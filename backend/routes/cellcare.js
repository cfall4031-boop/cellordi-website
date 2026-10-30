const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");
const { generateContratPdf } = require("../utils/generateContratPdf");

const router = express.Router();
router.use(auth);

// ── Helpers ───────────────────────────────────────────────────────────────────

function genNumeroMembre() {
  const year = new Date().getFullYear();
  const last = db.prepare(
    "SELECT numero FROM cc_membres WHERE numero LIKE ? ORDER BY numero DESC LIMIT 1"
  ).get(`CC-${year}-%`);
  let seq = 1;
  if (last) {
    const parts = last.numero.split("-");
    seq = parseInt(parts[2], 10) + 1;
  }
  return `CC-${year}-${String(seq).padStart(4, "0")}`;
}

function genCodeParrainage() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (db.prepare("SELECT id FROM cc_membres WHERE code_parrainage = ?").get(code));
  return code;
}

function addDays(date, days) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addMonths(date, months) {
  const d = new Date(date + "T12:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function journal(action, table, id, details, utilisateur) {
  try {
    db.prepare(
      "INSERT INTO cc_journal (action, table_cible, enregistrement_id, details, utilisateur) VALUES (?,?,?,?,?)"
    ).run(action, table, id, typeof details === "object" ? JSON.stringify(details) : String(details || ""), utilisateur || "admin");
  } catch (_) {}
}

function updateStatuts() {
  const today = new Date().toISOString().split("T")[0];
  db.prepare("UPDATE cc_souscriptions SET statut='actif' WHERE statut='en_carence' AND date_carence_fin <= ?").run(today);
  db.prepare("UPDATE cc_souscriptions SET statut='expire' WHERE statut IN ('actif','vitres_epuisees') AND date_fin < ?").run(today);
}

const DEFAULT_PLANS = {
  essentiel: {
    nom: "Essentiel",
    prix: 49,
    duree_mois: 12,
    vitres_max: 2,
    rabais_ecran: 20,
    rabais_batterie: 10,
    vitre_protection: true,
    parrainage_max: 1,
    parrainage_rabais: 40,
    parrainage_plafond: null,
  },
  plus: {
    nom: "Plus",
    prix: 79,
    duree_mois: 12,
    vitres_max: 4,
    rabais_ecran: 30,
    rabais_batterie: 40,
    vitre_protection: true,
    parrainage_max: 2,
    parrainage_rabais: 50,
    parrainage_plafond: 80,
  },
};

const DEFAULT_OFFRES = {
  rabais_reparation_jour: { actif: false, montant: 15, label: "Rabais réparation du jour" },
  credit_sans_reclamation: { actif: false, montant: 20, label: "Crédit si aucune réclamation en 12 mois" },
  prix_lancement: { actif: false, montant: 39, limite: 50, label: "Prix de lancement (50 premiers membres)" },
};

const DEFAULT_CONDITIONS = `CONDITIONS D'UTILISATION — CELL CARE (Version 1.0)

1. OBJET DU CONTRAT
Le plan Cell Care offre une protection contre les bris accidentels de l'appareil décrit dans ce contrat, selon les modalités de la formule choisie.

2. PÉRIODE DE CARENCE
Aucune réclamation ne peut être effectuée dans les 30 premiers jours suivant la date d'achat.

3. RÉCLAMATIONS
Les réclamations sont limitées selon la formule : Essentiel (2 vitres), Plus (4 vitres). Chaque réclamation doit être présentée en boutique avec l'appareil enregistré.

4. ANNULATION
Le membre peut annuler ce contrat dans les 10 jours suivant la date d'achat pour un remboursement complet. Après ce délai, aucun remboursement n'est possible.

5. EXCLUSIONS
Ce plan ne couvre pas : les dommages causés par l'eau, le vol, la perte, les dommages intentionnels, ou les appareils dont le numéro IMEI a été modifié.

6. LOI 25
Vos informations personnelles sont conservées conformément à la Loi modernisant des dispositions législatives en matière de protection des renseignements personnels (Loi 25). Durée de conservation : 5 ans.`;

const DEFAULT_AVIS = `AVIS SUR LA GARANTIE LÉGALE

En vertu du Code civil du Québec, tout bien vendu bénéficie d'une garantie légale contre les vices cachés. Le plan Cell Care est une protection supplémentaire qui complète, sans la remplacer, cette garantie légale.

La garantie légale contre les vices cachés s'applique indépendamment de ce contrat. En cas de vice caché affectant votre appareil, vous conservez tous vos recours prévus par la loi.

En souscrivant au plan Cell Care, vous reconnaissez avoir été informé de vos droits en vertu de la garantie légale.`;

function getParametres() {
  let row = db.prepare("SELECT * FROM cc_parametres WHERE id=1").get();
  if (!row) {
    db.prepare(
      "INSERT INTO cc_parametres (id, plans_config, offres_config, conditions_text, avis_garantie_text, conditions_version, duree_conservation_mois) VALUES (1,?,?,?,?,?,?)"
    ).run(JSON.stringify(DEFAULT_PLANS), JSON.stringify(DEFAULT_OFFRES), DEFAULT_CONDITIONS, DEFAULT_AVIS, "1.0", 60);
    row = db.prepare("SELECT * FROM cc_parametres WHERE id=1").get();
  }
  return {
    ...row,
    plans_config: JSON.parse(row.plans_config || "{}"),
    offres_config: JSON.parse(row.offres_config || "{}"),
  };
}

// ── PARAMÈTRES ────────────────────────────────────────────────────────────────

router.get("/parametres", (req, res) => {
  res.json(getParametres());
});

router.put("/parametres", (req, res) => {
  const { plans_config, offres_config, conditions_text, avis_garantie_text, conditions_version, duree_conservation_mois } = req.body;
  getParametres(); // init si absent
  const sets = []; const vals = [];
  if (plans_config !== undefined)           { sets.push("plans_config=?");            vals.push(JSON.stringify(plans_config)); }
  if (offres_config !== undefined)          { sets.push("offres_config=?");           vals.push(JSON.stringify(offres_config)); }
  if (conditions_text !== undefined)        { sets.push("conditions_text=?");         vals.push(conditions_text); }
  if (avis_garantie_text !== undefined)     { sets.push("avis_garantie_text=?");      vals.push(avis_garantie_text); }
  if (conditions_version !== undefined)     { sets.push("conditions_version=?");      vals.push(conditions_version); }
  if (duree_conservation_mois !== undefined){ sets.push("duree_conservation_mois=?"); vals.push(Number(duree_conservation_mois)); }
  if (!sets.length) return res.json({ message: "Aucun changement." });
  sets.push("updated_at=CURRENT_TIMESTAMP"); vals.push(1);
  db.prepare(`UPDATE cc_parametres SET ${sets.join(",")} WHERE id=?`).run(...vals);
  journal("UPDATE_PARAMETRES", "cc_parametres", 1, {}, req.admin?.nom);
  res.json({ message: "Paramètres sauvegardés.", parametres: getParametres() });
});

// ── VÉRIFICATION IMEI ────────────────────────────────────────────────────────

router.get("/check-imei/:imei", (req, res) => {
  const row = db.prepare(`
    SELECT a.imei, s.statut, s.date_fin, m.prenom, m.nom, m.numero
    FROM cc_appareils a
    JOIN cc_souscriptions s ON s.appareil_id=a.id
    JOIN cc_membres m ON m.id=s.membre_id
    WHERE a.imei=? AND s.statut NOT IN ('annule','expire')
    LIMIT 1
  `).get(req.params.imei);
  res.json({ existe: !!row, membre: row || null });
});

// ── INSCRIPTION (transaction atomique) ───────────────────────────────────────

router.post("/inscrire", (req, res) => {
  const {
    prenom, nom, telephone, email, consentement_sms,
    marque, modele, couleur, imei, photo_avant, photo_arriere, inspecte,
    formule, prix_paye, offres_appliquees, technicien_vendeur,
    conditions_version, signature, signature_date,
    // parrainage entrant
    code_parrainage_utilise,
  } = req.body;

  if (!prenom || !nom || !telephone)      return res.status(400).json({ erreur: "Prénom, nom et téléphone sont obligatoires." });
  if (!marque || !modele || !imei)        return res.status(400).json({ erreur: "Marque, modèle et IMEI sont obligatoires." });
  if (!photo_avant || !photo_arriere)     return res.status(400).json({ erreur: "Les photos avant et arrière sont obligatoires." });
  if (!inspecte)                          return res.status(400).json({ erreur: "L'appareil doit être inspecté et marqué comme intact." });
  if (!["essentiel", "plus"].includes(formule)) return res.status(400).json({ erreur: "Formule invalide." });
  if (!signature)                         return res.status(400).json({ erreur: "La signature du client est obligatoire." });

  // IMEI déjà actif ?
  const imeiExist = db.prepare(`
    SELECT a.id FROM cc_appareils a JOIN cc_souscriptions s ON s.appareil_id=a.id
    WHERE a.imei=? AND s.statut NOT IN ('annule','expire') LIMIT 1
  `).get(imei);
  if (imeiExist) return res.status(409).json({ erreur: `L'IMEI ${imei} est déjà lié à un plan actif.` });

  const params = getParametres();
  const planCfg = params.plans_config[formule];
  if (!planCfg) return res.status(400).json({ erreur: "Configuration du plan introuvable." });

  const offresApp = Array.isArray(offres_appliquees) ? offres_appliquees : [];

  // Vérifier compteur lancement
  if (offresApp.includes("prix_lancement")) {
    const offreLancement = params.offres_config.prix_lancement;
    if (!offreLancement?.actif) return res.status(400).json({ erreur: "L'offre de lancement n'est pas active." });
    const cnt = db.prepare("SELECT COUNT(*) as c FROM cc_souscriptions WHERE offres_appliquees LIKE '%prix_lancement%'").get();
    if (cnt.c >= offreLancement.limite) return res.status(400).json({ erreur: `Offre de lancement épuisée (limite ${offreLancement.limite}).` });
  }

  const today = new Date().toISOString().split("T")[0];
  let membreId, appareilId, souscriptionId, numeroMembre;

  db.transaction(() => {
    const existingMembre = db.prepare("SELECT id, numero FROM cc_membres WHERE telephone=?").get(telephone);
    if (existingMembre) {
      membreId = existingMembre.id;
      numeroMembre = existingMembre.numero;
      db.prepare("UPDATE cc_membres SET prenom=?,nom=?,email=?,consentement_sms=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
        .run(prenom, nom, email || null, consentement_sms ? 1 : 0, membreId);
    } else {
      numeroMembre = genNumeroMembre();
      const ins = db.prepare(
        "INSERT INTO cc_membres (numero,prenom,nom,telephone,email,consentement_sms,consentement_sms_date,code_parrainage) VALUES (?,?,?,?,?,?,?,?)"
      ).run(numeroMembre, prenom, nom, telephone, email || null, consentement_sms ? 1 : 0,
        consentement_sms ? new Date().toISOString() : null, genCodeParrainage());
      membreId = ins.lastInsertRowid;
    }

    const appIns = db.prepare(
      "INSERT INTO cc_appareils (membre_id,marque,modele,couleur,imei,photo_avant,photo_arriere,inspecte) VALUES (?,?,?,?,?,?,?,?)"
    ).run(membreId, marque, modele, couleur || null, imei, photo_avant, photo_arriere, inspecte ? 1 : 0);
    appareilId = appIns.lastInsertRowid;

    const subIns = db.prepare(`
      INSERT INTO cc_souscriptions
        (membre_id,appareil_id,formule,prix_paye,offres_appliquees,technicien_vendeur,
         date_carence_fin,date_annulation_limite,date_fin,vitres_restantes,
         version_conditions,signature,signature_date,statut)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      membreId, appareilId, formule,
      Number(prix_paye) || planCfg.prix,
      JSON.stringify(offresApp),
      technicien_vendeur || null,
      addDays(today, 30), addDays(today, 10), addMonths(today, 12),
      planCfg.vitres_max,
      conditions_version || params.conditions_version,
      signature, signature_date || new Date().toISOString(),
      "en_carence"
    );
    souscriptionId = subIns.lastInsertRowid;

    journal("INSCRIPTION", "cc_souscriptions", souscriptionId, { numero: numeroMembre, formule }, technicien_vendeur || req.admin?.nom);
  })();

  res.status(201).json({ message: "Inscription réussie.", numero_membre: numeroMembre, membre_id: membreId, souscription_id: souscriptionId });
});

// ── MEMBRES ───────────────────────────────────────────────────────────────────

router.get("/membres", (req, res) => {
  updateStatuts();
  const { q, statut, formule } = req.query;
  const conds = []; const vals = [];
  if (q) {
    conds.push("(m.prenom||' '||m.nom LIKE ? OR m.telephone LIKE ? OR m.numero LIKE ? OR a.imei LIKE ? OR m.email LIKE ?)");
    const l = `%${q}%`; vals.push(l, l, l, l, l);
  }
  if (statut) { conds.push("s.statut=?"); vals.push(statut); }
  if (formule) { conds.push("s.formule=?"); vals.push(formule); }
  const where = conds.length ? "WHERE " + conds.join(" AND ") : "";

  const membres = db.prepare(`
    SELECT m.id, m.numero, m.prenom, m.nom, m.telephone, m.email, m.code_parrainage, m.created_at,
           s.id as souscription_id, s.formule, s.statut, s.vitres_restantes, s.date_fin, s.date_carence_fin,
           s.prix_paye, s.date_annulation_limite,
           a.marque, a.modele, a.imei, a.id as appareil_id
    FROM cc_membres m
    LEFT JOIN cc_souscriptions s ON s.membre_id=m.id
    LEFT JOIN cc_appareils a ON a.id=s.appareil_id
    ${where}
    ORDER BY m.created_at DESC LIMIT 200
  `).all(...vals);

  res.json({ membres });
});

router.get("/membres/:id", (req, res) => {
  updateStatuts();
  const membre = db.prepare("SELECT * FROM cc_membres WHERE id=?").get(req.params.id);
  if (!membre) return res.status(404).json({ erreur: "Membre introuvable." });

  const souscriptions = db.prepare(`
    SELECT s.*, a.marque, a.modele, a.couleur, a.imei, a.photo_avant, a.photo_arriere, a.inspecte
    FROM cc_souscriptions s JOIN cc_appareils a ON a.id=s.appareil_id
    WHERE s.membre_id=? ORDER BY s.created_at DESC
  `).all(req.params.id);

  const reclamations = db.prepare(`
    SELECT r.*, s.formule FROM cc_reclamations r JOIN cc_souscriptions s ON s.id=r.souscription_id
    WHERE s.membre_id=? ORDER BY r.created_at DESC
  `).all(req.params.id);

  const parrainages = db.prepare(
    "SELECT * FROM cc_parrainages WHERE membre_parrain_id=? ORDER BY date_parrainage DESC"
  ).all(req.params.id);

  res.json({ membre, souscriptions, reclamations, parrainages });
});

router.put("/membres/:id", (req, res) => {
  const { prenom, nom, telephone, email, consentement_sms } = req.body;
  if (!db.prepare("SELECT id FROM cc_membres WHERE id=?").get(req.params.id))
    return res.status(404).json({ erreur: "Membre introuvable." });
  db.prepare(
    "UPDATE cc_membres SET prenom=COALESCE(?,prenom),nom=COALESCE(?,nom),telephone=COALESCE(?,telephone),email=COALESCE(?,email),consentement_sms=COALESCE(?,consentement_sms),updated_at=CURRENT_TIMESTAMP WHERE id=?"
  ).run(prenom||null, nom||null, telephone||null, email||null, consentement_sms!=null?(consentement_sms?1:0):null, req.params.id);
  journal("UPDATE_MEMBRE", "cc_membres", Number(req.params.id), req.body, req.admin?.nom);
  res.json({ message: "Membre mis à jour." });
});

router.delete("/membres/:id", (req, res) => {
  const m = db.prepare("SELECT * FROM cc_membres WHERE id=?").get(req.params.id);
  if (!m) return res.status(404).json({ erreur: "Membre introuvable." });
  db.prepare("UPDATE cc_membres SET prenom='[anonymisé]',nom='',telephone='',email=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(req.params.id);
  db.prepare("UPDATE cc_appareils SET photo_avant=NULL,photo_arriere=NULL WHERE membre_id=?").run(req.params.id);
  db.prepare("UPDATE cc_souscriptions SET signature='' WHERE membre_id=?").run(req.params.id);
  journal("ANONYMISATION", "cc_membres", Number(req.params.id), { motif: req.body?.motif, numero: m.numero }, req.admin?.nom);
  res.json({ message: "Membre anonymisé." });
});

// ── ANNULATION ────────────────────────────────────────────────────────────────

router.post("/souscriptions/:id/annuler", (req, res) => {
  const s = db.prepare("SELECT * FROM cc_souscriptions WHERE id=?").get(req.params.id);
  if (!s) return res.status(404).json({ erreur: "Souscription introuvable." });
  if (s.statut === "annule") return res.status(400).json({ erreur: "Déjà annulée." });
  const today = new Date().toISOString().split("T")[0];
  if (today > s.date_annulation_limite)
    return res.status(400).json({ erreur: `Date limite d'annulation dépassée (${s.date_annulation_limite}).` });
  db.prepare("UPDATE cc_souscriptions SET statut='annule',annulation_date=CURRENT_TIMESTAMP,annulation_motif=? WHERE id=?")
    .run(req.body?.motif || null, req.params.id);
  journal("ANNULATION", "cc_souscriptions", Number(req.params.id), req.body, req.admin?.nom);
  res.json({ message: `Souscription annulée. Rembourser ${s.prix_paye} $.`, remboursement: s.prix_paye });
});

// ── RÉCLAMATIONS ──────────────────────────────────────────────────────────────

router.post("/souscriptions/:id/reclamation", (req, res) => {
  updateStatuts();
  const { type, photos, technicien, cout_pieces, temps_minutes, rabais_applique, montant_client, notes } = req.body;
  const TYPES = ["vitre_avant", "vitre_arriere", "ecran_complet", "batterie"];
  if (!TYPES.includes(type)) return res.status(400).json({ erreur: "Type de réclamation invalide." });

  const s = db.prepare("SELECT * FROM cc_souscriptions WHERE id=?").get(req.params.id);
  if (!s) return res.status(404).json({ erreur: "Souscription introuvable." });

  const today = new Date().toISOString().split("T")[0];
  if (s.statut === "annule")       return res.status(400).json({ erreur: "Souscription annulée." });
  if (s.statut === "en_carence")   return res.status(400).json({ erreur: `Réclamation refusée — période de carence jusqu'au ${s.date_carence_fin}.` });
  if (today > s.date_fin)          return res.status(400).json({ erreur: `Réclamation refusée — plan expiré le ${s.date_fin}.` });

  const isVitre = type === "vitre_avant" || type === "vitre_arriere";
  if (isVitre && s.vitres_restantes <= 0)
    return res.status(400).json({ erreur: "Toutes les vitres ont déjà été réclamées." });

  const result = db.prepare(
    "INSERT INTO cc_reclamations (souscription_id,type,photos,technicien,cout_pieces,temps_minutes,rabais_applique,montant_client,notes) VALUES (?,?,?,?,?,?,?,?,?)"
  ).run(req.params.id, type, photos ? JSON.stringify(photos) : "[]", technicien||null, Number(cout_pieces)||0, Number(temps_minutes)||0, Number(rabais_applique)||0, Number(montant_client)||0, notes||null);

  if (isVitre) {
    const newVitres = s.vitres_restantes - 1;
    db.prepare("UPDATE cc_souscriptions SET vitres_restantes=?, statut=? WHERE id=?")
      .run(newVitres, newVitres <= 0 ? "vitres_epuisees" : s.statut, req.params.id);
  }

  journal("RECLAMATION", "cc_reclamations", result.lastInsertRowid, { type, souscription_id: req.params.id }, technicien || req.admin?.nom);
  res.status(201).json({ message: "Réclamation enregistrée.", id: result.lastInsertRowid });
});

// ── PARRAINAGES ───────────────────────────────────────────────────────────────

router.post("/souscriptions/:id/parrainage", (req, res) => {
  const { filleul_nom, filleul_telephone, rabais_accorde, reparation_id } = req.body;
  if (!filleul_nom || !filleul_telephone) return res.status(400).json({ erreur: "Nom et téléphone du filleul requis." });

  const s = db.prepare("SELECT * FROM cc_souscriptions WHERE id=?").get(req.params.id);
  if (!s) return res.status(404).json({ erreur: "Souscription introuvable." });

  const params = getParametres();
  const planCfg = params.plans_config[s.formule];
  const nbPar = db.prepare("SELECT COUNT(*) as c FROM cc_parrainages WHERE souscription_id=?").get(req.params.id).c;
  if (nbPar >= planCfg.parrainage_max)
    return res.status(400).json({ erreur: `Limite de ${planCfg.parrainage_max} parrainage(s) atteinte.` });

  const existingClient = db.prepare("SELECT id FROM clients WHERE telephone=?").get(filleul_telephone);
  const existingMembre = db.prepare("SELECT id FROM cc_membres WHERE telephone=?").get(filleul_telephone);
  if (existingClient || existingMembre)
    return res.status(400).json({ erreur: "Ce client existe déjà — le parrainage est pour les nouveaux clients seulement." });

  let rabais = Number(rabais_accorde) || planCfg.parrainage_rabais;
  if (planCfg.parrainage_plafond) rabais = Math.min(rabais, planCfg.parrainage_plafond);

  const result = db.prepare(
    "INSERT INTO cc_parrainages (membre_parrain_id,souscription_id,filleul_nom,filleul_telephone,rabais_accorde,reparation_id) VALUES (?,?,?,?,?,?)"
  ).run(s.membre_id, req.params.id, filleul_nom, filleul_telephone, rabais, reparation_id || null);

  journal("PARRAINAGE", "cc_parrainages", result.lastInsertRowid, { filleul: filleul_nom, rabais }, req.admin?.nom);
  res.status(201).json({ message: "Parrainage enregistré.", id: result.lastInsertRowid, rabais });
});

// ── STATISTIQUES ──────────────────────────────────────────────────────────────

router.get("/stats", (req, res) => {
  updateStatuts();
  const plansSold = db.prepare("SELECT formule, COUNT(*) as total, SUM(prix_paye) as revenus FROM cc_souscriptions GROUP BY formule").all();
  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as mois, formule, COUNT(*) as total, SUM(prix_paye) as revenus
    FROM cc_souscriptions WHERE created_at >= date('now','-12 months')
    GROUP BY mois, formule ORDER BY mois DESC
  `).all();
  const statuts = db.prepare("SELECT statut, COUNT(*) as total FROM cc_souscriptions GROUP BY statut").all();
  const reclamations = db.prepare("SELECT COUNT(*) as total, AVG(cout_pieces) as cout_moyen, SUM(cout_pieces) as cout_total, SUM(montant_client) as revenus_client FROM cc_reclamations").get();
  const reclamParType = db.prepare("SELECT type, COUNT(*) as total FROM cc_reclamations GROUP BY type").all();
  const parrainages = db.prepare("SELECT COUNT(*) as total, SUM(rabais_accorde) as rabais_total FROM cc_parrainages").get();
  const expireBientot = db.prepare("SELECT COUNT(*) as total FROM cc_souscriptions WHERE statut='actif' AND date_fin BETWEEN date('now') AND date('now','+30 days')").get();
  const compteurLancement = db.prepare("SELECT COUNT(*) as c FROM cc_souscriptions WHERE offres_appliquees LIKE '%prix_lancement%'").get();
  const totalMembres = db.prepare("SELECT COUNT(*) as c FROM cc_membres").get();

  res.json({ plans_vendus: plansSold, par_mois: byMonth, statuts, reclamations, reclamations_par_type: reclamParType, parrainages, expire_bientot: expireBientot.total, compteur_lancement: compteurLancement.c, total_membres: totalMembres.c });
});

// ── JOURNAL ───────────────────────────────────────────────────────────────────

router.get("/journal", (req, res) => {
  const rows = db.prepare("SELECT * FROM cc_journal ORDER BY created_at DESC LIMIT 200").all();
  res.json({ journal: rows });
});

// ── PDF CONTRAT ───────────────────────────────────────────────────────────────

router.get("/souscriptions/:id/pdf", async (req, res) => {
  const s = db.prepare(`
    SELECT s.*, a.marque, a.modele, a.couleur, a.imei, a.inspecte
    FROM cc_souscriptions s JOIN cc_appareils a ON a.id=s.appareil_id
    WHERE s.id=?
  `).get(req.params.id);
  if (!s) return res.status(404).json({ erreur: "Souscription introuvable." });

  const membre = db.prepare("SELECT * FROM cc_membres WHERE id=?").get(s.membre_id);
  if (!membre) return res.status(404).json({ erreur: "Membre introuvable." });

  const params = getParametres();

  try {
    const pdfBuf = await generateContratPdf({
      membre,
      souscription: { ...s, offres_appliquees: JSON.parse(s.offres_appliquees || "[]") },
      appareil: { marque: s.marque, modele: s.modele, couleur: s.couleur, imei: s.imei, inspecte: s.inspecte },
      params,
    });
    const filename = `contrat-cellcare-${membre.numero}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuf);
  } catch (err) {
    console.error("Erreur génération PDF:", err);
    res.status(500).json({ erreur: "Impossible de générer le PDF." });
  }
});

// ── EXPORT CSV ────────────────────────────────────────────────────────────────

router.get("/export/membres", (req, res) => {
  updateStatuts();
  const rows = db.prepare(`
    SELECT m.numero, m.prenom, m.nom, m.telephone, m.email, m.consentement_sms, m.code_parrainage,
           s.formule, s.statut, s.prix_paye, s.date_fin, s.vitres_restantes,
           a.marque, a.modele, a.imei, m.created_at
    FROM cc_membres m
    LEFT JOIN cc_souscriptions s ON s.membre_id=m.id
    LEFT JOIN cc_appareils a ON a.id=s.appareil_id
    ORDER BY m.created_at DESC
  `).all();

  const headers = ["Numéro","Prénom","Nom","Téléphone","Courriel","Consentement SMS","Code parrainage","Formule","Statut","Prix payé","Date fin","Vitres restantes","Marque","Modèle","IMEI","Date inscription"];
  const csv = [headers.join(";"), ...rows.map(r => [r.numero,r.prenom,r.nom,r.telephone,r.email||"",r.consentement_sms?"Oui":"Non",r.code_parrainage||"",r.formule||"",r.statut||"",r.prix_paye||"",r.date_fin||"",r.vitres_restantes??'',r.marque||"",r.modele||"",r.imei||"",r.created_at].join(";"))].join("\n");

  res.setHeader("Content-Type","text/csv;charset=utf-8");
  res.setHeader("Content-Disposition","attachment;filename=cellcare-membres.csv");
  res.send("﻿" + csv);
});

module.exports = router;
