import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";

const BASE = (import.meta.env.VITE_API_URL as string) || "";

// ── Couleurs ──────────────────────────────────────────────────────────────────
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

const STATUTS: Record<string, { label: string; color: string; bg: string }> = {
  en_carence:      { label: "En carence",      color: AMBER, bg: "rgba(245,158,11,0.12)" },
  actif:           { label: "Actif",            color: GREEN, bg: GREEN_DIM },
  vitres_epuisees: { label: "Vitres épuisées",  color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  expire:          { label: "Expiré",           color: GRAY,  bg: "rgba(136,153,170,0.12)" },
  annule:          { label: "Annulé",           color: RED,   bg: "rgba(239,68,68,0.12)" },
};

const TYPES_RECLAMATION: Record<string, string> = {
  vitre_avant:   "Vitre avant",
  vitre_arriere: "Vitre arrière",
  ecran_complet: "Écran complet",
  batterie:      "Batterie",
};

function fmt$(n: number) {
  return (n ?? 0).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d.includes("T") ? d : d + "T12:00:00").toLocaleDateString("fr-CA", { year:"numeric", month:"long", day:"numeric" });
}

// Session storage key
const SESSION_KEY = "cc_portal_token";
const SESSION_PRENOM_KEY = "cc_portal_prenom";
const SESSION_NUMERO_KEY = "cc_portal_numero";

