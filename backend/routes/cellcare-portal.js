const express = require("express");
const jwt     = require("jsonwebtoken");
const { db }  = require("../database");
const { generateContratPdf } = require("../utils/generateContratPdf");

const router = express.Router();

// Compteur de tentatives de login (en mémoire, se réinitialise au redémarrage)
const loginAttempts = new Map(); // key: numero_membre → { count, blockedUntil }
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_DURATION = "15m";

function getPortalSecret() {
  return (process.env.JWT_SECRET || "cellordi-secret") + "_portal";
}

function updateStatuts() {
  const today = new Date().toISOString().split("T")[0];
  db.prepare("UPDATE cc_souscriptions SET statut='actif' WHERE statut='en_carence' AND date_carence_fin <= ?").run(today);
  db.prepare("UPDATE cc_souscriptions SET statut='expire' WHERE statut IN ('actif','vitres_epuisees') AND date_fin < ?").run(today);
}

function journal(action, table, id, details, utilisateur) {
  try {
    db.prepare(
      "INSERT INTO cc_journal (action, table_cible, enregistrement_id, details, utilisateur) VALUES (?,?,?,?,?)"
    ).run(action, table, id, typeof details === "object" ? JSON.stringify(details) : String(details || ""), utilisateur || "portail");
  } catch (_) {}
}

// Middleware d'auth portail
function portalAuth(req, res, next) {
  const token = (req.headers["authorization"] || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ erreur: "Session expirée. Veuillez vous reconnecter." });
  try {
    req.portal = jwt.verify(token, getPortalSecret());
    next();
  } catch {
    res.status(403).json({ erreur: "Session invalide ou expirée." });
  }
}

// Masquer partiellement une chaîne (ex: 514-***-5123)
function maskPhone(phone) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "****";
  return clean.slice(0, 3) + "-***-" + clean.slice(-4);
}

function maskImei(imei) {
  if (!imei) return null;
  if (imei.length < 6) return "***";
  return imei.slice(0, 2) + "*".repeat(imei.length - 6) + imei.slice(-4);
}

function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return email[0] + "***";
  return local[0] + "***@" + domain;
}

// ── CONNEXION ─────────────────────────────────────────────────────────────────
// POST /api/cellcare-portal/login
// Body: { numero_membre, last4 }
router.post("/login", (req, res) => {
  const { numero_membre, last4 } = req.body;
  if (!numero_membre || !last4) return res.status(400).json({ erreur: "Numéro de membre et 4 derniers chiffres requis." });

  const key = String(numero_membre).toUpperCase();

  // Vérifier le blocage
  const attempt = loginAttempts.get(key);
  if (attempt?.blockedUntil && Date.now() < attempt.blockedUntil) {
    const minutesLeft = Math.ceil((attempt.blockedUntil - Date.now()) / 60000);
    return res.status(429).json({ erreur: `Compte temporairement bloqué. Réessayez dans ${minutesLeft} minute(s).` });
  }

  const membre = db.prepare("SELECT id, numero, prenom, nom, telephone FROM cc_membres WHERE numero=?").get(key);
  if (!membre) {
    // Incrémenter les tentatives
    const cur = loginAttempts.get(key) || { count: 0 };
    cur.count = (cur.count || 0) + 1;
    if (cur.count >= MAX_ATTEMPTS) cur.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    loginAttempts.set(key, cur);
    return res.status(401).json({ erreur: "Numéro de membre introuvable." });
  }

  const phoneClean = (membre.telephone || "").replace(/\D/g, "");
  const last4Clean = String(last4).replace(/\D/g, "");
  if (phoneClean.slice(-4) !== last4Clean) {
    const cur = loginAttempts.get(key) || { count: 0 };
    cur.count = (cur.count || 0) + 1;
    if (cur.count >= MAX_ATTEMPTS) cur.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    loginAttempts.set(key, cur);
    const remaining = MAX_ATTEMPTS - cur.count;
    return res.status(401).json({ erreur: `Code incorrect. ${remaining > 0 ? `${remaining} tentative(s) restante(s).` : "Compte bloqué 30 minutes."}` });
  }

  // Succès — réinitialiser les tentatives
  loginAttempts.delete(key);
  const token = jwt.sign({ membre_id: membre.id, numero: membre.numero, prenom: membre.prenom }, getPortalSecret(), { expiresIn: SESSION_DURATION });
  journal("PORTAL_LOGIN", "cc_membres", membre.id, {}, "portail");
  res.json({ token, prenom: membre.prenom, numero: membre.numero });
});

