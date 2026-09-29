const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");
const router = express.Router();

// ── GET / — toutes les entrées + stats ACTIF/PASSIF/VALEUR NETTE ──────────────
router.get("/", auth, (req, res) => {
  const entrees = db.prepare(`
    SELECT r.*,
      COALESCE(SUM(v.montant), 0) AS montant_paye,
      MAX(v.created_at)           AS dernier_versement
    FROM registre_financier r
    LEFT JOIN versements_registre v ON v.entree_id = r.id
    GROUP BY r.id
    ORDER BY r.statut ASC, r.created_at DESC
  `).all();

  // Calcul stats ACTIF/PASSIF
  // Actifs : type='actif' actif → valeur actuelle (montant ou dernière valeur historique)
  // Passifs : type='pret' + type='emprunt' + type='autre' actifs → restant dû
  const statsRows = db.prepare(`
    SELECT r.id, r.type, r.statut, r.portee, r.montant, r.limite_credit,
      COALESCE(SUM(v.montant), 0) AS montant_paye
    FROM registre_financier r
    LEFT JOIN versements_registre v ON v.entree_id = r.id
    WHERE r.statut = 'actif'
    GROUP BY r.id
  `).all();

  let totalActifsEntreprise = 0, totalActifsPersonnel = 0;
  let totalPassifsEntreprise = 0, totalPassifsPersonnel = 0;

  for (const row of statsRows) {
    const portee = row.portee || "entreprise";
    if (row.type === "actif") {
      if (portee === "entreprise") totalActifsEntreprise += row.montant;
      else totalActifsPersonnel += row.montant;
    } else {
      const restant = Math.max(row.montant - row.montant_paye, 0);
      if (portee === "entreprise") totalPassifsEntreprise += restant;
      else totalPassifsPersonnel += restant;
    }
  }

  const stats = {
    // Backward-compat
    total_prete:            0,
    total_emprunte:         0,
    total_rembourse_pret:   0,
    total_rembourse_emprunt:0,
    // Nouveaux
    total_actifs_entreprise:  totalActifsEntreprise,
    total_actifs_personnel:   totalActifsPersonnel,
    total_passifs_entreprise: totalPassifsEntreprise,
    total_passifs_personnel:  totalPassifsPersonnel,
    valeur_nette_entreprise:  totalActifsEntreprise - totalPassifsEntreprise,
    valeur_nette_personnel:   totalActifsPersonnel - totalPassifsPersonnel,
    valeur_nette_totale:
      (totalActifsEntreprise + totalActifsPersonnel) -
      (totalPassifsEntreprise + totalPassifsPersonnel),
  };

  // Anciens stats pour compatibilité
  const legacy = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='pret'    AND statut='actif'     THEN montant ELSE 0 END),0) AS total_prete,
      COALESCE(SUM(CASE WHEN type='emprunt' AND statut='actif'     THEN montant ELSE 0 END),0) AS total_emprunte,
      COALESCE(SUM(CASE WHEN type='pret'    AND statut='rembourse' THEN montant ELSE 0 END),0) AS total_rembourse_pret,
      COALESCE(SUM(CASE WHEN type='emprunt' AND statut='rembourse' THEN montant ELSE 0 END),0) AS total_rembourse_emprunt
    FROM registre_financier
  `).get();
  stats.total_prete             = legacy.total_prete;
  stats.total_emprunte          = legacy.total_emprunte;
  stats.total_rembourse_pret    = legacy.total_rembourse_pret;
  stats.total_rembourse_emprunt = legacy.total_rembourse_emprunt;

  res.json({ entrees, stats });
});

// ── POST / — créer une entrée ────────────────────────────────────────────────
router.post("/", auth, (req, res) => {
  const {
    type, personne, description, montant, date_echeance, notes,
    portee, limite_credit, paiement_minimum, taux_interet,
    categorie_actif, cout_achat, date_valeur,
  } = req.body;

  if (!type || !personne || montant === undefined || montant === null || montant === "") {
    return res.status(400).json({ erreur: "Type, personne et montant sont requis." });
  }

  const validTypes = ["pret", "emprunt", "autre", "actif"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ erreur: `Type invalide. Valeurs : ${validTypes.join(", ")}.` });
  }

  const result = db.prepare(`
    INSERT INTO registre_financier
      (type, personne, description, montant, date_echeance, notes,
       portee, limite_credit, paiement_minimum, taux_interet,
       categorie_actif, cout_achat, date_valeur)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    type,
    personne.trim(),
    description || "",
    Number(montant),
    date_echeance || null,
    notes || "",
    portee || "entreprise",
    limite_credit    ? Number(limite_credit)    : null,
    paiement_minimum ? Number(paiement_minimum) : null,
    taux_interet     ? Number(taux_interet)     : null,
    categorie_actif  || null,
    cout_achat       ? Number(cout_achat)       : null,
    date_valeur      || null,
  );

  res.status(201).json({ message: "Entrée créée.", id: result.lastInsertRowid });
});

