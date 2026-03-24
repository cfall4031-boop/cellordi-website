import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn, inputStyle, labelStyle } from "../tokens";
import { dechargesApi } from "../../api";
import { CONSENT_KEY } from "./CookieBanner";

// ── Helpers pour la politique de service ────────────────────────────────────
function PolicySection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : "1rem", paddingBottom: last ? 0 : "1rem", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
      <p style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "0.8rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.5rem" }}>{title}</p>
      <div style={{ fontSize: "0.82rem", color: "#8899aa", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}
function PolicyList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "0.3rem 0 0", padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ paddingLeft: "1rem", position: "relative", marginBottom: "0.25rem", fontSize: "0.82rem", color: "#8899aa", lineHeight: 1.6 }}>
          <span style={{ position: "absolute", left: 0, color: "#6dd400" }}>·</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ── Données bilingues de la politique de service ─────────────────────────────
const POLICY_DATA = {
  fr: {
    headerTitle: "📄 Politique de Service",
    company: "Les Entreprises Fall-C inc.",
    address: "5050 QC-132 #203, Sainte-Catherine, QC J5C 1L4 · Version en vigueur : 18/03/2026",
    warranty: { typeCol: "Type de pièce", partCol: "Pièce", laborCol: "Main-d'œuvre", certified: "Pièce certifiée (garantie fournisseur)", certPart: "14 jours", certLabor: "30 jours", uncertified: "Pièce non certifiée (non garantie fournisseur)", uncertPart: "Aucune", uncertLabor: "30 jours", neverCovers: "La garantie ne couvre jamais :", microNote: "Microsoudure / carte-mère et dommages liquides : réparation au meilleur effort, durée de garantie précisée sur le devis selon le cas." },
    sections: [
      { title: "1. Champ d'application", text: "La présente politique s'applique à l'ensemble des services de diagnostic et de réparation offerts par Les Entreprises Fall-C inc. pour les appareils électroniques suivants :", items: ["Téléphones intelligents (toutes marques)", "Tablettes numériques", "Ordinateurs portables et de bureau", "Consoles de jeux vidéo", "Tout autre appareil électronique accepté par le prestataire"] },
      { title: "2. Processus de service", items: ["① Dépôt : Le client dépose son appareil et complète la fiche de réception. L'état physique est consigné et des photos peuvent être prises.", "② Diagnostic : Le technicien effectue les tests nécessaires afin d'évaluer la panne. Un devis est ensuite soumis au client.", "③ Autorisation : Aucune réparation n'est entreprise sans l'accord écrit du client sur le devis (prix + délai estimé).", "④ Réparation : Les travaux sont réalisés selon les standards du prestataire avec des pièces certifiées ou compatibles selon disponibilité et choix du client.", "⑤ Remise : L'appareil est testé avant remise. La facture et les conditions de garantie sont remises au client."] },
      { title: "3. Frais de diagnostic et acompte", diagLabel: "Diagnostic :", diagItems: ["Gratuit si la réparation est effectuée.", "Des frais fixes peuvent s'appliquer si le client refuse la réparation après diagnostic."], depositLabel: "Acompte pour commande de pièces :", depositItems: ["Un acompte peut être exigé avant toute commande de pièce spéciale.", "Les pièces commandées spécialement sont non remboursables en cas d'annulation après commande, sauf erreur du prestataire ou pièce confirmée défectueuse.", "Si le client refuse la réparation après commande, il demeure redevable des frais engagés."] },
      { title: "4. Garantie", warrantyIntro: "Avant toute réparation, Les Entreprises Fall-C inc. présentent systématiquement au client les options de pièces disponibles et l'informent clairement du statut de garantie de chaque pièce.", warrantyExclusions: ["Dommages physiques, chocs ou bris causés par le client après la réparation", "Dommages liquides ou oxydation survenant après l'intervention", "Surtension électrique, usure normale ou mauvaise utilisation", "Intervention effectuée par un tiers après notre réparation", "Tout problème non directement lié à l'intervention effectuée"] },
      { title: "5. Risques acceptés par le client", items: ["État préexistant : L'appareil peut présenter des dommages non visibles (chute, torsion, oxydation, réparation antérieure, pièces non d'origine) pouvant entraîner des complications ou une impossibilité de réparation.", "Dommages liquides : Si présence d'humidité, l'appareil peut cesser de fonctionner à tout moment, même après intervention. La réparation est réalisée selon un principe de « meilleur effort ».", "Pièces compatibles : Des pièces OEM ou compatibles peuvent être utilisées selon disponibilité et budget. De légères différences esthétiques (couleur, teinte, luminosité) peuvent exister.", "Données personnelles : Le client est seul responsable de ses sauvegardes. Une intervention peut entraîner une perte de données. Le prestataire n'est pas responsable de toute perte de données.", "Récupération de données : Aucune garantie de résultat. Toute récupération dépend de l'état du support (disque, SSD, carte-mère)."] },
      { title: "6. Appareil non récupéré", items: ["Le client s'engage à récupérer son appareil dans un délai de 30 jours suivant l'avis « prêt ».", "Après 30 jours sans nouvelles, des frais d'entreposage peuvent s'appliquer.", "Après 60 jours, l'appareil peut être considéré abandonné et traité (recyclage/démontage) afin de couvrir les frais, dans la limite permise par les lois applicables."] },
      { title: "7. Limitation de responsabilité", text: "Dans la mesure permise par la loi, Les Entreprises Fall-C inc. ne peut être tenue responsable pour :", items: ["La perte de données, photos, fichiers ou mots de passe.", "Les défaillances préexistantes ou ultérieures non directement causées par l'intervention.", "Les dommages indirects (perte d'usage, perte de revenus, etc.)."], footer: "Toute responsabilité du prestataire, lorsqu'applicable, est limitée au montant payé pour l'intervention visée." },
      { title: "8. Confidentialité et communications", text: "Les informations personnelles collectées (nom, coordonnées, description de l'appareil) sont utilisées exclusivement aux fins de la prestation de service et ne sont pas partagées avec des tiers.", text2: "Le client autorise le prestataire à le contacter par appel, SMS ou courriel pour : statut du dossier, devis, autorisation de réparation, avis de récupération et suivi de garantie." },
    ],
  },
  en: {
    headerTitle: "📄 Service Policy",
    company: "Les Entreprises Fall-C inc.",
    address: "5050 QC-132 #203, Sainte-Catherine, QC J5C 1L4 · Effective version: 03/18/2026",
    warranty: { typeCol: "Part type", partCol: "Part", laborCol: "Labour", certified: "Certified part (supplier warranty)", certPart: "14 days", certLabor: "30 days", uncertified: "Non-certified part (no supplier warranty)", uncertPart: "None", uncertLabor: "30 days", neverCovers: "The warranty never covers:", microNote: "Microsoldering / motherboard and liquid damage: best-effort repair, warranty duration specified on the quote." },
    sections: [
      { title: "1. Scope", text: "This policy applies to all diagnostic and repair services offered by Les Entreprises Fall-C inc. for the following electronic devices:", items: ["Smart phones (all brands)", "Digital tablets", "Laptops and desktop computers", "Video game consoles", "Any other electronic device accepted by the provider"] },
      { title: "2. Service Process", items: ["① Drop-off: The client drops off their device and completes the intake form. The physical condition is recorded and photos may be taken.", "② Diagnostic: The technician performs the necessary tests to assess the issue. A quote is then submitted to the client.", "③ Authorization: No repair is undertaken without the client's written agreement on the quote (price + estimated time).", "④ Repair: Work is performed according to the provider's standards using certified or compatible parts based on availability and client preference.", "⑤ Handover: The device is tested before handover. The invoice and warranty terms are provided to the client."] },
      { title: "3. Diagnostic Fees and Deposit", diagLabel: "Diagnostic:", diagItems: ["Free if the repair is performed.", "Fixed fees may apply if the client refuses the repair after the diagnostic."], depositLabel: "Deposit for parts ordering:", depositItems: ["A deposit may be required before any special part order.", "Specially ordered parts are non-refundable upon cancellation after ordering, unless due to provider error or confirmed defective part.", "If the client refuses the repair after ordering, they remain liable for incurred costs."] },
      { title: "4. Warranty", warrantyIntro: "Before any repair, Les Entreprises Fall-C inc. systematically presents the available parts options to the client and clearly informs them of the warranty status of each part.", warrantyExclusions: ["Physical damage, shocks or breakage caused by the client after the repair", "Liquid damage or oxidation occurring after the intervention", "Electrical surge, normal wear or misuse", "Intervention performed by a third party after our repair", "Any issue not directly related to the intervention performed"] },
      { title: "5. Risks Accepted by the Client", items: ["Pre-existing condition: The device may have non-visible damage (drop, torsion, oxidation, prior repair, non-original parts) which may cause complications or impossibility of repair.", "Liquid damage: If moisture is present, the device may stop working at any time, even after intervention. Repair is performed on a best-effort basis.", "Compatible parts: OEM or compatible parts may be used depending on availability and budget. Minor aesthetic differences (colour, shade, brightness) may exist.", "Personal data: The client is solely responsible for their backups. An intervention may result in data loss. The provider is not responsible for any data loss.", "Data recovery: No guarantee of result. Any recovery depends on the condition of the storage medium (hard drive, SSD, motherboard)."] },
      { title: "6. Uncollected Device", items: ["The client agrees to collect their device within 30 days of the 'ready' notice.", "After 30 days with no contact, storage fees may apply.", "After 60 days, the device may be considered abandoned and processed (recycling/dismantling) to cover costs, within the limits permitted by applicable laws."] },
      { title: "7. Limitation of Liability", text: "To the extent permitted by law, Les Entreprises Fall-C inc. cannot be held liable for:", items: ["Loss of data, photos, files or passwords.", "Pre-existing or subsequent failures not directly caused by the intervention.", "Indirect damages (loss of use, loss of income, etc.)."], footer: "Any liability of the provider, when applicable, is limited to the amount paid for the relevant intervention." },
      { title: "8. Privacy and Communications", text: "Personal information collected (name, contact details, device description) is used exclusively for service delivery purposes and is not shared with third parties.", text2: "The client authorizes the provider to contact them by call, SMS or email for: case status, quotes, repair authorization, collection notices and warranty follow-up." },
    ],
  },
} as const;

