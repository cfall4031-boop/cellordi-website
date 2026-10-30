import React, { useState, useEffect, useRef, useCallback } from "react";
import { cellCareApi } from "../../api";

// ── Constantes visuelles ──────────────────────────────────────────────────────
const NAVY     = "#0a1628";
const NAVY_MID = "#0d1e35";
const NAVY_CARD= "#0f2238";
const BLUE     = "#3b82f6";
const BLUE_DIM = "rgba(59,130,246,0.12)";
const GREEN    = "#6dd400";
const GREEN_DIM= "rgba(109,212,0,0.10)";
const AMBER    = "#f59e0b";
const RED      = "#ef4444";
const GRAY     = "#8899aa";
const GRAY_DIM = "#4a6080";
const WHITE    = "#ffffff";

type View = "liste" | "inscrire" | "fiche" | "dashboard" | "parametres";

// ── Libellés statuts ─────────────────────────────────────────────────────────
const STATUTS: Record<string, { label: string; color: string }> = {
  en_carence:      { label: "En carence",       color: AMBER },
  actif:           { label: "Actif",             color: GREEN },
  vitres_epuisees: { label: "Vitres épuisées",   color: "#f97316" },
  expire:          { label: "Expiré",            color: GRAY },
  annule:          { label: "Annulé",            color: RED },
};

const TYPE_RECLAMATION: Record<string, string> = {
  vitre_avant:   "Vitre avant",
  vitre_arriere: "Vitre arrière",
  ecran_complet: "Écran complet",
  batterie:      "Batterie",
};

function fmt$(n: number) { return n?.toLocaleString("fr-CA", { style: "currency", currency: "CAD" }) ?? "—"; }
function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d.includes("T") ? d : d + "T12:00:00").toLocaleDateString("fr-CA", { year:"numeric", month:"short", day:"numeric" });
}

// ── Topbar ───────────────────────────────────────────────────────────────────
function CCTopbar({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid rgba(59,130,246,0.15)", display:"flex", alignItems:"center", gap:"0.75rem", background:NAVY_MID, flexShrink:0 }}>
      {onBack && (
        <button onClick={onBack} style={{ background:"none", border:"none", color:GRAY, fontSize:"1.2rem", cursor:"pointer", padding:"0.1rem 0.4rem", display:"flex", alignItems:"center" }}>←</button>
      )}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <span style={{ fontSize:"1rem" }}>🛡️</span>
          <span style={{ fontWeight:700, color:WHITE, fontSize:"1.05rem" }}>{title}</span>
          {subtitle && <span style={{ color:GRAY, fontSize:"0.82rem" }}>/ {subtitle}</span>}
        </div>
        <div style={{ fontSize:"0.68rem", color:BLUE, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:1 }}>Cell Care — Rep Cellordi</div>
      </div>
    </div>
  );
}

// ── Badge statut ─────────────────────────────────────────────────────────────
function BadgeStatut({ statut }: { statut: string }) {
  const s = STATUTS[statut] || { label: statut, color: GRAY };
  return <span style={{ fontSize:"0.72rem", fontWeight:600, padding:"0.2rem 0.55rem", borderRadius:99, background:`${s.color}22`, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
}

// ── Signature pad ─────────────────────────────────────────────────────────────
function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#1a3a6e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const pos = getPos(e, canvas);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setIsEmpty(false);
    };
    const end = () => {
      if (!drawing.current) return;
      drawing.current = false;
      onChange(canvas.toDataURL("image/png"));
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
    };
  }, [onChange]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div>
      <div style={{ border:`2px solid ${isEmpty ? GRAY_DIM : BLUE}`, borderRadius:8, overflow:"hidden", background:"#fff", transition:"border-color 0.2s" }}>
        <canvas ref={canvasRef} width={560} height={180} style={{ display:"block", width:"100%", height:180, touchAction:"none", cursor:"crosshair" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.4rem" }}>
        <span style={{ fontSize:"0.72rem", color:GRAY }}>Signer avec le doigt ou la souris</span>
        {!isEmpty && <button onClick={clear} style={{ background:"none", border:"none", color:RED, fontSize:"0.75rem", cursor:"pointer" }}>✕ Effacer</button>}
      </div>
    </div>
  );
}

