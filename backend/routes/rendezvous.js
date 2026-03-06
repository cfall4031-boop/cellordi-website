const express = require("express");
const { db, genererNumeroTicket } = require("../database");
const auth = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");
const { sendSMS }   = require("../utils/smsService");
const { rdvClient, rdvAdmin } = require("../utils/emailTemplates");

const router = express.Router();

// POST /api/rendezvous — Créer un RDV (public)
router.post("/", (req, res) => {
  const { prenom, nom, email, telephone, type_appareil, date_rdv, heure, description } = req.body;

  if (!prenom || !nom || !email || !type_appareil || !date_rdv) {
    return res.status(400).json({ erreur: "Champs obligatoires manquants (prenom, nom, email, type_appareil, date_rdv)." });
  }

  // Chercher ou créer le client
  let client = db.prepare("SELECT id FROM clients WHERE email = ?").get(email);
  if (!client) {
    const ins = db.prepare(
      "INSERT INTO clients (prenom, nom, email, telephone) VALUES (?, ?, ?, ?)"
    ).run(prenom, nom, email, telephone || null);
    client = { id: ins.lastInsertRowid };
  }

  const rdvResult = db.prepare(`
    INSERT INTO rendezvous (client_id, prenom, nom, email, telephone, type_appareil, date_rdv, heure, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(client.id, prenom, nom, email, telephone || null, type_appareil, date_rdv, heure || null, description || null);

  const rdvId = rdvResult.lastInsertRowid;

  // ── Auto-créer un ticket de suivi ───────────────────────────────
  let numero_ticket = null;
  try {
    numero_ticket = genererNumeroTicket();
    db.prepare(`
      INSERT INTO tickets
        (numero, client_id, rendezvous_id, prenom, nom, email, telephone, type_appareil, probleme, statut)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'recu')
    `).run(
      numero_ticket,
      client.id,
      rdvId,
      prenom,
      nom,
      email,
      telephone || null,
      type_appareil,
      description || "Non précisé"
    );
    console.log(`[RDV] ✅ Ticket créé automatiquement : ${numero_ticket}`);
  } catch (e) {
    console.error("[RDV] ❌ Erreur création ticket automatique :", e.message);
    numero_ticket = null;
  }

  // ── Emails de confirmation (fire-and-forget) ─────────────────────
  const emailData = { prenom, nom, email, telephone, type_appareil, date_rdv, heure, description, numero_ticket };

  sendEmail({
    to: email,
    subject: numero_ticket
      ? `Confirmation de votre rendez-vous — Ticket ${numero_ticket}`
      : `Confirmation de votre rendez-vous — Réparation CeLL&Ordi`,
    html: rdvClient(emailData),
  }).catch(console.error);

  if (process.env.ADMIN_NOTIFY_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `🔔 Nouveau RDV — ${prenom} ${nom} (${type_appareil})`,
      html: rdvAdmin(emailData),
    }).catch(console.error);
  }

  // ── SMS de confirmation client (fire-and-forget, si téléphone fourni) ────────
  if (telephone) {
    const ticketTxt = numero_ticket ? ` | Ticket: ${numero_ticket}` : "";
    const dateTxt   = date_rdv ? ` | Date: ${date_rdv}` : "";
    sendSMS({
      to: telephone,
      message: `Réparation CeLL&Ordi ✅ Votre RDV est reçu${ticketTxt}${dateTxt}. Appareil: ${type_appareil}. On vous confirme sous 1h. Questions? (514) 237-5792`,
    }).catch(console.error);
  }

  res.status(201).json({
    message: "Rendez-vous soumis avec succès ! Un courriel de confirmation vous a été envoyé.",
    id: rdvId,
    numero_ticket,
  });
});

// GET /api/rendezvous — Lister tous les RDV (admin)
router.get("/", auth, (req, res) => {
  const { statut, date } = req.query;
  let query = "SELECT * FROM rendezvous WHERE 1=1";
  const params = [];

  if (statut) { query += " AND statut = ?"; params.push(statut); }
  if (date)   { query += " AND date_rdv = ?"; params.push(date); }

  query += " ORDER BY date_rdv ASC, created_at DESC";
  const rdvs = db.prepare(query).all(...params);
  res.json({ total: rdvs.length, rendezvous: rdvs });
});

// GET /api/rendezvous/:id — Détail d'un RDV (admin)
router.get("/:id", auth, (req, res) => {
  const rdv = db.prepare("SELECT * FROM rendezvous WHERE id = ?").get(req.params.id);
  if (!rdv) return res.status(404).json({ erreur: "Rendez-vous introuvable." });
  res.json(rdv);
});

// PATCH /api/rendezvous/:id/statut — Changer le statut (admin)
router.patch("/:id/statut", auth, (req, res) => {
  const { statut } = req.body;
  const valides = ["en_attente", "confirme", "annule", "complete"];

  if (!valides.includes(statut)) {
    return res.status(400).json({ erreur: `Statut invalide. Valeurs: ${valides.join(", ")}` });
  }

  const result = db.prepare("UPDATE rendezvous SET statut = ? WHERE id = ?").run(statut, req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Rendez-vous introuvable." });

  res.json({ message: "Statut mis à jour.", statut });
});

// DELETE /api/rendezvous/:id — Supprimer un RDV (admin)
router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM rendezvous WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Rendez-vous introuvable." });
  res.json({ message: "Rendez-vous supprimé." });
});

module.exports = router;
