// ── Scheduler — rappels de paiement quotidiens ────────────────────────────────
const { db }          = require("../database");
const { sendPushToAll } = require("./pushService");

function getTodayStr() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Toronto" });
}

async function envoyerRappelsFactures() {
  const today = getTodayStr();
  const factures = db.prepare(`
    SELECT f.*, ft.label AS type_label, ft.color AS type_color
    FROM factures_calendrier f
    LEFT JOIN facture_types ft ON ft.id = CAST(f.type_facture AS INTEGER)
    WHERE f.date_echeance = ? AND f.statut = 'en_attente'
    ORDER BY f.montant DESC
  `).all(today);

  if (factures.length === 0) {
    console.log(`[Scheduler] ${today} — Aucune facture due aujourd'hui.`);
    return;
  }

  console.log(`[Scheduler] ${today} — ${factures.length} facture(s) due(s) aujourd'hui.`);

  if (factures.length === 1) {
    const f = factures[0];
    const montantTxt = f.montant != null
      ? ` — ${f.montant.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}`
      : "";
    await sendPushToAll({
      title: `💳 Paiement dû aujourd'hui`,
      body:  `${f.titre}${montantTxt}`,
      url:   "/admin?section=factures",
      tag:   "facture-rappel",
    });
  } else {
    const totalRestant = factures.reduce((s, f) => s + (f.montant ?? 0), 0);
    const totalTxt = totalRestant > 0
      ? ` — Total : ${totalRestant.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}`
      : "";
    const titres = factures.slice(0, 3).map(f => f.titre).join(", ");
    await sendPushToAll({
      title: `💳 ${factures.length} paiements dus aujourd'hui`,
      body:  `${titres}${factures.length > 3 ? "…" : ""}${totalTxt}`,
      url:   "/admin?section=factures",
      tag:   "facture-rappel",
    });
  }
}

function startScheduler() {
  try {
    const cron = require("node-cron");

    // 13:00 UTC = 9:00 AM EDT (UTC-4) — acceptable toute l'année
    cron.schedule("0 13 * * *", () => {
      console.log("[Scheduler] ⏰ Vérification des factures du jour…");
      envoyerRappelsFactures().catch(err =>
        console.error("[Scheduler] ❌ Erreur:", err.message)
      );
    });

    console.log("✅ Scheduler démarré — rappels factures à 13h00 UTC (≈ 9h00 Montréal)");
  } catch (err) {
    console.warn("⚠️  Scheduler non démarré (node-cron indisponible) :", err.message);
  }
}

module.exports = { startScheduler, envoyerRappelsFactures };
