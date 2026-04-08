const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");
const { sendPushToAll, isPushEnabled } = require("../utils/pushService");

const router = express.Router();

// GET /api/notifications/vapid-key — Clé publique VAPID (public)
router.get("/vapid-key", (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY || "BMSOCoqZFLh0geT_428FcfQ8w7etUM5vDJ46CNRiLdebFgptxTo9iRob6pAmYNoZhZAe13EndWhP5KhWIXEIVSs";
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
  const vapidKey = process.env.VAPID_PUBLIC_KEY || "";
  res.json({
    pushEnabled: isPushEnabled(),
    subscriberCount: row.count,
    vapidKeyPrefix: vapidKey.slice(0, 12) + "...",
  });
});

// DELETE /api/notifications/purge — Supprimer TOUS les abonnements (admin)
router.delete("/purge", auth, (req, res) => {
  const result = db.prepare("DELETE FROM push_subscriptions").run();
  res.json({ message: `${result.changes} abonnement(s) supprimé(s).`, deleted: result.changes });
});

// POST /api/notifications/test — Envoyer une notification test avec diagnostic détaillé (admin)
router.post("/test", auth, async (req, res) => {
  const webpush = require("web-push");

  if (!isPushEnabled()) {
    return res.status(503).json({
      erreur: "Push désactivé — les clés VAPID sont invalides ou manquantes sur le serveur.",
      pushEnabled: false,
    });
  }

  const subs = db.prepare("SELECT * FROM push_subscriptions").all();
  if (subs.length === 0) {
    return res.status(404).json({
      erreur: "Aucun abonnement push trouvé. Active d'abord les notifications avec le bouton dans la sidebar.",
      pushEnabled: true,
      subscriberCount: 0,
    });
  }

  const payload = JSON.stringify({
    title: "🧪 Test notification",
    body: "Si tu vois ceci, les notifications fonctionnent !",
    url: "/admin",
    tag: "test",
  });

  const results = [];
  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
    };
    try {
      await webpush.sendNotification(subscription, payload);
      results.push({ endpoint: sub.endpoint.slice(0, 60), status: "ok" });
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(sub.endpoint);
        results.push({ endpoint: sub.endpoint.slice(0, 60), status: "expiré — supprimé" });
      } else {
        results.push({ endpoint: sub.endpoint.slice(0, 60), status: `erreur ${err.statusCode}: ${err.message}` });
      }
    }
  }

  const ok = results.filter(r => r.status === "ok").length;
  const expired = results.filter(r => r.status.includes("expiré")).length;
  const failed = results.filter(r => r.status.startsWith("erreur")).length;

  res.json({
    message: `Envoyé: ${ok} ✅ | Expiré: ${expired} 🗑️ | Échoué: ${failed} ❌`,
    sent: ok,
    expired,
    failed,
    details: results,
  });
});

module.exports = router;
