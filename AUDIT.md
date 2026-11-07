# Audit de `spinwash-landing-pag-xksk.bolt.host`

Analyse du site existant, réalisée le 7 novembre 2026 à partir du HTML servi, du bundle
JavaScript (`index-BzZDC7Xj.js`), de la feuille de style (`index-DS1bzYyX.css`) et des images.

Le site est une application React mono-page générée par Vite (bundle de 188 Ko), rendue
entièrement côté client dans `<div id="root">`.

**Ordre réel des sections :** en-tête → hero (formules + planning) → options → **formulaire de
réservation** → avis → FAQ → pied de page.

---

## 1. Bugs majeurs

### 1.1 Trois liens de navigation sur cinq ne mènent nulle part

Les ancres utilisées dans le menu et le pied de page sont `#services`, `#tarifs`, `#planning`,
`#faq`, `#contact`. Or les seuls `id` présents dans le DOM sont **`contact` et `faq`**.

```
ancres référencées : #services  #tarifs  #planning  #faq  #contact
id réellement posés :                               faq   contact
```

`#services`, `#tarifs` et `#planning` ne correspondent à aucun élément : cliquer dessus ne fait
rien. C'est le cas dans le menu principal, dans le menu mobile **et** dans la colonne
« Navigation » du pied de page — soit 6 liens morts au total.

L'URL partagée depuis Instagram se termine par `#services` : elle arrive donc en haut de page,
sans effet. C'est le symptôme que vous aviez remarqué.

### 1.2 Le formulaire de réservation casse le message WhatsApp

Le message est construit par concaténation directe, sans encodage :

```js
const o = `Bonjour SPINWASH...%0A%0A*Nom:* ${e.name}%0A*Téléphone:* ${e.phone}...`;
window.open(`https://wa.me/${xp}?text=${o}`, "_blank");
```

Les valeurs saisies partent brutes dans l'URL. Dès qu'un champ contient une espace, une
esperluette, un `#` ou un `+`, l'URL est tronquée ou déformée et le message arrive incomplet.
Un nom comme « Jean Dupont » suffit à poser problème.

À noter : les boutons « Réserver » des cartes de prix, eux, utilisent bien `encodeURIComponent`.
L'oubli ne concerne que le formulaire — celui qui collecte le plus d'informations.

### 1.3 Le formulaire annonce un succès qui n'a pas eu lieu

```js
window.open(url, "_blank");
r(!0);                 // écran « Demande envoyée ! » affiché systématiquement
```

`window.open` est bloqué par de nombreux navigateurs mobiles et par les bloqueurs de pop-up.
Le code n'en tient pas compte : l'écran « Demande envoyée ! » s'affiche quoi qu'il arrive.
Le client croit avoir réservé alors que rien n'est parti. C'est le bug le plus coûteux
commercialement de la liste.

### 1.4 Près de 6 Mo d'images pour deux photos

| Fichier | Format | Poids | Dimensions |
|---|---|---|---|
| `462188AD-…-0462F7CA0FC8.PNG` | PNG | **3,19 Mo** | 1448 × 1086 |
| `BA263615-…-24A9E3984AC6.PNG` | PNG | **2,59 Mo** | 1086 × 1448 |
| `IMG_8016.jpg` (favicon) | JPEG | 183 Ko | 755 × 846 |

Des photographies enregistrées en PNG. En WebP à qualité équivalente, ces deux images pèsent
155 Ko et 130 Ko — soit **95 % de moins**. Sur mobile en 4G, la différence se compte en secondes.

Aucune image ne porte d'attributs `width`/`height`, ce qui provoque un décalage de la mise en
page au chargement (mauvais score CLS).

### 1.5 Une plaque d'immatriculation lisible

La photo de carrosserie laisse apparaître une plaque française lisible (`…528-RM`, dépt. 92).
En droit français une plaque est une donnée à caractère personnel : elle doit être floutée
avant publication.

### 1.6 Aucune page légale

Le site ne comporte ni mentions légales ni politique de confidentialité.

- Les mentions légales sont obligatoires pour un site professionnel (art. 19 de la loi LCEN) :
  identité de l'éditeur, SIREN, adresse, contact, hébergeur.
- Le formulaire collecte un nom et un numéro de téléphone : une information sur le traitement
  des données est exigée par le RGPD, ainsi qu'une case de consentement.
- Pour une prestation de service aux particuliers, le médiateur de la consommation doit être
  mentionné (art. L.612-1 du code de la consommation).

---

## 2. Bugs moyens

### 2.1 L'en-tête fixe recouvre les sections ciblées

L'en-tête est en `position:fixed` sur 64 à 80 px de haut, et aucune règle `scroll-margin-top`
n'est posée. Les deux ancres qui fonctionnent (`#faq`, `#contact`) arrivent donc avec leur titre
masqué derrière l'en-tête.

### 2.2 Liens vides

