const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");
const { contactClient, contactAdmin, replyToContact } = require("../utils/emailTemplates");

const router = express.Router();

// POST /api/contact — Envoyer un message (public)
router.post("/", (req, res) => {
  const { nom, email, sujet, message } = req.body;

  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ erreur: "Tous les champs sont obligatoires." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ erreur: "Format d'email invalide." });
  }

  const result = db.prepare(`
    INSERT INTO messages_contact (nom, email, sujet, message)
    VALUES (?, ?, ?, ?)
  `).run(nom, email, sujet, message);

  // ── Emails de confirmation (fire-and-forget) ─────────────────────
  sendEmail({
    to: email,
    subject: `Message reçu — Réparation CeLL&Ordi`,
    html: contactClient({ nom, sujet }),
  }).catch(console.error);

  if (process.env.ADMIN_NOTIFY_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `✉️ Nouveau message de ${nom} — ${sujet}`,
      html: contactAdmin({ nom, email, sujet, message }),
    }).catch(console.error);
  }

  res.status(201).json({
    message: "Message envoyé avec succès ! Nous vous répondrons sous 24h.",
    id: result.lastInsertRowid
  });
});

// GET /api/contact — Lister les messages (admin)
router.get("/", auth, (req, res) => {
  const { lu, repondu } = req.query;
  let query = "SELECT * FROM messages_contact WHERE 1=1";
  const params = [];

  if (lu !== undefined)      { query += " AND lu = ?";      params.push(lu === "true" ? 1 : 0); }
  if (repondu !== undefined) { query += " AND repondu = ?"; params.push(repondu === "true" ? 1 : 0); }

  query += " ORDER BY created_at DESC";
  const messages = db.prepare(query).all(...params);

  const nonLus = db.prepare("SELECT COUNT(*) as count FROM messages_contact WHERE lu = 0").get();
  res.json({ total: messages.length, non_lus: nonLus.count, messages });
});

// PATCH /api/contact/:id/lu — Marquer comme lu (admin)
router.patch("/:id/lu", auth, (req, res) => {
  const result = db.prepare("UPDATE messages_contact SET lu = 1 WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Message introuvable." });
  res.json({ message: "Message marqué comme lu." });
});

// PATCH /api/contact/:id/repondu — Marquer comme répondu (admin)
router.patch("/:id/repondu", auth, (req, res) => {
  db.prepare("UPDATE messages_contact SET lu = 1, repondu = 1 WHERE id = ?").run(req.params.id);
  res.json({ message: "Message marqué comme répondu." });
});

// POST /api/messages/:id/reply — Répondre à un message (admin)
router.post("/:id/reply", auth, (req, res) => {
  const { replyText } = req.body;

  if (!replyText || !replyText.trim()) {
    return res.status(400).json({ erreur: "Le texte de réponse est requis." });
  }

  const msg = db.prepare("SELECT * FROM messages_contact WHERE id = ?").get(req.params.id);
  if (!msg) return res.status(404).json({ erreur: "Message introuvable." });

  // Sauvegarder la réponse et marquer comme lu + répondu
  db.prepare(`
    UPDATE messages_contact
    SET reply_text = ?, replied_at = CURRENT_TIMESTAMP, repondu = 1, lu = 1
    WHERE id = ?
  `).run(replyText.trim(), req.params.id);

  // Envoyer l'email de réponse au client (fire-and-forget)
  sendEmail({
    to: msg.email,
    subject: `Réponse à votre message — Réparation CeLL&Ordi`,
    html: replyToContact({ nom: msg.nom, sujet: msg.sujet, originalMessage: msg.message, replyText: replyText.trim() }),
  }).catch(console.error);

  res.json({ success: true, replied_at: new Date().toISOString() });
});

// PATCH /api/messages/:id/archive — Archiver un message (admin)
router.patch("/:id/archive", auth, (req, res) => {
  const result = db.prepare("UPDATE messages_contact SET archived = 1 WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Message introuvable." });
  res.json({ message: "Message archivé." });
});

// PATCH /api/messages/:id/unarchive — Désarchiver un message (admin)
router.patch("/:id/unarchive", auth, (req, res) => {
  const result = db.prepare("UPDATE messages_contact SET archived = 0 WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Message introuvable." });
  res.json({ message: "Message désarchivé." });
});

// DELETE /api/contact/:id — Supprimer un message (admin)
router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM messages_contact WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Message introuvable." });
  res.json({ message: "Message supprimé." });
});

module.exports = router;
