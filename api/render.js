// Rend les pages publiques dont le contenu dépend des données modifiables
// depuis le back-office : accueil, véhicules, logements.
const fs = require('fs');
const path = require('path');
const { lireDonnees, esc, urlPhoto } = require('./_lib.js');

const RODEEO = 'https://my.rodeeo.app/providers/521-abc-loc/location-select';
const WA = 'https://wa.me/+596696662232';
const TEL = '+596696662232';

const PAGES = { index: 'index.html', vehicules: 'vehicules.html', logements: 'logements.html' };

/* Texte de contenu : on échappe tout, puis on ré-autorise une poignée de balises
   de mise en forme. Le contenu vient d'un formulaire, il ne doit pas pouvoir
   injecter de script même si le back-office était compromis. */
function riche(v) {
  return esc(v)
    .replace(/&lt;(\/?)(strong|em|b|i)&gt;/g, '<$1$2>')
    .replace(/&lt;br\s*\/?&gt;/g, '<br>');
}

const chips = (arr) => (arr || []).map((c) => `<span class="chip">${esc(c)}</span>`).join('');

/* Un logement peut encore n'avoir que l'ancien champ "photo" (donnée pas
   encore ré-enregistrée depuis le nouveau back-office) : on retombe dessus. */
function photosLogement(l) {
  if (Array.isArray(l.photos) && l.photos.length) return l.photos;
  if (l.photo) return [l.photo];
  return [];
}

function entete(page, defaut) {
  const p = (page && typeof page === 'object') ? page : {};
  return {
    eyebrow: p.eyebrow || defaut.eyebrow,
    titre: p.titre || defaut.titre,
    texte: p.texte || defaut.texte,
  };
}

function blocEntete(h) {
  return `<p class="eyebrow">${esc(h.eyebrow)}</p>
      <h1>${esc(h.titre)}</h1>
      <p>${riche(h.texte)}</p>`;
}

function blocPrix(v, suffixe) {
  const p = String(v.prix || '').trim();
  if (!p) return `<p class="price price--ask"><b>Sur demande</b><span>${esc(suffixe)}</span></p>`;
  return `<p class="price"><span class="price__from">à partir de</span><b>${esc(p)} €</b><span>par jour</span></p>`;
}

function carteVehicule(v) {
  const badge = v.badge
    ? `<span class="car__badge${v.badgeLagon ? ' car__badge--lagoon' : ''}">${esc(v.badge)}</span>`
    : '';
  return `
        <article class="car reveal" data-tags="${esc((v.categories || []).join(' '))}">
          <div class="car__media">${badge}
            <img src="${urlPhoto(v.photo)}" alt="${esc(v.nom)}" loading="lazy">
          </div>
          <div class="car__body">
            <div><h3 class="car__name">${esc(v.nom)}</h3><p class="car__sub">${esc(v.sousTitre)}</p></div>
            <div class="chips">${chips(v.chips)}</div>
            <div class="car__foot">
              ${blocPrix(v, 'nous consulter')}
              <a class="btn btn--sm btn--lagoon" href="${RODEEO}" target="_blank" rel="noopener">Réserver</a>
            </div>
          </div>
        </article>`;
}

function carteLogementAccueil(l) {
  const photo = photosLogement(l)[0] || '';
  return `
        <article class="car reveal">
          <div class="car__media" style="aspect-ratio:4/3"><img src="${urlPhoto(photo)}" alt="${esc(l.nom)}" loading="lazy" style="object-fit:cover;padding:0"></div>
          <div class="car__body">
            <div><h3 class="car__name">${esc(l.nom)}</h3><p class="car__sub">${esc(l.resume)}</p></div>
            <div class="chips">${chips(l.chipsAccueil)}</div>
            <div class="car__foot">
              <p class="price price--ask"><b>Sur demande</b><span>selon la saison</span></p>
              <a class="btn btn--sm btn--lagoon" href="logements.html#${esc(l.id)}">Détails</a>
            </div>
          </div>
        </article>`;
}

function galerieLogement(photos, nom) {
  const [principale, ...reste] = photos;
  const vignettes = reste.length
    ? `<div class="stay__thumbs">${reste
        .map((p) => `<img src="${urlPhoto(p)}" alt="${esc(nom)}" loading="lazy">`)
        .join('')}</div>`
    : '';
  return `<div class="stay__gallery"><div class="stay__media"><img src="${urlPhoto(principale)}" alt="${esc(nom)}" loading="lazy"></div>${vignettes}</div>`;
}

function blocLogement(l) {
  const paras = (l.paragraphes || []).map((p) => `<p>${riche(p)}</p>`).join('\n          ');
  const note = l.note
    ? `<p style="font-size:.92rem;color:var(--ink-mute)">${riche(l.note)}</p>`
    : '';
  return `
      <article class="stay reveal" id="${esc(l.id)}">
        ${galerieLogement(photosLogement(l), l.nom)}
        <div>
          <p class="stay__kind">${esc(l.type)}</p>
          <h3>${esc(l.nom)}</h3>
          ${paras}
          <div class="chips stay__amenities">${chips(l.equipements)}</div>
          ${note}
          <div class="stay__actions">
            <a class="btn btn--sm" href="${WA}" target="_blank" rel="noopener">Demander les disponibilités</a>
            <a class="btn btn--ghost btn--sm" href="tel:${TEL}">0696 66 22 32</a>
          </div>
        </div>
      </article>`;
}

