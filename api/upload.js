// Réception d'une photo depuis le back-office.
// L'image est redimensionnée côté navigateur avant l'envoi, puis transmise en
// base64 dans du JSON, puis commitée dans le dépôt GitHub (assets/uploads/…)
// et servie ensuite via raw.githubusercontent.com — public, sans jeton, comme
// l'exigent les balises <img> du site.
const { exigeAuth, stockageActif, ghPut, GH_OWNER, GH_REPO, GH_BRANCH } = require('./_lib.js');

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_OCTETS = 3 * 1024 * 1024;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erreur: 'Méthode non autorisée' });
  if (!exigeAuth(req, res)) return;

  if (!stockageActif()) {
    return res.status(503).json({
      erreur: "Stockage non configuré : la variable GITHUB_TOKEN est absente sur ce déploiement.",
    });
  }

  const { nom, type, donnees } = req.body || {};
  const ext = TYPES[type];
  if (!ext) return res.status(400).json({ erreur: 'Format accepté : JPEG, PNG ou WebP.' });

  let buffer;
  try {
    buffer = Buffer.from(String(donnees || ''), 'base64');
  } catch {
    return res.status(400).json({ erreur: 'Image illisible.' });
  }
  if (!buffer.length) return res.status(400).json({ erreur: 'Image vide.' });
  if (buffer.length > MAX_OCTETS) {
    return res.status(413).json({ erreur: 'Image trop lourde (3 Mo maximum après redimensionnement).' });
  }

  const base = String(nom || 'photo').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9-]/g, '-').slice(0, 50) || 'photo';
  const nomFichier = `${Date.now()}-${base}.${ext}`;
  const chemin = `assets/uploads/${nomFichier}`;

  try {
    await ghPut(chemin, buffer, `chore(back-office): ajout de la photo ${nomFichier}`);
    const url = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${chemin}`;
    res.json({ ok: true, url });
  } catch (err) {
    console.error('envoi GitHub impossible :', err.message);
    const code = err.code === 'NO_STORAGE' ? 503 : 500;
    res.status(code).json({ erreur: "L'envoi a échoué : " + err.message });
  }
};
