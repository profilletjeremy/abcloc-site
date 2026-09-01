# ABC LOC — nouveau site

Site vitrine statique pour **ABC LOC** (location de voitures à Rivière-Salée et de logements aux
Trois-Îlets, Martinique).
Il remplace le WordPress actuel de `abcloc.fr`. Toute la réservation part vers la plateforme **Rodeeo**.

---

## Ce que c'est techniquement

Cinq pages HTML, une feuille de style, un fichier JavaScript. **Aucune dépendance externe** : pas de
WordPress, pas de plugin, pas de CDN, pas de Google Fonts en ligne. Les polices sont embarquées dans
le CSS en base64. Le site fonctionne en ouvrant simplement `index.html`.

```
abcloc/
├── index.html          Accueil
├── vehicules.html      Les 10 véhicules + filtres
├── logements.html      Les 4 logements
├── faq.html            Questions fréquentes
├── contact.html        Contact + qui sommes-nous
└── assets/
    ├── css/site.css    Toute la mise en forme
    ├── js/site.js      Menu, filtres, accordéon, apparitions (~3 Ko)
    ├── fonts/fonts.css Fraunces + Inter, auto-hébergées (151 Ko)
    ├── brand/          Logo, photo d'accueil, portraits d'Anaïs et Lionel
    ├── vehicules/      Photos des véhicules
    └── logements/      Photos des logements
```

Poids total : **~1,9 Mo**, images comprises. À titre de comparaison, l'ancien site chargeait
Elementor, Elementor Pro, Essential Addons, WooCommerce, WP Meteor et Smush sur chaque page.

### Couleurs

Toutes définies en variables CSS en haut de `assets/css/site.css`.

Il n'y a **plus aucun orange** dans le site : le jaune du logo est devenu la couleur d'action.

| Variable | Valeur | Usage |
|---|---|---|
| `--sun` | `#F8C810` | **Jaune du logo**, prélevé au pixel dans `logo.webp`. Tous les boutons principaux, liserés, badge « Le plus demandé », filtre actif, titres de pied de page, cadre de la photo des fondateurs. |
| `--sun-dark` | `#D9AC00` | Survol des boutons jaunes. |
| `--sun-deep` | `#8A6100` | Même jaune assombri, pour le **texte** sur fond clair (le jaune vif y serait illisible). |
| `--sun-tint` | `#FDF4D6` | Fonds jaunes très clairs (encadrés « Bon à savoir », badges « à compléter »). |
| `--lagoon` | `#0E6B63` | Vert-bleu lagon : boutons secondaires, icônes, puces. |
| `--ink` | `#12312F` | Texte, sections sombres, **et texte des boutons jaunes**. |
| `--sand` | `#FBF7F0` | Fond de page. |

Pour renforcer ou atténuer le jaune, il suffit de modifier `--sun` : tout le site suit.

**Règle à respecter si vous modifiez les couleurs :** le jaune vif ne sert jamais de couleur de
texte sur fond clair — uniquement en aplat, en liseré, ou sur fond sombre. Pour du texte sur fond
sable, utilisez `--sun-deep`. Le texte foncé sur pastille jaune est à un contraste de 8,7:1.

### Autres choix retenus

- **Un seul rendu, clair.** Palette sable et lagon, `color-scheme: light`. Pas de mode sombre :
  c'est un parti pris de marque, pas un oubli.
- **HTML statique, pas de rendu JavaScript.** Le contenu est dans le HTML, donc lisible par Google
  et par les lecteurs d'écran même si le JS ne se charge pas.
- **Sans JavaScript, le site reste entièrement lisible.** Les animations d'apparition sont
  conditionnées à la classe `js` posée en début de page.
- **Accessibilité** : liens d'évitement, `aria-expanded` sur le menu et l'accordéon, focus visible,
  `prefers-reduced-motion` respecté.
- **SEO** : titres et descriptions par page, Open Graph, et un bloc JSON-LD `AutoRental` sur
  l'accueil avec les tarifs.

---

## Le back-office

Adresse : **`/admin`**. Non listé, non indexé, protégé par un mot de passe unique.

Anaïs et Lionel y modifient sans toucher au code : les **prix**, les **noms et descriptions**,
les **photos** (envoi depuis le téléphone, redimensionnement automatique), les **étiquettes**,
la mise **en vedette** sur l'accueil, le **masquage** d'un véhicule, les textes des **logements**,
la **note Google** et le **prix d'appel**. On peut aussi ajouter ou supprimer un véhicule.

### Comment ça marche

