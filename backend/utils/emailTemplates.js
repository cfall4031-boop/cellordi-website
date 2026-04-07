// ── Templates Email HTML — Réparation CeLL&Ordi ───────────────
// Design cohérent avec le site : fond #0b1c35, accent #6dd400

const SITE_URL = process.env.SITE_URL || "https://reparationcellordi.ca";

// ── Wrapper HTML commun ───────────────────────────────────────
function wrap(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Réparation CeLL&amp;Ordi</title>
</head>
<body style="margin:0;padding:0;background:#0b1c35;font-family:'Segoe UI',Arial,sans-serif;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;background:#0b1c35;">

    <!-- EN-TÊTE -->
    <div style="background:#0e2040;border-bottom:3px solid #6dd400;padding:24px 32px;text-align:center;">
      <div style="font-size:22px;font-weight:900;letter-spacing:0.04em;color:#ffffff;text-transform:uppercase;">
        RÉPARATION <span style="color:#6dd400;">CeLL&amp;Ordi</span>
      </div>
      <div style="font-size:11px;color:#6dd400;letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">
        Experts en réparation d'appareils électroniques
      </div>
    </div>

    <!-- CONTENU -->
    <div style="padding:32px;">
      ${content}
    </div>

    <!-- PIED DE PAGE -->
    <div style="background:#0e2040;border-top:1px solid rgba(109,212,0,0.15);padding:20px 32px;text-align:center;">
      <div style="color:#a8b8d0;font-size:12px;line-height:1.8;">
        <strong style="color:#6dd400;">📍</strong> 5050 QC-132 #203, Sainte-Catherine, QC<br/>
        <strong style="color:#6dd400;">📞</strong> (514) 237-5792 &nbsp;|&nbsp;
        <strong style="color:#6dd400;">🌐</strong>
        <a href="${SITE_URL}" style="color:#6dd400;text-decoration:none;">${SITE_URL.replace("https://","").replace("http://","")}</a>
      </div>
      <div style="color:#4a6080;font-size:11px;margin-top:8px;">
        Lun–Ven : 10h–19h &nbsp;|&nbsp; Sam : 11h–19h
      </div>
      <div style="color:#4a6080;font-size:10px;margin-top:12px;">
        Vous recevez ce courriel car vous avez interagi avec Réparation CeLL&amp;Ordi.
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ── Bouton vert ───────────────────────────────────────────────
function btnVert(texte, url) {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:#6dd400;color:#0b1c35;font-weight:900;font-size:15px;
      letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;
      clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);">
      ${texte}
    </a>
  </div>`;
}

// ── Bloc numéro de ticket ─────────────────────────────────────
function blocTicket(numero) {
  return `<div style="background:#0e2040;border:2px solid #6dd400;border-radius:0;padding:20px;text-align:center;margin:24px 0;">
    <div style="font-size:12px;color:#a8b8d0;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">
      Votre numéro de suivi
    </div>
    <div style="font-size:28px;font-weight:900;letter-spacing:0.06em;color:#6dd400;font-family:monospace;">
      ${numero}
    </div>
    <div style="font-size:12px;color:#a8b8d0;margin-top:8px;">
      Conservez ce numéro pour suivre l'état de votre réparation
    </div>
  </div>`;
}

// ── Ligne de détail ───────────────────────────────────────────
function detail(label, valeur) {
  if (!valeur) return "";
  return `<tr>
    <td style="padding:8px 12px;color:#a8b8d0;font-size:13px;width:40%;border-bottom:1px solid rgba(255,255,255,0.05);">
      ${label}
    </td>
    <td style="padding:8px 12px;color:#ffffff;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05);">
      ${valeur}
    </td>
  </tr>`;
}

// ═══════════════════════════════════════════════════════════════
// 1. EMAIL CLIENT — Confirmation de RDV + numéro de ticket
// ═══════════════════════════════════════════════════════════════
function rdvClient({ prenom, nom, email, telephone, type_appareil, date_rdv, heure, description, numero_ticket }) {
  const content = `
    <h1 style="font-size:20px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.03em;margin:0 0 8px;">
      Rendez-vous confirmé ✓
    </h1>
    <p style="color:#a8b8d0;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Bonjour <strong style="color:#ffffff;">${prenom}</strong>, votre rendez-vous est confirmé !
      Nous vous attendons le <strong style="color:#ffffff;">${date_rdv}</strong>${heure ? ` à <strong style="color:#ffffff;">${heure}</strong>` : ""}
      pour votre <strong style="color:#6dd400;">${type_appareil}</strong>.
    </p>

    ${numero_ticket ? blocTicket(numero_ticket) : ""}

    <!-- Détails du RDV -->
    <div style="background:#0e2040;padding:4px 0;margin-bottom:24px;">
      <div style="padding:12px 16px;font-size:12px;font-weight:700;color:#6dd400;letter-spacing:0.1em;text-transform:uppercase;border-bottom:1px solid rgba(109,212,0,0.15);">
        Détails de votre demande
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${detail("Nom complet", `${prenom} ${nom}`)}
        ${detail("Courriel", email)}
        ${detail("Téléphone", telephone)}
        ${detail("Appareil", type_appareil)}
        ${detail("Date souhaitée", date_rdv)}
        ${detail("Heure souhaitée", heure || "À confirmer")}
        ${description ? detail("Description", description) : ""}
      </table>
    </div>

    ${numero_ticket ? btnVert("Suivre ma réparation →", `${SITE_URL}/#suivi`) : ""}

    <div style="background:rgba(109,212,0,0.06);border-left:3px solid #6dd400;padding:14px 16px;margin-top:24px;">
      <p style="color:#a8b8d0;font-size:13px;line-height:1.6;margin:0;">
        <strong style="color:#6dd400;">📍 Adresse :</strong> 5050 QC-132 #203, Sainte-Catherine, QC.<br/>
        N'oubliez pas d'apporter votre appareil et son chargeur.
        Pour toute question, appelez-nous au <strong style="color:#6dd400;">(514) 237-5792</strong>.
      </p>
    </div>
  `;
  return wrap(content);
}

// ═══════════════════════════════════════════════════════════════
// 2. EMAIL ADMIN — Nouveau RDV soumis
// ═══════════════════════════════════════════════════════════════
function rdvAdmin({ prenom, nom, email, telephone, type_appareil, date_rdv, heure, description, numero_ticket }) {
  const content = `
    <div style="background:#f59e0b22;border:1px solid #f59e0b44;padding:12px 16px;margin-bottom:24px;">
      <div style="color:#f59e0b;font-weight:700;font-size:14px;">🔔 Nouveau rendez-vous soumis</div>
    </div>

    <h2 style="font-size:18px;color:#ffffff;margin:0 0 16px;">
      ${prenom} ${nom} — ${type_appareil}
    </h2>

    <table style="width:100%;border-collapse:collapse;background:#0e2040;margin-bottom:24px;">
      ${detail("Nom", `${prenom} ${nom}`)}
      ${detail("Courriel", `<a href="mailto:${email}" style="color:#6dd400;">${email}</a>`)}
      ${detail("Téléphone", telephone ? `<a href="tel:${telephone}" style="color:#6dd400;">${telephone}</a>` : "—")}
      ${detail("Appareil", type_appareil)}
      ${detail("Date souhaitée", date_rdv)}
      ${detail("Heure souhaitée", heure || "Non précisée")}
      ${numero_ticket ? detail("Ticket créé", `<strong style="color:#6dd400;">${numero_ticket}</strong>`) : ""}
      ${description ? detail("Description", description) : ""}
    </table>

    ${btnVert("Ouvrir le panneau admin →", `${SITE_URL}/admin`)}
  `;
  return wrap(content);
}

// ═══════════════════════════════════════════════════════════════
// 3. EMAIL CLIENT — Accusé de réception message Contact
// ═══════════════════════════════════════════════════════════════
function contactClient({ nom, sujet }) {
  const content = `
    <h1 style="font-size:20px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.03em;margin:0 0 8px;">
      Message reçu ✓
    </h1>
    <p style="color:#a8b8d0;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Bonjour <strong style="color:#ffffff;">${nom}</strong>, nous avons bien reçu votre message concernant
      <em>"${sujet}"</em>. Notre équipe vous répondra dans les
      <strong style="color:#6dd400;">24 heures ouvrables</strong>.
    </p>

    <div style="background:rgba(109,212,0,0.06);border-left:3px solid #6dd400;padding:14px 16px;margin-top:24px;">
      <p style="color:#a8b8d0;font-size:13px;line-height:1.6;margin:0;">
        Si votre demande est urgente, contactez-nous directement au
        <strong style="color:#6dd400;">(514) 237-5792</strong> ou passez en boutique au
        5050 QC-132 #203, Sainte-Catherine.
      </p>
    </div>

    ${btnVert("Visiter notre site →", SITE_URL)}
  `;
  return wrap(content);
}

// ═══════════════════════════════════════════════════════════════
// 4. EMAIL ADMIN — Nouveau message Contact
// ═══════════════════════════════════════════════════════════════
function contactAdmin({ nom, email, telephone, sujet, message }) {
  const content = `
    <div style="background:#38bdf822;border:1px solid #38bdf844;padding:12px 16px;margin-bottom:24px;">
      <div style="color:#38bdf8;font-weight:700;font-size:14px;">✉️ Nouveau message de contact</div>
    </div>

    <table style="width:100%;border-collapse:collapse;background:#0e2040;margin-bottom:24px;">
      ${detail("De", nom)}
      ${detail("Courriel", `<a href="mailto:${email}" style="color:#6dd400;">${email}</a>`)}
      ${telephone ? detail("Téléphone", `<a href="tel:${telephone}" style="color:#6dd400;">${telephone}</a>`) : ""}
      ${detail("Sujet", sujet)}
    </table>

    <div style="background:#0e2040;padding:16px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;color:#6dd400;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">
        Message
      </div>
      <p style="color:#a8b8d0;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
    </div>

    <div style="display:flex;gap:12px;">
      ${btnVert("Répondre par courriel →", `mailto:${email}?subject=Re: ${encodeURIComponent(sujet)}`)}
    </div>
    ${btnVert("Voir dans le panel admin →", `${SITE_URL}/admin`)}
  `;
  return wrap(content);
}

// ═══════════════════════════════════════════════════════════════
// 5. EMAIL CLIENT — Confirmation décharge signée
// ═══════════════════════════════════════════════════════════════
function dechargeClient({ prenom, nom, type_appareil, probleme }) {
  const prenom_affiche = prenom && prenom !== nom ? prenom : nom;
  const content = `
    <h1 style="font-size:20px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.03em;margin:0 0 8px;">
      Décharge enregistrée ✓
    </h1>
    <p style="color:#a8b8d0;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Bonjour <strong style="color:#ffffff;">${prenom_affiche}</strong>, votre décharge de responsabilité
      concernant votre <strong style="color:#6dd400;">${type_appareil}</strong> a bien été enregistrée dans
      notre système.
    </p>

    <div style="background:#0e2040;padding:4px 0;margin-bottom:24px;">
      <div style="padding:12px 16px;font-size:12px;font-weight:700;color:#6dd400;letter-spacing:0.1em;text-transform:uppercase;border-bottom:1px solid rgba(109,212,0,0.15);">
        Détails
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${detail("Appareil", type_appareil)}
        ${detail("Problème décrit", probleme)}
        ${detail("Autorisations", "Diagnostic ✓ &nbsp; Réparation ✓")}
      </table>
    </div>

    <div style="background:rgba(109,212,0,0.06);border-left:3px solid #6dd400;padding:14px 16px;">
      <p style="color:#a8b8d0;font-size:13px;line-height:1.6;margin:0;">
        Nos techniciens vont prendre en charge votre appareil. Pour toute question :
        <strong style="color:#6dd400;">(514) 237-5792</strong>.
      </p>
    </div>

    ${btnVert("Suivre ma réparation →", `${SITE_URL}/#suivi`)}
  `;
  return wrap(content);
}

// ═══════════════════════════════════════════════════════════════
// 6. EMAIL CLIENT — Réponse admin à un message de contact
// ═══════════════════════════════════════════════════════════════
function replyToContact({ nom, sujet, originalMessage, replyText }) {
  const content = `
    <h1 style="font-size:20px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.03em;margin:0 0 8px;">
      Réponse à votre message ✓
    </h1>
    <p style="color:#a8b8d0;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Bonjour <strong style="color:#ffffff;">${nom}</strong>,<br/>
      Notre équipe a répondu à votre demande concernant <em>"${sujet}"</em>.
    </p>

    <!-- Réponse de l'équipe -->
    <div style="background:#0e2040;border-left:4px solid #6dd400;padding:18px 20px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;color:#6dd400;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">
        Notre réponse
      </div>
      <p style="color:#ffffff;font-size:14px;line-height:1.75;margin:0;white-space:pre-line;">${replyText}</p>
    </div>

    <!-- Message original -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:16px 18px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#a8b8d0;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
        Votre message original
      </div>
      <p style="color:#a8b8d0;font-size:13px;line-height:1.7;margin:0;white-space:pre-line;">${originalMessage}</p>
    </div>

    <div style="background:rgba(109,212,0,0.06);border:1px solid rgba(109,212,0,0.2);padding:14px 16px;margin-bottom:24px;">
      <p style="color:#a8b8d0;font-size:13px;line-height:1.6;margin:0;">
        Si vous avez d'autres questions, n'hésitez pas à nous recontacter ou à nous appeler au
        <strong style="color:#6dd400;">(514) 237-5792</strong>.
      </p>
    </div>

    ${btnVert("Prendre rendez-vous →", `${SITE_URL}/#rendezvous`)}
  `;
  return wrap(content);
}

// ═══════════════════════════════════════════════════════════════
// 7. EMAIL ADMIN — Rappel demandé (client hors horaires)
// ═══════════════════════════════════════════════════════════════
function rappelAdmin({ telephone, created_at }) {
  const content = `
    <div style="background:#f59e0b22;border:1px solid #f59e0b44;padding:12px 16px;margin-bottom:24px;">
      <div style="color:#f59e0b;font-weight:700;font-size:14px;">📞 Rappel demandé — client hors horaires</div>
    </div>

    <h2 style="font-size:18px;color:#ffffff;margin:0 0 16px;">
      Un client veut être rappelé à l'ouverture
    </h2>

    <table style="width:100%;border-collapse:collapse;background:#0e2040;margin-bottom:24px;">
      ${detail("Numéro", `<a href="tel:${telephone}" style="color:#6dd400;font-size:18px;font-weight:900;">${telephone}</a>`)}
      ${detail("Reçu le", created_at || "maintenant")}
    </table>

    <div style="background:rgba(109,212,0,0.06);border-left:3px solid #6dd400;padding:14px 16px;margin-bottom:24px;">
      <p style="color:#a8b8d0;font-size:13px;line-height:1.6;margin:0;">
        <strong style="color:#6dd400;">À faire :</strong> Rappeler ce client dès l'ouverture.
        Le numéro est aussi visible dans le panel admin → Messages.
      </p>
    </div>

    ${btnVert("Voir dans le panel admin →", `${SITE_URL}/admin`)}
  `;
  return wrap(content);
}

// ─────────────────────────────────────────────────────────────
module.exports = {
  rdvClient,
  rdvAdmin,
  contactClient,
  contactAdmin,
  dechargeClient,
  replyToContact,
  rappelAdmin,
};
