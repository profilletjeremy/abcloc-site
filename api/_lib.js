// Fonctions communes au back-office et au rendu des pages publiques.
const crypto = require('crypto');
const DEFAULTS = require('./_data.js');

const BLOB_KEY = 'site-data.json';
const COOKIE = 'abcloc_session';
const DUREE_SESSION_MS = 12 * 60 * 60 * 1000; // 12 h

/* ------------------------------------------------------------------ données */

let cache = null;
let cacheExpire = 0;

function blobActif() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Lit les données : Blob si configuré, sinon les valeurs embarquées. */
async function lireDonnees({ frais = false } = {}) {
  if (!frais && cache && Date.now() < cacheExpire) return cache;
  if (!blobActif()) return DEFAULTS;

  try {
    const { list } = require('@vercel/blob');
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    if (!blobs.length) return DEFAULTS;
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    cache = data;
    cacheExpire = Date.now() + 10_000;
    return data;
  } catch (err) {
    // Le site doit rester debout même si le stockage tombe.
    console.error('lecture Blob impossible, retour aux valeurs par défaut :', err.message);
    return DEFAULTS;
  }
}

async function ecrireDonnees(data) {
  if (!blobActif()) {
    const e = new Error('BLOB_READ_WRITE_TOKEN absent : le stockage n\'est pas configuré.');
    e.code = 'NO_STORAGE';
    throw e;
  }
  const { put } = require('@vercel/blob');
  await put(BLOB_KEY, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
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

/** N'autorise que des chemins d'images internes ou des URL Blob. */
function urlPhoto(v) {
  const s = String(v || '').trim();
  if (/^assets\/[A-Za-z0-9._\/-]+$/.test(s)) return s;
  if (/^https:\/\/[A-Za-z0-9.-]+\.(vercel-storage\.com|public\.blob\.vercel-storage\.com)\//.test(s)) return s;
  if (/^https:\/\/[A-Za-z0-9.-]*blob\.vercel-storage\.com\//.test(s)) return s;
  return 'assets/brand/logo.webp';
}

module.exports = {
  DEFAULTS, COOKIE, blobActif,
  lireDonnees, ecrireDonnees,
  creerJeton, estConnecte, poserCookie, effacerCookie, exigeAuth,
  esc, urlPhoto,
};