Les trois pages qui dépendent de ces données (accueil, véhicules, logements) ne sont plus des
fichiers statiques : elles sont **rendues à la demande** par `api/render.js`, qui injecte les
données dans les gabarits de `api/_templates/`. Le HTML reste complet côté serveur, donc le
référencement et le fonctionnement sans JavaScript sont préservés. `faq.html` et `contact.html`
restent des fichiers statiques.

Les données vivent dans un **dépôt GitHub public**, `github.com/profilletjeremy/abcloc-site`
(fichier `data/site-data.json`, photos dans `assets/uploads/`), lu et écrit via l'API GitHub
depuis `api/_lib.js`. Si le dépôt n'est pas joignable, le site repart automatiquement sur les
valeurs embarquées dans `api/_data.js` : **une panne de stockage ne peut pas mettre le site à
terre**, elle le fige simplement sur la dernière version connue.

**Pourquoi GitHub plutôt que Vercel Blob :** Blob exige un moyen de paiement enregistré sur le
compte dès qu'un quota mutualisé (partagé entre tous les projets du compte) est dépassé — même à
0 € facturé. GitHub est gratuit sans carte, sans limite de temps, quel que soit le nombre d'autres
projets sur le compte. Le dépôt est volontairement **public** : les photos sont référencées en
`<img src="https://raw.githubusercontent.com/...">` dans le HTML envoyé au navigateur, qui ne
peut pas fournir de jeton d'authentification — un dépôt privé casserait l'affichage des photos.
Rien de sensible n'y est stocké (prix, textes, photos publiques du site).

### État actuel

Le dépôt est créé, public, et contient les vraies données (10 véhicules, 4 logements, 6
témoignages). Le code de lecture/écriture est testé de bout en bout en local — lecture publique
sans jeton, écriture et relecture avec jeton, upload de photo. Il reste deux actions
**dashboard uniquement** avant que ce soit actif en production (voir le message que je vous ai
envoyé) :

1. Connecter le projet Vercel à ce dépôt GitHub (Settings → Git → Connect Git Repository)
2. Ajouter la variable d'environnement `GITHUB_TOKEN` (un jeton fin, créé sur
   `github.com/settings/personal-access-tokens/new`, limité au dépôt `abcloc-site` avec la
   permission **Contents: Read and write**)

Une fois ces deux étapes faites, chaque `git push` sur `main` redéploie automatiquement le site —
plus besoin d'accès à un compte Vercel particulier pour la suite des évolutions.

Pour changer le mot de passe du back-office (`ADMIN_PASSWORD`), même mécanique qu'avant, mais
désormais dans les réglages du projet transféré (dashboard, pas CLI — le projet vit sur le compte
du client).

### Cache CDN des pages publiques

`index.html`, `vehicules.html` et `logements.html` sont mis en cache **30 secondes** sur le CDN
Vercel (`CDN-Cache-Control`), pour absorber le trafic sans ralentir la publication d'une
modification. Le navigateur, lui, revalide à chaque visite (`Cache-Control: max-age=0`) : personne
ne reste bloqué avec une page en cache local. Un changement enregistré depuis `/admin` est donc
visible en ligne en moins d'une minute.

