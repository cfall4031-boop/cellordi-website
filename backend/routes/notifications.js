const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");
const { sendPushToAll, isPushEnabled } = require("../utils/pushService");

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

// GET /api/notifications/status — État du système push (admin)
router.get("/status", auth, (req, res) => {
  const row = db.prepare("SELECT COUNT(*) as count FROM push_subscriptions").get();
  res.json({
    pushEnabled: isPushEnabled(),
    subscriberCount: row.count,
  });
});

// POST /api/notifications/test — Envoyer une notification test (admin)
router.post("/test", auth, async (req, res) => {
  if (!isPushEnabled()) {
    return res.status(503).json({
      erreur: "Push désactivé — les clés VAPID sont invalides ou manquantes sur le serveur.",
      pushEnabled: false,
    });
  }

  const row = db.prepare("SELECT COUNT(*) as count FROM push_subscriptions").get();
  if (row.count === 0) {
    return res.status(404).json({
      erreur: "Aucun abonnement push trouvé. Active d'abord les notifications avec le bouton dans la sidebar.",
      pushEnabled: true,
      subscriberCount: 0,
    });
  }

  try {
    await sendPushToAll({
      title: "🧪 Test notification",
      body: "Si tu vois ceci, les notifications fonctionnent !",
      url: "/admin",
      tag: "test",
    });
    res.json({ message: "Notification test envoyée !", sent: row.count });
  } catch (err) {
    res.status(500).json({ erreur: `Erreur envoi: ${err.message}` });
  }
});

module.exports = router;
