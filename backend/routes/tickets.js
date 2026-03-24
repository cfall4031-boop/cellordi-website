const express = require("express");
const { db, genererNumeroTicket } = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/tickets/suivi/:numero — Suivi public par numéro de ticket
router.get("/suivi/:numero", (req, res) => {
  const ticket = db.prepare(`
    SELECT numero, prenom, nom, type_appareil, marque, modele,
           probleme, statut, date_reception, date_estimee, cout_estime
    FROM tickets WHERE numero = ?
  `).get(req.params.numero.toUpperCase());

  if (!ticket) return res.status(404).json({ erreur: "Ticket introuvable. Vérifiez votre numéro." });

  const etapes = {
    recu:        { label: "Reçu",      index: 0 },
    diagnostic:  { label: "Diagnostic",index: 1 },
    en_cours:    { label: "En cours",  index: 2 },
    termine:     { label: "Terminé",   index: 3 },
    pret:        { label: "Prêt",      index: 4 },
    livre:       { label: "Livré",     index: 5 },
  };

  res.json({
    ...ticket,
    etape_actuelle: etapes[ticket.statut] || { label: ticket.statut, index: 0 },
    toutes_etapes: Object.values(etapes)
  });
});

// POST /api/tickets — Créer un ticket (admin)
router.post("/", auth, (req, res) => {
  const {
    prenom, nom, email, telephone,
    type_appareil, marque, modele, probleme,
    diagnostic, pieces, cout_estime, date_estimee,
    client_id, rendezvous_id, notes_internes
  } = req.body;

  if (!prenom || !nom || !type_appareil || !probleme) {
    return res.status(400).json({ erreur: "Champs obligatoires manquants." });
  }

  // Générer numéro unique
  let numero;
  let attempts = 0;
  do {
    numero = genererNumeroTicket();
    attempts++;
    if (attempts > 10) return res.status(500).json({ erreur: "Impossible de générer un numéro unique." });
  } while (db.prepare("SELECT id FROM tickets WHERE numero = ?").get(numero));

  const result = db.prepare(`
    INSERT INTO tickets (
      numero, client_id, rendezvous_id, prenom, nom, email, telephone,
      type_appareil, marque, modele, probleme, diagnostic, pieces,
      cout_estime, date_estimee, notes_internes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    numero, client_id || null, rendezvous_id || null,
    prenom, nom, email || null, telephone || null,
    type_appareil, marque || null, modele || null, probleme,
    diagnostic || null, pieces || null,
    cout_estime || 0, date_estimee || null, notes_internes || null
  );

  res.status(201).json({
    message: "Ticket créé avec succès.",
    id: result.lastInsertRowid,
    numero
  });
});

// GET /api/tickets — Lister tous les tickets (admin)
router.get("/", auth, (req, res) => {
  // Lazy expiration: delete tickets marked "livré" more than 24h ago
  // Decharges are preserved automatically via ON DELETE SET NULL
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    "DELETE FROM tickets WHERE statut = 'livre' AND date_livraison IS NOT NULL AND date_livraison < ?"
  ).run(cutoff);

  const { statut, search } = req.query;
  let query = "SELECT * FROM tickets WHERE 1=1";
  const params = [];

  if (statut) { query += " AND statut = ?"; params.push(statut); }
  if (search) {
    query += " AND (numero LIKE ? OR nom LIKE ? OR email LIKE ? OR type_appareil LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  query += " ORDER BY date_reception DESC";
  const tickets = db.prepare(query).all(...params);
  res.json({ total: tickets.length, tickets });
});

// GET /api/tickets/:id — Détail d'un ticket (admin)
router.get("/:id", auth, (req, res) => {
  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(req.params.id);
  if (!ticket) return res.status(404).json({ erreur: "Ticket introuvable." });
  res.json(ticket);
});

// PATCH /api/tickets/:id — Mettre à jour un ticket (admin)
router.patch("/:id", auth, (req, res) => {
  const {
    statut, diagnostic, pieces, cout_estime, cout_final,
    date_estimee, notes_internes
  } = req.body;

  const statutsValides = ["recu","diagnostic","en_cours","termine","pret","livre"];
  if (statut && !statutsValides.includes(statut)) {
    return res.status(400).json({ erreur: `Statut invalide. Valeurs: ${statutsValides.join(", ")}` });
  }

  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(req.params.id);
  if (!ticket) return res.status(404).json({ erreur: "Ticket introuvable." });

  const dateCompletion = statut === "termine" ? new Date().toISOString() : ticket.date_completion;
  const dateLivraison  = statut === "livre"   ? new Date().toISOString() : ticket.date_livraison;

  db.prepare(`
    UPDATE tickets SET
      statut          = COALESCE(?, statut),
      diagnostic      = COALESCE(?, diagnostic),
      pieces          = COALESCE(?, pieces),
      cout_estime     = COALESCE(?, cout_estime),
      cout_final      = COALESCE(?, cout_final),
      date_estimee    = COALESCE(?, date_estimee),
      notes_internes  = COALESCE(?, notes_internes),
      date_completion = ?,
      date_livraison  = ?,
      updated_at      = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    statut || null, diagnostic || null, pieces || null,
    cout_estime ?? null, cout_final ?? null,
    date_estimee || null, notes_internes || null,
    dateCompletion, dateLivraison, req.params.id
  );

  res.json({ message: "Ticket mis à jour.", ticket: db.prepare("SELECT * FROM tickets WHERE id = ?").get(req.params.id) });
});

// DELETE /api/tickets/:id — Supprimer un ticket (admin)
router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM tickets WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Ticket introuvable." });
  res.json({ message: "Ticket supprimé." });
});

module.exports = router;
