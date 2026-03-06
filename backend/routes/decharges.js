const express = require("express");
const { db }  = require("../database");
const auth    = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");
const { sendSMS }   = require("../utils/smsService");
const { dechargeClient } = require("../utils/emailTemplates");

const router = express.Router();

// GET /api/decharges — Lister toutes les décharges (admin)
router.get("/", auth, (req, res) => {
  const { statut } = req.query;
  let query = "SELECT * FROM decharges WHERE 1=1";
  const params = [];

  if (statut) { query += " AND statut = ?"; params.push(statut); }
  query += " ORDER BY created_at DESC";

  const decharges = db.prepare(query).all(...params);
  const enAttente = db.prepare("SELECT COUNT(*) as count FROM decharges WHERE statut = 'en_attente'").get();

  res.json({ total: decharges.length, en_attente: enAttente.count, decharges });
});

// GET /api/decharges/:id — Détail d'une décharge (admin)
router.get("/:id", auth, (req, res) => {
  const d = db.prepare("SELECT * FROM decharges WHERE id = ?").get(req.params.id);
  if (!d) return res.status(404).json({ erreur: "Décharge introuvable." });
  res.json(d);
});

// POST /api/decharges — Créer une décharge (public — formulaire client)
router.post("/", (req, res) => {
  const {
    ticket_id,
    // Accepte les deux formats : prenom+nom OU nom_complet
    nom, prenom,
    telephone, email,
    type_appareil, marque_modele, imei,
    probleme,
    // Accepte auth_diag/auth_rep (admin) ET auth_diagnostic/auth_reparation (formulaire public)
    auth_diag, auth_rep,
    auth_diagnostic, auth_reparation,
    signature,
    accessoires, etat_physique, code_acces, photos, notes_internes
  } = req.body;

  // Résolution des champs
  const nom_final    = nom || "";
  const prenom_final = prenom || nom_final;  // Si pas de prénom séparé, utilise le nom complet
  const diag_val     = auth_diag || auth_diagnostic || "OUI";
  const rep_val      = auth_rep  || auth_reparation  || "OUI";
  const appareil_final = type_appareil + (marque_modele ? ` — ${marque_modele}` : "");

  if (!nom_final || !type_appareil || !probleme) {
    return res.status(400).json({ erreur: "Champs obligatoires manquants (nom, type_appareil, probleme)." });
  }

  const result = db.prepare(`
    INSERT INTO decharges (ticket_id, nom, prenom, telephone, type_appareil, probleme, auth_diag, auth_rep, signature)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ticket_id || null,
    nom_final,
    prenom_final,
    telephone || null,
    appareil_final,
    probleme,
    diag_val,
    rep_val,
    signature || null
  );

  // ── Email de confirmation (fire-and-forget, seulement si email fourni) ──
  if (email) {
    sendEmail({
      to: email,
      subject: `Décharge enregistrée — Réparation CeLL&Ordi`,
      html: dechargeClient({
        prenom: prenom_final,
        nom: nom_final,
        type_appareil: appareil_final,
        probleme,
      }),
    }).catch(console.error);
  }

  // ── SMS de confirmation (fire-and-forget, si téléphone fourni) ────────────
  if (telephone) {
    sendSMS({
      to: telephone,
      message: `Réparation CeLL&Ordi ✅ Votre décharge pour ${appareil_final} est enregistrée. Nos techniciens vont s'en occuper. Questions? (514) 237-5792`,
    }).catch(console.error);
  }

  res.status(201).json({ message: "Décharge enregistrée avec succès.", id: result.lastInsertRowid });
});

// PATCH /api/decharges/:id/statut — Changer le statut (admin)
router.patch("/:id/statut", auth, (req, res) => {
  const { statut } = req.body;
  if (!["en_attente", "traitee"].includes(statut)) {
    return res.status(400).json({ erreur: "Statut invalide. Valeurs: en_attente, traitee" });
  }

  const result = db.prepare("UPDATE decharges SET statut = ? WHERE id = ?").run(statut, req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Décharge introuvable." });

  res.json({ message: "Statut mis à jour.", statut });
});

// DELETE /api/decharges/:id — Supprimer une décharge (admin)
router.delete("/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM decharges WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: "Décharge introuvable." });
  res.json({ message: "Décharge supprimée." });
});

module.exports = router;