- Le logo pointe vers `href="#"` : ajoute un `#` à l'URL sans action utile.
- L'icône Instagram du pied de page pointe vers `href="#"` : elle ne mène nulle part, alors que
  le trafic arrive justement d'Instagram (`utm_source=ig`).

### 2.3 L'ordre des sections casse le tunnel de conversion

Le formulaire de réservation est placé **avant** les avis clients et la FAQ. On demande donc au
visiteur de s'engager avant de lui avoir donné les preuves sociales et les réponses à ses
objections (prix du déplacement, durée, présence obligatoire…).

### 2.4 Partage social et référencement

- `og:image` pointe vers une image **portrait** 1086 × 1448. Les aperçus Facebook, WhatsApp et
  LinkedIn attendent du 1200 × 630 : l'image est recadrée n'importe comment.
- `og:image` et `twitter:image` pointent vers `https://spinwash.fr/images/…` alors que le site
  est servi depuis `bolt.host`. Si le domaine n'est pas encore en ligne, l'aperçu est vide.
- La balise `<link rel="canonical">` déclare `https://spinwash.fr/` pour une page servie depuis
  `bolt.host` : Google est explicitement invité à indexer une autre adresse.

### 2.5 `sitemap.xml` et `robots.txt` ne font pas leur travail

- `GET /sitemap.xml` renvoie **la page HTML** (repli SPA), pas un sitemap. Il n'existe donc
  aucun sitemap exploitable.
- `robots.txt` est le fichier « content signals » par défaut de l'hébergeur, sans directive
  `Sitemap:`.
- **Toute URL inexistante renvoie HTTP 200** avec la page d'accueil (`/zzz-does-not-exist-123`
  → 200). Ces « soft 404 » permettent l'indexation d'adresses arbitraires.

### 2.6 Données structurées incomplètes et contradictoires

```json
"@type": "AutoWash",
"openingHours": "Mo-Sa 10:00-21:00",
"priceRange": "50€ - 75€"
```

- `openingHours` exclut le dimanche, alors que la carte « Appeler » affiche « Du lundi au
  dimanche », que le hero annonce « Dimanche sur place » et que la grille de planning propose
  les quatre créneaux du dimanche.
- `priceRange` ignore les options (+5 à +10 € chacune) et les frais de déplacement (dès 5 €).
- Il manque `address`, `url`, `image` et `geo` — ce sont précisément les champs qui alimentent
  la fiche locale dans Google.

### 2.7 Incohérences d'horaires entre les sections

| Endroit | Ce qui est écrit |
|---|---|
| Badge du hero | « Lun–Sam à domicile · Dimanche sur place » |
| Carte « Appeler » | « Du lundi au dimanche » |
| Pied de page | « Lun–Sam : 10h–21h » + « Dim : sur place à Drancy » |
| Grille de planning | 7 jours sur 7, 4 créneaux, sans distinction du dimanche |
| Données structurées | `Mo-Sa 10:00-21:00` |

Cinq formulations différentes pour une même information.

### 2.8 La grille de planning laisse croire à des disponibilités réelles

Les 28 cases portent toutes une pastille verte identique, quelle que soit la date. Rien
n'indique qu'il s'agit de créneaux *proposés* et non de disponibilités confirmées. Un visiteur
peut légitimement penser réserver une place garantie.

### 2.9 Menus déroulants potentiellement illisibles

```jsx
<option value={o} className="bg-brand-dark-3">{o}</option>
```

Une classe CSS sur `<option>` n'est pas appliquée de façon fiable : plusieurs navigateurs et
systèmes rendent la liste déroulante avec leurs couleurs natives. Sur fond clair natif, le texte
blanc hérité devient illisible.

### 2.10 « Avis vérifiés » sans dispositif de vérification

Le bloc affiche « 5.0 / 5 — avis vérifiés ». Les avis sont codés en dur dans le bundle. En
France, afficher la mention « vérifiés » impose d'indiquer la méthode de vérification
(art. L.111-7-2 du code de la consommation) ; à défaut, la mention est une pratique commerciale
trompeuse.

---

## 3. Bugs mineurs et points de qualité

| # | Constat | Détail |
|---|---|---|
| 3.1 | Aucune prise en compte de `prefers-reduced-motion` | 0 occurrence dans le CSS, alors que des animations tournent (`animate-pulse-slow`, `phoneShake`, transitions) |
| 3.2 | Menu mobile incomplet | Pas de blocage du défilement de fond, pas de fermeture par Échap, pas de retour du focus |
| 3.3 | Accordéon FAQ non accessible | Boutons sans `aria-expanded` ni `aria-controls` ; un lecteur d'écran n'annonce pas l'état |
| 3.4 | Pas de lien d'évitement | Navigation au clavier obligée de traverser tout l'en-tête |
| 3.5 | Favicon = photo JPEG de 183 Ko | Un favicon doit être un SVG ou un PNG de quelques kilo-octets |
| 3.6 | `<meta name="keywords">` | Ignorée par Google depuis 2009 |
| 3.7 | Paragraphe de mots-clés en pied de page | Liste de 8 expressions SEO enchaînées : signal de sur-optimisation |
| 3.8 | Photo d'intérieur = visuel presse constructeur | L'habitacle Mercedes-AMG Classe A est une photo officielle, présentée comme une réalisation |
| 3.9 | 188 Ko de React pour une page statique | Aucune interactivité ne justifie ce poids ; le contenu n'existe pas sans JavaScript |
| 3.10 | Téléphone non validé | `type="tel"` sans `pattern` ni `inputmode` |
| 3.11 | Pas d'état de chargement au clic | Le bouton d'envoi ne change pas d'état |
| 3.12 | Badge Bolt injecté | `badge.js` chargé depuis `bolt.new` sur la page de production |
| 3.13 | Aucune mesure d'audience | Impossible de savoir d'où viennent les demandes, ni lesquelles convertissent |

