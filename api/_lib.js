// Fonctions communes au back-office et au rendu des pages publiques.
//
// Stockage : dépôt GitHub public (profilletjeremy/abcloc-site), via l'API Contents.
// Choisi pour n'exiger AUCUN moyen de paiement, ni sur ce compte ni sur celui du client —
// GitHub est gratuit sans carte, sans limite de temps, contrairement à Vercel Blob qui
// suspend l'écriture dès qu'un quota (mutualisé sur tout le compte Vercel) est dépassé.
const crypto = require('crypto');
const DEFAULTS = require('./_data.js');

const GH_OWNER = 'profilletjeremy';
const GH_REPO = 'abcloc-site';
const GH_BRANCH = 'main';
const DATA_PATH = 'data/site-data.json';
const GH_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;

const COOKIE = 'abcloc_session';
const DUREE_SESSION_MS = 12 * 60 * 60 * 1000; // 12 h

/* ------------------------------------------------------------------ données */

let cache = null;
let cacheExpire = 0;

function stockageActif() {
  return Boolean(process.env.GITHUB_TOKEN);
}

/** En-têtes GitHub. Le jeton est optionnel en lecture (dépôt public), obligatoire en écriture. */
function ghHeaders() {
  const h = { Accept: 'application/vnd.github+json', 'User-Agent': 'abcloc-site' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/** Lit un fichier du dépôt. Retourne null si absent, lève une erreur sur tout autre échec. */
async function ghGet(path) {
  const res = await fetch(`${GH_API}/contents/${path}?ref=${GH_BRANCH}`, {
    headers: ghHeaders(),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} → HTTP ${res.status}`);
  return res.json();
}

/** Écrit (crée ou met à jour) un fichier du dépôt, en gérant le sha courant. */
async function ghPut(path, buffer, message) {
  if (!stockageActif()) {
    const e = new Error("GITHUB_TOKEN absent : le stockage n'est pas configuré.");
    e.code = 'NO_STORAGE';
    throw e;
  }
  const existant = await ghGet(path).catch(() => null);
  const res = await fetch(`${GH_API}/contents/${path}`, {
    method: 'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: buffer.toString('base64'),
      branch: GH_BRANCH,
      ...(existant ? { sha: existant.sha } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const e = new Error(`Écriture GitHub refusée (HTTP ${res.status}). ${detail.slice(0, 200)}`);
    if (res.status === 401 || res.status === 403) e.code = 'NO_STORAGE';
    throw e;
  }
  return res.json();
}

/** Lit les données : dépôt GitHub si joignable, sinon les valeurs embarquées. */
async function lireDonnees({ frais = false } = {}) {
  if (!frais && cache && Date.now() < cacheExpire) return cache;

  try {
    const fichier = await ghGet(DATA_PATH);
    if (!fichier) return DEFAULTS;
    const data = JSON.parse(Buffer.from(fichier.content, 'base64').toString('utf8'));
    cache = data;
    cacheExpire = Date.now() + 10_000;
    return data;
  } catch (err) {
    // Le site doit rester debout même si le stockage tombe.
    console.error('lecture GitHub impossible, retour aux valeurs par défaut :', err.message);
    return DEFAULTS;
  }
}

async function ecrireDonnees(data) {
  await ghPut(
    DATA_PATH,
    Buffer.from(JSON.stringify(data, null, 2), 'utf8'),
    'chore(back-office): mise à jour des données du site'
  );
  cache = data;
  cacheExpire = Date.now() + 10_000;
}

/* ------------------------------------------------------------ authentification */

function secret() {
  const mdp = process.env.ADMIN_PASSWORD;
  if (!mdp) return null;
  return crypto.createHash('sha256').update('abcloc:' + mdp).digest();
}

function signer(charge) {
  return crypto.createHmac('sha256', secret()).update(charge).digest('base64url');
}

function creerJeton() {
  const exp = String(Date.now() + DUREE_SESSION_MS);
  return exp + '.' + signer(exp);
}

function jetonValide(jeton) {
  if (!jeton || !secret()) return false;
  const [exp, sig] = String(jeton).split('.');
  if (!exp || !sig) return false;
  const attendu = signer(exp);
  // comparaison à temps constant
  const a = Buffer.from(sig), b = Buffer.from(attendu);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Date.now() < Number(exp);
}

function lireCookie(req, nom) {
  const brut = req.headers.cookie || '';
  for (const part of brut.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === nom) return decodeURIComponent(v.join('='));
  }
  return null;
}

function estConnecte(req) {
  return jetonValide(lireCookie(req, COOKIE));
}

function poserCookie(res, jeton) {
  const attrs = [
    `${COOKIE}=${encodeURIComponent(jeton)}`,
    'Path=/', 'HttpOnly', 'SameSite=Strict', 'Secure',
    `Max-Age=${Math.floor(DUREE_SESSION_MS / 1000)}`,
  ];
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function effacerCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0`);
}

function exigeAuth(req, res) {
  if (estConnecte(req)) return true;
  res.status(401).json({ erreur: 'Session expirée ou absente. Reconnectez-vous.' });
  return false;
}

/* ---------------------------------------------------------------- utilitaires */

/** Échappe le texte destiné au HTML. Indispensable : le contenu vient d'un formulaire. */
function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** N'autorise que des chemins d'images internes ou des URL du dépôt GitHub (raw). */
function urlPhoto(v) {
  const s = String(v || '').trim();
  if (/^assets\/[A-Za-z0-9._\/-]+$/.test(s)) return s;
  if (new RegExp(`^https://raw\\.githubusercontent\\.com/${GH_OWNER}/${GH_REPO}/`).test(s)) return s;
  return 'assets/brand/logo.webp';
}

module.exports = {
  DEFAULTS, COOKIE, stockageActif,
  GH_OWNER, GH_REPO, GH_BRANCH, GH_API, ghHeaders, ghGet, ghPut,
  lireDonnees, ecrireDonnees,
  creerJeton, estConnecte, poserCookie, effacerCookie, exigeAuth,
  esc, urlPhoto,
};
