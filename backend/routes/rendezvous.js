const express = require("express");
const { db, genererNumeroTicket } = require("../database");
const auth = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");
const { sendSMS }   = require("../utils/smsService");
const { rdvClient, rdvAdmin } = require("../utils/emailTemplates");
const { sendPushToAll } = require("../utils/pushService");

const router = express.Router();

// POST /api/rendezvous — Créer un RDV (public)
router.post("/", (req, res) => {
  const { prenom, nom, email, telephone, type_appareil, date_rdv, heure, description } = req.body;

  if (!prenom || !nom || !type_appareil || !date_rdv) {
    return res.status(400).json({ erreur: "Champs obligatoires manquants (prenom, nom, type_appareil, date_rdv)." });
  }

  // Chercher ou créer le client (par email si fourni, sinon par téléphone)
  let client = null;
  if (email) {
    client = db.prepare("SELECT id FROM clients WHERE email = ?").get(email);
  } else if (telephone) {
    client = db.prepare("SELECT id FROM clients WHERE telephone = ?").get(telephone);
  }
  if (!client) {
    const ins = db.prepare(
      "INSERT INTO clients (prenom, nom, email, telephone) VALUES (?, ?, ?, ?)"
    ).run(prenom, nom, email || null, telephone || null);
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

  if (email) {
    sendEmail({
      to: email,
      subject: numero_ticket
        ? `✅ Rendez-vous confirmé — Ticket ${numero_ticket}`
        : `✅ Rendez-vous confirmé — Réparation CeLL&Ordi`,
      html: rdvClient(emailData),
    }).catch(console.error);
  }

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
    const dateTxt   = date_rdv ? ` | ${date_rdv}` : "";
    const heureTxt  = heure ? ` à ${heure}` : "";
    sendSMS({
      to: telephone,
      message: `Réparation CeLL&Ordi ✅ RDV confirmé!${ticketTxt}${dateTxt}${heureTxt}. Appareil: ${type_appareil}. Nous vous attendons! 📍5050 QC-132 #203, Ste-Catherine. Questions? (514) 237-5792`,
    }).catch(console.error);
  }

  // ── Push notification admin (fire-and-forget) ────────────────────
  sendPushToAll({
    title: "📅 Nouveau rendez-vous",
    body: `${prenom} ${nom} — ${type_appareil} (${date_rdv}${heure ? " à " + heure : ""})`,
    url: "/admin",
    tag: "rdv",
  }).catch(console.error);

  res.status(201).json({
    message: "Rendez-vous soumis avec succès ! Un courriel de confirmation vous a été envoyé.",
    id: rdvId,
    numero_ticket,
  });
});

// GET /api/rendezvous/disponibilites — Grille horaires (admin)
router.get("/disponibilites", auth, (req, res) => {
  const rows = db.prepare("SELECT * FROM horaires_dispo ORDER BY jour, heure").all();
  res.json({ disponibilites: rows });
});

// POST /api/rendezvous/disponibilites — Toggle un créneau ON/OFF (admin)
router.post("/disponibilites", auth, (req, res) => {
  const { jour, heure } = req.body;
  if (!jour || !heure) return res.status(400).json({ erreur: "jour et heure requis." });
  const existing = db.prepare("SELECT * FROM horaires_dispo WHERE jour = ? AND heure = ?").get(jour, heure);
  if (existing) {
    db.prepare("UPDATE horaires_dispo SET actif = ? WHERE jour = ? AND heure = ?").run(existing.actif ? 0 : 1, jour, heure);
  } else {
    db.prepare("INSERT INTO horaires_dispo (jour, heure, actif) VALUES (?, ?, 1)").run(jour, heure);
  }
  const updated = db.prepare("SELECT * FROM horaires_dispo WHERE jour = ? AND heure = ?").get(jour, heure);
  res.json({ slot: updated });
});

// POST /api/rendezvous/disponibilites/reset — Réactiver tous les créneaux (admin)
router.post("/disponibilites/reset", auth, (req, res) => {
  db.prepare("UPDATE horaires_dispo SET actif = 1").run();
  const rows = db.prepare("SELECT * FROM horaires_dispo ORDER BY jour, heure").all();
  res.json({ message: "Tous les créneaux ont été réactivés.", disponibilites: rows });
});

// GET /api/rendezvous/slots?date=YYYY-MM-DD — Créneaux actifs pour une date (public)
// Exclut automatiquement les créneaux déjà réservés pour cette date (sauf si annulé)
router.get("/slots", (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ erreur: "date requise (YYYY-MM-DD)." });
  const d = new Date(date + "T12:00:00");
  // getDay(): 0=Sun,1=Mon...6=Sat → map to our 1=Lun...6=Sam
  const dayJs = d.getDay(); // 0=Sun
  const jour = dayJs === 0 ? null : dayJs; // Sun = fermé
  if (!jour) return res.json({ slots: [] });

  // Créneaux actifs pour ce jour de semaine
  const activeSlots = db.prepare(
    "SELECT heure FROM horaires_dispo WHERE jour = ? AND actif = 1 ORDER BY heure"
  ).all(jour);

  // Créneaux déjà réservés ce jour précis (RDVs non annulés)
  const booked = db.prepare(
    "SELECT heure FROM rendezvous WHERE date_rdv = ? AND statut != 'annule' AND heure IS NOT NULL"
  ).all(date);
  const bookedSet = new Set(booked.map(s => s.heure));

  // Retourner uniquement les créneaux libres
  const available = activeSlots.filter(s => !bookedSet.has(s.heure));
  res.json({ slots: available.map(s => s.heure) });
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
