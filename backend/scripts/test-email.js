/**
 * Script de test — Envoi email CeLL&Ordi
 * Commande : node scripts/test-email.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { sendEmail } = require("../utils/mailer");
const { rdvClient } = require("../utils/emailTemplates");

const testData = {
  prenom: "Test",
  nom: "Client",
  email: process.env.ADMIN_NOTIFY_EMAIL,
  telephone: "(514) 237-5792",
  type_appareil: "iPhone 14",
  date_rdv: "2026-04-01",
  heure: "10:00",
  description: "Ceci est un test automatique du système d'email.",
  numero_ticket: "RCO-TEST-001",
};

(async () => {
  console.log("\n📧  Réparation CeLL&Ordi — Test d'envoi email");
  console.log("──────────────────────────────────────────────");
  console.log(`  RESEND_API_KEY    : ${process.env.RESEND_API_KEY ? "✅ configuré" : "❌ NON CONFIGURÉ"}`);
  console.log(`  FROM_EMAIL        : ${process.env.FROM_EMAIL || "❌ NON CONFIGURÉ"}`);
  console.log(`  ADMIN_NOTIFY_EMAIL: ${process.env.ADMIN_NOTIFY_EMAIL || "❌ NON CONFIGURÉ"}`);
  console.log(`  SITE_URL          : ${process.env.SITE_URL || "http://localhost:5173"}`);
  console.log("──────────────────────────────────────────────\n");

  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    console.error("❌  Credentials manquants dans .env — configure RESEND_API_KEY et FROM_EMAIL d'abord.");
    process.exit(1);
  }

  try {
    console.log(`📨  Envoi vers ${testData.email}...`);
    await sendEmail({
      to: testData.email,
      subject: `[TEST] Confirmation RDV — Ticket ${testData.numero_ticket}`,
      html: rdvClient(testData),
    });
    console.log("✅  Email envoyé avec succès ! Vérifie ta boîte de réception.\n");
  } catch (err) {
    console.error("❌  Erreur :", err.message);
    console.error("\n💡  Solutions possibles :");
    console.error("    1. Vérifie que le domaine est vérifié dans Resend (Domains → statut vert)");
    console.error("    2. Vérifie que RESEND_API_KEY est correct dans .env");
    console.error("    3. L'adresse FROM_EMAIL doit correspondre au domaine vérifié\n");
    process.exit(1);
  }
})();
