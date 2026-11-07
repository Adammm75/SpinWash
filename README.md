# SPINWASH — site vitrine

Lavage automobile premium à domicile en Île-de-France.

Refonte complète du site existant : correction des bugs relevés dans [`AUDIT.md`](AUDIT.md),
nouvelle direction artistique, devis interactif.

## Mise en ligne

Le site est **statique** : aucun build, aucune dépendance, aucun `npm install`.
Déposez le contenu du dossier tel quel sur n'importe quel hébergeur (Netlify, Vercel,
Cloudflare Pages, GitHub Pages, OVH, un simple FTP…).

Pour le tester en local :

```bash
python3 -m http.server 8000
```

Puis ouvrez `http://127.0.0.1:8000`.

## Contenu du dossier

```
index.html              La page principale (HTML + CSS + JS, tout inclus)
mentions-legales.html   Mentions légales — contient des champs À COMPLÉTER
confidentialite.html    Politique de confidentialité RGPD
robots.txt              Autorise l'indexation, déclare le sitemap
sitemap.xml             Les trois pages du site
assets/
  logo-mascot.png       Mascotte détourée, fond transparent (66 Ko)
  hero-car.webp         Visuel du hero (77 Ko)
  exterieur.webp        Photo carrosserie, plaque floutée (155 Ko)
  interieur.webp        Photo habitacle (130 Ko)
  og-cover.jpg          Aperçu réseaux sociaux, 1200 × 630 (127 Ko)
  favicon.svg           Favicon
AUDIT.md                Analyse détaillée de l'ancien site
tools/gen-planning.mjs  Régénère la grille de créneaux
```

## Avant la première mise en ligne

1. **Renseigner les mentions légales.** Les champs marqués `À COMPLÉTER` dans
   `mentions-legales.html` (forme juridique, SIREN, responsable de publication, hébergeur,
   médiateur de la consommation) sont obligatoires. Ne rien y inventer.
2. **Ajouter une adresse e-mail** dans `mentions-legales.html` et `confidentialite.html`.
3. **Remplacer le domaine.** Les URL absolues pointent vers `https://spinwash.fr/` dans
   `index.html` (balises `canonical`, `og:*`, `twitter:*`, données structurées), `robots.txt`
   et `sitemap.xml`. À adapter si le domaine diffère :

   ```bash
   grep -rn "spinwash.fr" index.html robots.txt sitemap.xml
   ```

4. **Activer Instagram.** Le lien est en place, commenté, dans le pied de page de
   `index.html` : remplacer `VOTRE_COMPTE` par l'identifiant réel et retirer les balises de
   commentaire.

## Modifier les contenus courants

| Quoi | Où |
|---|---|
| Tarifs des formules (50 € / 75 €) | `index.html` — section `#services` et champs `data-price` de `#est` |
| Options et leurs prix | `index.html` — champs `data-price` des cases à cocher de `#est` |
| Numéro de téléphone | chercher `0755107459` et `07 55 10 74 59` |
| Lien WhatsApp | chercher `wa.me/33755107459` |
| Questions / réponses | section `#faq` **et** le bloc `FAQPage` en bas de page (garder les deux identiques) |
| Avis clients | section `#avis` |
| Créneaux horaires | `tools/gen-planning.mjs`, puis recoller le résultat dans le `<table>` |

Un prix modifié doit l'être à **deux endroits** : la carte de la formule et l'attribut
`data-price` du devis interactif.

## Direction artistique

« Atelier nocturne » : un noir profond que la lumière balaie. La typographie display porte un
dégradé métallique (`.chrome`), le rouge de la charte sert de repère — rails, chiffres,
accents — et une seule bande claire, celle du devis, coupe le parcours au moment de décider.

| Rôle | Police | Usage |
|---|---|---|
| Display | **Archivo** (variable, axe `wdth`) | Titres larges et lourds ; la largeur se resserre sous 560 px |
| Texte | **Inter Tight** | Paragraphes et champs |
| Données | **JetBrains Mono** | Libellés, prix, horaires, numéros |

Les couleurs sont toutes définies en variables dans le `:root` de `index.html`.

## Animations

Toutes passent par `prefers-reduced-motion` : si le visiteur a demandé moins de mouvement,
la page devient statique sans rien perdre.

- Titres révélés ligne par ligne, apparitions décalées des cartes et des listes
- Balayage de lumière sur le hero, les boutons et les cartes
- Parallaxe sur la photo du hero, barre de progression, rail de section à gauche
- **Section « méthode » épinglée** : les quatre étapes défilent sur place, avec rail de
  progression ; sur mobile, chacune s'allume à son passage
- Compteurs animés, total du devis qui réagit au changement, boutons magnétiques,
  projecteur qui suit le curseur sur les cartes
- En-tête qui s'efface en descendant et revient en remontant

Au repos, tout est visible : rien n'attend un défilement pour s'afficher, et un filet de
sécurité lève toute animation restée en suspens.

## Ce que fait la page

- **Devis interactif** — formule, véhicule, options et créneau ; le total se met à jour et
  génère un message WhatsApp pré-rempli.
- **Formulaire de réservation** — validation native, case de consentement RGPD, message
  WhatsApp construit avec `encodeURIComponent` et ouvert par un vrai lien (jamais
  `window.open`, qui échoue silencieusement derrière un bloqueur).
- **Planning adaptatif** — grille de 28 créneaux sur grand écran ; sous 760 px, un sélecteur
  de jour et quatre grands boutons, ouvert sur la journée en cours. Le sélecteur est construit
  à partir du tableau : aucun contenu n'est dupliqué dans le HTML.
- **Carrousels tactiles** — formules et avis défilent à l'horizontale sur mobile, avec
  accroche au centre.
- **Accessibilité** — lien d'évitement, navigation au clavier, `aria-expanded` sur
  l'accordéon, `aria-pressed` sur le sélecteur de jour, fermeture par Échap, retour du focus,
  cibles tactiles d'au moins 44 px.
- **Référencement** — données structurées `AutoWash` et `FAQPage`, Open Graph complet,
  sitemap, titres hiérarchisés.

## Tests

Vérifications passées sur cette version (Playwright) : calcul du devis, encodage des URL
WhatsApp avec caractères spéciaux, compteurs, accordéon FAQ, progression de la section
épinglée, blocage du formulaire incomplet, tiroir mobile, visionneuse photo, validité des
28 liens de planning, sélecteur de jour mobile (7 jours, 4 créneaux, ouverture sur
aujourd'hui, message du dimanche sur place).

Aucun débordement horizontal ni erreur console à 1440, 820, 390 et 360 px.