export function Decharge() {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';
  const policy = isEN ? POLICY_DATA.en : POLICY_DATA.fr;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    appareil: "", marque: "", modele: "", serie: "",
    probleme: "", etatAppareil: "", accessoires: "",
    acceptConditions: false,
    acceptDiagnostic: false,
    acceptFacturation: false,
  });
  const [signed, setSigned] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const stepTitles = t("decharge.steps", { returnObjects: true }) as string[];
  const deviceTypes = t("decharge.step2.types", { returnObjects: true }) as string[];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const getPos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setDrawing(true);
    setLastPos(getPos(canvas, e));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    setLastPos(pos);
    setSigned(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  if (sessionStorage.getItem(CONSENT_KEY) === "refused") return (
    <section id="decharge" style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "750px", margin: "0 auto", textAlign: "center", paddingTop: "2rem" }}>
        <FadeUp>
          <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</p>
          <p style={{ color: WHITE, fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {t("decharge.refused_title")}
          </p>
          <p style={{ color: GRAY, fontFamily: FONT_BODY, fontSize: "0.95rem" }}>
            {t("decharge.refused_text")}<br />
            <strong style={{ color: WHITE }}>📞 (514) 237-5792</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong style={{ color: WHITE }}>✉️ info@reparationcellordi.ca</strong>
          </p>
        </FadeUp>
      </div>
    </section>
  );

  return (
    <section id="decharge" style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {t("decharge.tag")}
            </span>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
              {t("decharge.title")}
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem" }}>
              {t("decharge.subtitle")}
            </p>
          </div>
        </FadeUp>

        {done ? (
          <FadeUp>
            <div style={{ background: `rgba(109,212,0,0.08)`, border: `2px solid ${GREEN}55`, padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.8rem", color: GREEN, textTransform: "uppercase", marginBottom: "0.8rem" }}>
                {t("decharge.success.title")}
              </h3>
              <p style={{ fontFamily: FONT_BODY, color: GRAY, marginBottom: "0.5rem" }}>
                {t("decharge.success.text")}
              </p>
              <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.85rem" }}>
                {t("decharge.success.hint")}
              </p>
              <button
                onClick={() => {
                  setStep(1); setSigned(false); setDone(false); setErreur(null);
                  setForm({ nom: "", prenom: "", email: "", telephone: "", appareil: "", marque: "", modele: "", serie: "", probleme: "", etatAppareil: "", accessoires: "", acceptConditions: false, acceptDiagnostic: false, acceptFacturation: false });
                  const canvas = canvasRef.current;
                  if (canvas) { const ctx = canvas.getContext("2d"); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }
                }}
                style={{ ...btn(GREEN, NAVY), marginTop: "1.5rem" }}
              >
                {t("decharge.success.new")}
              </button>
            </div>
          </FadeUp>
        ) : (
          <>
            {/* Step indicator */}
            <FadeUp>
              <div style={{ display: "flex", gap: "0", marginBottom: "2.5rem" }}>
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      {s > 1 && <div style={{ flex: 1, height: "2px", background: step >= s ? GREEN : "rgba(255,255,255,0.1)" }} />}
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: step > s ? GREEN : step === s ? `rgba(109,212,0,0.15)` : "transparent",
                        border: `2px solid ${step >= s ? GREEN : "rgba(255,255,255,0.1)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.9rem",
                        color: step > s ? NAVY : step === s ? GREEN : GRAY_DIM,
                        flexShrink: 0,
                      }}>
                        {step > s ? "✓" : s}
                      </div>
                      {s < 3 && <div style={{ flex: 1, height: "2px", background: step > s ? GREEN : "rgba(255,255,255,0.1)" }} />}
                    </div>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: step >= s ? GRAY : GRAY_DIM, textAlign: "center", maxWidth: "80px" }}>
                      {stepTitles[s - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div style={{ background: NAVY, border: "1px solid rgba(109,212,0,0.12)", padding: "2.5rem" }}>
                {/* Step 1 */}
                {step === 1 && (
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.2rem", color: WHITE, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      {t("decharge.step1.title")}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>{t("decharge.step1.prenom")}</label>
                        <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Jean" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t("decharge.step1.nom")}</label>
                        <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Dupont" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>{t("decharge.step1.email")}</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t("decharge.step1.telephone")}</label>
                        <input name="telephone" type="tel" value={form.telephone} onChange={handleChange} required style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={() => { if (form.prenom && form.nom && form.telephone) setStep(2); }} style={{ ...btn(GREEN, NAVY) }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}>
                        {t("decharge.step1.next")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.2rem", color: WHITE, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      {t("decharge.step2.title")}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>{t("decharge.step2.type")}</label>
                        <select name="appareil" value={form.appareil} onChange={handleChange} required style={{ ...inputStyle, cursor: "pointer" }}>
                          <option value="">{t("decharge.step2.select")}</option>
                          {deviceTypes.map((a) => (
                            <option key={a} value={a} style={{ background: NAVY }}>{a}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>{t("decharge.step2.marque")}</label>
                        <input name="marque" value={form.marque} onChange={handleChange} required placeholder={t("decharge.step2.marque_ph")} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>{t("decharge.step2.modele")}</label>
                        <input name="modele" value={form.modele} onChange={handleChange} required placeholder={t("decharge.step2.modele_ph")} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t("decharge.step2.serie")}</label>
                        <input name="serie" value={form.serie} onChange={handleChange} placeholder={t("decharge.step2.serie_ph")} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: "1.2rem" }}>
                      <label style={labelStyle}>{t("decharge.step2.probleme")}</label>
                      <textarea name="probleme" value={form.probleme} onChange={handleChange} required rows={3} placeholder={t("decharge.step2.probleme_ph")} style={{ ...inputStyle, resize: "vertical" }} />
                    </div>
                    <div style={{ marginBottom: "1.2rem" }}>
                      <label style={labelStyle}>{t("decharge.step2.etat")}</label>
                      <input name="etatAppareil" value={form.etatAppareil} onChange={handleChange} placeholder={t("decharge.step2.etat_ph")} style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={labelStyle}>{t("decharge.step2.accessoires")}</label>
                      <input name="accessoires" value={form.accessoires} onChange={handleChange} placeholder={t("decharge.step2.accessoires_ph")} style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setStep(1)} style={{ ...btn("transparent", GRAY), border: "1px solid rgba(255,255,255,0.1)" }}>
                        {t("decharge.step2.prev")}
                      </button>
                      <button onClick={() => { if (form.appareil && form.marque && form.modele && form.probleme) setStep(3); }} style={{ ...btn(GREEN, NAVY) }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}>
                        {t("decharge.step2.next")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.2rem", color: WHITE, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      {t("decharge.step3.title")}
                    </h3>

                    {/* ── Politique de service scrollable ── */}
                    <div style={{
                      maxHeight: "320px", overflowY: "auto",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(109,212,0,0.18)",
                      padding: "1.25rem 1.4rem",
                      marginBottom: "1.5rem",
                      fontFamily: FONT_BODY,
                    }}>
                      {/* En-tête bilingue */}
                      <div style={{ textAlign: "center", marginBottom: "1.1rem", paddingBottom: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "0.88rem", color: GREEN, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 0.2rem" }}>
                          {policy.headerTitle}
                        </p>
                        <p style={{ color: WHITE, fontWeight: 700, fontSize: "0.85rem", margin: "0 0 0.15rem" }}>{policy.company}</p>
                        <p style={{ color: GRAY, fontSize: "0.78rem", margin: 0 }}>{policy.address}</p>
                      </div>

                      {/* Sections 1, 2 */}
                      {policy.sections.slice(0, 2).map((s: any, i: number) => (
                        <PolicySection key={i} title={s.title}>
                          {s.text && <p>{s.text}</p>}
                          {s.items && <PolicyList items={[...s.items]} />}
                        </PolicySection>
                      ))}

                      {/* Section 3 — Frais */}
                      <PolicySection title={policy.sections[2].title}>
                        <p><strong style={{ color: WHITE }}>{(policy.sections[2] as any).diagLabel}</strong></p>
                        <PolicyList items={[...(policy.sections[2] as any).diagItems]} />
                        <p style={{ marginTop: "0.5rem" }}><strong style={{ color: WHITE }}>{(policy.sections[2] as any).depositLabel}</strong></p>
                        <PolicyList items={[...(policy.sections[2] as any).depositItems]} />
                      </PolicySection>

                      {/* Section 4 — Garantie */}
                      <PolicySection title={policy.sections[3].title}>
                        <p style={{ marginBottom: "0.6rem" }}>{(policy.sections[3] as any).warrantyIntro}</p>
                        <div style={{ background: "rgba(255,255,255,0.04)", padding: "0.7rem 1rem", marginBottom: "0.7rem", fontSize: "0.78rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.3rem 0.8rem", color: GRAY }}>
                            <span style={{ color: WHITE, fontWeight: 700 }}>{policy.warranty.typeCol}</span>
                            <span style={{ color: WHITE, fontWeight: 700 }}>{policy.warranty.partCol}</span>
                            <span style={{ color: WHITE, fontWeight: 700 }}>{policy.warranty.laborCol}</span>
                            <span>{policy.warranty.certified}</span>
                            <span style={{ color: GREEN }}>{policy.warranty.certPart}</span>
                            <span style={{ color: GREEN }}>{policy.warranty.certLabor}</span>
                            <span>{policy.warranty.uncertified}</span>
                            <span style={{ color: "#ff6b6b" }}>{policy.warranty.uncertPart}</span>
                            <span style={{ color: GREEN }}>{policy.warranty.uncertLabor}</span>
                          </div>
                        </div>
                        <p><strong style={{ color: WHITE }}>{policy.warranty.neverCovers}</strong></p>
                        <PolicyList items={[...(policy.sections[3] as any).warrantyExclusions]} />
                        <p style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: GRAY }}>{policy.warranty.microNote}</p>
                      </PolicySection>

                      {/* Sections 5, 6 */}
                      {policy.sections.slice(4, 6).map((s: any, i: number) => (
                        <PolicySection key={i + 4} title={s.title}>
                          {s.text && <p>{s.text}</p>}
                          {s.items && <PolicyList items={[...s.items]} />}
                        </PolicySection>
                      ))}

                      {/* Section 7 — Limitation */}
                      <PolicySection title={policy.sections[6].title}>
                        <p>{(policy.sections[6] as any).text}</p>
                        <PolicyList items={[...(policy.sections[6] as any).items]} />
                        <p style={{ marginTop: "0.5rem" }}>{(policy.sections[6] as any).footer}</p>
                      </PolicySection>

                      {/* Section 8 — Confidentialité */}
                      <PolicySection title={policy.sections[7].title} last>
                        <p>{(policy.sections[7] as any).text}</p>
                        <p style={{ marginTop: "0.5rem" }}>{(policy.sections[7] as any).text2}</p>
                      </PolicySection>
                    </div>

                    {/* ── Cases à cocher ── */}
                    {[
                      { name: "acceptConditions", text: t("decharge.step3.cond1") },
                      { name: "acceptDiagnostic", text: t("decharge.step3.cond2") },
                      { name: "acceptFacturation", text: t("decharge.step3.cond3") },
                    ].map(({ name, text }) => (
                      <label key={name} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", marginBottom: "1rem", fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY }}>
                        <input type="checkbox" name={name} checked={(form as any)[name]} onChange={handleChange}
                          style={{ width: "18px", height: "18px", accentColor: GREEN, cursor: "pointer", marginTop: "2px", flexShrink: 0 }} />
                        {text}
                      </label>
                    ))}

                    <div style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={labelStyle}>{t("decharge.step3.signature")}</label>
                        <button onClick={clearCanvas} style={{ ...btn("transparent", GRAY_DIM), padding: "0.3rem 0.8rem", fontSize: "0.78rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {t("decharge.step3.clear")}
                        </button>
                      </div>
                      <canvas
                        ref={canvasRef}
                        width={680}
                        height={160}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={stopDraw}
                        style={{
                          width: "100%",
                          height: "160px",
                          background: "rgba(255,255,255,0.03)",
                          border: `1px dashed ${signed ? GREEN + "66" : "rgba(255,255,255,0.1)"}`,
                          cursor: "crosshair",
                          display: "block",
                          touchAction: "none",
                        }}
                      />
                      {!signed && (
                        <p style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: GRAY_DIM, marginTop: "0.4rem" }}>
                          {t("decharge.step3.sign_hint")}
                        </p>
                      )}
                      {/* Note légale */}
                      <p style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: GRAY_DIM, marginTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem", lineHeight: 1.5 }}>
                        {t("decharge.step3.legal_note")}
                      </p>
                    </div>

                    {erreur && (
                      <p style={{ color: "#ff6b6b", fontFamily: FONT_BODY, fontSize: "0.9rem", marginBottom: "1rem", background: "rgba(255,107,107,0.08)", padding: "0.75rem 1rem", border: "1px solid rgba(255,107,107,0.2)" }}>
                        ⚠ {erreur}
                      </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                      <button onClick={() => setStep(2)} style={{ ...btn("transparent", GRAY), border: "1px solid rgba(255,255,255,0.1)" }}>
                        {t("decharge.step3.prev")}
                      </button>
                      <button
                        disabled={loading}
                        onClick={async () => {
                          if (!form.acceptConditions || !form.acceptDiagnostic || !form.acceptFacturation || !signed) return;
                          setLoading(true);
                          setErreur(null);
                          try {
                            const signatureBase64 = canvasRef.current?.toDataURL("image/png") ?? null;
                            await dechargesApi.create({
                              prenom: form.prenom, nom: form.nom,
                              email: form.email || undefined, telephone: form.telephone,
                              type_appareil: form.appareil,
                              marque_modele: `${form.marque} ${form.modele}`.trim(),
                              imei: form.serie, probleme: form.probleme,
                              etat_physique: form.etatAppareil, accessoires: form.accessoires,
                              auth_diagnostic: "OUI",
                              auth_reparation: form.acceptFacturation ? "OUI" : "NON",
                              signature: signatureBase64,
                            });
                            setDone(true);
                          } catch (e: any) {
                            setErreur(e.message || t("decharge.step3.error_default"));
                          } finally {
                            setLoading(false);
                          }
                        }}
                        style={{ ...btn(loading ? GRAY_DIM : GREEN, NAVY), opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = GREEN_GLOW; }}
                        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = loading ? GRAY_DIM : GREEN; }}
                      >
                        {loading ? t("decharge.step3.sending") : t("decharge.step3.submit")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </FadeUp>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .rdv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
