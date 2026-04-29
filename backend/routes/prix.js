const express = require("express");
const { db } = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// ══════════════════════════════════════════════════════════════════
// CATALOGUE PIÈCES
// ══════════════════════════════════════════════════════════════════

router.get("/catalogue", auth, (req, res) => {
  const { type_appareil } = req.query;
  let sql = "SELECT * FROM pieces_catalogue";
  const params = [];
  if (type_appareil) {
    sql += " WHERE type_appareil LIKE ?";
    params.push(`%${type_appareil}%`);
  }
  sql += " ORDER BY type_appareil, type_piece";
  res.json({ pieces: db.prepare(sql).all(...params) });
});

router.post("/catalogue", auth, (req, res) => {
  const { type_appareil, modele, type_piece, cout_fournisseur, cout_vente, fournisseur, notes, piece_detachee } = req.body;
  if (!type_appareil || !type_piece || cout_fournisseur == null) {
    return res.status(400).json({ erreur: "Appareil, type de pièce et coût sont obligatoires." });
  }
  const result = db.prepare(`
    INSERT INTO pieces_catalogue (type_appareil, modele, type_piece, cout_fournisseur, cout_vente, fournisseur, notes, piece_detachee)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    type_appareil, modele || null, type_piece,
    Number(cout_fournisseur),
    cout_vente != null ? Number(cout_vente) : null,
    fournisseur || "Tan Star Trade",
    notes || null,
    piece_detachee ? 1 : 0
  );
  res.status(201).json({ message: "Pièce ajoutée.", id: result.lastInsertRowid });
});

router.patch("/catalogue/:id", auth, (req, res) => {
  const { type_appareil, modele, type_piece, cout_fournisseur, cout_vente, fournisseur, notes, piece_detachee } = req.body;
  const existing = db.prepare("SELECT id FROM pieces_catalogue WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ erreur: "Pièce introuvable." });

  db.prepare(`
    UPDATE pieces_catalogue SET
      type_appareil    = COALESCE(?, type_appareil),
      modele           = COALESCE(?, modele),
      type_piece       = COALESCE(?, type_piece),
      cout_fournisseur = COALESCE(?, cout_fournisseur),
      cout_vente       = ?,
      fournisseur      = COALESCE(?, fournisseur),
      notes            = COALESCE(?, notes),
      piece_detachee   = ?,
      updated_at       = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    type_appareil, modele, type_piece,
    cout_fournisseur != null ? Number(cout_fournisseur) : null,
    cout_vente != null ? Number(cout_vente) : null,
    fournisseur, notes,
    piece_detachee ? 1 : 0,
    req.params.id
  );
  res.json({ message: "Pièce mise à jour." });
});

router.delete("/catalogue/:id", auth, (req, res) => {
  db.prepare("DELETE FROM pieces_catalogue WHERE id = ?").run(req.params.id);
  res.json({ message: "Pièce supprimée." });
});

