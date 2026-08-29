const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, (req, res) => {
  const entrees = db.prepare(
    "SELECT * FROM registre_financier ORDER BY statut ASC, created_at DESC"
  ).all();

  const stats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='pret'    AND statut='actif' THEN montant ELSE 0 END), 0) AS total_prete,
      COALESCE(SUM(CASE WHEN type='emprunt' AND statut='actif' THEN montant ELSE 0 END), 0) AS total_emprunte,
      COALESCE(SUM(CASE WHEN type='pret'    AND statut='rembourse' THEN montant ELSE 0 END), 0) AS total_rembourse_pret,
      COALESCE(SUM(CASE WHEN type='emprunt' AND statut='rembourse' THEN montant ELSE 0 END), 0) AS total_rembourse_emprunt
    FROM registre_financier
  `).get();

  res.json({ entrees, stats });
});

router.post("/", auth, (req, res) => {
  const { type, personne, description, montant, date_echeance, notes } = req.body;
  if (!type || !personne || !montant) {
    return res.status(400).json({ erreur: "Type, personne et montant sont requis." });
  }
  const result = db.prepare(`
    INSERT INTO registre_financier (type, personne, description, montant, date_echeance, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type, personne.trim(), description || "", Number(montant), date_echeance || null, notes || "");
  res.status(201).json({ message: "Entrée créée.", id: result.lastInsertRowid });
});

router.patch("/:id", auth, (req, res) => {
  const { statut, notes, date_echeance } = req.body;
  const entry = db.prepare("SELECT id FROM registre_financier WHERE id = ?").get(req.params.id);
  if (!entry) return res.status(404).json({ erreur: "Entrée introuvable." });
  db.prepare(`
    UPDATE registre_financier SET
      statut        = COALESCE(?, statut),
      notes         = COALESCE(?, notes),
      date_echeance = COALESCE(?, date_echeance),
      updated_at    = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(statut || null, notes !== undefined ? notes : null, date_echeance || null, req.params.id);
  res.json({ message: "Entrée mise à jour." });
});

router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM registre_financier WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Entrée introuvable." });
  res.json({ message: "Entrée supprimée." });
});

module.exports = router;
