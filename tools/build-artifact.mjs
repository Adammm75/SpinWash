/**
 * Génère la variante publiable en Artifact à partir de index.html.
 *
 * L'Artifact enveloppe lui-même la page dans <!doctype html><head>…<body>, en
 * fournissant charset et viewport. On retire donc ce squelette et on conserve
 * le titre, le lien Google Fonts, le CSS, le contenu et les scripts.
 *
 *   node tools/build-artifact.mjs
 *   -> .artifact/index.html
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, ".artifact");

let s = readFileSync(resolve(ROOT, "index.html"), "utf8");

const head = s.slice(s.indexOf("<head>") + 6, s.indexOf("</head>"));
const body = s.slice(s.indexOf("<body>") + 6, s.lastIndexOf("</body>"));

// L'hôte fournit déjà charset + viewport ; le titre long est fait pour le SEO,
// l'Artifact veut un nom court.
const keep = head
  .split("\n")
  .filter((l) => {
    const t = l.trim();
    if (t.startsWith("<meta charset")) return false;
    if (t.startsWith('<meta name="viewport"')) return false;
    if (t.startsWith('<meta name="claude:viewport-fit-sides"')) return false;
    if (t.startsWith("<title>")) return false;
    return true;
  })
  .join("\n")
  .trim();

const page = [
  "<title>SPINWASH</title>",
  '<meta name="claude:viewport-fit-sides" content="cover">',
  keep,
  body.trim(),
  "",
].join("\n");

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, "index.html"), page, "utf8");

for (const f of ["mentions-legales.html", "confidentialite.html"]) {
  cpSync(resolve(ROOT, f), resolve(OUT, f));
}
cpSync(resolve(ROOT, "assets"), resolve(OUT, "assets"), { recursive: true });

const bad = ["<!doctype", "<html", "</html>", "<head>", "</head>", "<body>", "</body>"];
const found = bad.filter((t) => page.toLowerCase().includes(t));
console.log(found.length ? `ATTENTION, squelette résiduel : ${found}` : "squelette retiré");
console.log(`.artifact/index.html — ${(page.length / 1024).toFixed(1)} Ko`);
