/**
 * prerender.mjs — Script de pré-rendu SEO pour articles de blog + pages de services
 *
 * Exécuté après `vite build`.
 * Génère dist/blog/<slug>/index.html et dist/services/<slug>/index.html
 * avec balises <title>, <meta description>, <og:*>, <canonical> et JSON-LD
 * inscrites en dur dans le HTML — lisibles par Googlebot sans JavaScript.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const DIST      = join(ROOT, "dist");
const BASE_URL  = "https://cellordi.ca";
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

// ── Remplace title + description + og: dans le template ───────────────────────
function injectMeta(tmpl, title, desc, canonical, extra = "") {
  return tmpl
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*\/>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${esc(desc)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(desc)}">`)
    .replace("</head>", `${extra}\n</head>`);
}

// ── JSON-LD LocalBusiness partagé ─────────────────────────────────────────────
const LOCAL_BUSINESS_LD = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Réparation CeLL&Ordi",
    "url": "${BASE_URL}",
    "telephone": "+15142375792",
    "email": "reparationcellulaire.ordinateur@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5050 QC-132 #203",
      "addressLocality": "Sainte-Catherine",
      "addressRegion": "QC",
      "postalCode": "J5C 1L4",
      "addressCountry": "CA"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 45.4046, "longitude": -73.5793 },
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "16:00" }
    ],
    "areaServed": ["Sainte-Catherine","Saint-Constant","Candiac","La Prairie","Châteauguay","Brossard","Longueuil"],
    "hasMap": "https://maps.google.com/?q=5050+QC-132+%23203+Sainte-Catherine+QC"
  }
  </script>`;

// ── Métadonnées des pages de services ─────────────────────────────────────────
const SERVICES = [
  {
    slug: "cellulaires",
    title: "Réparation Cellulaire iPhone & Samsung à Sainte-Catherine | CeLL&Ordi",
    desc:  "Réparation professionnelle de cellulaires à Sainte-Catherine, QC. Écran fissuré, batterie, connecteur — résultats en moins de 2h. Diagnostic gratuit, pièces certifiées.",
    img:   "https://images.unsplash.com/photo-1697208386334-cdb57cd8ae75?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "ordinateurs",
    title: "Réparation Ordinateur PC & Mac à Sainte-Catherine | CeLL&Ordi",
    desc:  "Réparation PC et Mac à Sainte-Catherine, QC. Remplacement SSD, RAM, virus, écran laptop, récupération de données. Diagnostic gratuit, garantie 40 jours.",
    img:   "https://images.unsplash.com/photo-1689236673934-66f8e9d9279b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "informatique",
    title: "Services Informatiques Montérégie — Réseau & Sécurité | CeLL&Ordi",
    desc:  "Configuration réseau, antivirus, WiFi et support IT pour particuliers et PME en Montérégie. Intervention sur site ou à distance. Évaluation gratuite.",
    img:   "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "web",
    title: "Développement Web & Applications à Sainte-Catherine | CeLL&Ordi",
    desc:  "Création de sites web, e-commerce et applications React à Sainte-Catherine, QC. Design mobile-first, SEO optimisé, temps de chargement < 2s. Devis gratuit.",
    img:   "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "cloud",
    title: "Solutions Cloud & Migration Google Workspace / Microsoft 365 | CeLL&Ordi",
    desc:  "Migration cloud sécurisée pour PME et indépendants — Google Workspace, Microsoft 365, NAS, sauvegarde automatique. Zéro perte de données, garantie.",
    img:   "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "entretien",
    title: "Contrats d'Entretien Informatique pour Entreprises | CeLL&Ordi",
    desc:  "Maintenance préventive, support prioritaire et audit de sécurité mensuel pour PME de la Montérégie. Temps de réponse garanti < 4h. Audit initial gratuit.",
    img:   "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
];

// ── Générer pages de services ─────────────────────────────────────────────────
let svcCount = 0;
for (const svc of SERVICES) {
  const pageUrl = `${BASE_URL}/services/${svc.slug}`;
  const ogBlock = `
  <!-- SEO pré-rendu — /services/${svc.slug} -->
  <meta property="og:type"      content="website">
  <meta property="og:image"     content="${esc(svc.img)}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta name="twitter:card"     content="summary_large_image">
  <meta name="twitter:image"    content="${esc(svc.img)}">${LOCAL_BUSINESS_LD}`;

  const html = injectMeta(template, svc.title, svc.desc, pageUrl, ogBlock);

  const dir = join(DIST, "services", svc.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  svcCount++;
  console.log(`✅ Pré-rendu : /services/${svc.slug}`);
}

// ── Générer un HTML par article de blog ───────────────────────────────────────
let blogCount = 0;
for (const article of articles) {
  const { slug, title, desc, img, date } = article;
  const pageUrl = `${BASE_URL}/blog/${slug}`;

  const extra = `
  <!-- SEO pré-rendu — /blog/${slug} -->
  <meta property="og:type"        content="article">
  <meta property="og:image"       content="${esc(img)}">
  <meta property="og:site_name"   content="${SITE_NAME}">
  <meta property="article:published_time" content="${date}">
  <meta name="twitter:card"       content="summary_large_image">
  <meta name="twitter:image"      content="${esc(img)}">`;

  const html = injectMeta(template, `${title} | ${SITE_NAME}`, desc, pageUrl, extra);

  const dir = join(DIST, "blog", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  blogCount++;
  console.log(`✅ Pré-rendu : /blog/${slug}`);
}

// ── Page blog listing ─────────────────────────────────────────────────────────
const blogListingDesc = "Conseils d'experts en réparation de cellulaires et ordinateurs, astuces de sécurité, guides pratiques — le blog de Réparation CeLL&Ordi à Sainte-Catherine, QC.";
const blogExtra = `
  <!-- SEO pré-rendu — /blog -->
  <meta property="og:type"      content="website">
  <meta property="og:site_name" content="${SITE_NAME}">`;

const blogHtml = injectMeta(template, `Blog Conseils & Réparation | ${SITE_NAME}`, blogListingDesc, `${BASE_URL}/blog`, blogExtra);
mkdirSync(join(DIST, "blog"), { recursive: true });
writeFileSync(join(DIST, "blog", "index.html"), blogHtml, "utf-8");
console.log(`✅ Pré-rendu : /blog`);

// ── Page d'accueil — injecter JSON-LD LocalBusiness ──────────────────────────
const homeHtml = readFileSync(templatePath, "utf-8");
const homeWithLD = homeHtml.replace("</head>", `${LOCAL_BUSINESS_LD}\n</head>`);
writeFileSync(templatePath, homeWithLD, "utf-8");
console.log(`✅ Pré-rendu : / (JSON-LD injecté)`);

const total = svcCount + blogCount + 2;
console.log(`\n🎉 Pré-rendu terminé — ${total} pages générées.`);