// ── Photo capture (base64) ─────────────────────────────────────────────────────
function PhotoInput({ label, value, onChange }: { label: string; value: string | null; onChange: (b64: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ textAlign:"center" }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{ border:`2px dashed ${value ? BLUE : GRAY_DIM}`, borderRadius:10, minHeight:110, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.4rem", cursor:"pointer", background: value ? BLUE_DIM : "rgba(255,255,255,0.02)", overflow:"hidden", position:"relative" }}
      >
        {value
          ? <img src={value} alt={label} style={{ maxHeight:108, maxWidth:"100%", objectFit:"cover", borderRadius:8 }} />
          : <>
              <span style={{ fontSize:"2rem" }}>📸</span>
              <span style={{ fontSize:"0.78rem", color:GRAY }}>Ajouter {label}</span>
            </>
        }
      </div>
      {value && (
        <button onClick={() => onChange(null)} style={{ marginTop:"0.3rem", background:"none", border:"none", color:RED, fontSize:"0.72rem", cursor:"pointer" }}>✕ Retirer</button>
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display:"none" }} />
      <div style={{ fontSize:"0.7rem", color:GRAY, marginTop:4 }}>{label}</div>
    </div>
  );
}

// ── Assistant d'inscription (6 étapes) ────────────────────────────────────────
function WizardInscription({ params, onDone, onCancel }: { params: any; onDone: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imeiCheck, setImeiCheck] = useState<{ ok: boolean; msg?: string } | null>(null);
  const [imeiChecking, setImeiChecking] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [avisConfirme, setAvisConfirme] = useState(false);
  const [conditionsLues, setConditionsLues] = useState(false);
  const [resultInscription, setResultInscription] = useState<any>(null);

  const [form, setForm] = useState({
    prenom: "", nom: "", telephone: "", email: "", consentement_sms: false,
    marque: "", modele: "", couleur: "", imei: "", photo_avant: null as string | null, photo_arriere: null as string | null, inspecte: false,
    formule: "essentiel" as "essentiel" | "plus", offres_appliquees: [] as string[], technicien_vendeur: "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const plans = params?.plans_config || {};
  const offres = params?.offres_config || {};
  const planChoisi = plans[form.formule];

  const toggleOffre = (key: string) => {
    set("offres_appliquees", form.offres_appliquees.includes(key)
      ? form.offres_appliquees.filter(o => o !== key)
      : [...form.offres_appliquees, key]
    );
  };

  const checkImei = useCallback(async () => {
    if (!form.imei || form.imei.length < 5) return;
    setImeiChecking(true);
    try {
      const r = await cellCareApi.checkImei(form.imei);
      if (r.existe) {
        setImeiCheck({ ok: false, msg: `⚠ IMEI déjà actif pour ${r.membre?.prenom} ${r.membre?.nom} (${r.membre?.numero})` });
      } else {
        setImeiCheck({ ok: true, msg: "✓ IMEI disponible" });
      }
    } catch { setImeiCheck(null); }
    setImeiChecking(false);
  }, [form.imei]);

  const canNext = () => {
    if (step === 1) return form.prenom && form.nom && form.telephone;
    if (step === 2) return form.marque && form.modele && form.imei && form.photo_avant && form.photo_arriere && form.inspecte && imeiCheck?.ok;
    if (step === 3) return !!form.formule;
    if (step === 4) return avisConfirme;
    if (step === 5) return conditionsLues && signatureData;
    return true;
  };

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const r = await cellCareApi.inscrire({
        ...form,
        conditions_version: params?.conditions_version || "1.0",
        signature: signatureData,
        signature_date: new Date().toISOString(),
      });
      setResultInscription(r);
      setStep(6);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const inputSt: React.CSSProperties = {
    width:"100%", padding:"0.6rem 0.75rem", background:"rgba(255,255,255,0.04)",
    border:`1px solid rgba(59,130,246,0.2)`, borderRadius:7, color:WHITE, fontSize:"0.9rem",
    fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box",
  };

  const STEPS = ["Client","Appareil","Plan","Avis légal","Signature","Confirmation"];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <CCTopbar title="Nouvelle inscription" subtitle={`Étape ${step}/6 — ${STEPS[step-1]}`} onBack={onCancel} />

      {/* Indicateur étapes */}
      <div style={{ padding:"0.75rem 1.5rem", background:NAVY_MID, display:"flex", gap:"0.3rem", flexShrink:0 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i+1 < step ? BLUE : i+1 === step ? BLUE : "rgba(255,255,255,0.08)", transition:"background 0.3s" }} />
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
        {error && <div style={{ background:"rgba(239,68,68,0.1)", border:`1px solid ${RED}`, color:RED, padding:"0.75rem 1rem", borderRadius:8, marginBottom:"1rem", fontSize:"0.88rem" }}>{error}</div>}

        {/* ÉTAPE 1 : Infos client */}
        {step === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", maxWidth:540 }}>
            <div style={{ fontWeight:600, color:WHITE, fontSize:"1rem", marginBottom:"0.25rem" }}>Informations du client</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
              <div><label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Prénom *</label>
                <input style={inputSt} value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Jean" /></div>
              <div><label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Nom *</label>
                <input style={inputSt} value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Tremblay" /></div>
            </div>
            <div><label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Téléphone *</label>
              <input style={inputSt} value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="514-555-0123" /></div>
            <div><label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Courriel (optionnel)</label>
              <input style={inputSt} value={form.email} onChange={e=>set("email",e.target.value)} placeholder="jean@exemple.com" type="email" /></div>
            <label style={{ display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer", padding:"0.7rem", background:"rgba(255,255,255,0.03)", borderRadius:8, border:"1px solid rgba(255,255,255,0.07)" }}>
              <input type="checkbox" checked={form.consentement_sms} onChange={e=>set("consentement_sms",e.target.checked)} style={{ width:16, height:16 }} />
              <div>
                <div style={{ fontSize:"0.85rem", color:WHITE }}>Consentement aux textos</div>
                <div style={{ fontSize:"0.72rem", color:GRAY }}>Rappels, confirmation, renouvellement</div>
              </div>
            </label>
          </div>
        )}

        {/* ÉTAPE 2 : Appareil */}
        {step === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", maxWidth:560 }}>
            <div style={{ fontWeight:600, color:WHITE, fontSize:"1rem", marginBottom:"0.25rem" }}>Appareil à protéger</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
              <div><label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Marque *</label>
                <input style={inputSt} value={form.marque} onChange={e=>set("marque",e.target.value)} placeholder="Apple, Samsung…" /></div>
              <div><label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Modèle *</label>
                <input style={inputSt} value={form.modele} onChange={e=>set("modele",e.target.value)} placeholder="iPhone 15 Pro" /></div>
            </div>
            <div><label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Couleur</label>
              <input style={inputSt} value={form.couleur} onChange={e=>set("couleur",e.target.value)} placeholder="Noir, Blanc…" /></div>
            <div>
              <label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>IMEI ou numéro de série *</label>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                <input style={{ ...inputSt, flex:1 }} value={form.imei} onChange={e=>{set("imei",e.target.value);setImeiCheck(null);}} placeholder="Paramètres → Général → Informations" />
                <button onClick={checkImei} disabled={imeiChecking || !form.imei} style={{ padding:"0.6rem 1rem", background:BLUE_DIM, border:`1px solid ${BLUE}`, color:BLUE, borderRadius:7, cursor:"pointer", fontSize:"0.82rem", whiteSpace:"nowrap" }}>
                  {imeiChecking ? "…" : "Vérifier"}
                </button>
              </div>
              {imeiCheck && <div style={{ marginTop:"0.3rem", fontSize:"0.78rem", color: imeiCheck.ok ? GREEN : RED }}>{imeiCheck.msg}</div>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
              <PhotoInput label="Photo avant" value={form.photo_avant} onChange={v=>set("photo_avant",v)} />
              <PhotoInput label="Photo arrière" value={form.photo_arriere} onChange={v=>set("photo_arriere",v)} />
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer", padding:"0.7rem", background:"rgba(109,212,0,0.06)", borderRadius:8, border:`1px solid ${form.inspecte ? GREEN : "rgba(109,212,0,0.2)"}` }}>
              <input type="checkbox" checked={form.inspecte} onChange={e=>set("inspecte",e.target.checked)} style={{ width:16, height:16 }} />
              <div>
                <div style={{ fontSize:"0.85rem", color:WHITE }}>✅ Appareil inspecté et intact</div>
                <div style={{ fontSize:"0.72rem", color:GRAY }}>Le technicien confirme l'état de l'appareil au moment de l'inscription</div>
              </div>
            </label>
          </div>
        )}

        {/* ÉTAPE 3 : Plan */}
        {step === 3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div style={{ fontWeight:600, color:WHITE, fontSize:"1rem", marginBottom:"0.25rem" }}>Choisir le plan</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", maxWidth:640 }}>
              {Object.entries(plans).map(([key, plan]: [string, any]) => (
                <button key={key} onClick={() => set("formule", key)} style={{
                  border:`2px solid ${form.formule === key ? BLUE : "rgba(255,255,255,0.08)"}`,
                  background: form.formule === key ? BLUE_DIM : NAVY_CARD,
                  borderRadius:12, padding:"1.2rem", cursor:"pointer", textAlign:"left", transition:"all 0.15s"
                }}>
                  <div style={{ fontSize:"1.4rem", fontWeight:800, color: form.formule === key ? BLUE : WHITE }}>{plan.nom}</div>
                  <div style={{ fontSize:"1.6rem", fontWeight:800, color:BLUE, margin:"0.4rem 0" }}>{fmt$(plan.prix)}</div>
                  <div style={{ fontSize:"0.75rem", color:GRAY, marginBottom:"0.6rem" }}>Paiement unique — {plan.duree_mois} mois</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem" }}>
                    <span style={{ fontSize:"0.78rem", color:WHITE }}>• {plan.vitres_max} remplacement(s) de vitre</span>
                    <span style={{ fontSize:"0.78rem", color:WHITE }}>• Écran complet -{plan.rabais_ecran}%</span>
                    <span style={{ fontSize:"0.78rem", color:WHITE }}>• Batterie -{plan.rabais_batterie}%</span>
                    {plan.vitre_protection && <span style={{ fontSize:"0.78rem", color:GREEN }}>• Vitre de protection offerte</span>}
                    <span style={{ fontSize:"0.78rem", color:AMBER }}>• {plan.parrainage_max} parrainage{plan.parrainage_max > 1 ? "s" : ""} (-{plan.parrainage_rabais}%{plan.parrainage_plafond ? `, max ${fmt$(plan.parrainage_plafond)}` : ""})</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Offres */}
            {Object.entries(offres).some(([, o]: any) => o.actif) && (
              <div style={{ maxWidth:640 }}>
                <div style={{ fontSize:"0.82rem", color:AMBER, fontWeight:600, marginBottom:"0.5rem" }}>✨ Offres de lancement disponibles</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                  {Object.entries(offres).map(([key, offre]: [string, any]) => offre.actif && (
                    <label key={key} style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.65rem 0.85rem", background:"rgba(245,158,11,0.06)", border:`1px solid ${form.offres_appliquees.includes(key) ? AMBER : "rgba(245,158,11,0.2)"}`, borderRadius:8, cursor:"pointer" }}>
                      <input type="checkbox" checked={form.offres_appliquees.includes(key)} onChange={() => toggleOffre(key)} />
                      <span style={{ fontSize:"0.83rem", color:WHITE }}>{offre.label} <strong style={{ color:AMBER }}>(-{fmt$(offre.montant)})</strong></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ maxWidth:360 }}>
              <label style={{ fontSize:"0.78rem", color:GRAY, display:"block", marginBottom:4 }}>Technicien vendeur</label>
              <input style={inputSt} value={form.technicien_vendeur} onChange={e=>set("technicien_vendeur",e.target.value)} placeholder="Nom du technicien" />
            </div>

            {/* Résumé prix */}
            {planChoisi && (
              <div style={{ background:BLUE_DIM, border:`1px solid rgba(59,130,246,0.25)`, borderRadius:10, padding:"1rem 1.2rem", maxWidth:360 }}>
                <div style={{ color:GRAY, fontSize:"0.78rem", marginBottom:"0.25rem" }}>Total à encaisser</div>
                <div style={{ fontSize:"1.8rem", fontWeight:800, color:BLUE }}>
                  {fmt$(planChoisi.prix - form.offres_appliquees.reduce((s: number, k: string) => s + (offres[k]?.montant || 0), 0))}
                </div>
                <div style={{ fontSize:"0.72rem", color:GRAY }}>Plan {planChoisi.nom} • {planChoisi.duree_mois} mois</div>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 : Avis garantie légale */}
        {step === 4 && (
          <div style={{ maxWidth:600, display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div style={{ fontWeight:600, color:WHITE, fontSize:"1rem" }}>Avis sur la garantie légale</div>
            <div style={{ background:"rgba(245,158,11,0.06)", border:`1px solid rgba(245,158,11,0.25)`, borderRadius:10, padding:"1.2rem", whiteSpace:"pre-wrap", color:GRAY, fontSize:"0.84rem", lineHeight:1.7, maxHeight:320, overflowY:"auto" }}>
              {params?.avis_garantie_text || "—"}
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:"0.75rem", cursor:"pointer", padding:"0.85rem", background:"rgba(245,158,11,0.08)", borderRadius:8, border:`1px solid ${avisConfirme ? AMBER : "rgba(245,158,11,0.25)"}` }}>
              <input type="checkbox" checked={avisConfirme} onChange={e=>setAvisConfirme(e.target.checked)} style={{ width:18, height:18, cursor:"pointer" }} />
              <span style={{ fontSize:"0.88rem", color:WHITE }}>Le client confirme avoir lu et compris l'avis sur la garantie légale</span>
            </label>
          </div>
        )}

        {/* ÉTAPE 5 : Conditions + Signature */}
        {step === 5 && (
          <div style={{ maxWidth:600, display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div style={{ fontWeight:600, color:WHITE, fontSize:"1rem" }}>Conditions d'utilisation</div>
            <div style={{ background:"rgba(59,130,246,0.04)", border:`1px solid rgba(59,130,246,0.2)`, borderRadius:10, padding:"1.2rem", whiteSpace:"pre-wrap", color:GRAY, fontSize:"0.82rem", lineHeight:1.7, maxHeight:280, overflowY:"auto" }}>
              {params?.conditions_text || "—"}
            </div>
            <div style={{ fontSize:"0.72rem", color:GRAY_DIM }}>Version {params?.conditions_version || "1.0"}</div>
            <label style={{ display:"flex", alignItems:"center", gap:"0.75rem", cursor:"pointer", padding:"0.85rem", background:BLUE_DIM, borderRadius:8, border:`1px solid ${conditionsLues ? BLUE : "rgba(59,130,246,0.2)"}` }}>
              <input type="checkbox" checked={conditionsLues} onChange={e=>setConditionsLues(e.target.checked)} style={{ width:18, height:18, cursor:"pointer" }} />
              <span style={{ fontSize:"0.88rem", color:WHITE }}>J'ai lu et j'accepte les conditions d'utilisation du plan Cell Care</span>
            </label>
            <div>
              <div style={{ fontSize:"0.82rem", color:WHITE, marginBottom:"0.5rem" }}>Signature du client</div>
              <SignaturePad onChange={setSignatureData} />
            </div>
          </div>
        )}

        {/* ÉTAPE 6 : Confirmation */}
        {step === 6 && resultInscription && (
          <div style={{ maxWidth:500, textAlign:"center", padding:"2rem 1rem" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>✅</div>
            <div style={{ fontSize:"1.3rem", fontWeight:700, color:WHITE, marginBottom:"0.5rem" }}>Inscription réussie !</div>
            <div style={{ fontSize:"0.88rem", color:GRAY, marginBottom:"1.5rem" }}>Le plan Cell Care est activé pour {form.prenom} {form.nom}.</div>
            <div style={{ background:BLUE_DIM, border:`1px solid rgba(59,130,246,0.3)`, borderRadius:12, padding:"1.2rem", display:"inline-flex", flexDirection:"column", gap:"0.4rem", textAlign:"left", minWidth:260 }}>
              <div style={{ fontSize:"1.4rem", fontWeight:800, color:BLUE, textAlign:"center", letterSpacing:"0.05em" }}>{resultInscription.numero_membre}</div>
              <div style={{ fontSize:"0.72rem", color:GRAY, textAlign:"center", marginBottom:"0.5rem" }}>Numéro de membre</div>
              <div style={{ fontSize:"0.82rem", color:WHITE }}>📱 {form.marque} {form.modele}</div>
              <div style={{ fontSize:"0.82rem", color:WHITE }}>📋 Plan {plans[form.formule]?.nom}</div>
              <div style={{ fontSize:"0.78rem", color:AMBER }}>⚠ Carence 30 jours</div>
            </div>
            <div style={{ marginTop:"1.5rem", display:"flex", gap:"0.75rem", justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={onDone} style={{ padding:"0.65rem 1.5rem", background:BLUE, border:"none", color:WHITE, borderRadius:8, cursor:"pointer", fontSize:"0.9rem", fontWeight:600 }}>
                Voir la fiche membre
              </button>
              <button onClick={() => { setStep(1); setForm({ prenom:"", nom:"", telephone:"", email:"", consentement_sms:false, marque:"", modele:"", couleur:"", imei:"", photo_avant:null, photo_arriere:null, inspecte:false, formule:"essentiel", offres_appliquees:[], technicien_vendeur:"" }); setSignatureData(null); setAvisConfirme(false); setConditionsLues(false); setImeiCheck(null); setResultInscription(null); }} style={{ padding:"0.65rem 1.5rem", background:"transparent", border:`1px solid ${GRAY_DIM}`, color:GRAY, borderRadius:8, cursor:"pointer", fontSize:"0.9rem" }}>
                + Autre inscription
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      {step < 6 && (
        <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid rgba(59,130,246,0.1)", background:NAVY_MID, display:"flex", justifyContent:"space-between", flexShrink:0 }}>
          <button onClick={() => step > 1 ? setStep(s=>s-1) : onCancel()} style={{ padding:"0.6rem 1.2rem", background:"transparent", border:`1px solid ${GRAY_DIM}`, color:GRAY, borderRadius:8, cursor:"pointer", fontSize:"0.88rem" }}>
            {step === 1 ? "Annuler" : "← Retour"}
          </button>
          {step < 5
            ? <button onClick={() => canNext() && setStep(s=>s+1)} disabled={!canNext()} style={{ padding:"0.6rem 1.5rem", background: canNext() ? BLUE : GRAY_DIM, border:"none", color:WHITE, borderRadius:8, cursor: canNext() ? "pointer" : "not-allowed", fontSize:"0.88rem", fontWeight:600, opacity: canNext() ? 1 : 0.5 }}>
                Suivant →
              </button>
            : <button onClick={submit} disabled={loading || !canNext()} style={{ padding:"0.6rem 1.5rem", background: canNext() && !loading ? GREEN : GRAY_DIM, border:"none", color: canNext() && !loading ? NAVY : GRAY, borderRadius:8, cursor: canNext() && !loading ? "pointer" : "not-allowed", fontSize:"0.88rem", fontWeight:700 }}>
                {loading ? "Enregistrement…" : "✅ Confirmer l'inscription"}
              </button>
          }
        </div>
      )}
    </div>
  );
}

// ── Fiche membre ──────────────────────────────────────────────────────────────
function FicheMembre({ membreId, params, onBack, onRefresh }: { membreId: number; params: any; onBack: () => void; onRefresh: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info"|"reclamation"|"parrainage">("info");
  const [error, setError] = useState<string | null>(null);
  const [modalRecl, setModalRecl] = useState(false);
  const [modalPar, setModalPar] = useState(false);
  const [reclForm, setReclForm] = useState({ type:"vitre_avant", technicien:"", cout_pieces:"", temps_minutes:"", rabais_applique:"", montant_client:"", notes:"" });
  const [parForm, setParForm] = useState({ filleul_nom:"", filleul_telephone:"" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    try { setData(await cellCareApi.getMembre(membreId)); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [membreId]);

  if (loading) return <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:GRAY }}>Chargement…</div>;
  if (!data) return <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:RED }}>Erreur de chargement.</div>;

  const { membre, souscriptions, reclamations, parrainages } = data;
  const souActif = souscriptions.find((s: any) => !["annule","expire"].includes(s.statut));
  const plans = params?.plans_config || {};
  const planCfg = souActif ? plans[souActif.formule] : null;

  const inputSt: React.CSSProperties = {
    width:"100%", padding:"0.5rem 0.7rem", background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(59,130,246,0.2)", borderRadius:7, color:WHITE, fontSize:"0.85rem",
    fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box",
  };

  const submitRecl = async () => {
    if (!souActif) return;
    setSaving(true); setMsg(null);
    try {
      await cellCareApi.reclamation(souActif.id, {
        ...reclForm,
        cout_pieces: Number(reclForm.cout_pieces) || 0,
        temps_minutes: Number(reclForm.temps_minutes) || 0,
        rabais_applique: Number(reclForm.rabais_applique) || 0,
        montant_client: Number(reclForm.montant_client) || 0,
      });
      setMsg({ text: "Réclamation enregistrée.", ok: true });
      setModalRecl(false);
      load();
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    setSaving(false);
  };

  const submitPar = async () => {
    if (!souActif) return;
    setSaving(true); setMsg(null);
    try {
      const r = await cellCareApi.parrainage(souActif.id, parForm);
      setMsg({ text: `Parrainage enregistré. Rabais accordé : ${fmt$(r.rabais)}`, ok: true });
      setModalPar(false);
      setParForm({ filleul_nom:"", filleul_telephone:"" });
      load();
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    setSaving(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <CCTopbar title={`${membre.prenom} ${membre.nom}`} subtitle={membre.numero} onBack={onBack} />

      {msg && (
        <div style={{ margin:"0.75rem 1.5rem 0", padding:"0.65rem 1rem", borderRadius:8, background: msg.ok ? GREEN_DIM : "rgba(239,68,68,0.1)", border:`1px solid ${msg.ok ? GREEN : RED}`, color: msg.ok ? GREEN : RED, fontSize:"0.85rem" }}>
          {msg.text}
          <button onClick={() => setMsg(null)} style={{ float:"right", background:"none", border:"none", color:"inherit", cursor:"pointer" }}>✕</button>
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", padding:"1.25rem 1.5rem" }}>
        {/* Statut + dates */}
        {souActif && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"0.75rem", marginBottom:"1.25rem" }}>
            {[
              { label:"Statut", val:<BadgeStatut statut={souActif.statut}/> },
              { label:"Plan", val:<span style={{ color:BLUE, fontWeight:600 }}>{plans[souActif.formule]?.nom}</span> },
              { label:"Vitres restantes", val:<span style={{ color:souActif.vitres_restantes>0?GREEN:RED, fontWeight:700 }}>{souActif.vitres_restantes}/{planCfg?.vitres_max}</span> },
              { label:"Expiration", val:fmtDate(souActif.date_fin) },
              { label:"Fin carence", val:fmtDate(souActif.date_carence_fin) },
              { label:"Prix payé", val:fmt$(souActif.prix_paye) },
            ].map(({ label, val }) => (
              <div key={label} style={{ background:NAVY_CARD, borderRadius:8, padding:"0.75rem", border:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize:"0.68rem", color:GRAY_DIM, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:"0.9rem", color:WHITE }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:"1rem", gap:"0.25rem" }}>
          {(["info","reclamation","parrainage"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:"0.55rem 1rem", background:"none", border:"none", color: tab===t ? BLUE : GRAY, borderBottom:`2px solid ${tab===t ? BLUE : "transparent"}`, cursor:"pointer", fontSize:"0.82rem", fontWeight: tab===t ? 600 : 400, transition:"all 0.15s" }}>
              {t==="info" ? "Informations" : t==="reclamation" ? `Réclamations (${reclamations.length})` : `Parrainages (${parrainages.length})`}
            </button>
          ))}
        </div>

        {/* Tab Infos */}
        {tab === "info" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", maxWidth:640 }}>
            <div style={{ background:NAVY_CARD, borderRadius:10, padding:"1rem", border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight:600, color:WHITE, marginBottom:"0.6rem" }}>Client</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem", fontSize:"0.84rem" }}>
                <div><span style={{ color:GRAY_DIM }}>Tél :</span> <span style={{ color:WHITE }}>{membre.telephone}</span></div>
                {membre.email && <div><span style={{ color:GRAY_DIM }}>Email :</span> <span style={{ color:WHITE }}>{membre.email}</span></div>}
                <div><span style={{ color:GRAY_DIM }}>SMS :</span> <span style={{ color: membre.consentement_sms?GREEN:GRAY }}>{membre.consentement_sms ? "✓ Consenti" : "Non consenti"}</span></div>
                <div><span style={{ color:GRAY_DIM }}>Code parrainage :</span> <span style={{ color:BLUE, fontWeight:600, letterSpacing:"0.1em" }}>{membre.code_parrainage}</span></div>
                <div><span style={{ color:GRAY_DIM }}>Inscrit le :</span> <span style={{ color:WHITE }}>{fmtDate(membre.created_at)}</span></div>
              </div>
            </div>
            {souActif && (
              <div style={{ background:NAVY_CARD, borderRadius:10, padding:"1rem", border:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontWeight:600, color:WHITE, marginBottom:"0.6rem" }}>Appareil</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem", fontSize:"0.84rem" }}>
                  <div style={{ color:WHITE, fontWeight:600 }}>{souActif.marque} {souActif.modele}</div>
                  {souActif.couleur && <div><span style={{ color:GRAY_DIM }}>Couleur :</span> <span style={{ color:WHITE }}>{souActif.couleur}</span></div>}
                  <div><span style={{ color:GRAY_DIM }}>IMEI :</span> <span style={{ color:AMBER, fontFamily:"monospace" }}>{souActif.imei}</span></div>
                  <div><span style={{ color:GRAY_DIM }}>Inspecté :</span> <span style={{ color: souActif.inspecte?GREEN:RED }}>{souActif.inspecte?"✓ Oui":"✗ Non"}</span></div>
                </div>
                {(souActif.photo_avant || souActif.photo_arriere) && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginTop:"0.75rem" }}>
                    {souActif.photo_avant && <img src={souActif.photo_avant} alt="Avant" style={{ width:"100%", height:80, objectFit:"cover", borderRadius:6 }} />}
                    {souActif.photo_arriere && <img src={souActif.photo_arriere} alt="Arrière" style={{ width:"100%", height:80, objectFit:"cover", borderRadius:6 }} />}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bouton PDF contrat */}
        {souActif && (
          <div style={{ padding:"0 0 0.5rem" }}>
            <a
              href={cellCareApi.contratPdfUrl(souActif.id)}
              target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", padding:"0.5rem 1rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:GRAY, textDecoration:"none", fontSize:"0.82rem" }}
            >
              📄 Télécharger le contrat signé (PDF)
            </a>
          </div>
        )}

        {/* Tab Réclamations */}
        {tab === "reclamation" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {souActif && !["annule","expire","en_carence"].includes(souActif.statut) && (
              <button onClick={() => setModalRecl(true)} style={{ padding:"0.6rem 1.2rem", background:BLUE, border:"none", color:WHITE, borderRadius:8, cursor:"pointer", fontSize:"0.85rem", fontWeight:600, alignSelf:"flex-start" }}>+ Nouvelle réclamation</button>
            )}
            {souActif?.statut === "en_carence" && (
              <div style={{ padding:"0.65rem 1rem", background:"rgba(245,158,11,0.08)", border:`1px solid ${AMBER}`, borderRadius:8, color:AMBER, fontSize:"0.83rem" }}>
                ⚠ En période de carence jusqu'au {fmtDate(souActif.date_carence_fin)} — réclamations non acceptées
              </div>
            )}
            {reclamations.length === 0 ? (
              <div style={{ color:GRAY, fontSize:"0.85rem", padding:"1rem 0" }}>Aucune réclamation</div>
            ) : reclamations.map((r: any) => (
              <div key={r.id} style={{ background:NAVY_CARD, border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"0.9rem 1rem", display:"flex", gap:"1rem", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:WHITE, fontSize:"0.9rem" }}>{TYPE_RECLAMATION[r.type] || r.type}</div>
                  <div style={{ fontSize:"0.75rem", color:GRAY, marginTop:2 }}>{fmtDate(r.created_at)} {r.technicien ? `· par ${r.technicien}` : ""}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:"0.82rem", color:GREEN }}>Rabais : {fmt$(r.rabais_applique)}</div>
                  <div style={{ fontSize:"0.82rem", color:GRAY }}>Client a payé : {fmt$(r.montant_client)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Parrainages */}
        {tab === "parrainage" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {souActif && planCfg && parrainages.length < planCfg.parrainage_max && (
              <button onClick={() => setModalPar(true)} style={{ padding:"0.6rem 1.2rem", background:BLUE, border:"none", color:WHITE, borderRadius:8, cursor:"pointer", fontSize:"0.85rem", fontWeight:600, alignSelf:"flex-start" }}>+ Enregistrer un parrainage</button>
            )}
            {souActif && planCfg && (
              <div style={{ fontSize:"0.78rem", color:GRAY }}>
                {parrainages.length}/{planCfg.parrainage_max} parrainage(s) utilisé(s) · Rabais accordé : -{planCfg.parrainage_rabais}%{planCfg.parrainage_plafond ? ` (max ${fmt$(planCfg.parrainage_plafond)})` : ""}
              </div>
            )}
            {parrainages.length === 0 ? (
              <div style={{ color:GRAY, fontSize:"0.85rem", padding:"1rem 0" }}>Aucun parrainage</div>
            ) : parrainages.map((p: any) => (
              <div key={p.id} style={{ background:NAVY_CARD, border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"0.9rem 1rem" }}>
                <div style={{ fontWeight:600, color:WHITE }}>{p.filleul_nom}</div>
                <div style={{ fontSize:"0.78rem", color:GRAY }}>{p.filleul_telephone} · {fmtDate(p.date_parrainage)}</div>
                <div style={{ fontSize:"0.82rem", color:AMBER, marginTop:4 }}>Rabais accordé : {fmt$(p.rabais_accorde)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Réclamation */}
      {modalRecl && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div style={{ background:NAVY_MID, border:`1px solid rgba(59,130,246,0.2)`, borderRadius:14, width:"100%", maxWidth:480, padding:"1.5rem", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontWeight:700, color:WHITE, fontSize:"1rem", marginBottom:"1rem" }}>Nouvelle réclamation</div>
            {msg && !msg.ok && <div style={{ padding:"0.6rem 0.8rem", background:"rgba(239,68,68,0.1)", border:`1px solid ${RED}`, color:RED, borderRadius:8, marginBottom:"0.75rem", fontSize:"0.83rem" }}>{msg.text}</div>}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div>
                <label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Type de réclamation</label>
                <select style={{ ...inputSt, appearance:"none" }} value={reclForm.type} onChange={e=>setReclForm(f=>({...f,type:e.target.value}))}>
                  {Object.entries(TYPE_RECLAMATION).map(([k,l])=><option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
                <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Coût pièces ($)</label>
                  <input style={inputSt} type="number" value={reclForm.cout_pieces} onChange={e=>setReclForm(f=>({...f,cout_pieces:e.target.value}))} placeholder="0.00" /></div>
                <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Rabais appliqué ($)</label>
                  <input style={inputSt} type="number" value={reclForm.rabais_applique} onChange={e=>setReclForm(f=>({...f,rabais_applique:e.target.value}))} placeholder="0.00" /></div>
                <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Montant client ($)</label>
                  <input style={inputSt} type="number" value={reclForm.montant_client} onChange={e=>setReclForm(f=>({...f,montant_client:e.target.value}))} placeholder="0.00" /></div>
                <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Temps (min)</label>
                  <input style={inputSt} type="number" value={reclForm.temps_minutes} onChange={e=>setReclForm(f=>({...f,temps_minutes:e.target.value}))} placeholder="0" /></div>
              </div>
              <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Technicien</label>
                <input style={inputSt} value={reclForm.technicien} onChange={e=>setReclForm(f=>({...f,technicien:e.target.value}))} /></div>
              <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Notes</label>
                <textarea style={{ ...inputSt, resize:"vertical", minHeight:70 }} value={reclForm.notes} onChange={e=>setReclForm(f=>({...f,notes:e.target.value}))} /></div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"0.6rem", marginTop:"1.2rem" }}>
              <button onClick={()=>{setModalRecl(false);setMsg(null);}} style={{ padding:"0.55rem 1rem", background:"transparent", border:`1px solid ${GRAY_DIM}`, color:GRAY, borderRadius:8, cursor:"pointer" }}>Annuler</button>
              <button onClick={submitRecl} disabled={saving} style={{ padding:"0.55rem 1.2rem", background:BLUE, border:"none", color:WHITE, borderRadius:8, cursor:"pointer", fontWeight:600 }}>
                {saving ? "…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Parrainage */}
      {modalPar && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div style={{ background:NAVY_MID, border:`1px solid rgba(59,130,246,0.2)`, borderRadius:14, width:"100%", maxWidth:400, padding:"1.5rem" }}>
            <div style={{ fontWeight:700, color:WHITE, fontSize:"1rem", marginBottom:"1rem" }}>Enregistrer un parrainage</div>
            {msg && !msg.ok && <div style={{ padding:"0.6rem 0.8rem", background:"rgba(239,68,68,0.1)", border:`1px solid ${RED}`, color:RED, borderRadius:8, marginBottom:"0.75rem", fontSize:"0.83rem" }}>{msg.text}</div>}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Nom du client parrainé</label>
                <input style={inputSt} value={parForm.filleul_nom} onChange={e=>setParForm(f=>({...f,filleul_nom:e.target.value}))} /></div>
              <div><label style={{ fontSize:"0.75rem", color:GRAY, display:"block", marginBottom:4 }}>Téléphone (nouveau client)</label>
                <input style={inputSt} value={parForm.filleul_telephone} onChange={e=>setParForm(f=>({...f,filleul_telephone:e.target.value}))} placeholder="514-555-0123" /></div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"0.6rem", marginTop:"1.2rem" }}>
              <button onClick={()=>{setModalPar(false);setMsg(null);}} style={{ padding:"0.55rem 1rem", background:"transparent", border:`1px solid ${GRAY_DIM}`, color:GRAY, borderRadius:8, cursor:"pointer" }}>Annuler</button>
              <button onClick={submitPar} disabled={saving || !parForm.filleul_nom || !parForm.filleul_telephone} style={{ padding:"0.55rem 1.2rem", background:BLUE, border:"none", color:WHITE, borderRadius:8, cursor:"pointer", fontWeight:600 }}>
                {saving ? "…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Vue liste ─────────────────────────────────────────────────────────────────
function VueListe({ onSelect, onNew }: { onSelect: (id: number) => void; onNew: () => void }) {
  const [membres, setMembres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("");
  const [formule, setFormule] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await cellCareApi.getMembres({ q, statut, formule }); setMembres(r.membres || []); } catch {}
    setLoading(false);
  }, [q, statut, formule]);

  useEffect(() => { load(); }, [load]);

  const selSt: React.CSSProperties = {
    padding:"0.5rem 0.7rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(59,130,246,0.18)",
    borderRadius:7, color:WHITE, fontSize:"0.83rem", outline:"none", appearance:"none", cursor:"pointer",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <CCTopbar title="Cell Care" subtitle="Membres" />
      <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center", flexShrink:0 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Nom, téléphone, IMEI, n° membre…"
          style={{ flex:"1 1 220px", padding:"0.55rem 0.8rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(59,130,246,0.18)", borderRadius:8, color:WHITE, fontSize:"0.85rem", outline:"none" }} />
        <select value={statut} onChange={e=>setStatut(e.target.value)} style={selSt}>
          <option value="">Tous statuts</option>
          {Object.entries(STATUTS).map(([k,s])=><option key={k} value={k}>{s.label}</option>)}
        </select>
        <select value={formule} onChange={e=>setFormule(e.target.value)} style={selSt}>
          <option value="">Toutes formules</option>
          <option value="essentiel">Essentiel</option>
          <option value="plus">Plus</option>
        </select>
        <button onClick={onNew} style={{ padding:"0.55rem 1.1rem", background:BLUE, border:"none", color:WHITE, borderRadius:8, cursor:"pointer", fontSize:"0.85rem", fontWeight:600, whiteSpace:"nowrap" }}>+ Inscrire</button>
        <a href={cellCareApi.exportMembres()} target="_blank" rel="noreferrer" style={{ padding:"0.55rem 0.9rem", background:"transparent", border:`1px solid ${GRAY_DIM}`, color:GRAY, borderRadius:8, fontSize:"0.8rem", textDecoration:"none", whiteSpace:"nowrap" }}>⬇ CSV</a>
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>
        {loading ? (
          <div style={{ padding:"2rem", textAlign:"center", color:GRAY }}>Chargement…</div>
        ) : membres.length === 0 ? (
          <div style={{ padding:"3rem", textAlign:"center", color:GRAY_DIM }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.5rem" }}>🛡️</div>
            <div>Aucun membre Cell Care</div>
            <button onClick={onNew} style={{ marginTop:"1rem", padding:"0.6rem 1.2rem", background:BLUE, border:"none", color:WHITE, borderRadius:8, cursor:"pointer" }}>Inscrire le premier membre</button>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:NAVY_MID }}>
                {["N° Membre","Nom","Téléphone","Appareil","Plan","Statut","Vitres","Expiration"].map(h => (
                  <th key={h} style={{ padding:"0.65rem 1rem", textAlign:"left", fontSize:"0.72rem", color:GRAY_DIM, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600, borderBottom:"1px solid rgba(255,255,255,0.05)", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membres.map((m: any) => (
                <tr key={m.id} onClick={() => onSelect(m.id)} style={{ cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.1s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(59,130,246,0.05)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <td style={{ padding:"0.7rem 1rem", fontSize:"0.8rem", color:BLUE, fontWeight:600, fontFamily:"monospace" }}>{m.numero}</td>
                  <td style={{ padding:"0.7rem 1rem", color:WHITE, fontSize:"0.88rem", fontWeight:500 }}>{m.prenom} {m.nom}</td>
                  <td style={{ padding:"0.7rem 1rem", color:GRAY, fontSize:"0.82rem" }}>{m.telephone}</td>
                  <td style={{ padding:"0.7rem 1rem", color:GRAY, fontSize:"0.82rem" }}>{m.marque && m.modele ? `${m.marque} ${m.modele}` : "—"}</td>
                  <td style={{ padding:"0.7rem 1rem", fontSize:"0.8rem", color: m.formule==="plus"?AMBER:BLUE, fontWeight:500 }}>{m.formule ? m.formule.charAt(0).toUpperCase()+m.formule.slice(1) : "—"}</td>
                  <td style={{ padding:"0.7rem 1rem" }}>{m.statut ? <BadgeStatut statut={m.statut} /> : <span style={{ color:GRAY, fontSize:"0.78rem" }}>—</span>}</td>
                  <td style={{ padding:"0.7rem 1rem", color: m.vitres_restantes>0?GREEN:RED, fontWeight:600, fontSize:"0.88rem" }}>{m.vitres_restantes ?? "—"}</td>
                  <td style={{ padding:"0.7rem 1rem", color:GRAY, fontSize:"0.8rem", whiteSpace:"nowrap" }}>{fmtDate(m.date_fin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Tableau de bord ───────────────────────────────────────────────────────────
function VueDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cellCareApi.stats().then(setStats).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:GRAY }}>Chargement…</div>;
  if (!stats) return null;

  const totalRevenus = (stats.plans_vendus || []).reduce((s: number, p: any) => s + (p.revenus||0), 0);
  const totalPlans   = (stats.plans_vendus || []).reduce((s: number, p: any) => s + (p.total||0), 0);
  const coutReclam   = stats.reclamations?.cout_total || 0;
  const profit       = totalRevenus - coutReclam;

  const kpis = [
    { label:"Membres", val:stats.total_membres||0, color:BLUE },
    { label:"Plans vendus", val:totalPlans, color:BLUE },
    { label:"Revenus totaux", val:fmt$(totalRevenus), color:GREEN },
    { label:"Coût réclamations", val:fmt$(coutReclam), color:RED },
    { label:"Profit programme", val:fmt$(profit), color: profit>=0?GREEN:RED },
    { label:"Réclamations", val:stats.reclamations?.total||0, color:AMBER },
    { label:"Parrainages", val:stats.parrainages?.total||0, color:AMBER },
    { label:"Expirent ≤ 30j", val:stats.expire_bientot||0, color: (stats.expire_bientot||0)>0?AMBER:GRAY },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <CCTopbar title="Tableau de bord" subtitle="Cell Care" />
      <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"0.75rem", marginBottom:"1.5rem" }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background:NAVY_CARD, borderRadius:10, padding:"1rem", border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize:"0.68rem", color:GRAY_DIM, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{k.label}</div>
              <div style={{ fontSize:"1.4rem", fontWeight:800, color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Plans vendus par formule */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", maxWidth:640, marginBottom:"1.5rem" }}>
          {(stats.plans_vendus || []).map((p: any) => (
            <div key={p.formule} style={{ background:NAVY_CARD, borderRadius:10, padding:"1rem", border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight:700, color: p.formule==="plus"?AMBER:BLUE, fontSize:"1rem", marginBottom:"0.4rem" }}>{p.formule?.charAt(0).toUpperCase()+p.formule?.slice(1)}</div>
              <div style={{ fontSize:"1.5rem", fontWeight:800, color:WHITE }}>{p.total}</div>
              <div style={{ fontSize:"0.8rem", color:GREEN, marginTop:2 }}>{fmt$(p.revenus || 0)}</div>
            </div>
          ))}
        </div>

        {/* Statuts */}
        <div style={{ background:NAVY_CARD, borderRadius:10, padding:"1rem", marginBottom:"1.5rem", maxWidth:540 }}>
          <div style={{ fontWeight:600, color:WHITE, marginBottom:"0.75rem" }}>Statuts des plans</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
            {(stats.statuts || []).map((s: any) => {
              const st = STATUTS[s.statut] || { label: s.statut, color: GRAY };
              return (
                <div key={s.statut} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.35rem 0.5rem", borderRadius:6, background:"rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize:"0.85rem", color:st.color }}>{st.label}</span>
                  <span style={{ fontWeight:600, color:WHITE, fontSize:"0.9rem" }}>{s.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Réclamations par type */}
        {(stats.reclamations_par_type || []).length > 0 && (
          <div style={{ background:NAVY_CARD, borderRadius:10, padding:"1rem", maxWidth:540 }}>
            <div style={{ fontWeight:600, color:WHITE, marginBottom:"0.75rem" }}>Réclamations par type</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              {(stats.reclamations_par_type || []).map((t: any) => (
                <div key={t.type} style={{ display:"flex", justifyContent:"space-between", padding:"0.35rem 0.5rem", borderRadius:6, background:"rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize:"0.85rem", color:WHITE }}>{TYPE_RECLAMATION[t.type] || t.type}</span>
                  <span style={{ fontWeight:600, color:AMBER }}>{t.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Paramètres ────────────────────────────────────────────────────────────────
function VueParametres({ params, onSaved }: { params: any; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [tab, setTab] = useState<"plans"|"offres"|"textes">("plans");
  const [plans, setPlans] = useState<any>(params?.plans_config || {});
  const [offres, setOffres] = useState<any>(params?.offres_config || {});
  const [condText, setCondText] = useState(params?.conditions_text || "");
  const [avisText, setAvisText] = useState(params?.avis_garantie_text || "");
  const [version, setVersion] = useState(params?.conditions_version || "1.0");

  const setPlan = (formule: string, key: string, val: any) =>
    setPlans((p: any) => ({ ...p, [formule]: { ...p[formule], [key]: val } }));
  const setOffre = (key: string, field: string, val: any) =>
    setOffres((o: any) => ({ ...o, [key]: { ...o[key], [field]: val } }));

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      await cellCareApi.saveParametres({ plans_config: plans, offres_config: offres, conditions_text: condText, avis_garantie_text: avisText, conditions_version: version });
      setMsg({ text: "Paramètres sauvegardés.", ok: true });
      onSaved();
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    setSaving(false);
  };

  const inputSt: React.CSSProperties = {
    padding:"0.5rem 0.7rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(59,130,246,0.2)",
    borderRadius:7, color:WHITE, fontSize:"0.85rem", fontFamily:"'DM Sans',sans-serif", outline:"none",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <CCTopbar title="Paramètres Cell Care" />
      <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, padding:"0 1.5rem" }}>
        {(["plans","offres","textes"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"0.7rem 1.1rem", background:"none", border:"none", color: tab===t?BLUE:GRAY, borderBottom:`2px solid ${tab===t?BLUE:"transparent"}`, cursor:"pointer", fontSize:"0.85rem", fontWeight:tab===t?600:400 }}>
            {t==="plans"?"Plans":t==="offres"?"Offres de lancement":"Textes légaux"}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
        {msg && <div style={{ marginBottom:"1rem", padding:"0.65rem 1rem", borderRadius:8, background: msg.ok?GREEN_DIM:"rgba(239,68,68,0.1)", border:`1px solid ${msg.ok?GREEN:RED}`, color: msg.ok?GREEN:RED, fontSize:"0.85rem" }}>{msg.text}</div>}

        {/* Tab Plans */}
        {tab === "plans" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", maxWidth:720 }}>
            {Object.entries(plans).map(([key, plan]: [string, any]) => (
              <div key={key} style={{ background:NAVY_CARD, borderRadius:12, padding:"1.2rem", border:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontWeight:700, color: key==="plus"?AMBER:BLUE, fontSize:"1rem", marginBottom:"1rem" }}>{plan.nom || key}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.7rem" }}>
                  {[
                    { key:"prix", label:"Prix ($)", type:"number" },
                    { key:"duree_mois", label:"Durée (mois)", type:"number" },
                    { key:"vitres_max", label:"Vitres max", type:"number" },
                    { key:"rabais_ecran", label:"Rabais écran (%)", type:"number" },
                    { key:"rabais_batterie", label:"Rabais batterie (%)", type:"number" },
                    { key:"parrainage_max", label:"Parrainages max", type:"number" },
                    { key:"parrainage_rabais", label:"Rabais parrainage (%)", type:"number" },
                    { key:"parrainage_plafond", label:"Plafond parrainage ($, vide=aucun)", type:"number" },
                  ].map(({ key: k, label, type }) => (
                    <div key={k}>
                      <label style={{ fontSize:"0.72rem", color:GRAY, display:"block", marginBottom:3 }}>{label}</label>
                      <input type={type} style={{ ...inputSt, width:"100%", boxSizing:"border-box" }}
                        value={plan[k] ?? ""} onChange={e => setPlan(key, k, type==="number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)} />
                    </div>
                  ))}
                  <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.83rem", color:WHITE }}>
                    <input type="checkbox" checked={!!plan.vitre_protection} onChange={e=>setPlan(key,"vitre_protection",e.target.checked)} />
                    Vitre de protection offerte
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Offres */}
        {tab === "offres" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", maxWidth:500 }}>
            {Object.entries(offres).map(([key, offre]: [string, any]) => (
              <div key={key} style={{ background:NAVY_CARD, borderRadius:12, padding:"1.2rem", border:`1px solid ${offre.actif ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.05)"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                  <div style={{ fontWeight:600, color:WHITE, fontSize:"0.9rem" }}>{offre.label || key}</div>
                  <label style={{ display:"flex", alignItems:"center", gap:"0.4rem", cursor:"pointer", fontSize:"0.8rem", color: offre.actif?GREEN:GRAY }}>
                    <input type="checkbox" checked={!!offre.actif} onChange={e=>setOffre(key,"actif",e.target.checked)} />
                    {offre.actif ? "Activée" : "Désactivée"}
                  </label>
                </div>
                <div style={{ display:"flex", gap:"0.6rem" }}>
                  <div>
                    <label style={{ fontSize:"0.7rem", color:GRAY, display:"block", marginBottom:3 }}>Montant ($)</label>
                    <input type="number" style={{ ...inputSt, width:90 }} value={offre.montant ?? ""} onChange={e=>setOffre(key,"montant",Number(e.target.value))} />
                  </div>
                  {offre.limite !== undefined && (
                    <div>
                      <label style={{ fontSize:"0.7rem", color:GRAY, display:"block", marginBottom:3 }}>Limite (membres)</label>
                      <input type="number" style={{ ...inputSt, width:90 }} value={offre.limite ?? ""} onChange={e=>setOffre(key,"limite",Number(e.target.value))} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Textes */}
        {tab === "textes" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", maxWidth:640 }}>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <label style={{ fontSize:"0.82rem", color:GRAY }}>Version des conditions</label>
                <input style={{ ...inputSt, width:100, textAlign:"center" }} value={version} onChange={e=>setVersion(e.target.value)} placeholder="1.0" />
              </div>
            </div>
            <div>
              <label style={{ fontSize:"0.82rem", color:GRAY, display:"block", marginBottom:6 }}>Avis sur la garantie légale (affiché à l'étape 4)</label>
              <textarea style={{ ...inputSt, width:"100%", boxSizing:"border-box", minHeight:160, resize:"vertical" }} value={avisText} onChange={e=>setAvisText(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:"0.82rem", color:GRAY, display:"block", marginBottom:6 }}>Conditions d'utilisation complètes (affiché à l'étape 5)</label>
              <textarea style={{ ...inputSt, width:"100%", boxSizing:"border-box", minHeight:240, resize:"vertical" }} value={condText} onChange={e=>setCondText(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"flex-end", flexShrink:0 }}>
        <button onClick={save} disabled={saving} style={{ padding:"0.6rem 1.5rem", background:GREEN, border:"none", color:NAVY, borderRadius:8, cursor:saving?"wait":"pointer", fontWeight:700, fontSize:"0.9rem" }}>
          {saving ? "Enregistrement…" : "💾 Sauvegarder"}
        </button>
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function CellCare() {
  const [view, setView] = useState<View>("liste");
  const [selectedMembreId, setSelectedMembreId] = useState<number | null>(null);
  const [params, setParams] = useState<any>(null);
  const [paramsLoading, setParamsLoading] = useState(true);
  const [lastInscritId, setLastInscritId] = useState<number | null>(null);

  const loadParams = useCallback(() => {
    cellCareApi.getParametres().then(setParams).catch(()=>{}).finally(()=>setParamsLoading(false));
  }, []);

  useEffect(() => { loadParams(); }, [loadParams]);

  const navItems: { id: View; label: string; icon: string }[] = [
    { id:"liste",      label:"Membres",    icon:"👥" },
    { id:"inscrire",   label:"Inscrire",   icon:"✏️" },
    { id:"dashboard",  label:"Tableau",    icon:"📊" },
    { id:"parametres", label:"Paramètres", icon:"⚙️" },
  ];

  if (paramsLoading) return (
    <div style={{ display:"flex", height:"100%", alignItems:"center", justifyContent:"center", color:GRAY }}>
      Chargement Cell Care…
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:NAVY }}>
      {/* Nav secondaire */}
      {view !== "inscrire" && (
        <div style={{ display:"flex", gap:"0.2rem", padding:"0.6rem 1rem", borderBottom:"1px solid rgba(59,130,246,0.1)", background:NAVY_MID, flexShrink:0 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id); if (item.id !== "fiche") setSelectedMembreId(null); }} style={{
              padding:"0.45rem 0.9rem", border:"none", borderRadius:7, cursor:"pointer", fontSize:"0.82rem", fontWeight: view===item.id?600:400,
              background: view===item.id ? BLUE_DIM : "transparent",
              color: view===item.id ? BLUE : GRAY,
              display:"flex", alignItems:"center", gap:"0.4rem", transition:"all 0.15s",
              borderBottom: view===item.id ? `2px solid ${BLUE}` : "2px solid transparent",
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Contenu */}
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {view === "liste" && (
          <VueListe
            onSelect={(id) => { setSelectedMembreId(id); setView("fiche" as View); }}
            onNew={() => setView("inscrire")}
          />
        )}
        {view === "inscrire" && (
          <WizardInscription
            params={params}
            onCancel={() => setView("liste")}
            onDone={() => {
              cellCareApi.getMembres({}).then(r => {
                const first = r.membres?.[0];
                if (first) { setSelectedMembreId(first.id); setView("fiche" as View); }
                else setView("liste");
              }).catch(() => setView("liste"));
            }}
          />
        )}
        {(view as string) === "fiche" && selectedMembreId !== null && (
          <FicheMembre
            membreId={selectedMembreId}
            params={params}
            onBack={() => setView("liste")}
            onRefresh={() => {}}
          />
        )}
        {view === "dashboard" && <VueDashboard />}
        {view === "parametres" && <VueParametres params={params} onSaved={loadParams} />}
      </div>
    </div>
  );
}
