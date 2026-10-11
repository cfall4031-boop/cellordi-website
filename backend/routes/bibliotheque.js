const express = require("express");
const path    = require("path");
const fs      = require("fs");
const multer  = require("multer");
const jwt     = require("jsonwebtoken");
const { db }  = require("../database");
const auth    = require("../middleware/auth");

const router = express.Router();

// ── Storage paths ─────────────────────────────────────────────
const DB_PATH    = process.env.DB_PATH || path.join(__dirname, "..", "cellordi.db");
const BIBLIO_DIR = path.join(path.dirname(DB_PATH), "uploads", "biblio");
fs.mkdirSync(BIBLIO_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 25 * 1024 * 1024 },
});

// ── Helpers ───────────────────────────────────────────────────
function detectType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if ([".md", ".markdown"].includes(ext)) return "md";
  if (ext === ".txt")                     return "txt";
  if (ext === ".pdf")                     return "pdf";
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext)) return "image";
  if ([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"].includes(ext)) return "office";
  return "autre";
}

function safeFilename(n) {
  return n.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function saveFile(docId, buffer, filename) {
  const dir = path.join(BIBLIO_DIR, String(docId));
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, safeFilename(filename));
  fs.writeFileSync(fp, buffer);
  return fp;
}

function parseTags(raw) {
  if (!raw) return [];
  return raw.split("|").filter(Boolean).map(s => {
    const [id, label, couleur] = s.split(":");
    return { id: Number(id), label, couleur };
  });
}

function pruneVersions(docId) {
  const old = db.prepare(
    "SELECT id, chemin FROM biblio_versions WHERE doc_id = ? ORDER BY created_at DESC LIMIT -1 OFFSET 10"
  ).all(docId);
  for (const v of old) {
    if (v.chemin) try { fs.unlinkSync(v.chemin); } catch {}
    db.prepare("DELETE FROM biblio_versions WHERE id = ?").run(v.id);
  }
}

function snapshotVersion(doc) {
  if (!doc.contenu && !doc.chemin) return;
  let vContenu = doc.contenu || null;
  let vChemin  = null;
  if (!doc.contenu && doc.chemin && fs.existsSync(doc.chemin)) {
    const ext = path.extname(doc.chemin);
    const dir = path.join(BIBLIO_DIR, String(doc.id), "versions");
    fs.mkdirSync(dir, { recursive: true });
    vChemin = path.join(dir, `${Date.now()}${ext}`);
    fs.copyFileSync(doc.chemin, vChemin);
  }
  db.prepare("INSERT INTO biblio_versions (doc_id, contenu, chemin, taille) VALUES (?, ?, ?, ?)")
    .run(doc.id, vContenu, vChemin, doc.taille);
  pruneVersions(doc.id);
}

const docSelect = `
  SELECT d.*, GROUP_CONCAT(t.id || ':' || t.label || ':' || t.couleur, '|') AS tags_raw
  FROM biblio_docs d
  LEFT JOIN biblio_doc_tags dt ON dt.doc_id = d.id
  LEFT JOIN biblio_tags t ON t.id = dt.tag_id
`;

function setTags(docId, tagIds) {
  db.prepare("DELETE FROM biblio_doc_tags WHERE doc_id = ?").run(docId);
  if (!Array.isArray(tagIds) || !tagIds.length) return;
  const ins = db.prepare("INSERT OR IGNORE INTO biblio_doc_tags (doc_id, tag_id) VALUES (?, ?)");
  db.transaction(() => { for (const tid of tagIds) ins.run(docId, Number(tid)); })();
}

// ── DOSSIERS ──────────────────────────────────────────────────
router.get("/dossiers", auth, (_req, res) => {
  res.json({ dossiers: db.prepare("SELECT * FROM biblio_dossiers ORDER BY nom").all() });
});

router.post("/dossiers", auth, (req, res) => {
  const { nom, parent_id } = req.body;
  if (!nom?.trim()) return res.status(400).json({ erreur: "Nom requis." });
  const r = db.prepare("INSERT INTO biblio_dossiers (nom, parent_id) VALUES (?, ?)")
    .run(nom.trim(), parent_id || null);
  res.status(201).json({ id: r.lastInsertRowid });
});

router.patch("/dossiers/:id", auth, (req, res) => {
  const { nom } = req.body;
  if (!nom?.trim()) return res.status(400).json({ erreur: "Nom requis." });
  db.prepare("UPDATE biblio_dossiers SET nom = ? WHERE id = ?").run(nom.trim(), req.params.id);
  res.json({ message: "ok" });
});

router.delete("/dossiers/:id", auth, (req, res) => {
  db.prepare("UPDATE biblio_docs SET dossier_id = NULL WHERE dossier_id = ?").run(req.params.id);
  db.prepare("DELETE FROM biblio_dossiers WHERE id = ?").run(req.params.id);
  res.json({ message: "ok" });
});

// ── TAGS ──────────────────────────────────────────────────────
router.get("/tags", auth, (_req, res) => {
  res.json({ tags: db.prepare("SELECT * FROM biblio_tags ORDER BY label").all() });
});

router.post("/tags", auth, (req, res) => {
  const { label, couleur } = req.body;
  if (!label?.trim()) return res.status(400).json({ erreur: "Label requis." });
  try {
    const r = db.prepare("INSERT INTO biblio_tags (label, couleur) VALUES (?, ?)").run(label.trim(), couleur || "#6B7280");
    res.status(201).json({ id: r.lastInsertRowid });
  } catch {
    res.status(400).json({ erreur: "Ce tag existe déjà." });
  }
});

router.patch("/tags/:id", auth, (req, res) => {
  const { label, couleur } = req.body;
  const fields = [], vals = [];
  if (label   !== undefined) { fields.push("label = ?");   vals.push(label.trim()); }
  if (couleur !== undefined) { fields.push("couleur = ?"); vals.push(couleur); }
  if (!fields.length) return res.status(400).json({ erreur: "Rien à modifier." });
  vals.push(req.params.id);
  db.prepare(`UPDATE biblio_tags SET ${fields.join(", ")} WHERE id = ?`).run(...vals);
  res.json({ message: "ok" });
});

router.delete("/tags/:id", auth, (req, res) => {
  db.prepare("DELETE FROM biblio_tags WHERE id = ?").run(req.params.id);
  res.json({ message: "ok" });
});

// ── DOCS — LISTE ──────────────────────────────────────────────
router.get("/docs", auth, (req, res) => {
  const { dossier, type, corbeille, tri } = req.query;
  let where = corbeille === "1" ? "d.supprime_at IS NOT NULL" : "d.supprime_at IS NULL";
  const params = [];
  if (dossier) {
    if (dossier === "racine") { where += " AND d.dossier_id IS NULL"; }
    else { where += " AND d.dossier_id = ?"; params.push(dossier); }
  }
  if (type) { where += " AND d.type_fichier = ?"; params.push(type); }
  const orderMap = {
    updated_desc: "d.updated_at DESC",
    updated_asc:  "d.updated_at ASC",
    created_desc: "d.created_at DESC",
    name_asc:     "d.titre ASC",
    name_desc:    "d.titre DESC",
  };
  const order = orderMap[tri] || "d.updated_at DESC";
  const rows = db.prepare(`${docSelect} WHERE ${where} GROUP BY d.id ORDER BY ${order}`).all(...params);
  res.json({ docs: rows.map(d => ({ ...d, tags: parseTags(d.tags_raw), tags_raw: undefined, contenu: undefined })) });
});

// ── DOCS — RÉCENTS ────────────────────────────────────────────
router.get("/recents", auth, (_req, res) => {
  const rows = db.prepare(`${docSelect} WHERE d.supprime_at IS NULL AND d.ouvert_at IS NOT NULL GROUP BY d.id ORDER BY d.ouvert_at DESC LIMIT 8`).all();
  res.json({ docs: rows.map(d => ({ ...d, tags: parseTags(d.tags_raw), tags_raw: undefined, contenu: undefined })) });
});

// ── DOCS — RECHERCHE ──────────────────────────────────────────
router.get("/search", auth, (req, res) => {
  const { q, type } = req.query;
  if (!q?.trim()) return res.json({ docs: [] });
  const like = `%${q.trim()}%`;
  const params = [like, like];
  let extra = "";
  if (type) { extra += " AND d.type_fichier = ?"; params.push(type); }
  const rows = db.prepare(`${docSelect} WHERE d.supprime_at IS NULL AND (d.titre LIKE ? OR d.contenu LIKE ?)${extra} GROUP BY d.id ORDER BY d.updated_at DESC LIMIT 50`).all(...params);
  res.json({ docs: rows.map(d => ({ ...d, tags: parseTags(d.tags_raw), tags_raw: undefined, contenu: undefined })) });
});

// ── DOCS — GET ONE ────────────────────────────────────────────
router.get("/docs/:id", auth, (req, res) => {
  const row = db.prepare(`${docSelect} WHERE d.id = ? GROUP BY d.id`).get(req.params.id);
  if (!row) return res.status(404).json({ erreur: "Introuvable." });
  db.prepare("UPDATE biblio_docs SET ouvert_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  let contenu = row.contenu;
  if (!contenu && row.chemin && ["md", "txt"].includes(row.type_fichier)) {
    try { contenu = fs.readFileSync(row.chemin, "utf-8"); } catch {}
  }
  res.json({ doc: { ...row, tags: parseTags(row.tags_raw), tags_raw: undefined, contenu } });
});

// ── DOCS — CRÉER TEXTE ────────────────────────────────────────
router.post("/docs/texte", auth, (req, res) => {
  const { titre, type_fichier, contenu, dossier_id, description, tag_ids } = req.body;
  if (!titre?.trim()) return res.status(400).json({ erreur: "Titre requis." });
  const type = ["md", "txt"].includes(type_fichier) ? type_fichier : "md";
  const buf  = Buffer.byteLength(contenu || "", "utf-8");
  const r = db.prepare("INSERT INTO biblio_docs (titre, description, type_fichier, contenu, dossier_id, taille) VALUES (?, ?, ?, ?, ?, ?)")
    .run(titre.trim(), description || "", type, contenu || "", dossier_id || null, buf);
  if (tag_ids?.length) setTags(r.lastInsertRowid, tag_ids);
  res.status(201).json({ id: r.lastInsertRowid });
});

// ── DOCS — UPLOAD ─────────────────────────────────────────────
router.post("/docs/upload", auth, upload.single("fichier"), (req, res) => {
  if (!req.file) return res.status(400).json({ erreur: "Fichier requis." });
  const { titre, dossier_id, description } = req.body;
  const tagIds = (() => { try { return JSON.parse(req.body.tag_ids || "[]"); } catch { return []; } })();
  const nom    = req.file.originalname;
  const type   = detectType(nom);
  const r = db.prepare("INSERT INTO biblio_docs (titre, description, type_fichier, nom_fichier, taille, dossier_id) VALUES (?, ?, ?, ?, ?, ?)")
    .run(titre?.trim() || nom, description || "", type, nom, req.file.size, dossier_id || null);
  const id     = r.lastInsertRowid;
  const chemin = saveFile(id, req.file.buffer, nom);
  db.prepare("UPDATE biblio_docs SET chemin = ? WHERE id = ?").run(chemin, id);
  if (tagIds.length) setTags(id, tagIds);
  res.status(201).json({ id });
});

// ── DOCS — MISE À JOUR ────────────────────────────────────────
router.patch("/docs/:id", auth, upload.single("fichier"), (req, res) => {
  const doc = db.prepare("SELECT * FROM biblio_docs WHERE id = ?").get(req.params.id);
  if (!doc) return res.status(404).json({ erreur: "Introuvable." });
  const body   = req.body;
  const hasNewContent = body.contenu !== undefined || req.file;
  if (hasNewContent) snapshotVersion(doc);
  const fields = ["updated_at = CURRENT_TIMESTAMP"], vals = [];
  if (body.titre       !== undefined) { fields.push("titre = ?");       vals.push(body.titre.trim()); }
  if (body.description !== undefined) { fields.push("description = ?"); vals.push(body.description); }
  if (body.dossier_id  !== undefined) { fields.push("dossier_id = ?");  vals.push(body.dossier_id || null); }
  if (body.contenu     !== undefined) {
    fields.push("contenu = ?", "taille = ?");
    vals.push(body.contenu, Buffer.byteLength(body.contenu, "utf-8"));
  }
  if (req.file) {
    const chemin = saveFile(doc.id, req.file.buffer, req.file.originalname);
    fields.push("chemin = ?", "nom_fichier = ?", "taille = ?", "type_fichier = ?");
    vals.push(chemin, req.file.originalname, req.file.size, detectType(req.file.originalname));
  }
  vals.push(req.params.id);
  db.prepare(`UPDATE biblio_docs SET ${fields.join(", ")} WHERE id = ?`).run(...vals);
  if (body.tag_ids !== undefined) {
    const tagArr = (() => { try { return typeof body.tag_ids === "string" ? JSON.parse(body.tag_ids) : body.tag_ids; } catch { return []; } })();
    setTags(Number(req.params.id), tagArr);
  }
  res.json({ message: "ok" });
});

// ── DOCS — CORBEILLE ──────────────────────────────────────────
router.delete("/docs/:id", auth, (req, res) => {
  db.prepare("UPDATE biblio_docs SET supprime_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  res.json({ message: "ok" });
});

router.post("/docs/:id/restaurer", auth, (req, res) => {
  db.prepare("UPDATE biblio_docs SET supprime_at = NULL WHERE id = ?").run(req.params.id);
  res.json({ message: "ok" });
});

router.delete("/docs/:id/definitif", auth, (req, res) => {
  const doc = db.prepare("SELECT * FROM biblio_docs WHERE id = ?").get(req.params.id);
  if (!doc) return res.status(404).json({ erreur: "Introuvable." });
  try {
    const dir = path.join(BIBLIO_DIR, String(doc.id));
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
  db.prepare("DELETE FROM biblio_docs WHERE id = ?").run(req.params.id);
  res.json({ message: "ok" });
});

// ── FICHIER SERVI ─────────────────────────────────────────────
router.get("/docs/:id/file", (req, res) => {
  const token = req.query.token || (req.headers.authorization || "").replace("Bearer ", "");
  try { jwt.verify(token, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ erreur: "Non autorisé." }); }
  const doc = db.prepare("SELECT chemin, nom_fichier FROM biblio_docs WHERE id = ?").get(req.params.id);
  if (!doc?.chemin || !fs.existsSync(doc.chemin)) return res.status(404).json({ erreur: "Fichier introuvable." });
  res.setHeader("Content-Disposition", `inline; filename="${doc.nom_fichier || "fichier"}"`);
  res.sendFile(path.resolve(doc.chemin));
});

// ── VERSIONS ─────────────────────────────────────────────────
router.get("/docs/:id/versions", auth, (req, res) => {
  const vs = db.prepare("SELECT id, doc_id, taille, created_at FROM biblio_versions WHERE doc_id = ? ORDER BY created_at DESC").all(req.params.id);
  res.json({ versions: vs });
});

router.post("/docs/:id/versions/:vid/restaurer", auth, (req, res) => {
  const doc = db.prepare("SELECT * FROM biblio_docs WHERE id = ?").get(req.params.id);
  const ver = db.prepare("SELECT * FROM biblio_versions WHERE id = ? AND doc_id = ?").get(req.params.vid, req.params.id);
  if (!doc || !ver) return res.status(404).json({ erreur: "Introuvable." });
  snapshotVersion(doc);
  if (ver.contenu !== null) {
    db.prepare("UPDATE biblio_docs SET contenu = ?, taille = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(ver.contenu, Buffer.byteLength(ver.contenu || "", "utf-8"), doc.id);
  } else if (ver.chemin && fs.existsSync(ver.chemin)) {
    const ext  = path.extname(ver.chemin);
    const dest = path.join(BIBLIO_DIR, String(doc.id), `restaure_${Date.now()}${ext}`);
    if (doc.chemin) try { fs.unlinkSync(doc.chemin); } catch {}
    fs.copyFileSync(ver.chemin, dest);
    db.prepare("UPDATE biblio_docs SET chemin = ?, taille = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(dest, fs.statSync(dest).size, doc.id);
  }
  if (ver.chemin) try { fs.unlinkSync(ver.chemin); } catch {}
  db.prepare("DELETE FROM biblio_versions WHERE id = ?").run(ver.id);
  res.json({ message: "ok" });
});

// ── NOTES ─────────────────────────────────────────────────────
router.get("/docs/:id/notes", auth, (req, res) => {
  res.json({ notes: db.prepare("SELECT * FROM biblio_notes WHERE doc_id = ? ORDER BY created_at DESC").all(req.params.id) });
});

router.post("/docs/:id/notes", auth, (req, res) => {
  const { contenu } = req.body;
  if (!contenu?.trim()) return res.status(400).json({ erreur: "Contenu requis." });
  const r = db.prepare("INSERT INTO biblio_notes (doc_id, contenu) VALUES (?, ?)").run(req.params.id, contenu.trim());
  res.status(201).json({ id: r.lastInsertRowid });
});

router.patch("/docs/:id/notes/:nid", auth, (req, res) => {
  const { contenu } = req.body;
  if (!contenu?.trim()) return res.status(400).json({ erreur: "Contenu requis." });
  db.prepare("UPDATE biblio_notes SET contenu = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND doc_id = ?")
    .run(contenu.trim(), req.params.nid, req.params.id);
  res.json({ message: "ok" });
});

router.delete("/docs/:id/notes/:nid", auth, (req, res) => {
  db.prepare("DELETE FROM biblio_notes WHERE id = ? AND doc_id = ?").run(req.params.nid, req.params.id);
  res.json({ message: "ok" });
});

module.exports = router;
