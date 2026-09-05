// Lecture / écriture des données du site depuis le back-office.
const { lireDonnees, ecrireDonnees, exigeAuth, stockageActif } = require('./_lib.js');

const CATS = ['citadine', 'suv', 'familiale', 'auto'];

const texte = (v, max = 400) => String(v == null ? '' : v).slice(0, max);
const liste = (v, max = 20) => (Array.isArray(v) ? v : []).slice(0, max).map((x) => texte(x, 80)).filter(Boolean);
const photos = (v, max = 12) => (Array.isArray(v) ? v : []).slice(0, max).map((x) => texte(x, 500)).filter(Boolean);

function entete(src, defaut) {
  const s = src && typeof src === 'object' ? src : {};
  return {
    eyebrow: texte(s.eyebrow, 80) || defaut.eyebrow,
    titre: texte(s.titre, 160) || defaut.titre,
    texte: texte(s.texte, 600) || defaut.texte,
  };
}

/** On ne fait jamais confiance au corps de la requête : on reconstruit l'objet champ par champ. */
function nettoyer(entree) {
  const src = entree && typeof entree === 'object' ? entree : {};
  return {
    prixDepart: texte(src.prixDepart, 10),
    pageVehicules: entete(src.pageVehicules, {
      eyebrow: 'Notre flotte',
      titre: 'Dix véhicules, et rien à ajouter au tarif',
      texte: "L'assurance, le kilométrage illimité et le second conducteur sont <strong>déjà compris</strong> dans le prix. Aucun supplément à prévoir, aucune option à cocher, aucune mauvaise surprise au retour. Seule la saison et la durée font varier le montant de départ.",
    }),
    pageLogements: entete(src.pageLogements, {
      eyebrow: 'Les Trois-Îlets · Pointe du Bout',
      titre: 'Quatre adresses face à la marina',
      texte: 'Un appartement deux chambres et trois studios, tous aux Trois-Îlets, à quelques pas de la plage et des navettes pour Fort-de-France. Réservation par téléphone ou WhatsApp, directement avec Anaïs et Lionel.',
    }),
    avis: {
      note: texte((src.avis || {}).note, 10),
      nombre: texte((src.avis || {}).nombre, 10),
      lien: /^https:\/\//.test((src.avis || {}).lien || '') ? texte((src.avis || {}).lien, 500) : '',
      aVerifier: Boolean((src.avis || {}).aVerifier),
      temoignages: (Array.isArray((src.avis || {}).temoignages) ? src.avis.temoignages : [])
        .slice(0, 12)
        .map((t) => ({ auteur: texte((t || {}).auteur, 60), texte: texte((t || {}).texte, 280) }))
        .filter((t) => t.texte),
    },
    vehicules: (Array.isArray(src.vehicules) ? src.vehicules : []).slice(0, 40).map((v, i) => ({
      id: texte(v.id, 60).replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'vehicule-' + i,
      nom: texte(v.nom, 80),
      sousTitre: texte(v.sousTitre, 160),
      prix: texte(v.prix, 8).replace(/[^0-9.,]/g, ''),
      categories: liste(v.categories, 4).filter((c) => CATS.includes(c)),
      chips: liste(v.chips, 6),
      photo: texte(v.photo, 500),
      badge: texte(v.badge, 30),
      badgeLagon: Boolean(v.badgeLagon),
      vedette: Boolean(v.vedette),
      visible: v.visible !== false,
    })),
    logements: (Array.isArray(src.logements) ? src.logements : []).slice(0, 20).map((l, i) => ({
      id: texte(l.id, 60).replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'logement-' + i,
      nom: texte(l.nom, 80),
      type: texte(l.type, 80),
      photos: photos(l.photos && l.photos.length ? l.photos : (l.photo ? [l.photo] : [])),
      resume: texte(l.resume, 160),
      paragraphes: (Array.isArray(l.paragraphes) ? l.paragraphes : []).slice(0, 6).map((p) => texte(p, 1200)).filter(Boolean),
      note: texte(l.note, 400),
      equipements: liste(l.equipements, 24),
      chipsAccueil: liste(l.chipsAccueil, 4),
      visible: l.visible !== false,
    })),
  };
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    if (!exigeAuth(req, res)) return;
    const data = await lireDonnees({ frais: true });
    return res.json({ data, stockage: stockageActif() ? 'github' : 'aucun' });
  }

  if (req.method !== 'PUT') return res.status(405).json({ erreur: 'Méthode non autorisée' });
  if (!exigeAuth(req, res)) return;

  const propre = nettoyer(req.body);
  if (!propre.vehicules.length) {
    return res.status(400).json({ erreur: 'Refusé : la liste de véhicules est vide.' });
  }

  try {
    await ecrireDonnees(propre);
  } catch (err) {
    const code = err.code === 'NO_STORAGE' ? 503 : 500;
    return res.status(code).json({ erreur: err.message });
  }

  res.json({ ok: true, enregistreLe: new Date().toISOString() });
};