// Incrémenter le compteur de demandes
router.post("/catalogue/:id/demande", auth, (req, res) => {
  const qty = Math.max(1, parseInt(req.body.qty) || 1);
  const existing = db.prepare("SELECT id FROM pieces_catalogue WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ erreur: "Pièce introuvable." });
  db.prepare("UPDATE pieces_catalogue SET nb_demandes = nb_demandes + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(qty, req.params.id);
  const updated = db.prepare("SELECT nb_demandes FROM pieces_catalogue WHERE id = ?").get(req.params.id);
  res.json({ message: "Demande enregistrée.", nb_demandes: updated.nb_demandes });
});

// ══════════════════════════════════════════════════════════════════
// PRIX CONCURRENTS
// ══════════════════════════════════════════════════════════════════

router.get("/concurrents", auth, (req, res) => {
  const { type_appareil } = req.query;
  let sql = "SELECT * FROM prix_concurrents";
  const params = [];
  if (type_appareil) {
    sql += " WHERE type_appareil LIKE ?";
    params.push(`%${type_appareil}%`);
  }
  sql += " ORDER BY type_appareil, type_reparation";
  res.json({ concurrents: db.prepare(sql).all(...params) });
});

router.post("/concurrents", auth, (req, res) => {
  const { type_appareil, type_reparation, prix_cd_solution, prix_fix_moi, prix_mobile_klinik, source } = req.body;
  if (!type_appareil || !type_reparation) {
    return res.status(400).json({ erreur: "Appareil et type de réparation sont obligatoires." });
  }
  const result = db.prepare(`
    INSERT INTO prix_concurrents (type_appareil, type_reparation, prix_cd_solution, prix_fix_moi, prix_mobile_klinik, source)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type_appareil, type_reparation,
    prix_cd_solution != null ? Number(prix_cd_solution) : null,
    prix_fix_moi != null ? Number(prix_fix_moi) : null,
    prix_mobile_klinik != null ? Number(prix_mobile_klinik) : null,
    source || null);
  res.status(201).json({ message: "Prix concurrent ajouté.", id: result.lastInsertRowid });
});

router.patch("/concurrents/:id", auth, (req, res) => {
  const { type_appareil, type_reparation, prix_cd_solution, prix_fix_moi, prix_mobile_klinik, source } = req.body;
  const existing = db.prepare("SELECT id FROM prix_concurrents WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ erreur: "Entrée introuvable." });

  db.prepare(`
    UPDATE prix_concurrents SET
      type_appareil = COALESCE(?, type_appareil),
      type_reparation = COALESCE(?, type_reparation),
      prix_cd_solution = ?,
      prix_fix_moi = ?,
      prix_mobile_klinik = ?,
      source = COALESCE(?, source),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(type_appareil, type_reparation,
    prix_cd_solution != null ? Number(prix_cd_solution) : null,
    prix_fix_moi != null ? Number(prix_fix_moi) : null,
    prix_mobile_klinik != null ? Number(prix_mobile_klinik) : null,
    source, req.params.id);
  res.json({ message: "Prix concurrent mis à jour." });
});

router.delete("/concurrents/:id", auth, (req, res) => {
  db.prepare("DELETE FROM prix_concurrents WHERE id = ?").run(req.params.id);
  res.json({ message: "Entrée supprimée." });
});

// ══════════════════════════════════════════════════════════════════
// VALEUR APPAREILS
// ══════════════════════════════════════════════════════════════════

router.get("/appareils", auth, (req, res) => {
  const { type_appareil } = req.query;
  let sql = "SELECT * FROM appareils_valeur";
  const params = [];
  if (type_appareil) {
    sql += " WHERE type_appareil LIKE ?";
    params.push(`%${type_appareil}%`);
  }
  sql += " ORDER BY type_appareil";
  res.json({ appareils: db.prepare(sql).all(...params) });
});

router.post("/appareils", auth, (req, res) => {
  const { type_appareil, valeur_marche, annee, notes } = req.body;
  if (!type_appareil || valeur_marche == null) {
    return res.status(400).json({ erreur: "Appareil et valeur marché sont obligatoires." });
  }
  const result = db.prepare(`
    INSERT INTO appareils_valeur (type_appareil, valeur_marche, annee, notes)
    VALUES (?, ?, ?, ?)
  `).run(type_appareil, Number(valeur_marche), annee || null, notes || null);
  res.status(201).json({ message: "Appareil ajouté.", id: result.lastInsertRowid });
});

router.patch("/appareils/:id", auth, (req, res) => {
  const { type_appareil, valeur_marche, annee, notes } = req.body;
  const existing = db.prepare("SELECT id FROM appareils_valeur WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ erreur: "Appareil introuvable." });

  db.prepare(`
    UPDATE appareils_valeur SET
      type_appareil = COALESCE(?, type_appareil),
      valeur_marche = COALESCE(?, valeur_marche),
      annee = ?,
      notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(type_appareil, valeur_marche != null ? Number(valeur_marche) : null, annee || null, notes || null, req.params.id);
  res.json({ message: "Appareil mis à jour." });
});

router.delete("/appareils/:id", auth, (req, res) => {
  db.prepare("DELETE FROM appareils_valeur WHERE id = ?").run(req.params.id);
  res.json({ message: "Appareil supprimé." });
});

// ══════════════════════════════════════════════════════════════════
// CALCULATEUR DE PRIX
// ══════════════════════════════════════════════════════════════════

router.get("/calculer", auth, (req, res) => {
  const { appareil, reparation, main_oeuvre } = req.query;
  if (!appareil || !reparation) {
    return res.status(400).json({ erreur: "Appareil et type de réparation sont requis." });
  }

  const labor = Number(main_oeuvre) || 100;

  // 1. Chercher le coût pièce (fuzzy match)
  const piece = db.prepare(`
    SELECT cout_fournisseur FROM pieces_catalogue
    WHERE LOWER(type_appareil) LIKE LOWER(?) AND LOWER(type_piece) LIKE LOWER(?)
    ORDER BY updated_at DESC LIMIT 1
  `).get(`%${appareil}%`, `%${reparation}%`);

  const cout_piece = piece ? piece.cout_fournisseur : null;
  const cout_total = cout_piece != null ? cout_piece + labor : null;

  // 2. Chercher les prix concurrents (fuzzy match)
  const concurrent = db.prepare(`
    SELECT prix_cd_solution, prix_fix_moi, prix_mobile_klinik FROM prix_concurrents
    WHERE LOWER(type_appareil) LIKE LOWER(?) AND LOWER(type_reparation) LIKE LOWER(?)
    ORDER BY updated_at DESC LIMIT 1
  `).get(`%${appareil}%`, `%${reparation}%`);

  const concurrents = {
    cd_solution: concurrent?.prix_cd_solution || null,
    fix_moi: concurrent?.prix_fix_moi || null,
    mobile_klinik: concurrent?.prix_mobile_klinik || null,
  };

  // Moyenne des concurrents (exclure les null)
  const prixConc = [concurrents.cd_solution, concurrents.fix_moi, concurrents.mobile_klinik].filter(p => p != null);
  const moyenne = prixConc.length > 0 ? Math.round(prixConc.reduce((a, b) => a + b, 0) / prixConc.length) : null;
  concurrents.moyenne = moyenne;

  // 3. Chercher la valeur de l'appareil (fuzzy match)
  const appareilVal = db.prepare(`
    SELECT valeur_marche FROM appareils_valeur
    WHERE LOWER(type_appareil) LIKE LOWER(?)
    ORDER BY updated_at DESC LIMIT 1
  `).get(`%${appareil}%`);

  const valeur_appareil = appareilVal?.valeur_marche || null;

  // 4. Calculs
  const ratio = (cout_total != null && valeur_appareil) ? Math.round((cout_total / valeur_appareil) * 100) : null;

  // Prix suggéré : si concurrents connus, viser 5-10% sous la moyenne. Sinon, coût + marge standard.
  let prix_suggere = null;
  if (cout_total != null) {
    if (moyenne) {
      // Viser ~8% sous la moyenne des concurrents, mais jamais en dessous du coût total
      prix_suggere = Math.max(cout_total, Math.round(moyenne * 0.92));
    } else {
      // Pas de données concurrents → marge de 15% sur le coût
      prix_suggere = Math.round(cout_total * 1.15);
    }

    // Si le ratio réparation/valeur est trop élevé, réduire le prix
    if (ratio && ratio > 50 && valeur_appareil) {
      // Limiter à 40% de la valeur de l'appareil
      const prixMax40 = Math.round(valeur_appareil * 0.40);
      if (prix_suggere > prixMax40 && prixMax40 >= cout_total) {
        prix_suggere = prixMax40;
      }
    }
  }

  const marge_pct = (prix_suggere && cout_total) ? Math.round(((prix_suggere - cout_total) / prix_suggere) * 100) : null;

  // Compétitivité
  let competitivite = "inconnu";
  if (prix_suggere && moyenne) {
    if (prix_suggere <= moyenne) competitivite = "vert";
    else if (prix_suggere <= moyenne * 1.15) competitivite = "orange";
    else competitivite = "rouge";
  }

  res.json({
    cout_piece,
    main_oeuvre: labor,
    cout_total,
    concurrents,
    valeur_appareil,
    ratio_reparation_valeur: ratio,
    prix_suggere,
    marge_pct,
    competitivite,
  });
});

module.exports = router;
