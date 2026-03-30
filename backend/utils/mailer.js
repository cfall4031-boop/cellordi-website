// ── Mailer — Réparation CeLL&Ordi (Resend HTTP API) ────────────
const { Resend } = require("resend");

/**
 * Envoie un courriel HTML via l'API HTTP Resend (pas de SMTP).
 *
 * @param {{ to: string, subject: string, html: string }} opts
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    console.warn("[Mailer] RESEND_API_KEY / FROM_EMAIL manquants — email ignoré.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `"Réparation CeLL&Ordi" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) throw new Error(error.message);

    console.log(`[Mailer] ✅ Email envoyé à ${to} — ${data.id}`);
  } catch (err) {
    console.error(`[Mailer] ❌ Erreur envoi à ${to}:`, err.message);
  }
}

module.exports = { sendEmail };
