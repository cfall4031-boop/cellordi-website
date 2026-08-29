const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, (req, res) => {
  const notes = db.prepare(
    "SELECT * FROM notes_admin ORDER BY epingled DESC, updated_at DESC"
  ).all();
  res.json({ notes });
});

router.post("/", auth, (req, res) => {
  const { titre, contenu, couleur, epingled } = req.body;
  const result = db.prepare(`
    INSERT INTO notes_admin (titre, contenu, couleur, epingled)
    VALUES (?, ?, ?, ?)
  `).run(
    titre?.trim() || "Note sans titre",
    contenu || "",
    couleur || "#1e3a5f",
    epingled ? 1 : 0
  );
  res.status(201).json({ message: "Note créée.", id: result.lastInsertRowid });
});

router.patch("/:id", auth, (req, res) => {
  const { titre, contenu, couleur, epingled } = req.body;
  const note = db.prepare("SELECT id FROM notes_admin WHERE id = ?").get(req.params.id);
  if (!note) return res.status(404).json({ erreur: "Note introuvable." });
  db.prepare(`
    UPDATE notes_admin SET
      titre    = COALESCE(?, titre),
      contenu  = COALESCE(?, contenu),
      couleur  = COALESCE(?, couleur),
      epingled = COALESCE(?, epingled),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    titre !== undefined ? titre.trim() || "Note sans titre" : null,
    contenu !== undefined ? contenu : null,
    couleur || null,
    epingled !== undefined ? (epingled ? 1 : 0) : null,
    req.params.id
  );
  res.json({ message: "Note mise à jour." });
});

router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM notes_admin WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Note introuvable." });
  res.json({ message: "Note supprimée." });
});

module.exports = router;
