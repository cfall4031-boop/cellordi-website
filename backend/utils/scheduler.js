// ── Scheduler — rappels de paiement et rappels RDV ────────────────────────────
const { db }            = require("../database");
const { sendPushToAll } = require("./pushService");

const TZ = "America/Toronto";

function getTodayStr() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: TZ });
}

// ── Convertit une date "YYYY-MM-DD" + heure "HH:MM" en timestamp JS (ms) ─────
// en considérant qu'il s'agit de l'heure locale America/Toronto.
function rdvTimestamp(dateStr, heureStr) {
  // On construit "YYYY-MM-DDTHH:MM:00" puis on l'interprète comme si c'était Toronto.
  // Trick fiable : Intl.DateTimeFormat donne l'offset, on le soustrait.
  const naiveISO = `${dateStr}T${heureStr}:00`;
  // Obtenir l'offset de Toronto en ms pour ce moment précis
  const naive = new Date(naiveISO); // JS l'interprète en UTC, on corrige après
  // On utilise l'API Intl pour connaître le décalage réel
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  // Astuce : on part de l'heure locale désirée, on cherche l'UTC correspondant
  // en itérant (les DST shifts rendent ça non trivial)
  // → méthode directe : construire la date en UTC et appliquer l'offset connu
  const utcGuess = new Date(`${dateStr}T${heureStr}:00Z`);
  const localStr = utcGuess.toLocaleString("sv-SE", { timeZone: TZ });
  const diff = utcGuess.getTime() - new Date(localStr + "Z").getTime();
  return new Date(`${dateStr}T${heureStr}:00Z`).getTime() + diff;
}

// ── Maintenant en ms, fuseau Toronto ─────────────────────────────────────────
function nowMs() {
  const nowStr = new Date().toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T");
  return new Date(nowStr + "Z").getTime();
}

// ── RAPPELS RDV ───────────────────────────────────────────────────────────────
async function envoyerRappelsRDV() {
  const settings = db.prepare("SELECT * FROM rdv_rappel_settings WHERE id = 1").get();
  if (!settings || !settings.actif) return;

  const delai1 = settings.delai_1 || 60; // minutes avant RDV
  const delai2 = settings.delai_2 || 30;
  const FENETRE = 2; // tolérance ±2 min pour rattraper un tick manqué

  const today    = getTodayStr();
  const tomorrow = new Date(new Date().toLocaleDateString("sv-SE", { timeZone: TZ }) + "T12:00:00Z");
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  // On cherche les RDVs d'aujourd'hui et demain (pour la fenêtre de minuit)
  const rdvs = db.prepare(`
    SELECT * FROM rendezvous
    WHERE statut IN ('en_attente', 'confirme')
      AND heure IS NOT NULL AND heure != ''
      AND date_rdv IN (?, ?)
  `).all(today, tomorrowStr);

  const now = nowMs();

  for (const rdv of rdvs) {
    const rdvMs  = rdvTimestamp(rdv.date_rdv, rdv.heure);
    const diffMin = (rdvMs - now) / 60000; // minutes restantes avant le RDV

    // Si le RDV est déjà commencé ou dépassé, on ne fait rien
    if (diffMin < 0) continue;

    const isEn_attente = rdv.statut === "en_attente";
    const nom = `${rdv.prenom} ${rdv.nom}`.toUpperCase().trim();
    const corps = `${nom} — ${rdv.type_appareil} — ${rdv.heure}${rdv.telephone ? " — " + rdv.telephone : ""}`;

    // ── Rappel delai1 (60 min par défaut) ──────────────────────────────────
    if (!rdv.rappel_60_envoye && Math.abs(diffMin - delai1) <= FENETRE) {
      const titre = isEn_attente
        ? `⚠️ RDV à confirmer dans ${delai1} min`
        : `📱 RDV dans ${delai1} min`;
      try {
        await sendPushToAll({ title: titre, body: corps, url: "/admin?section=rendezvous", tag: `rdv-rappel-${rdv.id}-${delai1}` });
        db.prepare("UPDATE rendezvous SET rappel_60_envoye = 1 WHERE id = ?").run(rdv.id);
        console.log(`[Scheduler RDV] ✅ Rappel ${delai1}min envoyé → RDV#${rdv.id} ${nom} à ${rdv.heure}`);
      } catch (e) {
        console.error(`[Scheduler RDV] ❌ Rappel ${delai1}min RDV#${rdv.id}:`, e.message);
      }
    }

    // ── Rappel delai2 (30 min par défaut) ──────────────────────────────────
    if (!rdv.rappel_30_envoye && Math.abs(diffMin - delai2) <= FENETRE) {
      const titre = isEn_attente
        ? `⚠️ RDV à confirmer dans ${delai2} min`
        : `📱 RDV dans ${delai2} min`;
      try {
        await sendPushToAll({ title: titre, body: corps, url: "/admin?section=rendezvous", tag: `rdv-rappel-${rdv.id}-${delai2}` });
        db.prepare("UPDATE rendezvous SET rappel_30_envoye = 1 WHERE id = ?").run(rdv.id);
        console.log(`[Scheduler RDV] ✅ Rappel ${delai2}min envoyé → RDV#${rdv.id} ${nom} à ${rdv.heure}`);
      } catch (e) {
        console.error(`[Scheduler RDV] ❌ Rappel ${delai2}min RDV#${rdv.id}:`, e.message);
      }
    }
  }
}

// ── RAPPELS FACTURES (quotidien) ─────────────────────────────────────────────
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
    await sendPushToAll({ title: `💳 Paiement dû aujourd'hui`, body: `${f.titre}${montantTxt}`, url: "/admin?section=factures", tag: "facture-rappel" });
  } else {
    const totalRestant = factures.reduce((s, f) => s + (f.montant ?? 0), 0);
    const totalTxt = totalRestant > 0
      ? ` — Total : ${totalRestant.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}`
      : "";
    const titres = factures.slice(0, 3).map(f => f.titre).join(", ");
    await sendPushToAll({ title: `💳 ${factures.length} paiements dus aujourd'hui`, body: `${titres}${factures.length > 3 ? "…" : ""}${totalTxt}`, url: "/admin?section=factures", tag: "facture-rappel" });
  }
}

// ── DÉMARRAGE ─────────────────────────────────────────────────────────────────
function startScheduler() {
  try {
    const cron = require("node-cron");

    // ── Toutes les minutes : rappels RDV ─────────────────────────────────────
    cron.schedule("* * * * *", () => {
      envoyerRappelsRDV().catch(err =>
        console.error("[Scheduler RDV] ❌ Erreur inattendue:", err.message)
      );
    });

    // ── 13h00 UTC (≈ 9h00 EDT) : rappels factures quotidiens ─────────────────
    cron.schedule("0 13 * * *", () => {
      console.log("[Scheduler] ⏰ Vérification des factures du jour…");
      envoyerRappelsFactures().catch(err =>
        console.error("[Scheduler] ❌ Erreur:", err.message)
      );
    });

    console.log("✅ Scheduler démarré — rappels RDV (toutes les minutes) + factures (13h UTC)");
  } catch (err) {
    console.warn("⚠️  Scheduler non démarré (node-cron indisponible) :", err.message);
  }
}

module.exports = { startScheduler, envoyerRappelsFactures, envoyerRappelsRDV };