function blocAvis(a) {
  const note = String(a.note || '').trim() || '—';
  const pct = Math.max(0, Math.min(100, (parseFloat(note.replace(',', '.')) / 5) * 100)) || 0;
  const lien = /^https:\/\//.test(a.lien || '') ? a.lien : 'https://www.google.com/';
  const texte = a.aVerifier
    ? `<span class="todo">À compléter</span> — remplacez la note, le nombre d'avis et le lien par les vraies valeurs de votre fiche Google, depuis le back-office.`
    : `Ce sont nos clients qui en parlent le mieux. Retrouvez tous leurs retours sur notre fiche Google.`;
  return `
        <div class="reviews__score">
          <b>${esc(note)}</b>
          <div class="stars" style="--pct:${pct.toFixed(0)}%" aria-hidden="true"><i></i></div>
          <p class="reviews__count">sur <strong>${esc(a.nombre)}</strong> avis</p>
        </div>
        <div class="reviews__sep"></div>
        <div class="reviews__body">
          <h3>Nos clients nous notent sur Google</h3>
          <p>${texte}</p>
        </div>
        <div>
          <a class="btn btn--ghost btn--sm" href="${esc(lien)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3a11.5 11.5 0 0 0 10.2 6.3z"/><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3z"/><path fill="#EA4335" d="M12 5.1c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7.1 9 5.1 12 5.1z"/></svg>
            Voir les avis Google
          </a>
        </div>`;
}

function blocTemoignages(liste) {
  const items = (liste || []).filter((t) => t && t.texte);
  if (!items.length) return '';
  const etoiles = '<span class="testimonial__stars" aria-hidden="true">★★★★★</span>';
  return items
    .map(
      (t) => `
        <figure class="testimonial reveal">
          ${etoiles}
          <blockquote>${riche(t.texte)}</blockquote>
          <figcaption>${esc(t.auteur || 'Client Google')}</figcaption>
        </figure>`
    )
    .join('\n');
}

let gabarits = {};
function gabarit(nom) {
  if (!gabarits[nom]) {
    gabarits[nom] = fs.readFileSync(path.join(__dirname, '_templates', PAGES[nom]), 'utf8');
  }
  return gabarits[nom];
}

module.exports = async (req, res) => {
  const page = String((req.query && req.query.page) || 'index');
  if (!PAGES[page]) return res.status(404).send('Page inconnue');

  let html = gabarit(page);
  const d = await lireDonnees();
  const vehicules = (d.vehicules || []).filter((v) => v.visible !== false);
  const logements = (d.logements || []).filter((l) => l.visible !== false);

  if (page === 'index') {
    html = html
      .replace('<!--CARS_HOME-->', vehicules.filter((v) => v.vedette).map(carteVehicule).join('\n'))
      .replace('<!--STAYS_HOME-->', logements.map(carteLogementAccueil).join('\n'))
      .replace('<!--REVIEWS-->', blocAvis(d.avis || {}))
      .replace('<!--TESTIMONIALS-->', blocTemoignages((d.avis || {}).temoignages))
      .replace(
        /(<span class="hero__from">à partir de <b>)[^<]*(<\/b>)/,
        `$1${esc(d.prixDepart || '')} €$2`
      );
  } else if (page === 'vehicules') {
    const entV = entete(d.pageVehicules, {
      eyebrow: 'Notre flotte',
      titre: 'Dix véhicules, et rien à ajouter au tarif',
      texte: "L'assurance, le kilométrage illimité et le second conducteur sont <strong>déjà compris</strong> dans le prix. Aucun supplément à prévoir, aucune option à cocher, aucune mauvaise surprise au retour. Seule la saison et la durée font varier le montant de départ.",
    });
    const vide = `
        <p class="cars__empty" hidden>Aucun véhicule ne correspond à ce filtre. <a href="${WA}" target="_blank" rel="noopener">Écrivez-nous</a>, nous trouverons une solution.</p>`;
    html = html
      .replace('<!--PAGEHEAD_VEHICULES-->', blocEntete(entV))
      .replace('<!--CARS_ALL-->', vehicules.map(carteVehicule).join('\n') + vide);
  } else {
    const entL = entete(d.pageLogements, {
      eyebrow: 'Les Trois-Îlets · Pointe du Bout',
      titre: 'Quatre adresses face à la marina',
      texte: 'Un appartement deux chambres et trois studios, tous aux Trois-Îlets, à quelques pas de la plage et des navettes pour Fort-de-France. Réservation par téléphone ou WhatsApp, directement avec Anaïs et Lionel.',
    });
    html = html
      .replace('<!--PAGEHEAD_LOGEMENTS-->', blocEntete(entL))
      .replace('<!--STAYS_ALL-->', logements.map(blocLogement).join('\n'));
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache CDN Vercel : 30 s, pour qu'un changement fait dans le back-office se voie vite
  // (utilisateurs non techniques qui viennent de cliquer « Enregistrer »). Le navigateur, lui,
  // revalide à chaque fois (max-age=0) : personne ne reste bloqué sur une page en cache local.
  // Vercel retire s-maxage de Cache-Control avant de l'envoyer au navigateur ; CDN-Cache-Control
  // et Vercel-CDN-Cache-Control sont les en-têtes dédiés au cache CDN lui-même — voir
  // https://vercel.com/docs/caching/cdn-cache#cdn-cache-control
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=86400');
  res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=86400');
  res.status(200).send(html);
};
