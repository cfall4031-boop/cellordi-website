const express = require("express");
const { db }  = require("../database");
const auth    = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");
const { sendSMS }   = require("../utils/smsService");
const { annulationRdvAbsence } = require("../utils/emailTemplates");

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Toronto" });
}

function getConflicts(dateDebut, dateFin) {
  return db.prepare(`
    SELECT id, prenom, nom, email, telephone, date_rdv, heure
    FROM rendezvous
    WHERE date_rdv BETWEEN ? AND ?
      AND statut IN ('en_attente', 'confirme')
    ORDER BY date_rdv, heure
  `).all(dateDebut, dateFin);
}

// ── GET /api/absences — liste admin (toutes) ──────────────────
router.get("/", auth, (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM absences ORDER BY date_debut ASC"
  ).all();
  res.json({ absences: rows });
});

// ── GET /api/absences/public — liste publique (à venir) ───────
router.get("/public", (req, res) => {
  const today = todayStr();
  const rows = db.prepare(`
    SELECT id, date_debut, date_fin FROM absences
    WHERE date_fin >= ?
    ORDER BY date_debut ASC
  `).all(today);
  res.json({ absences: rows });
});

// ── POST /api/absences — créer une absence (admin) ────────────
router.post("/", auth, (req, res) => {
  const { date_debut, date_fin, motif } = req.body;
  const force = req.query.force === "1";

  if (!date_debut || !date_fin) {
    return res.status(400).json({ erreur: "date_debut et date_fin sont requis." });
  }
  if (date_fin < date_debut) {
    return res.status(400).json({ erreur: "date_fin doit être >= date_debut." });
  }
  const today = todayStr();
  if (date_fin < today) {
    return res.status(400).json({ erreur: "Impossible d'ajouter une absence entièrement passée." });
  }

  const conflicts = getConflicts(date_debut, date_fin);

  // Sans force : signaler les conflits pour confirmation
  if (!force && conflicts.length > 0) {
    return res.status(409).json({ conflicts });
  }

  // Insérer l'absence
  const result = db.prepare(
    "INSERT INTO absences (date_debut, date_fin, motif) VALUES (?, ?, ?)"
  ).run(date_debut, date_fin, motif || "");

  const absenceId = result.lastInsertRowid;

  // Annuler les RDVs conflictuels et notifier les clients
  if (conflicts.length > 0) {
    const cancel = db.prepare(
      "UPDATE rendezvous SET statut = 'annule' WHERE id = ?"
    );
    db.transaction(() => {
      for (const rdv of conflicts) cancel.run(rdv.id);
    })();

    // Envoi email + SMS (fire-and-forget)
    for (const rdv of conflicts) {
      if (rdv.email) {
        sendEmail({
          to: rdv.email,
          subject: "Annulation de votre rendez-vous — Réparation CeLL&Ordi",
          html: annulationRdvAbsence({
            prenom: rdv.prenom,
            nom: rdv.nom,
            date_rdv: rdv.date_rdv,
            heure: rdv.heure,
            date_debut,
            date_fin,
          }),
        }).catch(console.error);
      }
      if (rdv.telephone) {
        const fmtDate = (d) => {
          const [y, m, j] = d.split("-");
          return `${parseInt(j)}/${parseInt(m)}/${y}`;
        };
        sendSMS({
          to: rdv.telephone,
          message: `❌ CeLL&Ordi — Votre RDV du ${rdv.date_rdv}${rdv.heure ? " à " + rdv.heure : ""} est annulé en raison d'une absence du technicien (${fmtDate(date_debut)} au ${fmtDate(date_fin)}). Reprendre RDV : reparationcellordi.ca\nInfo : (514) 237-5792`,
        }).catch(console.error);
      }
    }
  }

  res.status(201).json({
    id: absenceId,
    annules: conflicts.length,
  });
});

// ── DELETE /api/absences/:id — supprimer une absence (admin) ──
router.delete("/:id", auth, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT id FROM absences WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ erreur: "Absence introuvable." });
  db.prepare("DELETE FROM absences WHERE id = ?").run(id);
  res.json({ message: "Absence supprimée." });
});

module.exports = router;
