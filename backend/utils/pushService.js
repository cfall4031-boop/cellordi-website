// ── Service Push Notifications — Web Push API ─────────────────────
const webpush = require("web-push");
const { db } = require("../database");

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL   = process.env.VAPID_EMAIL || "mailto:admin@reparationcellordi.ca";

let pushEnabled = false;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    try {
          webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
          pushEnabled = true;
          console.log("🔔 Push notifications: configuré");
    } catch (err) {
          console.warn("⚠️ Push notifications: clé VAPID invalide —", err.message, "— push désactivé");
    }
} else {
    console.log("⚠️ Push notifications: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY manquantes — push désactivé");
}

/**
 * Envoie une notification push à tous les abonnés.
 * Fire-and-forget : les erreurs sont loguées mais ne remontent pas.
 * Les abonnements expirés (410/404) sont automatiquement supprimés.
 */
async function sendPushToAll(payload) {
    if (!pushEnabled) return;

  const subs = db.prepare("SELECT * FROM push_subscriptions").all();
    if (subs.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.allSettled(
        subs.map(async (sub) => {
                const subscription = {
                          endpoint: sub.endpoint,
                          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
                };
                try {
                          await webpush.sendNotification(subscription, body);
                } catch (err) {
                          if (err.statusCode === 410 || err.statusCode === 404) {
                                      db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(sub.endpoint);
                                      console.log(`🗑️ Push subscription expirée supprimée: ${sub.endpoint.slice(0, 60)}…`);
                          } else {
                                      console.error(`❌ Push error (${err.statusCode}):`, err.message);
                          }
                }
        })
      );
}

module.exports = { sendPushToAll, isPushEnabled: () => pushEnabled };
