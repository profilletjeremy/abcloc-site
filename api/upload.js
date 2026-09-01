// Réception d'une photo depuis le back-office.
// L'image est redimensionnée côté navigateur avant l'envoi, puis transmise en
// base64 dans du JSON : pas de multipart à décoder, et une charge utile légère.
const { exigeAuth, blobActif } = require('./_lib.js');

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_OCTETS = 3 * 1024 * 1024;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erreur: 'Méthode non autorisée' });
  if (!exigeAuth(req, res)) return;

  if (!blobActif()) {
    return res.status(503).json({
      erreur: "Stockage non configuré : créez un Blob Store sur Vercel pour pouvoir envoyer des photos.",
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

  try {
    const { put } = require('@vercel/blob');
    const blob = await put(`photos/${base}.${ext}`, buffer, {
      access: 'public',
      contentType: type,
      addRandomSuffix: true, // évite d'écraser une photo existante et casse le cache
    });
    res.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error('envoi Blob impossible :', err.message);
    res.status(500).json({ erreur: "L'envoi a échoué : " + err.message });
  }
};