// ── PATCH /:id — mettre à jour une entrée ────────────────────────────────────
router.patch("/:id", auth, (req, res) => {
  const entry = db.prepare("SELECT id FROM registre_financier WHERE id = ?").get(req.params.id);
  if (!entry) return res.status(404).json({ erreur: "Entrée introuvable." });

  const {
    statut, notes, date_echeance,
    personne, description, montant,
    portee, limite_credit, paiement_minimum, taux_interet,
    categorie_actif, cout_achat, date_valeur,
  } = req.body;

  db.prepare(`
    UPDATE registre_financier SET
      statut           = COALESCE(?, statut),
      notes            = COALESCE(?, notes),
      date_echeance    = COALESCE(?, date_echeance),
      personne         = COALESCE(?, personne),
      description      = COALESCE(?, description),
      montant          = COALESCE(?, montant),
      portee           = COALESCE(?, portee),
      limite_credit    = COALESCE(?, limite_credit),
      paiement_minimum = COALESCE(?, paiement_minimum),
      taux_interet     = COALESCE(?, taux_interet),
      categorie_actif  = COALESCE(?, categorie_actif),
      cout_achat       = COALESCE(?, cout_achat),
      date_valeur      = COALESCE(?, date_valeur),
      updated_at       = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    statut           !== undefined ? statut            : null,
    notes            !== undefined ? notes             : null,
    date_echeance    !== undefined ? date_echeance     : null,
    personne         !== undefined ? personne.trim()   : null,
    description      !== undefined ? description       : null,
    montant          !== undefined ? Number(montant)   : null,
    portee           !== undefined ? portee            : null,
    limite_credit    !== undefined ? Number(limite_credit)    : null,
    paiement_minimum !== undefined ? Number(paiement_minimum) : null,
    taux_interet     !== undefined ? Number(taux_interet)     : null,
    categorie_actif  !== undefined ? categorie_actif   : null,
    cout_achat       !== undefined ? Number(cout_achat): null,
    date_valeur      !== undefined ? date_valeur       : null,
    req.params.id,
  );

  res.json({ message: "Entrée mise à jour." });
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM registre_financier WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Entrée introuvable." });
  res.json({ message: "Entrée supprimée." });
});

// ── VERSEMENTS ────────────────────────────────────────────────────────────────
router.get("/:id/versements", auth, (req, res) => {
  const versements = db.prepare(
    "SELECT * FROM versements_registre WHERE entree_id = ? ORDER BY created_at DESC"
  ).all(req.params.id);
  res.json({ versements });
});

router.post("/:id/versement", auth, (req, res) => {
  const entry = db.prepare("SELECT * FROM registre_financier WHERE id = ?").get(req.params.id);
  if (!entry) return res.status(404).json({ erreur: "Entrée introuvable." });

  const { montant, notes } = req.body;
  if (!montant || isNaN(Number(montant)) || Number(montant) <= 0) {
    return res.status(400).json({ erreur: "Montant invalide." });
  }

  db.prepare("INSERT INTO versements_registre (entree_id, montant, notes) VALUES (?, ?, ?)")
    .run(entry.id, Number(montant), notes || "");

  const { total_paye } = db.prepare(
    "SELECT COALESCE(SUM(montant), 0) AS total_paye FROM versements_registre WHERE entree_id = ?"
  ).get(entry.id);

  if (total_paye >= entry.montant && entry.type !== "actif") {
    db.prepare("UPDATE registre_financier SET statut='rembourse', updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .run(entry.id);
  }

  res.status(201).json({ message: "Versement enregistré.", total_paye });
});

router.delete("/:id/versement/:vid", auth, (req, res) => {
  const r = db.prepare("DELETE FROM versements_registre WHERE id = ? AND entree_id = ?")
    .run(req.params.vid, req.params.id);
  if (r.changes === 0) return res.status(404).json({ erreur: "Versement introuvable." });
  res.json({ message: "Versement supprimé." });
});

// ── BILANS NETS ───────────────────────────────────────────────────────────────
router.get("/bilans", auth, (req, res) => {
  const bilans = db.prepare(
    "SELECT * FROM bilans_nets ORDER BY date_bilan DESC LIMIT 24"
  ).all();
  res.json({ bilans });
});

router.post("/bilan", auth, (req, res) => {
  const { date_bilan, total_actifs, total_passifs, valeur_nette, portee, notes } = req.body;
  if (!date_bilan) return res.status(400).json({ erreur: "date_bilan requis." });

  const result = db.prepare(`
    INSERT INTO bilans_nets (date_bilan, total_actifs, total_passifs, valeur_nette, portee, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    date_bilan,
    Number(total_actifs)  || 0,
    Number(total_passifs) || 0,
    Number(valeur_nette)  || 0,
    portee || "tout",
    notes  || "",
  );
  res.status(201).json({ message: "Bilan enregistré.", id: result.lastInsertRowid });
});

module.exports = router;
