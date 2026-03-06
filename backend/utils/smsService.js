// ── Service SMS — Réparation CeLL&Ordi ────────────────────────────────────────
// Provider : Twilio
// Variables requises : TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

/**
 * Formate un numéro de téléphone canadien en format E.164 (+1XXXXXXXXXX).
 * Accepte : (514) 237-5792, 5142375792, 15142375792, +15142375792
 */
function formatPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null; // Format inconnu — on ignore
}

/**
 * Envoie un SMS via Twilio.
 * Fire-and-forget : n'empêche jamais une réponse HTTP de partir.
 *
 * @param {{ to: string, message: string }} opts
 * @returns {Promise<void>}
 */
async function sendSMS({ to, message }) {
  // Si les variables ne sont pas configurées, on ignore silencieusement
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN  ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    console.warn("[SMS] Variables TWILIO non configurées — SMS ignoré.");
    return;
  }

  const toFormatted = formatPhone(to);
  if (!toFormatted) {
    console.warn(`[SMS] Numéro de téléphone invalide ou manquant : "${to}" — SMS ignoré.`);
    return;
  }

  try {
    // Require dynamique : Twilio est optionnel (pas de crash si non installé)
    const twilio = require("twilio");
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   toFormatted,
    });

    console.log(`[SMS] ✅ Envoyé à ${toFormatted} — SID: ${msg.sid}`);
  } catch (err) {
    console.error(`[SMS] ❌ Erreur envoi à ${toFormatted}:`, err.message);
  }
}

module.exports = { sendSMS };
