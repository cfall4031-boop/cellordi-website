// ── Transporteur Email — Réparation CeLL&Ordi ─────────────────
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

/**
 * Envoie un courriel HTML.
 * Fire-and-forget : n'empêche jamais une réponse HTTP de partir.
 *
 * @param {{ to: string, subject: string, html: string }} opts
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    console.warn("[Mailer] RESEND_API_KEY / FROM_EMAIL manquants — email ignoré.");
    return;
  }

  const mailOptions = {
    from: `"Réparation CeLL&Ordi" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] ✅ Email envoyé à ${to} — ${info.messageId}`);
  } catch (err) {
    console.error(`[Mailer] ❌ Erreur envoi à ${to}:`, err.message);
  }
}

module.exports = { sendEmail };
