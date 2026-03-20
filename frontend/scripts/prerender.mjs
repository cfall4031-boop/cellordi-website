/**
 * prerender.mjs — Script de pré-rendu SEO pour les articles de blog
 *
 * Exécuté après `vite build`.
 * Pour chaque article, crée dist/blog/<slug>/index.html avec les balises
 * <title>, <meta description>, <og:*> et <canonical> inscrites en dur
 * dans le HTML — lisibles par Googlebot sans exécution de JavaScript.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");          // frontend/
const DIST      = join(ROOT, "dist");
const BASE_URL  = "https://reparationcellordi.ca";
const SITE_NAME = "Réparation CeLL&Ordi";

// ── Lire le template HTML de base ─────────────────────────────────────────────
const templatePath = join(DIST, "index.html");
if (!existsSync(templatePath)) {
  console.error("❌ dist/index.html introuvable — lancez vite build d'abord.");
  process.exit(1);
}
const template = readFileSync(templatePath, "utf-8");

// ── Charger les métadonnées des articles ───────────────────────────────────────
const articles = JSON.parse(
  readFileSync(join(__dirname, "articles-meta.json"), "utf-8")
);

// ── Fonction : échapper les caractères HTML dans les attributs ─────────────────
function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Générer un HTML par article ───────────────────────────────────────────────
let count = 0;

for (const article of articles) {
  const { slug, title, desc, img, date } = article;
  const pageUrl = `${BASE_URL}/blog/${slug}`;

  const metaBlock = `
  <!-- SEO pré-rendu — ${slug} -->
  <title>${esc(title)} | ${SITE_NAME}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type"        content="article">
  <meta property="og:title"       content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url"         content="${pageUrl}">
  <meta property="og:image"       content="${esc(img)}">
  <meta property="og:site_name"   content="${SITE_NAME}">
  <meta property="article:published_time" content="${date}">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image"       content="${esc(img)}">`;

  // Injecter juste avant </head>
  const html = template.replace("</head>", `${metaBlock}\n</head>`);

  // Créer le dossier dist/blog/<slug>/
  const dir = join(DIST, "blog", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  count++;
  console.log(`✅ Pré-rendu : /blog/${slug}`);
}

// ── Page blog listing ─────────────────────────────────────────────────────────
const blogMeta = `
  <!-- SEO pré-rendu — /blog -->
  <title>Blog Conseils & Réparation | ${SITE_NAME}</title>
  <meta name="description" content="Conseils d'experts en réparation de cellulaires et ordinateurs, astuces de sécurité, guides pratiques — le blog de Réparation CeLL&Ordi à Sainte-Catherine, QC.">
  <link rel="canonical" href="${BASE_URL}/blog">
  <meta property="og:type"        content="website">
  <meta property="og:title"       content="Blog Conseils & Réparation | ${SITE_NAME}">
  <meta property="og:description" content="Conseils d'experts en réparation de cellulaires et ordinateurs, astuces de sécurité, guides pratiques.">
  <meta property="og:url"         content="${BASE_URL}/blog">
  <meta property="og:site_name"   content="${SITE_NAME}">`;

const blogHtml = template.replace("</head>", `${blogMeta}\n</head>`);
mkdirSync(join(DIST, "blog"), { recursive: true });
writeFileSync(join(DIST, "blog", "index.html"), blogHtml, "utf-8");
console.log(`✅ Pré-rendu : /blog`);

console.log(`\n🎉 Pré-rendu terminé — ${count + 1} pages générées.`);
