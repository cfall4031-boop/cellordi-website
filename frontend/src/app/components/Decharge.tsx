import React, { useState, useRef, useEffect } from "react";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, NAVY_LIGHT, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn, inputStyle, labelStyle } from "../tokens";
import { dechargesApi } from "../../api";
import { CONSENT_KEY } from "./CookieBanner";

export function Decharge() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Canvas drawing
  const getPos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(canvas, e);
    setLastPos(pos);
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

  const stepTitles = ["Informations client", "Description de l'appareil", "Conditions & Signature"];

  if (localStorage.getItem(CONSENT_KEY) === "refused") return (
    <section id="decharge" style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "750px", margin: "0 auto", textAlign: "center", paddingTop: "2rem" }}>
        <FadeUp>
          <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</p>
          <p style={{ color: WHITE, fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Vous avez refusé le traitement de vos données.
          </p>
          <p style={{ color: GRAY, fontFamily: FONT_BODY, fontSize: "0.95rem" }}>
            Pour déposer votre appareil, contactez-nous directement :<br />
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
              Dépôt d'appareil
            </span>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
              Fiche de Décharge
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem" }}>
              Formulaire officiel de dépôt et de consentement pour la réparation.
            </p>
          </div>
        </FadeUp>

        {done ? (
          <FadeUp>
            <div style={{ background: `rgba(109,212,0,0.08)`, border: `2px solid ${GREEN}55`, padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.8rem", color: GREEN, textTransform: "uppercase", marginBottom: "0.8rem" }}>
                Fiche enregistrée !
              </h3>
              <p style={{ fontFamily: FONT_BODY, color: GRAY, marginBottom: "0.5rem" }}>
                Votre numéro de ticket vous sera envoyé par email.
              </p>
              <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.85rem" }}>
                Conservez ce numéro pour suivre votre réparation.
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  setSigned(false);
                  setDone(false);
                  setErreur(null);
                  setForm({
                    nom: "", prenom: "", email: "", telephone: "",
                    appareil: "", marque: "", modele: "", serie: "",
                    probleme: "", etatAppareil: "", accessoires: "",
                    acceptConditions: false,
                    acceptDiagnostic: false,
                    acceptFacturation: false,
                  });
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext("2d");
                    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                  }
                }}
                style={{ ...btn(GREEN, NAVY), marginTop: "1.5rem" }}
              >
                Nouvelle fiche
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
                {/* Step 1 — Client */}
                {step === 1 && (
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.2rem", color: WHITE, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      Informations Client
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>Prénom *</label>
                        <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Jean" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Nom *</label>
                        <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Dupont" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Téléphone *</label>
                        <input name="telephone" type="tel" value={form.telephone} onChange={handleChange} required style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => { if (form.prenom && form.nom && form.email) setStep(2); }}
                        style={{ ...btn(GREEN, NAVY) }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Appareil */}
                {step === 2 && (
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.2rem", color: WHITE, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      Description de l'Appareil
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>Type d'appareil *</label>
                        <select name="appareil" value={form.appareil} onChange={handleChange} required style={{ ...inputStyle, cursor: "pointer" }}>
                          <option value="">-- Sélectionner --</option>
                          {["Téléphone", "Tablette", "Laptop", "Desktop", "Autre"].map((a) => (
                            <option key={a} value={a} style={{ background: NAVY }}>{a}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Marque *</label>
                        <input name="marque" value={form.marque} onChange={handleChange} required placeholder="Apple, Samsung..." style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                      <div>
                        <label style={labelStyle}>Modèle *</label>
                        <input name="modele" value={form.modele} onChange={handleChange} required placeholder="iPhone 14, XPS 15..." style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>N° de série</label>
                        <input name="serie" value={form.serie} onChange={handleChange} placeholder="(optionnel)" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: "1.2rem" }}>
                      <label style={labelStyle}>Problème signalé *</label>
                      <textarea name="probleme" value={form.probleme} onChange={handleChange} required rows={3} placeholder="Décrivez le problème..." style={{ ...inputStyle, resize: "vertical" }} />
                    </div>
                    <div style={{ marginBottom: "1.2rem" }}>
                      <label style={labelStyle}>État visuel de l'appareil</label>
                      <input name="etatAppareil" value={form.etatAppareil} onChange={handleChange} placeholder="Rayures, fissures, dommages..." style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={labelStyle}>Accessoires déposés</label>
                      <input name="accessoires" value={form.accessoires} onChange={handleChange} placeholder="Chargeur, étui, câble..." style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setStep(1)} style={{ ...btn("transparent", GRAY), border: "1px solid rgba(255,255,255,0.1)" }}>
                        ← Retour
                      </button>
                      <button
                        onClick={() => { if (form.appareil && form.marque && form.modele && form.probleme) setStep(3); }}
                        style={{ ...btn(GREEN, NAVY) }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Signature */}
                {step === 3 && (
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.2rem", color: WHITE, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      Conditions & Signature
                    </h3>

                    {[
                      { name: "acceptConditions", label: "J'accepte les conditions générales de réparation et la politique de confidentialité." },
                      { name: "acceptDiagnostic", label: "J'autorise le technicien à effectuer un diagnostic complet de mon appareil." },
                      { name: "acceptFacturation", label: "Je m'engage à payer le montant convenu lors de la récupération de l'appareil." },
                    ].map((c) => (
                      <label key={c.name} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", marginBottom: "1rem", fontFamily: FONT_BODY, fontSize: "0.9rem", color: GRAY }}>
                        <input
                          type="checkbox"
                          name={c.name}
                          checked={(form as any)[c.name]}
                          onChange={handleChange}
                          style={{ width: "18px", height: "18px", accentColor: GREEN, cursor: "pointer", marginTop: "2px", flexShrink: 0 }}
                        />
                        {c.label}
                      </label>
                    ))}

                    <div style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={labelStyle}>Signature du client *</label>
                        <button onClick={clearCanvas} style={{ ...btn("transparent", GRAY_DIM), padding: "0.3rem 0.8rem", fontSize: "0.78rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                          Effacer
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
                          Signez dans le cadre ci-dessus avec votre souris ou doigt
                        </p>
                      )}
                    </div>

                    {erreur && (
                      <p style={{ color: "#ff6b6b", fontFamily: FONT_BODY, fontSize: "0.9rem", marginBottom: "1rem", background: "rgba(255,107,107,0.08)", padding: "0.75rem 1rem", border: "1px solid rgba(255,107,107,0.2)" }}>
                        ⚠ {erreur}
                      </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                      <button onClick={() => setStep(2)} style={{ ...btn("transparent", GRAY), border: "1px solid rgba(255,255,255,0.1)" }}>
                        ← Retour
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
                              prenom:          form.prenom,
                              nom:             form.nom,
                              email:           form.email || undefined,
                              telephone:       form.telephone,
                              type_appareil:   form.appareil,
                              marque_modele:   `${form.marque} ${form.modele}`.trim(),
                              imei:            form.serie,
                              probleme:        form.probleme,
                              etat_physique:   form.etatAppareil,
                              accessoires:     form.accessoires,
                              auth_diagnostic: "OUI",
                              auth_reparation: form.acceptFacturation ? "OUI" : "NON",
                              signature:       signatureBase64,
                            });
                            setDone(true);
                          } catch (e: any) {
                            setErreur(e.message || "Erreur lors de l'envoi. Veuillez réessayer.");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        style={{ ...btn(loading ? GRAY_DIM : GREEN, NAVY), opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = GREEN_GLOW; }}
                        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = loading ? GRAY_DIM : GREEN; }}
                      >
                        {loading ? "Envoi en cours..." : "Valider la fiche"}
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
