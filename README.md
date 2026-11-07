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

## Ce que fait la page

- **Devis interactif** — formule, véhicule, options et créneau ; le total se met à jour et
  génère un message WhatsApp pré-rempli.
- **Formulaire de réservation** — validation native, case de consentement RGPD, message
  WhatsApp construit avec `encodeURIComponent` et ouvert par un vrai lien (jamais
  `window.open`, qui échoue silencieusement derrière un bloqueur).
- **Grille de planning** — 28 créneaux cliquables, chacun pré-remplissant jour et heure.
- **Accessibilité** — lien d'évitement, navigation au clavier, `aria-expanded` sur
  l'accordéon, fermeture par Échap, retour du focus, respect de `prefers-reduced-motion`.
- **Référencement** — données structurées `AutoWash` et `FAQPage`, Open Graph complet,
  sitemap, titres hiérarchisés.

## Tests

Les vérifications passées sur cette version (Playwright) :
calcul du devis, encodage des URL WhatsApp avec caractères spéciaux, accordéon FAQ, blocage du
formulaire incomplet, tiroir mobile, visionneuse photo, validité des 28 liens de planning,
absence de débordement horizontal à 390 px, absence d'erreur console.
