const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/notifications/vapid-key — Clé publique VAPID (public)
router.get("/vapid-key", (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ erreur: "Push notifications non configurées." });
  res.json({ publicKey: key });
});

// POST /api/notifications/subscribe — Enregistrer un abonnement push (admin)
router.post("/subscribe", auth, (req, res) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ erreur: "Données d'abonnement invalides." });
  }

  db.prepare(`
    INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth)
    VALUES (?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET keys_p256dh = excluded.keys_p256dh, keys_auth = excluded.keys_auth
  `).run(endpoint, keys.p256dh, keys.auth);

  res.status(201).json({ message: "Abonnement push enregistré." });
});

// DELETE /api/notifications/unsubscribe — Supprimer un abonnement push (admin)
router.delete("/unsubscribe", auth, (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ erreur: "Endpoint requis." });

  db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(endpoint);
  res.json({ message: "Abonnement push supprimé." });
});

module.exports = router;