// ── INFO MEMBRE (lecture seule, données masquées) ─────────────────────────────
// GET /api/cellcare-portal/info
router.get("/info", portalAuth, (req, res) => {
  updateStatuts();
  const membre = db.prepare("SELECT * FROM cc_membres WHERE id=?").get(req.portal.membre_id);
  if (!membre) return res.status(404).json({ erreur: "Membre introuvable." });

  const params = (() => {
    const row = db.prepare("SELECT * FROM cc_parametres WHERE id=1").get();
    if (!row) return {};
    return { ...row, plans_config: JSON.parse(row.plans_config || "{}"), offres_config: JSON.parse(row.offres_config || "{}") };
  })();

  const souscription = db.prepare(`
    SELECT s.id, s.formule, s.statut, s.prix_paye, s.vitres_restantes,
           s.date_carence_fin, s.date_fin, s.date_annulation_limite,
           s.offres_appliquees, s.created_at,
           a.marque, a.modele, a.couleur, a.imei
    FROM cc_souscriptions s
    JOIN cc_appareils a ON a.id=s.appareil_id
    WHERE s.membre_id=? AND s.statut NOT IN ('annule','expire')
    ORDER BY s.created_at DESC LIMIT 1
  `).get(req.portal.membre_id);

  const reclamations = db.prepare(`
    SELECT id, type, created_at, rabais_applique, montant_client, notes
    FROM cc_reclamations WHERE souscription_id=?
    ORDER BY created_at DESC
  `).all(souscription?.id || 0);

  const parrainages = db.prepare(
    "SELECT id, filleul_nom, date_parrainage, rabais_accorde FROM cc_parrainages WHERE membre_parrain_id=? ORDER BY date_parrainage DESC"
  ).all(req.portal.membre_id);

  const planCfg = souscription ? params.plans_config?.[souscription.formule] : null;

  // Calculer jours restants
  let joursRestants = null;
  if (souscription?.date_fin) {
    joursRestants = Math.max(0, Math.ceil((new Date(souscription.date_fin + "T23:59:59").getTime() - Date.now()) / 86400000));
  }

  // Vérifier si crédit sans réclamation applicable
  const creditSansRecl = souscription && reclamations.length === 0 && souscription.statut === "actif" && joursRestants !== null && joursRestants <= 30;

  journal("PORTAL_VIEW", "cc_membres", membre.id, {}, "portail");

  res.json({
    membre: {
      prenom: membre.prenom,
      nom: membre.nom,
      telephone: maskPhone(membre.telephone),
      email: maskEmail(membre.email),
      consentement_sms: !!membre.consentement_sms,
      code_parrainage: membre.code_parrainage,
      numero: membre.numero,
      created_at: membre.created_at,
    },
    souscription: souscription ? {
      ...souscription,
      imei: maskImei(souscription.imei),
      offres_appliquees: JSON.parse(souscription.offres_appliquees || "[]"),
      jours_restants: joursRestants,
      credit_sans_reclamation: creditSansRecl,
    } : null,
    plan_config: planCfg ? {
      nom: planCfg.nom,
      vitres_max: planCfg.vitres_max,
      rabais_ecran: planCfg.rabais_ecran,
      rabais_batterie: planCfg.rabais_batterie,
      parrainage_max: planCfg.parrainage_max,
      parrainage_rabais: planCfg.parrainage_rabais,
      parrainage_plafond: planCfg.parrainage_plafond,
      vitre_protection: planCfg.vitre_protection,
    } : null,
    reclamations: reclamations.map(r => ({
      id: r.id,
      type: r.type,
      date: r.created_at,
      rabais_obtenu: r.rabais_applique,
      montant_paye: r.montant_client,
      notes: r.notes,
    })),
    parrainages,
    conditions_text: params.conditions_text || null,
    conditions_version: params.conditions_version || "1.0",
  });
});

// ── TÉLÉCHARGEMENT PDF CONTRAT ────────────────────────────────────────────────
// GET /api/cellcare-portal/contrat
router.get("/contrat", portalAuth, async (req, res) => {
  const membre = db.prepare("SELECT * FROM cc_membres WHERE id=?").get(req.portal.membre_id);
  if (!membre) return res.status(404).json({ erreur: "Membre introuvable." });

  const s = db.prepare(`
    SELECT s.*, a.marque, a.modele, a.couleur, a.imei, a.inspecte
    FROM cc_souscriptions s JOIN cc_appareils a ON a.id=s.appareil_id
    WHERE s.membre_id=? ORDER BY s.created_at DESC LIMIT 1
  `).get(req.portal.membre_id);
  if (!s) return res.status(404).json({ erreur: "Aucune souscription trouvée." });

  const params = (() => {
    const row = db.prepare("SELECT * FROM cc_parametres WHERE id=1").get();
    if (!row) return {};
    return { ...row, plans_config: JSON.parse(row.plans_config || "{}"), offres_config: JSON.parse(row.offres_config || "{}") };
  })();

  try {
    const pdfBuf = await generateContratPdf({
      membre,
      souscription: { ...s, offres_appliquees: JSON.parse(s.offres_appliquees || "[]") },
      appareil: { marque: s.marque, modele: s.modele, couleur: s.couleur, imei: s.imei, inspecte: s.inspecte },
      params,
    });
    journal("PORTAL_DOWNLOAD_PDF", "cc_souscriptions", s.id, {}, `portail:${req.portal.numero}`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="contrat-cellcare-${membre.numero}.pdf"`);
    res.send(pdfBuf);
  } catch (err) {
    console.error("Erreur PDF portail:", err);
    res.status(500).json({ erreur: "Impossible de générer le PDF." });
  }
});

// ── DEMANDE DE MISE À NIVEAU EN BOUTIQUE ─────────────────────────────────────
// POST /api/cellcare-portal/upgrade-request
router.post("/upgrade-request", portalAuth, (req, res) => {
  updateStatuts();
  const souscription = db.prepare(
    "SELECT id, formule, statut FROM cc_souscriptions WHERE membre_id=? AND statut NOT IN ('annule','expire') ORDER BY created_at DESC LIMIT 1"
  ).get(req.portal.membre_id);

  if (!souscription) return res.status(404).json({ erreur: "Aucun plan actif trouvé." });
  if (souscription.formule !== "essentiel") return res.status(400).json({ erreur: "Mise à niveau disponible seulement pour le plan Essentiel." });
  if (!["actif", "en_carence"].includes(souscription.statut))
    return res.status(400).json({ erreur: "Mise à niveau non disponible dans ce statut." });

  journal("PORTAL_UPGRADE_REQUEST", "cc_souscriptions", souscription.id, { via: "portail" }, `portail:${req.portal.numero}`);
  res.json({ message: "Demande de mise à niveau enregistrée. Présentez-vous en boutique pour finaliser le paiement de 30 $." });
});

module.exports = router;
