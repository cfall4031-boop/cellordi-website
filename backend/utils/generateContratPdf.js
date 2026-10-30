const PDFDocument = require("pdfkit");

const TYPES_RECLAMATION = {
  vitre_avant:   "Vitre avant",
  vitre_arriere: "Vitre arrière",
  ecran_complet: "Écran complet",
  batterie:      "Batterie",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d.includes("T") ? d : d + "T12:00:00").toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });
}

function fmt$(n) {
  return Number(n || 0).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

/**
 * Génère un PDF de contrat Cell Care.
 * @param {object} data — { membre, souscription, appareil, params }
 * @returns {Promise<Buffer>}
 */
function generateContratPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const { membre, souscription, appareil, params } = data;
      const planCfg = params?.plans_config?.[souscription.formule] || {};
      const offres = Array.isArray(souscription.offres_appliquees) ? souscription.offres_appliquees : JSON.parse(souscription.offres_appliquees || "[]");

      const doc = new PDFDocument({ size: "LETTER", margin: 50 });
      const chunks = [];
      doc.on("data", c => chunks.push(c));
      doc.on("end",  () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const NAVY = "#0a1628";
      const BLUE = "#1d4ed8";
      const GREEN = "#15803d";
      const GRAY = "#4a5568";
      const W = doc.page.width - 100;

      // ── En-tête ─────────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 90).fill(NAVY);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text("🛡 CELL CARE", 50, 24);
      doc.font("Helvetica").fontSize(10).fillColor("#93c5fd").text("Plan de protection — Rep Cellordi (Les Entreprises Fall-C inc.)", 50, 52);
      doc.fontSize(8).fillColor("#64748b").text("Sainte-Catherine, Québec", 50, 66);
      doc.moveDown(2);

      // ── Titre contrat ────────────────────────────────────────────────────────
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text("CONTRAT DE PROTECTION", { align: "center" });
      doc.font("Helvetica").fontSize(10).fillColor(GRAY).text(`Numéro de membre : ${membre.numero}  ·  Version conditions : ${souscription.version_conditions || params?.conditions_version || "1.0"}`, { align: "center" });
      doc.moveDown(1.5);

      // ── Séparateur ────────────────────────────────────────────────────────────
      const sep = () => { doc.moveTo(50, doc.y).lineTo(50 + W, doc.y).strokeColor("#e2e8f0").lineWidth(1).stroke(); doc.moveDown(0.7); };

      // ── Section helper ────────────────────────────────────────────────────────
      const sectionTitle = (title) => {
        doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(11).text(title.toUpperCase(), { characterSpacing: 0.5 });
        doc.moveDown(0.3);
        sep();
      };

      const row = (label, value, color = "#1a202c") => {
        const y = doc.y;
        doc.font("Helvetica").fontSize(9).fillColor(GRAY).text(label, 50, y, { width: 200 });
        doc.font("Helvetica-Bold").fontSize(9).fillColor(color).text(String(value || "—"), 260, y, { width: W - 210 });
        doc.moveDown(0.55);
      };

      // ── MEMBRE ───────────────────────────────────────────────────────────────
      sectionTitle("Informations du membre");
      row("Numéro de membre",  membre.numero, BLUE);
      row("Nom",               `${membre.prenom} ${membre.nom}`);
      row("Téléphone",         membre.telephone || "—");
      row("Courriel",          membre.email || "—");
      row("Consentement SMS",  membre.consentement_sms ? "Oui" : "Non");
      row("Code de parrainage", membre.code_parrainage || "—");
      doc.moveDown(0.5);

      // ── APPAREIL ─────────────────────────────────────────────────────────────
      sectionTitle("Appareil protégé");
      row("Marque / Modèle", `${appareil.marque} ${appareil.modele}${appareil.couleur ? " — " + appareil.couleur : ""}`);
      row("IMEI / Numéro de série", appareil.imei, "#92400e");
      row("Appareil inspecté", appareil.inspecte ? "✓ Oui — état intact confirmé au comptoir" : "Non", appareil.inspecte ? GREEN : "#dc2626");
      doc.moveDown(0.5);

      // ── PLAN ─────────────────────────────────────────────────────────────────
      sectionTitle("Détails du plan");
      row("Formule", planCfg.nom || souscription.formule);
      row("Prix payé", fmt$(souscription.prix_paye));
      if (offres.length) row("Offres appliquées", offres.join(", "));
      if (souscription.technicien_vendeur) row("Technicien vendeur", souscription.technicien_vendeur);
      doc.moveDown(0.5);

      // ── DATES ────────────────────────────────────────────────────────────────
      sectionTitle("Dates du contrat");
      row("Date d'inscription",       fmtDate(souscription.created_at));
      row("Fin de la période de carence", fmtDate(souscription.date_carence_fin));
      row("Date limite d'annulation",  fmtDate(souscription.date_annulation_limite));
      row("Date d'expiration",         fmtDate(souscription.date_fin), "#dc2626");
      doc.moveDown(0.5);

      // ── COUVERTURE ───────────────────────────────────────────────────────────
      sectionTitle("Couverture incluse");
      row("Remplacements de vitre", `${planCfg.vitres_max || "—"} (avant et/ou arrière)`);
      row("Rabais écran complet", `-${planCfg.rabais_ecran || 0} %`);
      row("Rabais remplacement batterie", `-${planCfg.rabais_batterie || 0} %`);
      row("Vitre de protection", planCfg.vitre_protection ? "Offerte à l'inscription" : "Non incluse");
      row("Parrainage", `Jusqu'à ${planCfg.parrainage_max || 0} ami(s) — rabais de ${planCfg.parrainage_rabais || 0} %${planCfg.parrainage_plafond ? ` (max ${fmt$(planCfg.parrainage_plafond)})` : ""}`);
      doc.moveDown(0.5);

      // ── SIGNATURE ────────────────────────────────────────────────────────────
      sectionTitle("Acceptation et signature");
      row("Date et heure de signature", fmtDate(souscription.signature_date) + (souscription.signature_date ? " à " + new Date(souscription.signature_date).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) : ""));

      // Afficher la signature (base64)
      if (souscription.signature && souscription.signature.startsWith("data:image")) {
        try {
          const b64 = souscription.signature.replace(/^data:image\/\w+;base64,/, "");
          const buf = Buffer.from(b64, "base64");
          const sigY = doc.y + 5;
          doc.rect(50, sigY, 260, 80).strokeColor("#cbd5e0").lineWidth(1).stroke();
          doc.image(buf, 52, sigY + 2, { width: 256, height: 76, fit: [256, 76] });
          doc.font("Helvetica").fontSize(7.5).fillColor(GRAY).text("Signature du client", 50, sigY + 84);
          doc.moveDown(6);
        } catch (_) {
          row("Signature", "Enregistrée électroniquement");
        }
      } else {
        row("Signature", "Enregistrée électroniquement");
      }

      // ── CONDITIONS ───────────────────────────────────────────────────────────
      if (params?.conditions_text) {
        // Nouvelle page pour les conditions
        doc.addPage();
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text("CONDITIONS D'UTILISATION", { align: "center" });
        doc.font("Helvetica").fontSize(8).fillColor(GRAY).text(`Version ${params.conditions_version || "1.0"}`, { align: "center" });
        doc.moveDown(1);
        doc.font("Helvetica").fontSize(8.5).fillColor("#1a202c")
           .text(params.conditions_text, { align: "left", lineGap: 2 });
      }

      if (params?.avis_garantie_text) {
        doc.addPage();
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text("AVIS SUR LA GARANTIE LÉGALE", { align: "center" });
        doc.moveDown(1);
        doc.font("Helvetica").fontSize(8.5).fillColor("#1a202c")
           .text(params.avis_garantie_text, { align: "left", lineGap: 2 });
      }

      // ── Pied de page dernière page ───────────────────────────────────────────
      const pages = doc.bufferedPageRange ? doc.bufferedPageRange().count : 1;
      doc.font("Helvetica").fontSize(7.5).fillColor(GRAY)
         .text(`Rep Cellordi · Les Entreprises Fall-C inc. · Sainte-Catherine, QC · reparationcellordi.ca`, 50, doc.page.height - 40, { align: "center", width: W });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateContratPdf };
