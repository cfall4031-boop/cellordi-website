const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// ── GET /api/stock — liste toutes les pièces avec quantité calculée ──────────
router.get("/", auth, (req, res) => {
  const pieces = db.prepare(`
    SELECT
      p.*,
      COALESCE(SUM(CASE WHEN m.type='entree'      THEN  m.quantite ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN m.type='sortie'    THEN  m.quantite ELSE 0 END), 0)
      + COALESCE(SUM(CASE WHEN m.type='ajustement' THEN m.quantite ELSE 0 END), 0) AS quantite_calculee,
      COALESCE(SUM(CASE WHEN m.type='entree' THEN m.quantite * m.cout_unitaire ELSE 0 END), 0) AS total_investi,
      COALESCE(SUM(CASE WHEN m.type='sortie' THEN m.quantite * m.prix_unitaire ELSE 0 END), 0) AS total_revenus
    FROM pieces_catalogue p
    LEFT JOIN mouvements_stock m ON m.piece_id = p.id
    GROUP BY p.id
    ORDER BY p.type_appareil, p.type_piece
  `).all();
  res.json({ pieces });
});

// ── GET /api/stock/stats — statistiques financières globales ────────────────
router.get("/stats", auth, (req, res) => {
  const global = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='entree' THEN quantite * cout_unitaire ELSE 0 END), 0) AS total_investi,
      COALESCE(SUM(CASE WHEN type='sortie' THEN quantite * prix_unitaire ELSE 0 END), 0) AS total_revenus,
      COALESCE(SUM(CASE WHEN type='sortie' THEN quantite ELSE 0 END), 0) AS total_pieces_vendues
    FROM mouvements_stock
  `).get();

  const mensuel = db.prepare(`
    SELECT
      strftime('%Y-%m', created_at) AS mois,
      COALESCE(SUM(CASE WHEN type='entree' THEN quantite * cout_unitaire ELSE 0 END), 0) AS investi,
      COALESCE(SUM(CASE WHEN type='sortie' THEN quantite * prix_unitaire ELSE 0 END), 0) AS revenus
    FROM mouvements_stock
    WHERE created_at >= date('now', '-12 months')
    GROUP BY mois
    ORDER BY mois ASC
  `).all();

  const top_pieces = db.prepare(`
    SELECT
      p.type_appareil,
      p.modele,
      p.type_piece,
      COALESCE(SUM(CASE WHEN m.type='sortie' THEN m.quantite ELSE 0 END), 0) AS nb_sorties
    FROM pieces_catalogue p
    LEFT JOIN mouvements_stock m ON m.piece_id = p.id
    GROUP BY p.id
    ORDER BY nb_sorties DESC
    LIMIT 10
  `).all();

  res.json({
    total_investi:       global.total_investi,
    total_revenus:       global.total_revenus,
    profit:              global.total_revenus - global.total_investi,
    total_pieces_vendues: global.total_pieces_vendues,
    mensuel,
    top_pieces,
  });
});

// ── POST /api/stock/:id/mouvement — ajouter un mouvement ────────────────────
router.post("/:id/mouvement", auth, (req, res) => {
  const { type, quantite, cout_unitaire, prix_unitaire, notes } = req.body;
  const piece_id = parseInt(req.params.id, 10);

  if (!["entree", "sortie", "ajustement"].includes(type)) {
    return res.status(400).json({ erreur: "Type invalide. Valeurs : entree, sortie, ajustement." });
  }
  if (!quantite || isNaN(Number(quantite))) {
    return res.status(400).json({ erreur: "Quantité invalide." });
  }

  const piece = db.prepare("SELECT id FROM pieces_catalogue WHERE id = ?").get(piece_id);
  if (!piece) return res.status(404).json({ erreur: "Pièce introuvable." });

  const result = db.prepare(`
    INSERT INTO mouvements_stock (piece_id, type, quantite, cout_unitaire, prix_unitaire, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(piece_id, type, Number(quantite), Number(cout_unitaire) || 0, Number(prix_unitaire) || 0, notes || null);

  res.status(201).json({ message: "Mouvement enregistré.", id: result.lastInsertRowid });
});

// ── PUT /api/stock/:id — mettre à jour seuil_alerte ─────────────────────────
router.put("/:id", auth, (req, res) => {
  const { seuil_alerte } = req.body;
  const result = db.prepare(
    "UPDATE pieces_catalogue SET seuil_alerte = ? WHERE id = ?"
  ).run(Number(seuil_alerte) || 3, req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Pièce introuvable." });
  res.json({ message: "Seuil mis à jour." });
});

// ── GET /api/stock/:id/mouvements — historique d'une pièce ──────────────────
router.get("/:id/mouvements", auth, (req, res) => {
  const mouvements = db.prepare(`
    SELECT * FROM mouvements_stock WHERE piece_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.params.id);
  res.json({ mouvements });
});

module.exports = router;
