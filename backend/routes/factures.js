const express = require("express");
const { db }  = require("../database");
const auth    = require("../middleware/auth");

const router = express.Router();

const STATUTS_VALIDES = ["en_attente", "paye"];
const RECURRENCES_VALIDES = ["aucune", "hebdomadaire", "mensuelle", "annuelle"];

// ── TYPES DE FACTURES ────────────────────────────────────────────────────────

// GET /api/factures/types
router.get("/types", auth, (req, res) => {
  const types = db.prepare("SELECT * FROM facture_types ORDER BY ordre ASC, id ASC").all();
  res.json({ types });
});

// POST /api/factures/types
router.post("/types", auth, (req, res) => {
  const { label, color } = req.body;
  if (!label || !label.trim()) return res.status(400).json({ erreur: "label requis." });
  const maxOrdre = db.prepare("SELECT COALESCE(MAX(ordre),0) as m FROM facture_types").get().m;
  const result = db.prepare("INSERT INTO facture_types (label, color, ordre) VALUES (?, ?, ?)")
    .run(label.trim(), color || "#6B7280", maxOrdre + 1);
  res.status(201).json({ message: "Type créé.", id: result.lastInsertRowid });
});

// PATCH /api/factures/types/:tid
router.patch("/types/:tid", auth, (req, res) => {
  const t = db.prepare("SELECT * FROM facture_types WHERE id = ?").get(req.params.tid);
  if (!t) return res.status(404).json({ erreur: "Type introuvable." });
  const { label, color } = req.body;
  db.prepare("UPDATE facture_types SET label=?, color=? WHERE id=?")
    .run(label !== undefined ? label.trim() : t.label, color !== undefined ? color : t.color, t.id);
  res.json({ message: "Type mis à jour." });
});

// DELETE /api/factures/types/:tid
router.delete("/types/:tid", auth, (req, res) => {
  const result = db.prepare("DELETE FROM facture_types WHERE id = ?").run(req.params.tid);
  if (result.changes === 0) return res.status(404).json({ erreur: "Type introuvable." });
  res.json({ message: "Type supprimé." });
});

// GET /api/factures — lister, filtrable par ?mois=&annee=
router.get("/", auth, (req, res) => {
  const { mois, annee } = req.query;
  let q = "SELECT * FROM factures_calendrier WHERE 1=1";
  const p = [];
  if (mois && annee) {
    q += " AND strftime('%Y-%m', date_echeance) = ?";
    p.push(`${annee}-${String(mois).padStart(2, "0")}`);
  }
  q += " ORDER BY date_echeance ASC";
  res.json({ factures: db.prepare(q).all(...p) });
});

// POST /api/factures — créer
router.post("/", auth, (req, res) => {
  const { titre, montant, type_facture, date_echeance, recurrence, notes } = req.body;
  if (!titre || !date_echeance) {
    return res.status(400).json({ erreur: "titre et date_echeance sont obligatoires." });
  }
  const type = type_facture || "autre";
  const rec  = RECURRENCES_VALIDES.includes(recurrence) ? recurrence : "aucune";
  const result = db.prepare(`
    INSERT INTO factures_calendrier (titre, montant, type_facture, date_echeance, recurrence, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(titre.trim(), montant ? Number(montant) : null, type, date_echeance, rec, notes || "");
  res.status(201).json({ message: "Facture créée.", id: result.lastInsertRowid });
});

// PATCH /api/factures/:id — modifier
router.patch("/:id", auth, (req, res) => {
  const facture = db.prepare("SELECT * FROM factures_calendrier WHERE id = ?").get(req.params.id);
  if (!facture) return res.status(404).json({ erreur: "Facture introuvable." });

  const {
    titre, montant, type_facture, date_echeance, statut, recurrence, notes
  } = req.body;

  const updates = {
    titre:         titre        !== undefined ? titre.trim()                                         : facture.titre,
    montant:       montant      !== undefined ? (montant ? Number(montant) : null)                   : facture.montant,
    type_facture:  type_facture !== undefined ? (type_facture || facture.type_facture) : facture.type_facture,
    date_echeance: date_echeance !== undefined ? date_echeance                                       : facture.date_echeance,
    statut:        statut       !== undefined ? (STATUTS_VALIDES.includes(statut) ? statut : facture.statut) : facture.statut,
    recurrence:    recurrence   !== undefined ? (RECURRENCES_VALIDES.includes(recurrence) ? recurrence : facture.recurrence) : facture.recurrence,
    notes:         notes        !== undefined ? notes                                                : facture.notes,
  };

  db.prepare(`
    UPDATE factures_calendrier
    SET titre=?, montant=?, type_facture=?, date_echeance=?, statut=?, recurrence=?, notes=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(updates.titre, updates.montant, updates.type_facture, updates.date_echeance, updates.statut, updates.recurrence, updates.notes, req.params.id);

  res.json({ message: "Facture mise à jour." });
});

// DELETE /api/factures/:id
router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM factures_calendrier WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Facture introuvable." });
  res.json({ message: "Facture supprimée." });
});

module.exports = router;