---

## 4. Ce qui fonctionnait bien et qui a été conservé

- La charte noir / rouge / blanc, cohérente et adaptée au secteur.
- Le couple typographique Barlow Condensed + Inter.
- La mascotte, mémorisable et identitaire.
- La grille de planning cliquable qui pré-remplit WhatsApp : bonne idée, bien exécutée côté
  encodage (`encodeURIComponent` correctement utilisé ici).
- L'ensemble des contenus : formules, options, FAQ, avis. Les textes sont justes et concrets ;
  ils ont été repris, parfois resserrés, jamais inventés.

---

## 5. Récapitulatif des corrections apportées

| Problème | Correction |
|---|---|
| 1.1 Ancres mortes | 7 sections avec `id` réel ; chaque entrée de menu a une cible vérifiée |
| 1.2 Encodage WhatsApp | `encodeURIComponent` sur la totalité du message ; testé avec `&`, `#`, `%`, espaces |
| 1.3 Faux succès | Plus de `window.open` : le bouton est un `<a href>` construit en direct, que l'utilisateur clique lui-même |
| 1.4 Poids des images | PNG → WebP : 5,78 Mo → 285 Ko ; `width`/`height` sur chaque image |
| 1.5 Plaque lisible | Floutée |
| 1.6 Pages légales | `mentions-legales.html` et `confidentialite.html` + case de consentement RGPD |
| 2.1 En-tête masquant | `scroll-margin-top` sur toutes les sections |
| 2.2 Liens vides | Logo → `#top` ; Instagram retiré tant que l'URL réelle n'est pas connue |
| 2.3 Ordre des sections | Formules → méthode → devis → planning → avis → FAQ → réservation |
| 2.4 Partage social | `og:image` 1200 × 630 dédiée, dimensions déclarées |
| 2.5 Sitemap / robots | `sitemap.xml` et `robots.txt` réels |
| 2.6 Données structurées | `AutoWash` complet + `FAQPage` ; horaires, adresse, catalogue d'offres |
| 2.7 Horaires | Une seule formulation sur tout le site |
| 2.8 Planning trompeur | Encadré « Une case ≠ une place garantie » + dimanche distingué en rouge |
| 2.9 Listes déroulantes | Couleurs explicites sur `<option>`, adaptées à chaque fond |
| 2.10 « Avis vérifiés » | Mention retirée ; les avis restent, sans note agrégée revendiquée |
| 3.1 → 3.4 Accessibilité | `prefers-reduced-motion`, Échap, blocage du défilement, retour du focus, `aria-expanded`, lien d'évitement |
| 3.5 Favicon | SVG de 400 octets |
| 3.6 / 3.7 SEO | `keywords` retirée, paragraphe de mots-clés remplacé par une liste de zones lisible |
| 3.9 Poids | Aucun framework : HTML, CSS et JavaScript natifs |
| 3.10 Validation | `inputmode`, `autocomplete`, validation native avant ouverture de WhatsApp |

---

## 6. Points restant à trancher par SPINWASH

1. **Mentions légales** — SIREN, forme juridique, nom du responsable de publication, hébergeur
   et médiateur de la consommation sont marqués `À COMPLÉTER` dans la page. Rien n'a été
   inventé : ces champs doivent être renseignés avant mise en ligne.
2. **Adresse e-mail de contact** — absente du site d'origine, nécessaire pour les mentions
   légales et l'exercice des droits RGPD.
3. **Compte Instagram** — le lien a été retiré faute de connaître l'URL. Le code est en place,
   commenté, dans le pied de page.
4. **Horaires du dimanche** — le site d'origine indique « toute la journée ». Les données
   structurées déclarent 10 h – 21 h, par cohérence avec la grille de planning. À confirmer.
5. **Photo d'intérieur** — il s'agit d'un visuel presse Mercedes. Une photo de vos propres
   réalisations serait plus crédible et évite toute question de droits.
6. **Avis clients** — repris tels quels. Les collecter via Google Business Profile permettrait
   de les afficher avec une source vérifiable, et d'alimenter la fiche locale.
