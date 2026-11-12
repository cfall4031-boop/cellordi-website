// ── Service Push Notifications — Web Push API ─────────────────────
const webpush = require("web-push");
const { db } = require("../database");

// La clé publique peut être hardcodée (elle est publique par définition).
// La clé privée ne doit JAMAIS être hardcodée — elle doit venir de l'env var.
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || "BLkzN0bX5jH075bpXVpnb9-lcnt86ZwK9YEPBf_K_e5WxOrRrd1qoubV5lnHfG_QKBEYsrpfzpN5KvQeMglXVvA";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL   = process.env.VAPID_EMAIL       || "mailto:cfall4031@gmail.com";

let pushEnabled = false;

if (!VAPID_PRIVATE) {
  console.warn("⚠️  Push: VAPID_PRIVATE_KEY manquante — notifications push désactivées.");
  console.warn("    → Ajoute VAPID_PRIVATE_KEY dans les variables d'environnement Railway.");
} else if (!VAPID_PUBLIC) {
  console.warn("⚠️  Push: VAPID_PUBLIC_KEY manquante — notifications push désactivées.");
} else {
  try {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
    pushEnabled = true;
    console.log(`🔔 Push: configuré ✓  clé publique: ${VAPID_PUBLIC.slice(0, 14)}…  sujet: ${VAPID_EMAIL}`);
  } catch (err) {
    console.error("❌ Push: setVapidDetails a échoué —", err.message);
    console.error("   → Les clés VAPID semblent invalides. Génère-en une nouvelle paire :");
    console.error("   → npx web-push generate-vapid-keys");
  }
}

/**
 * Envoie une notification push à tous les abonnés.
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
          console.log(`🗑️  Push: abonnement expiré supprimé (${err.statusCode}): ${sub.endpoint.slice(0, 60)}…`);
        } else {
          console.error(`❌ Push error (${err.statusCode}):`, err.message, err.body || "");
        }
      }
    })
  );
}

module.exports = { sendPushToAll, isPushEnabled: () => pushEnabled };
