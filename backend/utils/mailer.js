// ── Transporteur Email — Réparation CeLL&Ordi ─────────────────
const nodemailer = require("nodemailer");
const dns        = require("dns");

// Force IPv4 partout — Railway ne supporte pas IPv6 sortant
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,   // STARTTLS
  // DNS lookup explicitement IPv4 (fix Railway ENETUNREACH IPv6)
  dnsLookup: (hostname, opts, cb) =>
    dns.lookup(hostname, { ...opts, family: 4 }, cb),
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
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
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[Mailer] Variables GMAIL_USER / GMAIL_APP_PASSWORD non configurées — email ignoré.");
    return;
  }

  const mailOptions = {
    from: `"Réparation CeLL&Ordi" <${process.env.GMAIL_USER}>`,
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
