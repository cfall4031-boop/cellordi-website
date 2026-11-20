const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/clients — Lister tous les clients (admin)
router.get("/", auth, (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM clients WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND (prenom LIKE ? OR nom LIKE ? OR email LIKE ? OR telephone LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  query += " ORDER BY created_at DESC";
  const clients = db.prepare(query).all(...params);
  res.json({ total: clients.length, clients });
});

// GET /api/clients/:id — Détail d'un client avec son historique (admin)
router.get("/:id", auth, (req, res) => {
  const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
  if (!client) return res.status(404).json({ erreur: "Client introuvable." });

  const rendezvous = db.prepare("SELECT * FROM rendezvous WHERE client_id = ? ORDER BY date_rdv DESC").all(req.params.id);
  const tickets    = db.prepare("SELECT * FROM tickets WHERE client_id = ? ORDER BY date_reception DESC").all(req.params.id);

  res.json({ ...client, rendezvous, tickets });
});

// POST /api/clients/find-or-create — Trouver ou créer depuis un ticket (admin)
router.post("/find-or-create", auth, (req, res) => {
  const { prenom, nom, telephone, email } = req.body;

  if (!prenom || !nom || !telephone) {
    return res.status(400).json({ erreur: "Prénom, nom et téléphone sont requis." });
  }

  // 1. Chercher par téléphone en premier
  const byPhone = db.prepare("SELECT * FROM clients WHERE telephone = ?").get(telephone);
  if (byPhone) return res.json({ created: false, client: byPhone });

  // 2. Chercher par email si fourni
  if (email) {
    const byEmail = db.prepare("SELECT * FROM clients WHERE email = ?").get(email);
    if (byEmail) return res.json({ created: false, client: byEmail });
  }

  // 3. Créer — email placeholder déterministe si absent
  const finalEmail = email || `noemail.${telephone.replace(/\D/g, "")}@cellordi.local`;

  try {
    const result = db.prepare(
      "INSERT INTO clients (prenom, nom, email, telephone) VALUES (?, ?, ?, ?)"
    ).run(prenom, nom, finalEmail, telephone);

    const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(result.lastInsertRowid);
    return res.status(201).json({ created: true, client });
  } catch (_) {
    // Contrainte unique — retourner le client existant
    const existing = db.prepare("SELECT * FROM clients WHERE email = ?").get(finalEmail);
    if (existing) return res.json({ created: false, client: existing });
    return res.status(500).json({ erreur: "Erreur lors de la création du client." });
  }
});

// POST /api/clients — Créer un client manuellement (admin)
router.post("/", auth, (req, res) => {
  const { prenom, nom, email, telephone, adresse, notes } = req.body;

  if (!prenom || !nom || !email) {
    return res.status(400).json({ erreur: "Prénom, nom et email sont obligatoires." });
  }

  const existant = db.prepare("SELECT id FROM clients WHERE email = ?").get(email);
  if (existant) return res.status(409).json({ erreur: "Un client avec cet email existe déjà.", id: existant.id });

  const result = db.prepare(`
    INSERT INTO clients (prenom, nom, email, telephone, adresse, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(prenom, nom, email, telephone || null, adresse || null, notes || null);

  res.status(201).json({ message: "Client créé.", id: result.lastInsertRowid });
});

// PATCH /api/clients/:id — Modifier un client (admin)
router.patch("/:id", auth, (req, res) => {
  const { prenom, nom, email, telephone, adresse, notes } = req.body;

  const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
  if (!client) return res.status(404).json({ erreur: "Client introuvable." });

  db.prepare(`
    UPDATE clients SET
      prenom     = COALESCE(?, prenom),
      nom        = COALESCE(?, nom),
      email      = COALESCE(?, email),
      telephone  = COALESCE(?, telephone),
      adresse    = COALESCE(?, adresse),
      notes      = COALESCE(?, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(prenom||null, nom||null, email||null, telephone||null, adresse||null, notes||null, req.params.id);

  res.json({ message: "Client mis à jour.", client: db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id) });
});

// DELETE /api/clients/:id — Supprimer un client (admin)
router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM clients WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Client introuvable." });
  res.json({ message: "Client supprimé." });
});

module.exports = router;