> Point technique retenu pendant la mise au point : Vercel retire la directive `s-maxage` de
> l'en-tête `Cache-Control` avant de la transmettre au navigateur — elle n'a d'effet que via
> `CDN-Cache-Control` / `Vercel-CDN-Cache-Control`. Voir `api/render.js` et
> [la doc Vercel CDN Cache](https://vercel.com/docs/caching/cdn-cache#cdn-cache-control).

### Sécurité

- Session signée en HMAC-SHA256, cookie `HttpOnly` + `Secure` + `SameSite=Strict`, 12 h.
- Comparaison du mot de passe à temps constant, et blocage après 8 essais ratés en 10 minutes.
- Tout ce qui vient du formulaire est **reconstruit champ par champ** côté serveur, jamais
  recopié tel quel, et échappé au rendu. Seules `<strong>`, `<em>` et `<br>` survivent dans les
  descriptions de logements.
- Les photos ne sont acceptées qu'en JPEG, PNG ou WebP, 3 Mo maximum.

---

## Mettre en ligne

Le site est un dossier de fichiers statiques : il se déploie n'importe où.

### Option A — chez Hostinger (l'hébergement actuel)

1. hPanel → **Gestionnaire de fichiers**.
2. Sauvegardez d'abord le WordPress existant (hPanel → Sauvegardes).
3. Envoyez le contenu de ce dossier dans `public_html/`.
4. Le site est en ligne sur `abcloc.fr`.

> ⚠️ Cela remplace le WordPress. Tant que vous n'êtes pas décidé, déployez d'abord sur un
> sous-domaine (`nouveau.abcloc.fr`) pour comparer les deux côte à côte.

### Option B — Vercel ou Netlify (gratuit, plus rapide)

```bash
npx vercel --prod
```

Puis faites pointer le domaine `abcloc.fr` vers le déploiement.

### Prévisualiser en local

```bash
npx http-server /Users/jeremy/Desktop/claude/abcloc -p 8765 -c-1
```

---

## À compléter avant la mise en ligne

Je n'ai pas inventé les informations que seuls Anaïs et Lionel connaissent. Elles sont signalées
dans les pages par un badge orange **« À compléter »**, facile à retrouver :

```bash
grep -rn "todo" *.html
```

### 1. FAQ — neuf réponses à écrire (`faq.html`)

| Question | Ce qu'il faut préciser |
|---|---|
| Politique carburant | Plein-à-plein ? même niveau qu'au départ ? |
| Documents à présenter | Permis, pièce d'identité, carte bancaire au nom du conducteur ? |
| Âge minimum / ancienneté de permis | Et supplément jeune conducteur éventuel |
| Caution | Montant, mode de dépôt, délai de restitution |
| Annulation et modification | Conditions et délai gratuit |
| Autres lieux de remise | Trois-Îlets, hôtels, port ? Des frais selon la zone ? |
| Retard de vol | Marche à suivre, jusqu'à quelle heure vous assurez les remises |
| Sièges bébé et rehausseurs | Disponibilité, tarif, réservation à l'avance |
| Ménage des logements | La règle des trois logements autres que le T3 |

### 2. Avis Google — trois valeurs à remplacer

L'encart d'avis sur la page d'accueil affiche **des valeurs de démonstration** (4,9 sur 27 avis).
Je n'ai pas pu récupérer votre note Google réelle, et je ne l'ai pas inventée. À remplacer dans
`index.html`, section « AVIS GOOGLE » :

| Quoi | Où | Valeur actuelle |
|---|---|---|
| La note | `<b>4,9</b>` | démonstration |
| Le remplissage des étoiles | `style="--pct:98%"` | note ÷ 5 × 100 (4,9/5 → 98 %) |
| Le nombre d'avis | `<strong>27</strong>` | démonstration |
| Le lien | `href="https://www.google.com/search?q=..."` | recherche Google — mettez l'URL directe de votre fiche |

Supprimez aussi le paragraphe portant le badge « À compléter » une fois les vraies valeurs en place.

> ⚠️ Tant que ces valeurs sont fausses, ne mettez pas cette page devant des clients : afficher une
> note Google qui n'est pas la vôtre est trompeur.

### 3. Prix d'appel incohérent

La page d'accueil annonce **« à partir de 18 € / jour »**, mais le véhicule le moins cher affiché
sur les cartes est la **Fiat Panda à 22 €**. Il manque soit un véhicule à 18 €, soit une mise à jour
des tarifs. Envoyez-moi la nouvelle grille et je la répercute partout.

### 4. Tarifs manquants

- **Tous les tarifs sont affichés « À PARTIR DE »**, jamais comme un prix ferme. Le montant exact
  dépend de la saison et de la durée, et se fixe à la réservation Rodeeo ou par devis.
- **Trois véhicules affichent « Sur demande »** faute de prix dans l'ancien site :
  Dacia Lodgy 7 places, Partner Tepee, Dacia Stepway. Leur bouton renvoie vers WhatsApp.
  Pour afficher un prix de départ, remplacez dans `vehicules.html` :
  ```html
  <p class="price price--ask"><b>Sur demande</b><span>nous consulter</span></p>
  ```
  par :
  ```html
  <p class="price"><span class="price__from">à partir de</span><b>29 €</b><span>par jour</span></p>
  ```
- **Les quatre logements** n'ont aucun tarif public. Ils sont affichés « Sur demande » et renvoient
  vers WhatsApp — ce qui est probablement le bon choix, les prix variant selon la saison.

### 5. Mentions légales et CGV

Obligatoires pour une activité commerciale en France. Le pied de page contient un emplacement
marqué **« à rédiger »**. Il faut créer une page et y mettre : raison sociale, SIRET, adresse,
directeur de publication, hébergeur, et vos conditions de location.

### 6. Un point à vérifier

Le **Dacia Jogger** est étiqueté « Familiale ». Selon la finition, c'est un 5 ou un 7 places —
l'ancien site ne le précisait pas. Si c'est un 7 places, changez la puce dans `index.html` et
`vehicules.html`, et ajoutez-le au filtre en passant `data-tags="familiale"` tel quel (le filtre
« Familiales & 7 places » l'inclut déjà).

---

## Modifier le site au quotidien

Aucun outil à installer, tout se fait dans un éditeur de texte.

**Changer un tarif** — ouvrez `vehicules.html` (et `index.html` pour les six véhicules en vedette),
cherchez le nom du véhicule, modifiez le nombre dans `<b>22 €</b>`. Pensez à mettre à jour le bloc
JSON-LD en bas de `index.html`, qui alimente Google.

**Ajouter un véhicule** — dupliquez un bloc `<article class="car">` complet, changez le nom, la photo,
le prix et l'attribut `data-tags` (valeurs possibles : `citadine`, `suv`, `familiale`, `auto` —
plusieurs valeurs séparées par une espace).

**Changer le lien de réservation** — le lien Rodeeo apparaît partout. Un seul remplacement global :

```bash
cd /Users/jeremy/Desktop/claude/abcloc
grep -rl "my.rodeeo.app" *.html | xargs sed -i '' 's|ANCIEN_LIEN|NOUVEAU_LIEN|g'
```

**Les deux parcours du site.** Ils sont volontairement distincts :

| Parcours | Où | Destination |
|---|---|---|
| **Réserver** | Les 16 boutons de **cartes véhicules**, le hero, la barre mobile, les blocs d'appel à l'action, le pied de page | La plateforme Rodeeo |
| **Faire un devis** | Le bouton de **l'en-tête**, sur les 5 pages (version desktop et menu mobile) + carte dédiée de `contact.html`, FAQ, blocs d'appel à l'action, pieds de page | E-mail pré-rempli vers `abcloc972@gmail.com` |

Un visiteur qui repère un véhicule qui lui plaît clique « Réserver » et choisit ses dates sur Rodeeo.
Celui qui a une demande particulière — long séjour, groupe, voiture + logement — utilise le bouton
« Faire un devis » toujours visible en haut de page.

Les quatre logements font exception : ils renvoient vers WhatsApp (« Demander les disponibilités »),
puisqu'ils ne sont pas gérés par Rodeeo.

**La demande de devis par e-mail** — un bouton « Demander un devis » est aussi présent dans chaque
bloc d'appel à l'action, dans les pieds de page, sur une carte dédiée de `contact.html` et dans la FAQ.
Il ouvre un `mailto:` **pré-rempli** vers `abcloc972@gmail.com`, avec un modèle de message à compléter :

> Dates · Véhicule souhaité · Nombre de conducteurs · Lieu de prise en charge · Logement · Coordonnées

Ce choix est délibéré plutôt qu'un formulaire : le message part depuis la messagerie du client vers
une adresse Gmail, donc il n'emprunte pas le domaine `abcloc.fr` dont l'envoi est cassé (voir plus bas).
Rien à héberger, rien à maintenir, et la réponse se fait par simple « Répondre ».

Pour changer l'adresse ou le modèle de message, cherchez `mailto:abcloc972@gmail.com` — le corps du
message est encodé en URL après `&body=`.

Si vous préférez un vrai formulaire plus tard, [Web3Forms](https://web3forms.com) ou
[Formspree](https://formspree.io) s'ajoutent en quelques minutes sans serveur.

---

## Rappel : le problème d'emails n'est pas réglé par ce site

Le domaine `abcloc.fr` n'a **aucun enregistrement MX, SPF, DKIM ni DMARC**. C'est pour cela que les
clients ne reçoivent plus rien depuis que Gmail et Yahoo ont durci leurs règles en février 2024.

Ce site ne change rien à ce problème — il n'envoie aucun mail. La correction reste à faire côté
DNS et hébergement :

1. Créer une boîte mail sur le domaine (hPanel Hostinger → Emails) : cela pose MX, SPF et DKIM.
2. Ajouter un TXT sur `_dmarc.abcloc.fr` : `v=DMARC1; p=none; rua=mailto:contact@abcloc.fr`.

Tant que ce n'est pas fait, gardez WhatsApp comme canal principal — ce que fait déjà ce site.

---

## Contenu repris de l'ancien site

Tout le contenu réel a été récupéré et réécrit en français : les 10 véhicules et leurs tarifs, les
4 logements et leurs équipements détaillés, l'histoire d'Anaïs et Lionel (janvier 2023), les quatre
arguments commerciaux, le téléphone et les réseaux.

Ce qui a été **supprimé** parce que c'était du contenu de démonstration jamais nettoyé :

- La FAQ entière — questions en anglais sur des commandes d'échantillons, PayPal et des frais de
  livraison en taka bangladais.
- Les blocs `Lorem ipsum` en bas des fiches T3 Pointe du Bout et Ti Carayou.
- Les titres de gabarit « The ultimate luxury », « Apartment Details ».
- La description « A Timeless American Sedan » collée sur la Dacia Jogger.
- Les pages en anglais *About*, *Shop*, *Refund and Returns Policy*.
