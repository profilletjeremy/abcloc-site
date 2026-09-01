// Connexion au back-office : un seul mot de passe partagé, défini par la variable
// d'environnement ADMIN_PASSWORD. Aucun mot de passe n'est stocké dans le code.
const crypto = require('crypto');
const { creerJeton, poserCookie, effacerCookie, estConnecte } = require('./_lib.js');

// Petit garde-fou contre le brute force, par instance de fonction.
const tentatives = new Map();
const MAX = 8;
const FENETRE_MS = 10 * 60 * 1000;

function trop(ip) {
  const e = tentatives.get(ip);
  if (!e || Date.now() > e.jusqu) return false;
  return e.n >= MAX;
}
function compter(ip) {
  const e = tentatives.get(ip);
  if (!e || Date.now() > e.jusqu) tentatives.set(ip, { n: 1, jusqu: Date.now() + FENETRE_MS });
  else e.n++;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') return res.json({ connecte: estConnecte(req) });

  if (req.method === 'DELETE') {
    effacerCookie(res);
    return res.json({ ok: true });
  }

  if (req.method !== 'POST') return res.status(405).json({ erreur: 'Méthode non autorisée' });

  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) {
    return res.status(503).json({
      erreur: "Le back-office n'est pas encore configuré : la variable ADMIN_PASSWORD est absente.",
    });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'inconnue';
  if (trop(ip)) {
    return res.status(429).json({ erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' });
  }

  const fourni = String((req.body && req.body.motdepasse) || '');
  const a = Buffer.from(fourni);
  const b = Buffer.from(attendu);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    compter(ip);
    return res.status(401).json({ erreur: 'Mot de passe incorrect.' });
  }

  poserCookie(res, creerJeton());
  res.json({ ok: true });
};