// ── API portail ───────────────────────────────────────────────────────────────
async function apiLogin(numero_membre: string, last4: string) {
  const r = await fetch(`${BASE}/api/cellcare-portal/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero_membre: numero_membre.toUpperCase(), last4 }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.erreur || "Erreur de connexion.");
  return data;
}

async function apiInfo(token: string) {
  const r = await fetch(`${BASE}/api/cellcare-portal/info`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.erreur || "Erreur.");
  return data;
}

async function apiUpgradeRequest(token: string) {
  const r = await fetch(`${BASE}/api/cellcare-portal/upgrade-request`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.erreur || "Erreur.");
  return data;
}

// ── Composants utilitaires ────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: NAVY_CARD, borderRadius: 12, border: "1px solid rgba(59,130,246,0.12)", padding: "1.2rem", ...style }}>
      {children}
    </div>
  );
}

function Stat({ label, val, color = WHITE }: { label: string; val: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.68rem", color: GRAY_DIM, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: "1rem", fontWeight: 700, color }}>{val}</span>
    </div>
  );
}

// ── Écran de connexion ────────────────────────────────────────────────────────
function LoginScreen({ prefillNumero, onLogin }: { prefillNumero: string; onLogin: (token: string, prenom: string, numero: string) => void }) {
  const [numero, setNumero] = useState(prefillNumero);
  const [last4, setLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!numero.trim() || !last4.trim()) { setError("Tous les champs sont obligatoires."); return; }
    if (last4.replace(/\D/g, "").length !== 4) { setError("Entrez exactement 4 chiffres."); return; }
    setLoading(true);
    try {
      const data = await apiLogin(numero.trim(), last4.trim());
      try { sessionStorage.setItem(SESSION_KEY, data.token); sessionStorage.setItem(SESSION_PRENOM_KEY, data.prenom); sessionStorage.setItem(SESSION_NUMERO_KEY, data.numero); } catch {}
      onLogin(data.token, data.prenom, data.numero);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.8rem 1rem",
    background: "rgba(255,255,255,0.04)", border: `1px solid rgba(59,130,246,0.2)`,
    borderRadius: 8, color: WHITE, fontSize: "1rem", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: NAVY, padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🛡️</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: WHITE }}>Cell Care</div>
          <div style={{ fontSize: "0.82rem", color: BLUE, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Portail membre — Rep Cellordi</div>
        </div>

        <Card style={{ padding: "2rem" }}>
          <form onSubmit={submit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: GRAY, display: "block", marginBottom: 6 }}>Numéro de membre</label>
                <input
                  style={{ ...inp, textTransform: "uppercase", letterSpacing: "0.05em" }}
                  value={numero} onChange={e => setNumero(e.target.value)}
                  placeholder="CC-2026-0001" autoComplete="username" autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: GRAY, display: "block", marginBottom: 6 }}>
                  4 derniers chiffres de votre téléphone
                </label>
                <input
                  style={{ ...inp, letterSpacing: "0.2em", textAlign: "center", fontSize: "1.4rem" }}
                  value={last4} onChange={e => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••" type="tel" inputMode="numeric" maxLength={4}
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: `1px solid ${RED}`, color: RED, padding: "0.65rem 0.9rem", borderRadius: 8, fontSize: "0.85rem" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                padding: "0.85rem", background: loading ? GRAY_DIM : BLUE, border: "none",
                color: WHITE, borderRadius: 8, fontSize: "1rem", fontWeight: 700, cursor: loading ? "wait" : "pointer",
                transition: "background 0.2s",
              }}>
                {loading ? "Connexion…" : "Accéder à mon plan"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: "1.5rem", padding: "0.8rem", background: BLUE_DIM, borderRadius: 8, fontSize: "0.78rem", color: GRAY }}>
            <strong style={{ color: WHITE }}>Où trouver ces informations ?</strong><br />
            Votre numéro de membre est inscrit sur la carte remise lors de votre inscription. Il commence par <span style={{ color: BLUE }}>CC-</span>.
          </div>
        </Card>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: GRAY_DIM }}>
          Session de 15 minutes · Connexion sécurisée
        </p>
        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <Link to="/" style={{ color: BLUE, fontSize: "0.82rem", textDecoration: "none" }}>← Retour au site</Link>
        </div>
      </div>
    </div>
  );
}

// ── Écran principal portail ───────────────────────────────────────────────────
function PortailInfo({ token, prenom, onLogout }: { token: string; prenom: string; onLogout: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"plan" | "reclamations" | "parrainage">("plan");
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);
  const [upgradingRequest, setUpgradingRequest] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await apiInfo(token)); } catch (e: any) {
      if (e.message.includes("expir") || e.message.includes("invalide")) { onLogout(); return; }
      setError(e.message);
    }
    setLoading(false);
  }, [token, onLogout]);

  useEffect(() => { load(); }, [load]);

  const copyCode = () => {
    const code = data?.membre?.code_parrainage;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  };

  const shareCode = () => {
    const code = data?.membre?.code_parrainage;
    const msg = `J'ai un plan de protection Cell Care chez Rep Cellordi ! Utilise mon code ${code} pour obtenir un rabais sur ta réparation ou ton inscription. 🛡️`;
    if (navigator.share) {
      navigator.share({ title: "Mon code Cell Care", text: msg }).catch(() => {});
    } else {
      navigator.clipboard.writeText(msg).catch(() => {});
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const requestUpgrade = async () => {
    setUpgradingRequest(true);
    try { const r = await apiUpgradeRequest(token); setUpgradeMsg(r.message); } catch (e: any) { setUpgradeMsg(e.message); }
    setUpgradingRequest(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: NAVY }}>
      <div style={{ color: GRAY }}>Chargement de votre plan…</div>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: NAVY, gap: "1rem", padding: "2rem" }}>
      <div style={{ color: RED, fontSize: "0.9rem" }}>{error}</div>
      <button onClick={load} style={{ padding: "0.6rem 1.2rem", background: BLUE, border: "none", color: WHITE, borderRadius: 8, cursor: "pointer" }}>Réessayer</button>
    </div>
  );

  const { membre, souscription, plan_config, reclamations, parrainages, conditions_text, conditions_version } = data || {};
  const statut = souscription ? (STATUTS[souscription.statut] || { label: souscription.statut, color: GRAY, bg: "transparent" }) : null;

  const tabSt = (t: string): React.CSSProperties => ({
    padding: "0.6rem 1rem", background: "none", border: "none",
    color: tab === t ? BLUE : GRAY, cursor: "pointer", fontSize: "0.85rem", fontWeight: tab === t ? 700 : 400,
    borderBottom: `2px solid ${tab === t ? BLUE : "transparent"}`, transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: NAVY, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: NAVY_MID, borderBottom: "1px solid rgba(59,130,246,0.12)", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🛡️</span>
            <span style={{ fontWeight: 700, color: WHITE }}>Mon Cell Care</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: BLUE, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {prenom} · {membre?.numero}
          </div>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: `1px solid ${GRAY_DIM}`, color: GRAY, padding: "0.4rem 0.9rem", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem" }}>
          Déconnexion
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "1.25rem 1rem 3rem" }}>

        {/* Statut principal */}
        {souscription && statut ? (
          <div style={{ background: statut.bg, border: `2px solid ${statut.color}22`, borderRadius: 14, padding: "1.5rem", marginBottom: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: statut.color, lineHeight: 1, marginBottom: "0.25rem" }}>
              {statut.label.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.9rem", color: WHITE, opacity: 0.8 }}>
              Plan <strong style={{ color: BLUE }}>{plan_config?.nom || souscription.formule}</strong>
              {souscription.jours_restants != null && (
                <> · <span style={{ color: souscription.jours_restants <= 30 ? AMBER : WHITE }}>{souscription.jours_restants} jour{souscription.jours_restants !== 1 ? "s" : ""} restant{souscription.jours_restants !== 1 ? "s" : ""}</span></>
              )}
            </div>
            {souscription.statut === "en_carence" && (
              <div style={{ marginTop: "0.6rem", fontSize: "0.82rem", color: AMBER }}>
                ⏳ Protection active à partir du {fmtDate(souscription.date_carence_fin)}
              </div>
            )}
            {souscription.credit_sans_reclamation && (
              <div style={{ marginTop: "0.75rem", background: GREEN_DIM, border: `1px solid ${GREEN}`, borderRadius: 8, padding: "0.6rem", fontSize: "0.82rem", color: GREEN }}>
                🎉 Aucune réclamation — vous avez droit à un crédit de 20 $. Contactez-nous pour le réclamer.
              </div>
            )}
          </div>
        ) : (
          <Card style={{ marginBottom: "1.25rem", textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "0.9rem", color: GRAY }}>Aucun plan actif. Présentez-vous en boutique pour vous inscrire.</div>
          </Card>
        )}

        {/* Onglets */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "1rem", gap: "0.1rem" }}>
          <button onClick={() => setTab("plan")} style={tabSt("plan")}>Mon plan</button>
          <button onClick={() => setTab("reclamations")} style={tabSt("reclamations")}>Réclamations{reclamations?.length > 0 ? ` (${reclamations.length})` : ""}</button>
          <button onClick={() => setTab("parrainage")} style={tabSt("parrainage")}>Parrainage</button>
        </div>

        {/* ─ Tab Plan ─ */}
        {tab === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {souscription && (
              <>
                {/* Dates clés */}
                <Card>
                  <div style={{ fontWeight: 600, color: WHITE, marginBottom: "0.85rem", fontSize: "0.9rem" }}>Dates clés</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <Stat label="Date d'achat" val={fmtDate(souscription.created_at)} />
                    <Stat label="Date de fin" val={fmtDate(souscription.date_fin)} color={souscription.jours_restants != null && souscription.jours_restants <= 30 ? AMBER : WHITE} />
                    <Stat label="Fin de carence" val={fmtDate(souscription.date_carence_fin)} />
                    <Stat label="Annulation avant" val={fmtDate(souscription.date_annulation_limite)} />
                  </div>
                </Card>

                {/* Vitres */}
                <Card>
                  <div style={{ fontWeight: 600, color: WHITE, marginBottom: "0.85rem", fontSize: "0.9rem" }}>Protection vitres</div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    {Array.from({ length: plan_config?.vitres_max || 0 }).map((_, i) => (
                      <div key={i} style={{
                        width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                        background: i < (plan_config?.vitres_max || 0) - souscription.vitres_restantes ? "rgba(239,68,68,0.15)" : GREEN_DIM,
                        border: `1px solid ${i < (plan_config?.vitres_max || 0) - souscription.vitres_restantes ? RED : GREEN}`,
                      }}>
                        {i < (plan_config?.vitres_max || 0) - souscription.vitres_restantes ? "✗" : "📱"}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: GRAY }}>
                    <span style={{ color: souscription.vitres_restantes > 0 ? GREEN : RED, fontWeight: 700 }}>{souscription.vitres_restantes}</span> remplacement(s) restant(s) sur {plan_config?.vitres_max}
                  </div>
                </Card>

                {/* Rabais */}
                <Card>
                  <div style={{ fontWeight: 600, color: WHITE, marginBottom: "0.85rem", fontSize: "0.9rem" }}>Vos rabais inclus</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {[
                      { label: "Remplacement écran complet", val: `-${plan_config?.rabais_ecran ?? 0} %` },
                      { label: "Remplacement batterie", val: `-${plan_config?.rabais_batterie ?? 0} %` },
                      plan_config?.vitre_protection && { label: "Vitre de protection", val: "Offerte" },
                    ].filter(Boolean).map((r: any) => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span style={{ color: GRAY }}>{r.label}</span>
                        <span style={{ color: BLUE, fontWeight: 600 }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Appareil */}
                <Card>
                  <div style={{ fontWeight: 600, color: WHITE, marginBottom: "0.6rem", fontSize: "0.9rem" }}>Appareil protégé</div>
                  <div style={{ fontSize: "0.88rem", color: WHITE, fontWeight: 600 }}>{souscription.marque} {souscription.modele}</div>
                  {souscription.couleur && <div style={{ fontSize: "0.8rem", color: GRAY, marginTop: 2 }}>{souscription.couleur}</div>}
                  <div style={{ fontSize: "0.78rem", color: AMBER, fontFamily: "monospace", marginTop: 4 }}>IMEI : {souscription.imei}</div>
                </Card>

                {/* Mise à niveau */}
                {souscription.formule === "essentiel" && ["actif", "en_carence"].includes(souscription.statut) && (
                  <Card style={{ border: `1px solid rgba(59,130,246,0.3)` }}>
                    <div style={{ fontWeight: 600, color: BLUE, marginBottom: "0.5rem", fontSize: "0.9rem" }}>⬆ Mise à niveau disponible</div>
                    <div style={{ fontSize: "0.82rem", color: GRAY, marginBottom: "0.85rem" }}>
                      Passez au plan <strong style={{ color: WHITE }}>Plus</strong> pour {fmt$(30)} et profitez de 4 vitres, −30 % sur l'écran et −40 % sur la batterie.
                    </div>
                    {upgradeMsg ? (
                      <div style={{ padding: "0.65rem", background: upgradeMsg.includes("enregistrée") ? GREEN_DIM : "rgba(239,68,68,0.1)", border: `1px solid ${upgradeMsg.includes("enregistrée") ? GREEN : RED}`, borderRadius: 8, fontSize: "0.83rem", color: upgradeMsg.includes("enregistrée") ? GREEN : RED }}>
                        {upgradeMsg}
                      </div>
                    ) : (
                      <button onClick={requestUpgrade} disabled={upgradingRequest} style={{ padding: "0.6rem 1.2rem", background: BLUE_DIM, border: `1px solid ${BLUE}`, color: BLUE, borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
                        {upgradingRequest ? "…" : "🏪 Demander la mise à niveau en boutique"}
                      </button>
                    )}
                  </Card>
                )}

                {/* Télécharger contrat */}
                <a
                  href={`${BASE}/api/cellcare-portal/contrat`}
                  onClick={e => { e.preventDefault(); fetch(`${BASE}/api/cellcare-portal/contrat`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.blob()).then(blob => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `contrat-cellcare-${membre?.numero}.pdf`; a.click(); URL.revokeObjectURL(url); }); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: GRAY, textDecoration: "none", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  📄 Télécharger mon contrat signé (PDF)
                </a>

                {/* Conditions */}
                <div>
                  <button onClick={() => setShowConditions(!showConditions)} style={{ background: "none", border: "none", color: BLUE, fontSize: "0.8rem", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {showConditions ? "▼" : "▶"} Conditions d'utilisation (version {conditions_version})
                  </button>
                  {showConditions && (
                    <div style={{ marginTop: "0.75rem", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "1rem", fontSize: "0.8rem", color: GRAY, whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 320, overflowY: "auto" }}>
                      {conditions_text}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Prendre rendez-vous */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1rem", textAlign: "center" }}>
              <a href="/#rendezvous" style={{ display: "inline-block", padding: "0.7rem 1.5rem", background: GREEN_DIM, border: `1px solid ${GREEN}`, color: GREEN, borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: "0.88rem" }}>
                📅 Prendre un rendez-vous en boutique
              </a>
            </div>
          </div>
        )}

        {/* ─ Tab Réclamations ─ */}
        {tab === "reclamations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {souscription?.statut === "en_carence" && (
              <div style={{ padding: "0.8rem 1rem", background: "rgba(245,158,11,0.08)", border: `1px solid ${AMBER}`, borderRadius: 8, color: AMBER, fontSize: "0.83rem" }}>
                ⚠ En période de carence jusqu'au {fmtDate(souscription.date_carence_fin)} — réclamations non acceptées
              </div>
            )}
            {!reclamations?.length ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: GRAY_DIM }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
                <div>Aucune réclamation enregistrée</div>
                {data?.souscription && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: GRAY }}>
                    Votre plan est intact — crédit «&nbsp;sans bris&nbsp;» possible à l'échéance
                  </div>
                )}
              </div>
            ) : reclamations.map((r: any) => (
              <Card key={r.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: WHITE, fontSize: "0.9rem" }}>{TYPES_RECLAMATION[r.type] || r.type}</div>
                    <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>{fmtDate(r.date)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.82rem", color: BLUE }}>Rabais obtenu : {fmt$(r.rabais_obtenu)}</div>
                    <div style={{ fontSize: "0.82rem", color: GRAY }}>Vous avez payé : {fmt$(r.montant_paye)}</div>
                  </div>
                </div>
                {r.notes && <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: GRAY_DIM }}>{r.notes}</div>}
              </Card>
            ))}
          </div>
        )}

        {/* ─ Tab Parrainage ─ */}
        {tab === "parrainage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Code de parrainage */}
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginBottom: "0.5rem" }}>Votre code de parrainage</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: BLUE, letterSpacing: "0.2em", marginBottom: "0.75rem" }}>
                {membre?.code_parrainage}
              </div>
              {plan_config && (
                <div style={{ fontSize: "0.82rem", color: GRAY, marginBottom: "1rem" }}>
                  Donnez ce code à un ami — il reçoit <strong style={{ color: AMBER }}>−{plan_config.parrainage_rabais} %</strong>
                  {plan_config.parrainage_plafond ? ` (max ${fmt$(plan_config.parrainage_plafond)})` : ""} sur sa réparation ou son inscription.
                </div>
              )}
              <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={copyCode} style={{ padding: "0.55rem 1.1rem", background: BLUE_DIM, border: `1px solid ${BLUE}`, color: BLUE, borderRadius: 8, cursor: "pointer", fontSize: "0.83rem" }}>
                  {copied ? "✓ Copié !" : "📋 Copier"}
                </button>
                <button onClick={shareCode} style={{ padding: "0.55rem 1.1rem", background: GREEN_DIM, border: `1px solid ${GREEN}`, color: GREEN, borderRadius: 8, cursor: "pointer", fontSize: "0.83rem" }}>
                  🔗 Partager
                </button>
              </div>
            </Card>

            {/* Résumé */}
            {souscription && plan_config && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: GRAY }}>Parrainages utilisés</span>
                  <span style={{ color: WHITE, fontWeight: 700 }}>{parrainages?.length || 0} / {plan_config.parrainage_max}</span>
                </div>
              </Card>
            )}

            {/* Liste */}
            {parrainages?.length > 0 && parrainages.map((p: any) => (
              <Card key={p.id}>
                <div style={{ fontWeight: 600, color: WHITE, fontSize: "0.88rem" }}>{p.filleul_nom}</div>
                <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>{fmtDate(p.date_parrainage)}</div>
                <div style={{ fontSize: "0.82rem", color: AMBER, marginTop: 4 }}>Rabais accordé : {fmt$(p.rabais_accorde)}</div>
              </Card>
            ))}

            {!parrainages?.length && (
              <div style={{ textAlign: "center", padding: "2rem", color: GRAY_DIM, fontSize: "0.85rem" }}>
                Aucun parrainage enregistré pour l'instant
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function PortailCellCare() {
  const [token, setToken] = useState<string | null>(null);
  const [prenom, setPrenom] = useState("");

  // URL param ?m=CC-2026-0001
  const prefillNumero = (() => {
    try { return new URLSearchParams(window.location.search).get("m") || ""; } catch { return ""; }
  })();

  // Restaurer session depuis sessionStorage
  useEffect(() => {
    try {
      const t = sessionStorage.getItem(SESSION_KEY);
      const p = sessionStorage.getItem(SESSION_PRENOM_KEY) || "";
      if (t) { setToken(t); setPrenom(p); }
    } catch {}
  }, []);

  const handleLogin = (t: string, p: string) => { setToken(t); setPrenom(p); };
  const handleLogout = () => {
    setToken(null); setPrenom("");
    try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_PRENOM_KEY); sessionStorage.removeItem(SESSION_NUMERO_KEY); } catch {}
  };

  if (!token) return <LoginScreen prefillNumero={prefillNumero} onLogin={handleLogin} />;
  return <PortailInfo token={token} prenom={prenom} onLogout={handleLogout} />;
}
