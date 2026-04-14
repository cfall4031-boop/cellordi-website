import React, { useState, useEffect, useCallback } from "react";
import {
  authApi, rdvApi, ticketsApi, clientsApi,
  messagesApi, dechargesApi, prixApi, notificationsApi, setToken, removeToken, getToken
} from "../../api";

// ── MOBILE CONTEXT ───────────────────────────────────────────
const MobileCtx = React.createContext<{ isMobile: boolean; openSidebar: () => void }>({ isMobile: false, openSidebar: () => {} });

// ── TOKENS ────────────────────────────────────────────────────
const NAVY       = "#0b1c35";
const NAVY_MID   = "#0e2040";
const GREEN      = "#6dd400";
const GREEN_DIM  = "rgba(109,212,0,0.12)";
const GRAY       = "#a8b8d0";
const GRAY_DIM   = "#4a6080";
const RED        = "#ff4d4d";
const ORANGE     = "#f59e0b";
const BLUE       = "#38bdf8";

// ── STATUTS ───────────────────────────────────────────────────
const statutColors: Record<string, { bg: string; color: string; label: string }> = {
  confirme:   { bg:"rgba(109,212,0,0.15)",  color:GREEN,  label:"Confirmé"   },
  en_attente: { bg:"rgba(245,158,11,0.15)", color:ORANGE, label:"En attente" },
  annule:     { bg:"rgba(255,77,77,0.15)",  color:RED,    label:"Annulé"     },
  complete:   { bg:"rgba(56,189,248,0.15)", color:BLUE,   label:"Complété"   },
  recu:       { bg:"rgba(109,212,0,0.1)",   color:GREEN,  label:"Reçu"       },
  diagnostic: { bg:"rgba(56,189,248,0.15)", color:BLUE,   label:"Diagnostic" },
  en_cours:   { bg:"rgba(245,158,11,0.15)", color:ORANGE, label:"En cours"   },
  termine:    { bg:"rgba(109,212,0,0.15)",  color:GREEN,  label:"Terminé"    },
  pret:       { bg:"rgba(109,212,0,0.25)",  color:GREEN,  label:"✓ Prêt"     },
  livre:      { bg:"rgba(56,189,248,0.1)",  color:BLUE,   label:"Livré"      },
  en_suspend: { bg:"rgba(168,85,247,0.15)", color:"#c084fc", label:"⏸ En suspend" },
  traitee:    { bg:"rgba(109,212,0,0.15)",  color:GREEN,  label:"Traitée"    },
};

function Badge({ statut }: { statut: string }) {
  const s = statutColors[statut] || { bg:"rgba(255,255,255,0.1)", color:GRAY, label:statut };
  return (
    <span style={{ background:s.bg, color:s.color, fontSize:"0.72rem", fontWeight:700,
      letterSpacing:"0.06em", padding:"0.25rem 0.7rem", whiteSpace:"nowrap" as const }}>
      {s.label}
    </span>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=DM+Sans:wght@300;400;500&display=swap');
  .admin-wrap *, .admin-wrap *::before, .admin-wrap *::after { box-sizing: border-box; }
  .admin-wrap { font-family: 'DM Sans', sans-serif; background: ${NAVY}; color: #fff; }
  .admin-wrap ::-webkit-scrollbar { width: 5px; }
  .admin-wrap ::-webkit-scrollbar-track { background: ${NAVY}; }
  .admin-wrap ::-webkit-scrollbar-thumb { background: ${GREEN}; }
  .admin-wrap table { border-collapse: collapse; width: 100%; }
  @keyframes adminFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .admin-fade { animation: adminFadeIn 0.35s ease both; }
  .admin-wrap input::placeholder { color: ${GRAY_DIM}; }
  .admin-wrap input:focus, .admin-wrap textarea:focus { outline: none; border-color: ${GREEN} !important; }

  /* ── MOBILE RESPONSIVE ──────────────────────────────────── */
  @media (max-width: 768px) {
    .admin-wrap table { font-size: 0.8rem; }
    .admin-wrap th, .admin-wrap td { padding: 0.5rem 0.6rem !important; font-size: 0.78rem !important; }
    .admin-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .admin-login-box { width: 92vw !important; max-width: 400px !important; }
    .admin-login-inner { padding: 1.5rem !important; }
    .admin-content-pad { padding: 0.75rem 0.4rem !important; padding-bottom: 5rem !important; }
    .admin-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
    .admin-grid-2 { grid-template-columns: 1fr !important; }
    .admin-grid-3 { grid-template-columns: 1fr !important; }
    .admin-cal-grid { grid-template-columns: 1fr !important; }
    .admin-modal { width: 96vw !important; max-width: 500px !important; padding: 1rem !important; margin: 0 auto !important; }
    .admin-modal-grid { grid-template-columns: 1fr !important; }
    .admin-detail-panel { width: 100% !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 90 !important; border-left: none !important; overflow-y: auto !important; }
    .admin-detail-inner { padding: 1rem !important; }
    .admin-topbar-title { font-size: 1.1rem !important; }
    .admin-flex-col-mobile { flex-direction: column !important; }
    .admin-wrap select { font-size: 16px !important; min-height: 44px !important; padding: 0.5rem 0.8rem !important; }
    .admin-wrap input, .admin-wrap textarea { font-size: 16px !important; }
    .admin-wrap button { min-height: 44px; border-radius: 10px !important; }
    .admin-wrap select { border-radius: 10px !important; }
    .admin-wrap input, .admin-wrap textarea { border-radius: 10px !important; }
    .admin-mobile-hide-table { display: none !important; }
    .admin-mobile-cards { display: flex !important; }
    .admin-desktop-only { display: none !important; }
    .admin-msg-list { width: 100% !important; border-right: none !important; }
    .admin-msg-detail { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 90 !important; background: ${NAVY} !important; }
    .admin-mobile-hide-table { border-radius: 14px !important; }
  }
  @media (min-width: 769px) {
    .admin-mobile-cards { display: none !important; }
    .admin-mobile-only { display: none !important; }
  }
`;

const thStyle: React.CSSProperties = {
  padding:"0.7rem 1rem", fontSize:"0.72rem", fontWeight:700,
  letterSpacing:"0.1em", color:GRAY, textTransform:"uppercase",
  borderBottom:"1px solid rgba(109,212,0,0.12)", textAlign:"left", whiteSpace:"nowrap"
};
const tdStyle: React.CSSProperties = {
  padding:"0.85rem 1rem", fontSize:"0.87rem",
  borderBottom:"1px solid rgba(255,255,255,0.04)", verticalAlign:"middle"
};

const inpStyle: React.CSSProperties = {
  width:"100%", background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
  fontFamily:"'DM Sans',sans-serif", fontSize:"0.95rem",
  padding:"0.85rem 1rem", outline:"none", transition:"border-color 0.2s"
};

// ── LOGIN ─────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (token: string, nom: string) => void }) {
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pw) return;
    setLoading(true); setError("");
    try {
      const data = await authApi.login(email, pw);
      setToken(data.token);
      onLogin(data.token, data.admin.nom);
    } catch (err: any) {
      setError(err.message || "Identifiants invalides.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`radial-gradient(ellipse 80% 80% at 50% 0%, rgba(109,212,0,0.06) 0%, transparent 60%), ${NAVY}` }}>
      <div className="admin-login-box" style={{ width:400, animation:"adminFadeIn 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.8rem", fontWeight:900, marginBottom:"0.3rem" }}>
            RÉPARATION <span style={{color:GREEN}}>CeLL&amp;Ordi</span>
          </div>
          <div style={{ fontSize:"0.82rem", color:GRAY, letterSpacing:"0.1em", textTransform:"uppercase" }}>
            Panneau d'administration
          </div>
        </div>
        <div className="admin-login-inner" style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.15)", padding:"2.5rem" }}>
          <div style={{ marginBottom:"1.2rem" }}>
            <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, letterSpacing:"0.1em", color:GRAY, textTransform:"uppercase", marginBottom:"0.4rem" }}>Courriel</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
              placeholder="admin@reparationcellordi.ca" style={inpStyle}
              onKeyDown={e=>e.key==="Enter"&&handle()}/>
          </div>
          <div style={{ marginBottom:"1.5rem" }}>
            <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, letterSpacing:"0.1em", color:GRAY, textTransform:"uppercase", marginBottom:"0.4rem" }}>Mot de passe</label>
            <input value={pw} onChange={e=>setPw(e.target.value)} type="password"
              placeholder="••••••••••••" style={inpStyle}
              onKeyDown={e=>e.key==="Enter"&&handle()}/>
          </div>
          {error && <div style={{ background:"rgba(255,77,77,0.1)", border:"1px solid rgba(255,77,77,0.3)", color:RED, fontSize:"0.84rem", padding:"0.6rem 0.9rem", marginBottom:"1rem" }}>{error}</div>}
          <button onClick={handle} disabled={loading} style={{
            width:"100%", background:loading?"rgba(109,212,0,0.5)":GREEN, color:NAVY,
            fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:"1.1rem",
            letterSpacing:"0.1em", padding:"0.95rem", border:"none", cursor:loading?"not-allowed":"pointer",
            clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)", transition:"all 0.2s"
          }}>
            {loading ? "CONNEXION..." : "SE CONNECTER →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"overview",  icon:"📊", label:"Vue d'ensemble" },
  { id:"rdvs",      icon:"📅", label:"Rendez-vous"    },
  { id:"tickets",   icon:"🎫", label:"Tickets"         },
  { id:"clients",   icon:"👥", label:"Clients"         },
  { id:"messages",  icon:"✉️", label:"Messages"        },
  { id:"decharges", icon:"📋", label:"Décharges"       },
  { id:"calculateur", icon:"🧮", label:"Calculateur"   },
];

// ── Helpers pour push notifications ──────────────────────────
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const pushSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

function Sidebar({ active, setActive, adminNom, onLogout, isMobile, sidebarOpen, setSidebarOpen }: {
  active: string; setActive: (s: string) => void;
  adminNom: string; onLogout: () => void;
  isMobile: boolean; sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void;
}) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMsg, setPushMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!pushSupported) return;
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub))
    ).catch(() => {});
  }, []);

  const togglePush = async () => {
    if (!pushSupported) return;
    setPushLoading(true);
    setPushMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        await notificationsApi.unsubscribe(existing.endpoint).catch(() => {});
        setPushEnabled(false);
        setPushMsg({ text: "Notifications désactivées", ok: true });
      } else {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setPushMsg({ text: "Permission refusée par le navigateur. Vérifie les réglages.", ok: false });
          setPushLoading(false);
          return;
        }
        const { publicKey } = await notificationsApi.getVapidKey();
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await notificationsApi.subscribe(sub.toJSON() as any);
        setPushEnabled(true);
        setPushMsg({ text: "Notifications activées !", ok: true });
      }
    } catch (e: any) {
      console.error("Push toggle error:", e);
      setPushMsg({ text: `Erreur: ${e.message || e}`, ok: false });
    }
    setPushLoading(false);
  };

  const testPush = async () => {
    setPushMsg(null);
    try {
      const res = await notificationsApi.test() as any;
      let txt = res.message;
      if (res.details) {
        const errs = res.details.filter((d: any) => d.status !== "ok");
        if (errs.length > 0) txt += "\n" + errs.map((d: any) => d.status).join("; ");
      }
      setPushMsg({ text: txt, ok: res.sent > 0 });
    } catch (e: any) {
      setPushMsg({ text: `Test échoué: ${e.message || e}`, ok: false });
    }
  };

  const resetPush = async () => {
    setPushLoading(true);
    setPushMsg(null);
    try {
      // 1. Désabonner le navigateur actuel
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      // 2. Purger tous les anciens abonnements du serveur
      await notificationsApi.purge();

      // 3. Re-souscrire avec la clé VAPID actuelle
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushMsg({ text: "Permission refusée. Va dans Réglages > Safari > cellordi.ca > Notifications.", ok: false });
        setPushEnabled(false);
        setPushLoading(false);
        return;
      }
      const { publicKey } = await notificationsApi.getVapidKey();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await notificationsApi.subscribe(sub.toJSON() as any);
      setPushEnabled(true);
      setPushMsg({ text: "Anciens abonnements purgés + nouveau créé ! Clique Tester.", ok: true });
    } catch (e: any) {
      console.error("Reset push error:", e);
      setPushMsg({ text: `Erreur reset: ${e.message || e}`, ok: false });
    }
    setPushLoading(false);
  };

  const handleNavClick = (id: string) => {
    setActive(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:99
        }}/>
      )}
      <aside style={{
        width:240, flexShrink:0, background:NAVY_MID,
        borderRight:"1px solid rgba(109,212,0,0.1)",
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, bottom:0, zIndex:100,
        transform: isMobile && !sidebarOpen ? "translateX(-240px)" : "translateX(0)",
        transition: "transform 0.25s ease"
      }}>
        <div style={{ padding:"1.5rem 1.2rem", borderBottom:"1px solid rgba(109,212,0,0.1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:"1.1rem" }}>
              RÉPARATION <span style={{color:GREEN}}>CeLL&amp;Ordi</span>
            </div>
            <div style={{ fontSize:"0.7rem", color:GRAY_DIM, letterSpacing:"0.08em", marginTop:"0.2rem" }}>ADMIN PANEL</div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{
              background:"none", border:"none", color:GRAY, fontSize:"1.4rem", cursor:"pointer", padding:"0.2rem"
            }}>✕</button>
          )}
        </div>

        <nav style={{ flex:1, padding:"1rem 0", overflowY:"auto" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={()=>handleNavClick(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:"0.75rem",
              padding:"0.75rem 1.2rem",
              background:active===item.id?"rgba(109,212,0,0.1)":"transparent",
              borderTop:"none", borderRight:"none", borderBottom:"none",
              borderLeft:`3px solid ${active===item.id?GREEN:"transparent"}`,
              color:active===item.id?"#fff":GRAY, cursor:"pointer",
              fontSize:"0.88rem", fontWeight:active===item.id?600:400,
              textAlign:"left", transition:"all 0.15s"
            }}>
              <span style={{fontSize:"1rem"}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding:"1rem 1.2rem", borderTop:"1px solid rgba(109,212,0,0.1)" }}>
          {/* Push notification toggle + test */}
          {pushSupported && (
            <>
              <button onClick={togglePush} disabled={pushLoading} style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
                background: pushEnabled ? GREEN_DIM : "transparent",
                border:`1px solid ${pushEnabled ? GREEN : GRAY_DIM}`,
                color: pushEnabled ? GREEN : GRAY,
                fontSize:"0.78rem", padding:"0.5rem", cursor: pushLoading ? "wait" : "pointer",
                marginBottom:"0.4rem", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s"
              }}>
                {pushLoading ? "..." : pushEnabled ? "🔔 Notifications ON" : "🔕 Notifications OFF"}
              </button>
              {pushEnabled && (
                <div style={{ display:"flex", gap:"0.3rem", marginBottom:"0.4rem" }}>
                  <button onClick={testPush} style={{
                    flex:1, background:"transparent",
                    border:`1px solid ${GRAY_DIM}`, color:GRAY,
                    fontSize:"0.72rem", padding:"0.35rem", cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif"
                  }}>
                    🧪 Tester
                  </button>
                  <button onClick={resetPush} disabled={pushLoading} style={{
                    flex:1, background:"transparent",
                    border:`1px solid ${GRAY_DIM}`, color:GRAY,
                    fontSize:"0.72rem", padding:"0.35rem", cursor: pushLoading ? "wait" : "pointer",
                    fontFamily:"'DM Sans',sans-serif"
                  }}>
                    🔄 Reset
                  </button>
                </div>
              )}
              {pushMsg && (
                <div style={{
                  fontSize:"0.7rem", padding:"0.3rem 0.5rem", marginBottom:"0.4rem",
                  background: pushMsg.ok ? "rgba(109,212,0,0.1)" : "rgba(255,77,77,0.1)",
                  border: `1px solid ${pushMsg.ok ? GREEN : RED}`,
                  color: pushMsg.ok ? GREEN : RED,
                  wordBreak:"break-word"
                }}>
                  {pushMsg.text}
                </div>
              )}
            </>
          )}
          <div style={{ fontSize:"0.78rem", color:GRAY, marginBottom:"0.6rem" }}>
            Connecté : <strong style={{color:"#fff"}}>{adminNom}</strong>
          </div>
          <a href="/" style={{
            display:"block", textAlign:"center", textDecoration:"none",
            background:"transparent", border:"1px solid rgba(109,212,0,0.3)",
            color:GREEN, fontSize:"0.78rem", padding:"0.4rem", marginBottom:"0.4rem", cursor:"pointer"
          }}>← Site public</a>
          <button onClick={onLogout} style={{
            width:"100%", background:"transparent", border:"1px solid rgba(255,77,77,0.3)",
            color:RED, fontSize:"0.82rem", padding:"0.5rem", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s"
          }}>
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}

// ── TOPBAR ────────────────────────────────────────────────────
function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { isMobile, openSidebar } = React.useContext(MobileCtx);
  const now = new Date().toLocaleDateString("fr-CA", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  return (
    <div style={{ padding: isMobile ? "0.85rem 0.6rem" : "1.5rem 2rem", borderBottom:"1px solid rgba(109,212,0,0.1)",
      display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
        {isMobile && (
          <button onClick={openSidebar} style={{
            background:"none", border:"none", color:"#fff", fontSize:"1.5rem", cursor:"pointer", padding:"0.2rem"
          }}>☰</button>
        )}
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile ? "1.2rem" : "1.6rem", fontWeight:900, margin:0 }}>{title}</h1>
          {subtitle && <p style={{ fontSize:"0.82rem", color:GRAY, marginTop:"0.1rem", margin:0 }}>{subtitle}</p>}
        </div>
      </div>
      {!isMobile && <div style={{ fontSize:"0.82rem", color:GRAY_DIM }}>{now}</div>}
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────
function Overview() {
  const [stats, setStats] = useState({ rdvs:0, tickets:0, clients:0, messages_non_lus:0 });
  const [rdvsAujourdhui, setRdvsAujourdhui] = useState<any[]>([]);
  const [ticketsRecents, setTicketsRecents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      rdvApi.getAll({ date: today }),
      ticketsApi.getAll(),
      clientsApi.getAll(),
      messagesApi.getAll(),
    ]).then(([rdvData, tickData, cliData, msgData]) => {
      setRdvsAujourdhui((rdvData as any).rendezvous || []);
      const allTickets = (tickData as any).tickets || [];
      setTicketsRecents(allTickets.slice(0, 5));
      setStats({
        rdvs: (rdvData as any).total || 0,
        tickets: allTickets.filter((t:any) => t.statut !== "livre" && t.statut !== "termine").length,
        clients: (cliData as any).total || 0,
        messages_non_lus: (msgData as any).non_lus || 0,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label:"RDV aujourd'hui",   value:rdvsAujourdhui.length, icon:"📅", color:BLUE },
    { label:"Tickets actifs",    value:stats.tickets,          icon:"🎫", color:ORANGE },
    { label:"Clients",           value:stats.clients,          icon:"👥", color:GREEN },
    { label:"Messages non lus",  value:stats.messages_non_lus, icon:"✉️", color:RED },
  ];

  if (loading) return (
    <div className="admin-fade">
      <Topbar title="Vue d'ensemble"/>
      <div style={{ padding:"3rem", textAlign:"center", color:GRAY }}>Chargement...</div>
    </div>
  );

  return (
    <div className="admin-fade">
      <Topbar title="Vue d'ensemble" subtitle="Tableau de bord — Réparation CeLL&Ordi"/>
      <div className="admin-content-pad" style={{ padding:"2rem" }}>
        <div className="admin-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
          {statCards.map((s,i) => (
            <div key={i} style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)",
              borderTop:`3px solid ${s.color}`, padding:"1.4rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.8rem" }}>
                <span style={{fontSize:"1.6rem"}}>{s.icon}</span>
              </div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"2.5rem", fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:"0.8rem", color:GRAY, marginTop:"0.3rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="admin-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
          <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", padding:"1.5rem" }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.1rem", fontWeight:700, marginBottom:"1rem" }}>
              RDV Aujourd'hui ({rdvsAujourdhui.length})
            </div>
            {rdvsAujourdhui.length === 0 && <div style={{color:GRAY_DIM, fontSize:"0.85rem"}}>Aucun RDV aujourd'hui</div>}
            {rdvsAujourdhui.map((r:any) => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:"0.8rem",
                padding:"0.7rem 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ background:GREEN_DIM, color:GREEN, fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:700, fontSize:"0.85rem", padding:"0.3rem 0.6rem", minWidth:52, textAlign:"center" }}>
                  {r.heure || "--:--"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.9rem", fontWeight:500 }}>{r.prenom} {r.nom}</div>
                  <div style={{ fontSize:"0.75rem", color:GRAY }}>{r.type_appareil}</div>
                </div>
                <Badge statut={r.statut}/>
              </div>
            ))}
          </div>

          <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", padding:"1.5rem" }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.1rem", fontWeight:700, marginBottom:"1rem" }}>
              Tickets Récents
            </div>
            {ticketsRecents.map((t:any) => (
              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:"0.8rem",
                padding:"0.6rem 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:GREEN, fontWeight:700, fontSize:"0.78rem", minWidth:130 }}>
                  {t.numero}
                </div>
                <div style={{ flex:1, fontSize:"0.85rem" }}>{t.prenom} {t.nom}</div>
                <Badge statut={t.statut}/>
              </div>
            ))}
            {ticketsRecents.length === 0 && <div style={{color:GRAY_DIM, fontSize:"0.85rem"}}>Aucun ticket</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RENDEZ-VOUS ───────────────────────────────────────────────
// ── Helpers calendrier ──────────────────────────────────────────────────────
const JOURS_LABEL = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const MOIS_LABEL  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function Rendez_vous() {
  // ── État principal ──────────────────────────────────────────────────────────
  const [rdvs,    setRdvs]   = useState<any[]>([]);
  const [dispos,  setDispos] = useState<{jour:number;heure:string;actif:number}[]>([]);
  const [filter,  setFilter] = useState("actifs");
  const [loading, setLoading]= useState(true);

  // ── Calendrier ──────────────────────────────────────────────────────────────
  const today      = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-based
  const [selDate,  setSelDate]  = useState<string | null>(null);

  // ── Formulaire création RDV ─────────────────────────────────────────────────
  const [showForm,  setShowForm]  = useState(false);
  const [slots,     setSlots]     = useState<string[]>([]);
  const emptyForm = { prenom:"", nom:"", email:"", telephone:"", service:"Réparation cellulaire", appareil:"", description:"", date:"", heure:"" };
  const [newRdv,   setNewRdv]   = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createErr,setCreateErr]= useState<string|null>(null);
  const [createOk, setCreateOk] = useState<string|null>(null);

  // ── Tableau dispo ───────────────────────────────────────────────────────────
  const [showDispo, setShowDispo] = useState(false);
  const [resetting, setResetting] = useState(false);
  const HEURES = ["10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"];
  const JOURS_DISPO = [1,2,3,4,5,6]; // Lun–Sam

  // ── Chargement ──────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      rdvApi.getAll(),
      rdvApi.getDisponibilites(),
    ]).then(([rdvData, dispoData]) => {
      setRdvs((rdvData as any).rendezvous || []);
      setDispos((dispoData as any).disponibilites || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Slots quand date change ─────────────────────────────────────────────────
  useEffect(() => {
    if (!newRdv.date) { setSlots([]); return; }
    rdvApi.getSlots(newRdv.date).then((d:any) => setSlots(d.slots || [])).catch(() => setSlots([]));
  }, [newRdv.date]);

  // ── Filtrer RDVs ────────────────────────────────────────────────────────────
  const byDate = selDate ? rdvs.filter((r:any) => r.date_rdv === selDate) : rdvs;
  const filtered =
    filter === "actifs"   ? byDate.filter((r:any) => ["en_attente","confirme"].includes(r.statut)) :
    filter === "archives" ? byDate.filter((r:any) => ["complete","annule"].includes(r.statut)) :
    filter === "tous"     ? byDate :
    byDate.filter((r:any) => r.statut === filter);

  // ── Changer statut ──────────────────────────────────────────────────────────
  const changeStatut = async (id: number, statut: string) => {
    try {
      await rdvApi.updateStatut(id, statut);
      setRdvs(prev => prev.map((x:any) => x.id === id ? {...x, statut} : x));
    } catch (err) { console.error(err); }
  };

  // ── Supprimer RDV archivé ───────────────────────────────────────────────────
  const deleteRdv = async (id: number) => {
    if (!window.confirm("Supprimer définitivement ce rendez-vous ?")) return;
    try {
      await rdvApi.delete(id);
      setRdvs(prev => prev.filter((x:any) => x.id !== id));
    } catch (e: any) { console.error(e); }
  };

  // ── Toggle disponibilité ────────────────────────────────────────────────────
  const toggleSlot = async (jour: number, heure: string) => {
    try {
      const res = await rdvApi.toggleSlot(jour, heure) as any;
      setDispos(prev => {
        const idx = prev.findIndex(d => d.jour === jour && d.heure === heure);
        if (idx >= 0) return prev.map((d,i) => i===idx ? res.slot : d);
        return [...prev, res.slot];
      });
    } catch (err) { console.error(err); }
  };

  const isActif = (jour: number, heure: string) => {
    const s = dispos.find(d => d.jour === jour && d.heure === heure);
    return s ? s.actif === 1 : false;
  };

  // ── Créer RDV ───────────────────────────────────────────────────────────────
  const submitNewRdv = async () => {
    if (!newRdv.prenom || !newRdv.nom || !newRdv.date) {
      setCreateErr("Prénom, nom et date sont requis."); return;
    }
    setCreating(true); setCreateErr(null); setCreateOk(null);
    try {
      const res = await rdvApi.createAdmin({
        prenom: newRdv.prenom, nom: newRdv.nom,
        email: newRdv.email, telephone: newRdv.telephone,
        type_appareil: newRdv.service || newRdv.appareil || "Non spécifié",
        date_rdv: newRdv.date, heure: newRdv.heure || null,
        description: `${newRdv.appareil ? "Appareil: "+newRdv.appareil+" | " : ""}${newRdv.description}`,
      }) as any;
      setCreateOk(`✅ RDV créé${res.numero_ticket ? ` — Ticket ${res.numero_ticket}` : ""}. Email envoyé au client.`);
      setNewRdv(emptyForm);
      load();
    } catch(e:any) { setCreateErr(e.message || "Erreur lors de la création."); }
    finally { setCreating(false); }
  };

  // ── Données calendrier ──────────────────────────────────────────────────────
  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay  = new Date(calYear, calMonth + 1, 0);
  // Décalage : getDay() retourne 0=Sun, on veut 0=Lun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells  = startOffset + lastDay.getDate();
  const rows        = Math.ceil(totalCells / 7);

  const rdvsParJour = (day: number) => {
    const d = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return rdvs.filter((r:any) => r.date_rdv === d && ["en_attente","confirme"].includes(r.statut)).length;
  };

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y=>y-1); setCalMonth(11); } else setCalMonth(m=>m-1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y=>y+1); setCalMonth(0); } else setCalMonth(m=>m+1); };

  const SERVICES = ["Réparation cellulaire","Réparation tablette","Réparation ordinateur","Service informatique","Développement web","Solution cloud","Contrat d'entretien","Autre"];

  return (
    <div className="admin-fade">
      <Topbar title="Rendez-vous" subtitle={selDate ? `Vue du ${selDate}` : `${filtered.length} rendez-vous`}/>
      <div className="admin-content-pad" style={{ padding:"1.5rem 2rem" }}>

        {/* ── Bouton Nouveau RDV + Dispo ── */}
        <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.25rem", flexWrap:"wrap", alignItems:"center" }}>
          <button onClick={()=>{ setShowForm(f=>!f); setCreateErr(null); setCreateOk(null); }}
            style={{ background:showForm ? GREEN : "rgba(109,212,0,0.12)", color:showForm ? NAVY : GREEN,
              border:`1px solid ${GREEN}44`, padding:"0.55rem 1.2rem", fontSize:"0.84rem",
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, borderRadius:12, flex:"1 1 auto" }}>
            ＋ Nouveau rendez-vous
          </button>
          <button onClick={()=>setShowDispo(d=>!d)}
            style={{ background:showDispo ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", color:GRAY,
              border:"1px solid rgba(255,255,255,0.12)", padding:"0.55rem 1.2rem", fontSize:"0.84rem",
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif", borderRadius:12 }}>
            🗓 {showDispo ? "Masquer disponibilités" : "Gérer disponibilités"}
          </button>
          <button onClick={load} style={{ background:"transparent", color:GRAY, border:"1px solid rgba(255,255,255,0.1)",
            padding:"0.5rem 1rem", fontSize:"0.82rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginLeft:"auto", borderRadius:12 }}>
            ↻ Actualiser
          </button>
        </div>

        {/* ── Formulaire Nouveau RDV ── */}
        {showForm && (
          <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.2)", padding:"1.5rem", marginBottom:"1.5rem" }}>
            <p style={{ color:GREEN, fontWeight:700, fontSize:"0.85rem", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"1.5rem" }}>
              ＋ Créer un rendez-vous
            </p>

            {/* ── ÉTAPE 1 : Date + Créneau ── */}
            <div style={{ background:"rgba(109,212,0,0.04)", border:"1px solid rgba(109,212,0,0.15)", padding:"1.2rem", marginBottom:"1.2rem" }}>
              <p style={{ color:GREEN, fontSize:"0.75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"1rem", fontFamily:"'DM Sans',sans-serif" }}>
                📅 Étape 1 — Date &amp; Créneau
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", alignItems:"start" }} className="rdv-grid admin-grid-2">
                <div>
                  <label style={{ display:"block", color:GRAY, fontSize:"0.78rem", marginBottom:"0.4rem", fontFamily:"'DM Sans',sans-serif" }}>Date du rendez-vous *</label>
                  <input type="date" value={newRdv.date}
                    onChange={e => { setSlots([]); setNewRdv(p=>({...p,date:e.target.value,heure:""})); }}
                    min={formatDate(today)}
                    style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:`2px solid ${newRdv.date ? GREEN+"55" : "rgba(109,212,0,0.2)"}`,
                      color:"#fff", padding:"0.6rem 0.75rem", fontSize:"0.95rem", fontFamily:"'DM Sans',sans-serif",
                      boxSizing:"border-box" as const, outline:"none", colorScheme:"dark" }} />
                </div>
                <div>
                  <label style={{ display:"block", color:GRAY, fontSize:"0.78rem", marginBottom:"0.4rem", fontFamily:"'DM Sans',sans-serif" }}>
                    Créneau horaire *
                    {newRdv.date && slots.length > 0 && <span style={{ color:GREEN, marginLeft:"0.5rem" }}>({slots.length} disponibles)</span>}
                  </label>
                  {!newRdv.date && (
                    <p style={{ color:GRAY_DIM, fontSize:"0.82rem", fontFamily:"'DM Sans',sans-serif", marginTop:"0.25rem" }}>
                      ← Choisissez d'abord une date
                    </p>
                  )}
                  {newRdv.date && slots.length === 0 && (
                    <p style={{ color:ORANGE, fontSize:"0.82rem", fontFamily:"'DM Sans',sans-serif", marginTop:"0.25rem" }}>
                      ⚠ Aucun créneau disponible ce jour (fermé).
                    </p>
                  )}
                  {slots.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.45rem" }}>
                      {slots.map(h=>(
                        <button key={h} type="button" onClick={()=>setNewRdv(p=>({...p,heure:h}))}
                          style={{
                            background: newRdv.heure===h ? GREEN : "rgba(255,255,255,0.06)",
                            color: newRdv.heure===h ? NAVY : GRAY,
                            border: `2px solid ${newRdv.heure===h ? GREEN : "rgba(255,255,255,0.12)"}`,
                            padding:"0.45rem 0.9rem", fontSize:"0.9rem", cursor:"pointer",
                            fontFamily:"'DM Sans',sans-serif", fontWeight: newRdv.heure===h ? 700 : 400,
                            transition:"all 0.12s",
                          }}>
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {newRdv.date && newRdv.heure && (
                <div style={{ marginTop:"0.9rem", background:"rgba(109,212,0,0.1)", border:"1px solid rgba(109,212,0,0.3)", padding:"0.6rem 0.9rem", display:"inline-flex", gap:"0.5rem", alignItems:"center" }}>
                  <span style={{ fontSize:"1rem" }}>✅</span>
                  <span style={{ color:GREEN, fontWeight:700, fontSize:"0.88rem", fontFamily:"'DM Sans',sans-serif" }}>
                    RDV le {newRdv.date} à {newRdv.heure}
                  </span>
                </div>
              )}
            </div>

            {/* ── ÉTAPE 2 : Infos client ── */}
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", padding:"1.2rem" }}>
              <p style={{ color:GRAY, fontSize:"0.75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"1rem", fontFamily:"'DM Sans',sans-serif" }}>
                👤 Étape 2 — Informations client
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }} className="rdv-grid admin-grid-2">
                {([["Prénom *","prenom","text",""],["Nom *","nom","text",""],
                  ["Email","email","email",""],["Téléphone *","telephone","tel",""]]
                ).map(([label,name,type,ph])=>(
                  <div key={name as string}>
                    <label style={{ display:"block", color:GRAY, fontSize:"0.78rem", marginBottom:"0.25rem", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
                    <input value={(newRdv as any)[name as string]} onChange={e=>setNewRdv(p=>({...p,[name as string]:e.target.value}))}
                      type={type as string} placeholder={ph as string}
                      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(109,212,0,0.15)",
                        color:"#fff", padding:"0.5rem 0.75rem", fontSize:"0.85rem", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" as const, outline:"none" }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }} className="rdv-grid admin-grid-2">
                <div>
                  <label style={{ display:"block", color:GRAY, fontSize:"0.78rem", marginBottom:"0.25rem", fontFamily:"'DM Sans',sans-serif" }}>Service</label>
                  <select value={newRdv.service} onChange={e=>setNewRdv(p=>({...p,service:e.target.value}))}
                    style={{ width:"100%", background:NAVY, border:"1px solid rgba(109,212,0,0.15)", color:"#fff",
                      padding:"0.5rem 0.75rem", fontSize:"0.85rem", fontFamily:"'DM Sans',sans-serif", cursor:"pointer", outline:"none" }}>
                    {SERVICES.map(s=><option key={s} value={s} style={{background:NAVY}}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", color:GRAY, fontSize:"0.78rem", marginBottom:"0.25rem", fontFamily:"'DM Sans',sans-serif" }}>Appareil / Modèle</label>
                  <input value={newRdv.appareil} onChange={e=>setNewRdv(p=>({...p,appareil:e.target.value}))}
                    placeholder="iPhone 13, Dell XPS 15…"
                    style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(109,212,0,0.15)",
                      color:"#fff", padding:"0.5rem 0.75rem", fontSize:"0.85rem", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" as const, outline:"none" }} />
                </div>
              </div>
              <div>
                <label style={{ display:"block", color:GRAY, fontSize:"0.78rem", marginBottom:"0.25rem", fontFamily:"'DM Sans',sans-serif" }}>Description / Problème</label>
                <textarea value={newRdv.description} onChange={e=>setNewRdv(p=>({...p,description:e.target.value}))}
                  rows={3} placeholder="Décrire le problème…"
                  style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(109,212,0,0.15)",
                    color:"#fff", padding:"0.5rem 0.75rem", fontSize:"0.85rem", fontFamily:"'DM Sans',sans-serif", resize:"vertical" as const, boxSizing:"border-box" as const, outline:"none" }} />
              </div>
            </div>

            {createErr && <p style={{ color:RED, fontSize:"0.85rem", marginTop:"1rem", fontFamily:"'DM Sans',sans-serif" }}>⚠ {createErr}</p>}
            {createOk  && <p style={{ color:GREEN, fontSize:"0.85rem", marginTop:"1rem", fontFamily:"'DM Sans',sans-serif" }}>{createOk}</p>}
            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.25rem" }}>
              <button onClick={submitNewRdv} disabled={creating}
                style={{ background:creating?"rgba(109,212,0,0.4)":GREEN, color:NAVY, border:"none",
                  padding:"0.55rem 1.4rem", fontSize:"0.85rem", fontWeight:700, cursor:creating?"not-allowed":"pointer",
                  fontFamily:"'DM Sans',sans-serif" }}>
                {creating ? "Création…" : "✓ Créer le rendez-vous"}
              </button>
              <button onClick={()=>{ setShowForm(false); setCreateErr(null); setCreateOk(null); setNewRdv(emptyForm); setSlots([]); }}
                style={{ background:"transparent", color:GRAY, border:"1px solid rgba(255,255,255,0.1)",
                  padding:"0.55rem 1rem", fontSize:"0.85rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Tableau disponibilités ── */}
        {showDispo && (
          <div style={{ background:NAVY_MID, border:"1px solid rgba(255,255,255,0.1)", padding:"1.25rem", marginBottom:"1.5rem", overflowX:"auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", flexWrap:"wrap", gap:"0.5rem" }}>
              <p style={{ color:GRAY, fontWeight:700, fontSize:"0.82rem", textTransform:"uppercase", letterSpacing:"0.08em", margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                🗓 Tableau de disponibilités — cliquez pour activer / désactiver
              </p>
              <button
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  try {
                    const res = await rdvApi.resetDisponibilites() as any;
                    setDispos(res.disponibilites || []);
                  } catch(e) { console.error(e); }
                  finally { setResetting(false); }
                }}
                style={{ background:"rgba(109,212,0,0.12)", color:GREEN, border:`1px solid ${GREEN}44`,
                  padding:"0.35rem 0.9rem", fontSize:"0.78rem", cursor:resetting?"not-allowed":"pointer",
                  fontFamily:"'DM Sans',sans-serif", fontWeight:600, opacity:resetting?0.6:1 }}>
                {resetting ? "…" : "✅ Tout activer"}
              </button>
            </div>
            <table style={{ borderCollapse:"collapse", width:"100%", minWidth:"500px" }}>
              <thead>
                <tr>
                  <th style={{ padding:"0.4rem 0.6rem", textAlign:"left", color:GRAY, fontSize:"0.78rem", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>Créneau</th>
                  {JOURS_DISPO.map(j=>(
                    <th key={j} style={{ padding:"0.4rem 0.6rem", textAlign:"center", color:GRAY, fontSize:"0.78rem", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                      {JOURS_LABEL[j-1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEURES.map(h=>(
                  <tr key={h}>
                    <td style={{ padding:"0.35rem 0.6rem", color:GRAY, fontSize:"0.82rem", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{h}</td>
                    {JOURS_DISPO.map(j=>{
                      const actif = isActif(j,h);
                      return (
                        <td key={j} style={{ padding:"0.25rem 0.4rem", textAlign:"center" }}>
                          <button onClick={()=>toggleSlot(j,h)}
                            title={actif ? "Cliquer pour fermer" : "Cliquer pour ouvrir"}
                            style={{
                              width:"36px", height:"28px", cursor:"pointer",
                              background: actif ? "rgba(109,212,0,0.15)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${actif ? "rgba(109,212,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                              color: actif ? GREEN : GRAY_DIM,
                              fontSize:"0.82rem", transition:"all 0.15s",
                            }}>
                            {actif ? "✓" : "✗"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color:GRAY_DIM, fontSize:"0.75rem", marginTop:"0.75rem", fontFamily:"'DM Sans',sans-serif" }}>
              ✓ = créneau ouvert (visible dans le formulaire de création) · ✗ = créneau fermé
            </p>
          </div>
        )}

        {/* ── Calendrier + liste ── */}
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:"1.5rem", alignItems:"start" }} className="cal-grid admin-cal-grid">

          {/* Calendrier */}
          <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", padding:"1rem", flexShrink:0, borderRadius:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
              <button onClick={prevMonth} style={{ background:"transparent", border:"none", color:GRAY, cursor:"pointer", fontSize:"1rem", padding:"0.2rem 0.5rem" }}>◀</button>
              <span style={{ color:"#fff", fontWeight:700, fontSize:"0.88rem", fontFamily:"'DM Sans',sans-serif" }}>
                {MOIS_LABEL[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} style={{ background:"transparent", border:"none", color:GRAY, cursor:"pointer", fontSize:"1rem", padding:"0.2rem 0.5rem" }}>▶</button>
            </div>
            {/* En-têtes jours */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", marginBottom:"4px" }}>
              {JOURS_LABEL.map(j=>(
                <div key={j} style={{ textAlign:"center", fontSize:"0.68rem", color:GRAY_DIM, fontFamily:"'DM Sans',sans-serif", fontWeight:600, padding:"0.15rem 0" }}>{j}</div>
              ))}
            </div>
            {/* Jours */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
              {Array.from({length: rows * 7}).map((_,i) => {
                const dayNum = i - startOffset + 1;
                if (dayNum < 1 || dayNum > lastDay.getDate()) return <div key={i} />;
                const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
                const count   = rdvsParJour(dayNum);
                const isSel   = selDate === dateStr;
                const isToday = dateStr === formatDate(today);
                return (
                  <button key={i} onClick={()=>setSelDate(isSel ? null : dateStr)}
                    style={{
                      background: isSel ? "rgba(109,212,0,0.2)" : "transparent",
                      border: isSel ? `1px solid ${GREEN}` : isToday ? "1px solid rgba(109,212,0,0.35)" : "1px solid transparent",
                      color: isSel ? GREEN : isToday ? GREEN : "#fff",
                      padding:"0.4rem 0", textAlign:"center", cursor:"pointer",
                      fontSize:"0.85rem", fontFamily:"'DM Sans',sans-serif", minHeight:44, borderRadius:6,
                      position:"relative" as const, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:"2px",
                    }}>
                    {dayNum}
                    {count > 0 && (
                      <span style={{
                        display:"block", width:"6px", height:"6px", borderRadius:"50%",
                        background: count >= 3 ? ORANGE : GREEN,
                        flexShrink:0,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
            {selDate && (
              <button onClick={()=>setSelDate(null)} style={{ width:"100%", marginTop:"0.75rem", background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:GRAY, padding:"0.35rem", fontSize:"0.78rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                ✕ Voir tous les RDVs
              </button>
            )}
            {/* Légende */}
            <div style={{ marginTop:"0.75rem", display:"flex", flexDirection:"column", gap:"0.3rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:GREEN, display:"inline-block" }} />
                <span style={{ fontSize:"0.72rem", color:GRAY_DIM, fontFamily:"'DM Sans',sans-serif" }}>1–2 RDVs</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:ORANGE, display:"inline-block" }} />
                <span style={{ fontSize:"0.72rem", color:GRAY_DIM, fontFamily:"'DM Sans',sans-serif" }}>3+ RDVs</span>
              </div>
            </div>
          </div>

          {/* Liste des RDVs */}
          <div>
            <div style={{ display:"flex", gap:"0.4rem", marginBottom:"1rem", flexWrap:"wrap" }}>
              {["actifs","en_attente","confirme","archives","tous"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{
                  background:filter===f ? (f==="archives"?"rgba(255,255,255,0.12)":GREEN) : "rgba(255,255,255,0.05)",
                  color:filter===f ? (f==="archives"?"#fff":NAVY) : (f==="archives"?GRAY:"#fff"),
                  border:`1px solid ${f==="archives"?"rgba(255,255,255,0.15)":"rgba(109,212,0,0.2)"}`,
                  padding:"0.45rem 0.95rem", fontSize:"0.8rem", cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", borderRadius:10
                }}>
                  {f==="actifs" ? "✓ Actifs" : f==="archives" ? "🗃 Archives" : f==="tous" ? "Tous" : statutColors[f]?.label||f}
                </button>
              ))}
            </div>
            {loading ? <div style={{color:GRAY,textAlign:"center",padding:"2rem"}}>Chargement...</div> : (
            <>
            {/* Desktop table */}
            <div className="admin-mobile-hide-table" style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", overflowX:"auto" }}>
              <table>
                <thead>
                  <tr style={{ background:"rgba(109,212,0,0.04)" }}>
                    {["Client","Téléphone","Appareil","Date","Heure","Statut","Action"].map(h=>(
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r:any)=>(
                    <tr key={r.id}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.02)")}
                      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <td style={{...tdStyle, fontWeight:500}}>{r.prenom} {r.nom}</td>
                      <td style={{...tdStyle, color:GRAY}}>{r.telephone || "—"}</td>
                      <td style={tdStyle}>{r.type_appareil}</td>
                      <td style={{...tdStyle, color:GRAY}}>{r.date_rdv}</td>
                      <td style={tdStyle}>
                        <span style={{background:GREEN_DIM,color:GREEN,padding:"0.2rem 0.5rem",fontWeight:600,fontSize:"0.82rem"}}>
                          {r.heure || "—"}
                        </span>
                      </td>
                      <td style={tdStyle}><Badge statut={r.statut}/></td>
                      <td style={tdStyle}>
                        <div style={{display:"flex", gap:"0.4rem", alignItems:"center"}}>
                          <select value={r.statut} onChange={e=>changeStatut(r.id,e.target.value)}
                            style={{ background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                              fontSize:"0.78rem", padding:"0.3rem 0.5rem", cursor:"pointer", outline:"none" }}>
                            <option value="en_attente">En attente</option>
                            <option value="confirme">Confirmer</option>
                            <option value="complete">Compléter</option>
                            <option value="annule">Annuler</option>
                          </select>
                          {(r.statut === "complete" || r.statut === "annule") && (
                            <button onClick={()=>deleteRdv(r.id)} title="Supprimer définitivement"
                              style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)",
                                color:"#f87171", cursor:"pointer", fontSize:"0.85rem", padding:"0.25rem 0.5rem", lineHeight:1 }}>
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign:"center", padding:"3rem", color:GRAY }}>
                  {selDate ? `Aucun rendez-vous le ${selDate}.` : "Aucun rendez-vous pour ce filtre."}
                </div>
              )}
            </div>
            {/* Mobile cards */}
            <div className="admin-mobile-cards" style={{ display:"none", flexDirection:"column", gap:"0.6rem" }}>
              {filtered.map((r:any)=>(
                <div key={r.id} style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", borderRadius:14, padding:"1rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
                    <span style={{ fontWeight:600, fontSize:"0.95rem" }}>{r.prenom} {r.nom}</span>
                    {r.telephone && <a href={`tel:${r.telephone}`} style={{ color:GREEN, fontSize:"1.1rem", textDecoration:"none" }}>📞</a>}
                  </div>
                  <div style={{ fontSize:"0.82rem", color:GRAY, marginBottom:"0.4rem" }}>{r.type_appareil}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.6rem" }}>
                    <span style={{ fontSize:"0.82rem", color:GRAY }}>{r.date_rdv}</span>
                    <span style={{background:GREEN_DIM,color:GREEN,padding:"0.15rem 0.5rem",fontWeight:600,fontSize:"0.82rem",borderRadius:4}}>
                      {r.heure || "—"}
                    </span>
                    <Badge statut={r.statut}/>
                  </div>
                  <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
                    <select value={r.statut} onChange={e=>changeStatut(r.id,e.target.value)}
                      style={{ flex:1, background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                        fontSize:"0.88rem", padding:"0.6rem 0.8rem", cursor:"pointer", outline:"none", borderRadius:4 }}>
                      <option value="en_attente">En attente</option>
                      <option value="confirme">Confirmer</option>
                      <option value="complete">Compléter</option>
                      <option value="annule">Annuler</option>
                    </select>
                    {(r.statut === "complete" || r.statut === "annule") && (
                      <button onClick={()=>deleteRdv(r.id)} title="Supprimer"
                        style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)",
                          color:"#f87171", cursor:"pointer", fontSize:"1rem", padding:"0.6rem 0.8rem", borderRadius:4 }}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign:"center", padding:"2rem", color:GRAY }}>
                  {selDate ? `Aucun rendez-vous le ${selDate}.` : "Aucun rendez-vous pour ce filtre."}
                </div>
              )}
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .cal-grid { grid-template-columns: 1fr !important; }
          .rdv-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── TICKETS ───────────────────────────────────────────────────
function Tickets() {
  const [tickets, setTickets]   = useState<any[]>([]);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);
  const [newUpdate, setNewUpdate] = useState("");

  // Load updates when a ticket is selected
  const selectedId = selected?.id ?? null;
  useEffect(() => {
    if (!selectedId) { setUpdates([]); setNewUpdate(""); return; }
    let cancelled = false;
    (async () => {
      try {
        const d = await ticketsApi.getUpdates(selectedId);
        if (!cancelled) setUpdates(d.updates || []);
      } catch { if (!cancelled) setUpdates([]); }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const addUpdate = async () => {
    if (!newUpdate.trim() || !selected) return;
    try {
      const res = await ticketsApi.addUpdate(selected.id, newUpdate.trim());
      setUpdates(prev => [res.update, ...prev]);
      setNewUpdate("");
    } catch (err) { console.error(err); }
  };

  const removeUpdate = async (updateId: number) => {
    if (!selected) return;
    try {
      await ticketsApi.deleteUpdate(selected.id, updateId);
      setUpdates(prev => prev.filter(u => u.id !== updateId));
    } catch (err) { console.error(err); }
  };

  const load = useCallback(() => {
    setLoading(true);
    ticketsApi.getAll().then((d:any) => setTickets(d.tickets || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets
    .filter((t:any) =>
      `${t.prenom} ${t.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      (t.numero || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.type_appareil || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter((t:any) => showArchived || t.statut !== "livre");

  const changeStatut = async (id: number, statut: string) => {
    try {
      await ticketsApi.update(id, { statut });
      const now = new Date().toISOString();
      const extra = statut === "livre" ? { date_livraison: now } : {};
      setTickets(prev => prev.map((x:any) => x.id === id ? {...x, statut, ...extra} : x));
      if (selected?.id === id) setSelected((s:any) => ({...s, statut, ...extra}));
    } catch (err) { console.error(err); }
  };

  const saveNote = async (id: number, notes_internes: string) => {
    try {
      await ticketsApi.update(id, { notes_internes });
      setTickets(prev => prev.map((x:any) => x.id === id ? {...x, notes_internes} : x));
      if (selected?.id === id) setSelected((s:any) => ({...s, notes_internes}));
    } catch (err) { console.error(err); }
  };

  const deleteTicket = async (id: number) => {
    if (!window.confirm("Supprimer définitivement ce ticket ?")) return;
    try {
      await ticketsApi.delete(id);
      setTickets(prev => prev.filter((x:any) => x.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e: any) { console.error(e); }
  };

  const statutsList = ["recu","diagnostic","en_cours","en_suspend","termine","pret","livre"];

  return (
    <div className="admin-fade" style={{display:"flex", height:"100%"}}>
      <div style={{flex:1, overflow:"auto"}}>
        <Topbar title="Tickets de Réparation" subtitle={`${filtered.length} ticket${filtered.length !== 1 ? "s" : ""} actif${filtered.length !== 1 ? "s" : ""}${!showArchived ? " — livrés masqués" : ""}`}/>
        <div className="admin-content-pad" style={{ padding:"1.5rem 2rem" }}>
          <div className="admin-flex-col-mobile" style={{display:"flex", gap:"0.8rem", marginBottom:"1.2rem"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="🔍  Rechercher par nom, numéro, appareil..."
              style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(109,212,0,0.2)",
                color:"#fff", padding:"0.8rem 1rem", fontSize:"0.9rem", fontFamily:"'DM Sans',sans-serif",
                outline:"none" }}/>
            <button onClick={()=>setShowCreate(true)} style={{ background:GREEN, color:NAVY,
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:"0.95rem",
              letterSpacing:"0.06em", padding:"0.8rem 1.2rem", border:"none", cursor:"pointer",
              whiteSpace:"nowrap" }}>
              + Nouveau ticket
            </button>
            <button onClick={()=>setShowArchived(p=>!p)} style={{
              background: showArchived ? "rgba(109,212,0,0.1)" : "transparent",
              color: showArchived ? GREEN : GRAY,
              border: `1px solid ${showArchived ? "rgba(109,212,0,0.3)" : "rgba(255,255,255,0.1)"}`,
              padding:"0.8rem 1rem", cursor:"pointer", fontSize:"0.82rem",
              fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap"
            }}>
              🗃 {showArchived ? "Masquer archives" : "Voir archives"}
            </button>
            <button onClick={load} style={{ background:"transparent", color:GRAY,
              border:"1px solid rgba(255,255,255,0.1)", padding:"0.8rem", cursor:"pointer" }}>↻</button>
          </div>

          {loading ? <div style={{color:GRAY,textAlign:"center",padding:"2rem"}}>Chargement...</div> : (
          <>
          {/* Desktop table */}
          <div className="admin-mobile-hide-table" style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", overflowX:"auto" }}>
            <table>
              <thead>
                <tr style={{ background:"rgba(109,212,0,0.04)" }}>
                  {["Numéro","Client","Appareil","Problème","Statut","Coût","Action"].map(h=>(
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t:any)=>(
                  <tr key={t.id} style={{ cursor:"pointer" }}
                    onClick={()=>setSelected(t)}
                    onMouseEnter={e=>(e.currentTarget.style.background="rgba(109,212,0,0.04)")}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <td style={tdStyle}>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",color:GREEN,fontWeight:700,fontSize:"0.82rem"}}>
                        {t.numero}
                      </span>
                    </td>
                    <td style={{...tdStyle,fontWeight:500}}>{t.prenom} {t.nom}</td>
                    <td style={{...tdStyle,color:GRAY}}>{t.type_appareil}</td>
                    <td style={{...tdStyle,color:GRAY,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.probleme}</td>
                    <td style={tdStyle}>
                      <Badge statut={t.statut}/>
                      {t.statut === "livre" && t.date_livraison && (() => {
                        const remaining = 24 * 3600 * 1000 - (Date.now() - new Date(t.date_livraison).getTime());
                        const hours = Math.max(0, Math.floor(remaining / 3600000));
                        return <div style={{color:ORANGE,fontSize:"0.7rem",marginTop:"0.25rem"}}>⏱ Expire dans {hours}h</div>;
                      })()}
                    </td>
                    <td style={{...tdStyle,color:t.cout_estime>0?GREEN:GRAY_DIM,fontWeight:t.cout_estime>0?600:400}}>
                      {t.cout_estime>0?`${t.cout_estime} $`:"—"}
                    </td>
                    <td style={tdStyle} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex", flexDirection:"column", gap:"0.4rem"}}>
                        <div style={{display:"flex", gap:"0.4rem", alignItems:"center"}}>
                          <select value={t.statut} onChange={e=>{e.stopPropagation();changeStatut(t.id,e.target.value);}}
                            onClick={e=>e.stopPropagation()}
                            style={{ background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                              fontSize:"0.78rem", padding:"0.3rem 0.5rem", cursor:"pointer", outline:"none" }}>
                            {statutsList.map(s=><option key={s} value={s}>{statutColors[s]?.label||s}</option>)}
                          </select>
                          {showArchived && t.statut === "livre" && (
                            <button onClick={e=>{e.stopPropagation();deleteTicket(t.id);}} title="Supprimer définitivement"
                              style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)",
                                color:"#f87171", cursor:"pointer", fontSize:"0.85rem", padding:"0.25rem 0.5rem", lineHeight:1 }}>
                              🗑
                            </button>
                          )}
                        </div>
                        {t.statut === "en_suspend" && (
                          <input
                            key={`note-${t.id}`}
                            type="text"
                            defaultValue={t.notes_internes || ""}
                            onBlur={e => saveNote(t.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            placeholder="Raison du suspend…"
                            style={{ width:"100%", background:"rgba(168,85,247,0.08)",
                              border:"1px solid rgba(168,85,247,0.3)", color:"#fff",
                              fontSize:"0.78rem", padding:"0.35rem 0.5rem", outline:"none", borderRadius:6 }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{textAlign:"center",padding:"3rem",color:GRAY}}>Aucun ticket trouvé.</div>}
          </div>
          {/* Mobile cards */}
          <div className="admin-mobile-cards" style={{ display:"none", flexDirection:"column", gap:"0.6rem" }}>
            {filtered.map((t:any)=>(
              <div key={t.id} onClick={()=>setSelected(t)}
                style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", borderRadius:14, padding:"1rem", cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.3rem" }}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",color:GREEN,fontWeight:700,fontSize:"0.85rem"}}>{t.numero}</span>
                  <Badge statut={t.statut}/>
                </div>
                <div style={{ fontWeight:600, fontSize:"0.95rem", marginBottom:"0.3rem" }}>{t.prenom} {t.nom}</div>
                <div style={{ fontSize:"0.82rem", color:GRAY, marginBottom:"0.5rem" }}>
                  {t.type_appareil} {t.probleme ? `— ${t.probleme.slice(0,40)}${t.probleme.length>40?"...":""}` : ""}
                </div>
                <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                  <select value={t.statut} onChange={e=>{e.stopPropagation();changeStatut(t.id,e.target.value);}}
                    onClick={e=>e.stopPropagation()}
                    style={{ flex:1, background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                      fontSize:"0.88rem", padding:"0.6rem 0.8rem", cursor:"pointer", outline:"none", borderRadius:4 }}>
                    {statutsList.map(s=><option key={s} value={s}>{statutColors[s]?.label||s}</option>)}
                  </select>
                  <span style={{ color:t.cout_estime>0?GREEN:GRAY_DIM, fontWeight:600, fontSize:"0.9rem", minWidth:50, textAlign:"right" }}>
                    {t.cout_estime>0?`${t.cout_estime} $`:"—"}
                  </span>
                </div>
                {t.statut === "en_suspend" && (
                  <input
                    key={`note-m-${t.id}`}
                    type="text"
                    defaultValue={t.notes_internes || ""}
                    onBlur={e => saveNote(t.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="⏸ Raison du suspend…"
                    style={{ marginTop:"0.6rem", width:"100%", background:"rgba(168,85,247,0.08)",
                      border:"1px solid rgba(168,85,247,0.3)", color:"#fff",
                      fontSize:"16px", padding:"0.55rem 0.7rem", outline:"none", borderRadius:10 }}
                  />
                )}
              </div>
            ))}
            {filtered.length === 0 && <div style={{textAlign:"center",padding:"2rem",color:GRAY}}>Aucun ticket trouvé.</div>}
          </div>
          </>
          )}
        </div>
      </div>

      {/* Panneau détail */}
      {selected && (
        <div className="admin-detail-panel" style={{ width:380, background:NAVY_MID, borderLeft:"1px solid rgba(109,212,0,0.15)",
          padding:"1.5rem", overflowY:"auto", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.1rem", fontWeight:700 }}>Détail Ticket</div>
            <button onClick={()=>setSelected(null)} style={{ background:"transparent", border:"none", color:GRAY, cursor:"pointer", fontSize:"1.2rem" }}>✕</button>
          </div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:GREEN, fontWeight:700, fontSize:"0.9rem", marginBottom:"1rem" }}>{selected.numero}</div>
          {[["Client",`${selected.prenom} ${selected.nom}`],["Email",selected.email],["Téléphone",selected.telephone],["Appareil",selected.type_appareil],["Problème",selected.probleme],["Coût estimé",selected.cout_estime>0?`${selected.cout_estime} $`:"À définir"]].map(([l,v])=>(
            <div key={l} style={{ marginBottom:"1rem" }}>
              <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", color:GRAY_DIM, textTransform:"uppercase", marginBottom:"0.3rem" }}>{l}</div>
              <div style={{ fontSize:"0.88rem", wordBreak:"break-word" }}>{v}</div>
            </div>
          ))}
          <div style={{ marginBottom:"1rem" }}>
            <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", color:GRAY_DIM, textTransform:"uppercase", marginBottom:"0.3rem" }}>Statut</div>
            <Badge statut={selected.statut}/>
          </div>
          <div style={{ marginTop:"1rem" }}>
            <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", color:GRAY_DIM, textTransform:"uppercase", marginBottom:"0.5rem" }}>Changer le statut</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              {statutsList.map(s=>(
                <button key={s} onClick={()=>changeStatut(selected.id,s)} style={{
                  background:selected.statut===s?"rgba(109,212,0,0.15)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${selected.statut===s?GREEN:"rgba(255,255,255,0.08)"}`,
                  color:selected.statut===s?GREEN:GRAY, padding:"0.5rem 0.8rem",
                  fontSize:"0.82rem", cursor:"pointer", textAlign:"left",
                  fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s"
                }}>{statutColors[s]?.label||s}</button>
              ))}
            </div>
          </div>

          {/* ── Mises à jour (tracking) ── */}
          <div style={{ marginTop:"1.5rem", borderTop:"1px solid rgba(109,212,0,0.12)", paddingTop:"1.2rem" }}>
            <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", color:GRAY_DIM, textTransform:"uppercase", marginBottom:"0.8rem" }}>
              📋 Mises à jour {updates.length > 0 && <span style={{ color:GREEN, marginLeft:"0.3rem" }}>({updates.length})</span>}
            </div>
            {/* Add update form */}
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
              <textarea
                value={newUpdate}
                onChange={e => setNewUpdate(e.target.value)}
                placeholder="Ex: Écran commandé, arrivée prévue jeudi..."
                rows={2}
                style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
                  color:"#fff", padding:"0.5rem 0.7rem", fontSize:"0.82rem", fontFamily:"'DM Sans',sans-serif",
                  resize:"vertical", minHeight:"50px" }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addUpdate(); } }}
              />
            </div>
            <button onClick={addUpdate} disabled={!newUpdate.trim()} style={{
              background: newUpdate.trim() ? GREEN : "rgba(255,255,255,0.05)",
              color: newUpdate.trim() ? NAVY : GRAY_DIM,
              border:"none", padding:"0.45rem 1rem", fontSize:"0.8rem", fontWeight:700,
              cursor: newUpdate.trim() ? "pointer" : "default", fontFamily:"'DM Sans',sans-serif",
              width:"100%", marginBottom:"1rem", transition:"all 0.15s"
            }}>+ Ajouter une mise à jour</button>

            {/* Updates list */}
            {updates.length === 0 ? (
              <div style={{ fontSize:"0.8rem", color:GRAY_DIM, fontStyle:"italic" }}>Aucune mise à jour</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem", borderLeft:`2px solid ${GREEN}33`, paddingLeft:"1rem" }}>
                {updates.map((u: any) => (
                  <div key={u.id} style={{ position:"relative", background:"rgba(255,255,255,0.02)", padding:"0.6rem 0.7rem", borderRadius:"4px" }}>
                    <div style={{ position:"absolute", left:"-1.35rem", top:"0.7rem", width:"8px", height:"8px", borderRadius:"50%", background:GREEN }} />
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ fontSize:"0.7rem", color:GRAY_DIM, marginBottom:"0.3rem" }}>
                        {new Date(u.created_at).toLocaleString("fr-CA", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                      </div>
                      <button onClick={() => removeUpdate(u.id)} style={{
                        background:"transparent", border:"none", color:"rgba(255,100,100,0.5)", cursor:"pointer",
                        fontSize:"0.75rem", padding:"0 0.3rem", lineHeight:1
                      }} title="Supprimer">✕</button>
                    </div>
                    <div style={{ fontSize:"0.85rem", color:"#fff", lineHeight:1.4 }}>{u.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nouveau Ticket */}
      {showCreate && <NouveauTicketModal onClose={()=>setShowCreate(false)} onCreated={()=>{load();setShowCreate(false);}}/>}
    </div>
  );
}

function NouveauTicketModal({ onClose, onCreated }: { onClose:()=>void; onCreated:()=>void }) {
  const [form, setForm] = useState({ prenom:"",nom:"",email:"",telephone:"",type_appareil:"",marque:"",modele:"",probleme:"",cout_estime:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await ticketsApi.create({ ...form, cout_estime: form.cout_estime ? Number(form.cout_estime) : 0 });
      onCreated();
    } catch (err:any) { setError(err.message || "Erreur"); setLoading(false); }
  };

  const field = (name: keyof typeof form, label: string, opts?: any) => (
    <div style={{marginBottom:"1rem"}}>
      <label style={{display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",color:GRAY,textTransform:"uppercase",marginBottom:"0.3rem"}}>{label}</label>
      <input {...opts} name={name} value={form[name]} onChange={e=>setForm(p=>({...p,[name]:e.target.value}))}
        style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(109,212,0,0.2)",color:"#fff",
          padding:"0.7rem",fontSize:"0.9rem",fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{background:NAVY_MID,border:"1px solid rgba(109,212,0,0.2)",padding:"2rem",width:500,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.3rem",fontWeight:900}}>Nouveau Ticket</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:GRAY,cursor:"pointer",fontSize:"1.3rem"}}>✕</button>
        </div>
        <form onSubmit={handle}>
          <div className="admin-modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
            {field("prenom","Prénom *",{required:true})}
            {field("nom","Nom *",{required:true})}
            {field("email","Email",{type:"email",placeholder:"jean@ex.com"})}
            {field("telephone","Téléphone *",{required:true})}
            {field("type_appareil","Type d'appareil *",{required:true,placeholder:"iPhone, Laptop..."})}
            {field("marque","Marque",{placeholder:"Apple, Dell..."})}
            {field("modele","Modèle",{placeholder:"14 Pro, XPS 15..."})}
            {field("cout_estime","Coût estimé ($)",{type:"number",placeholder:"150"})}
          </div>
          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",color:GRAY,textTransform:"uppercase",marginBottom:"0.3rem"}}>Problème *</label>
            <textarea required value={form.probleme} onChange={e=>setForm(p=>({...p,probleme:e.target.value}))} rows={3}
              placeholder="Décrivez le problème..."
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(109,212,0,0.2)",color:"#fff",
                padding:"0.7rem",fontSize:"0.9rem",fontFamily:"'DM Sans',sans-serif",outline:"none",resize:"vertical"}}/>
          </div>
          {error && <div style={{color:RED,fontSize:"0.85rem",marginBottom:"1rem"}}>{error}</div>}
          <div style={{display:"flex",gap:"0.8rem"}}>
            <button type="submit" disabled={loading} style={{flex:1,background:loading?"rgba(109,212,0,0.5)":GREEN,color:NAVY,
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"1rem",letterSpacing:"0.08em",
              padding:"0.8rem",border:"none",cursor:loading?"not-allowed":"pointer"}}>
              {loading?"CRÉATION...":"CRÉER LE TICKET"}
            </button>
            <button type="button" onClick={onClose} style={{background:"transparent",color:GRAY,
              border:"1px solid rgba(255,255,255,0.15)",padding:"0.8rem 1.2rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CALCULATEUR DE PRIX ──────────────────────────────────────────
function Calculateur() {
  const [subTab, setSubTab] = useState<"calculer"|"catalogue"|"concurrents"|"appareils">("calculer");
  const tabs = [
    { id:"calculer" as const, icon:"🧮", label:"Calculer" },
    { id:"catalogue" as const, icon:"📦", label:"Catalogue pièces" },
    { id:"concurrents" as const, icon:"🏪", label:"Prix concurrents" },
    { id:"appareils" as const, icon:"📱", label:"Valeur appareils" },
  ];
  return (
    <div className="admin-fade">
      <Topbar title="Calculateur de prix" subtitle={tabs.find(t=>t.id===subTab)?.label}/>
      <div className="admin-content-pad" style={{ padding:"1.5rem 2rem" }}>
        <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setSubTab(t.id)}
              style={{background:subTab===t.id?GREEN:"rgba(255,255,255,0.04)",color:subTab===t.id?NAVY:GRAY,
                border:`1px solid ${subTab===t.id?GREEN:"rgba(109,212,0,0.2)"}`,padding:"0.5rem 1.1rem",
                cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:subTab===t.id?700:400,
                fontSize:"0.9rem",letterSpacing:"0.05em",borderRadius:4}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {subTab==="calculer" && <CalculerPrix/>}
        {subTab==="catalogue" && <CataloguePieces/>}
        {subTab==="concurrents" && <PrixConcurrents/>}
        {subTab==="appareils" && <ValeurAppareils/>}
      </div>
    </div>
  );
}

function CalculerPrix() {
  const [appareil, setAppareil] = useState("");
  const [reparation, setReparation] = useState("");
  const [mainOeuvre, setMainOeuvre] = useState(100);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appareils, setAppareils] = useState<string[]>([]);
  const [reparations, setReparations] = useState<string[]>([]);

  useEffect(()=>{
    prixApi.getCatalogue().then((d:any)=>{
      const a = [...new Set((d.pieces||[]).map((p:any)=>p.type_appareil))];
      const r = [...new Set((d.pieces||[]).map((p:any)=>p.type_piece))];
      setAppareils(a as string[]);
      setReparations(r as string[]);
    }).catch(()=>{});
  },[]);

  const calculer = async () => {
    if(!appareil||!reparation) return;
    setLoading(true);
    try {
      const data = await prixApi.calculer({appareil,reparation,main_oeuvre:String(mainOeuvre)});
      setResult(data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const copier = () => {
    if(result?.prix_suggere) {
      navigator.clipboard.writeText(String(result.prix_suggere));
      setCopied(true);
      setTimeout(()=>setCopied(false),2000);
    }
  };

  const compBadge = (c:string) => {
    if(c==="vert") return {bg:"rgba(109,212,0,0.15)",color:GREEN,text:"COMPÉTITIF ✅"};
    if(c==="orange") return {bg:"rgba(245,158,11,0.15)",color:"#f59e0b",text:"BORDERLINE ⚠️"};
    if(c==="rouge") return {bg:"rgba(239,68,68,0.15)",color:RED,text:"TROP CHER ❌"};
    return {bg:"rgba(255,255,255,0.05)",color:GRAY,text:"DONNÉES MANQUANTES"};
  };

  const labelSt:React.CSSProperties = {display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",color:GRAY,textTransform:"uppercase",marginBottom:"0.3rem"};
  const inputSt:React.CSSProperties = {width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(109,212,0,0.2)",color:"#fff",padding:"0.7rem",fontSize:"0.9rem",fontFamily:"'DM Sans',sans-serif",outline:"none"};

  return (
    <div className="admin-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem"}}>
      {/* LEFT — Inputs */}
      <div>
        <div style={{marginBottom:"1.2rem"}}>
          <label style={labelSt}>Appareil</label>
          <input value={appareil} onChange={e=>setAppareil(e.target.value)} list="dl-appareils" placeholder="iPhone 15 Pro Max" style={inputSt}/>
          <datalist id="dl-appareils">{appareils.map(a=><option key={a} value={a}/>)}</datalist>
        </div>
        <div style={{marginBottom:"1.2rem"}}>
          <label style={labelSt}>Type de réparation</label>
          <input value={reparation} onChange={e=>setReparation(e.target.value)} list="dl-reparations" placeholder="Écran, Batterie..." style={inputSt}/>
          <datalist id="dl-reparations">{reparations.map(r=><option key={r} value={r}/>)}</datalist>
        </div>
        <div style={{marginBottom:"1.2rem"}}>
          <label style={labelSt}>Main d'œuvre ($)</label>
          <input type="number" value={mainOeuvre} onChange={e=>setMainOeuvre(Number(e.target.value))} style={{...inputSt,marginBottom:"0.5rem"}}/>
          <div style={{display:"flex",gap:"0.4rem"}}>
            {[50,75,100,125,150].map(v=>(
              <button key={v} type="button" onClick={()=>setMainOeuvre(v)}
                style={{background:mainOeuvre===v?GREEN:"rgba(255,255,255,0.06)",color:mainOeuvre===v?NAVY:GRAY,
                  border:`1px solid ${mainOeuvre===v?GREEN:"rgba(255,255,255,0.1)"}`,padding:"0.3rem 0.7rem",
                  cursor:"pointer",fontSize:"0.8rem",fontFamily:"'DM Sans',sans-serif",fontWeight:mainOeuvre===v?700:400}}>
                {v}$
              </button>
            ))}
          </div>
        </div>
        <button onClick={calculer} disabled={loading||!appareil||!reparation}
          style={{width:"100%",background:loading?"rgba(109,212,0,0.5)":GREEN,color:NAVY,
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"1.1rem",letterSpacing:"0.08em",
            padding:"0.9rem",border:"none",cursor:loading?"wait":"pointer",marginTop:"0.5rem"}}>
          {loading?"CALCUL...":"🧮 CALCULER LE PRIX"}
        </button>
      </div>

      {/* RIGHT — Results */}
      <div>
        {!result && <div style={{color:GRAY,fontSize:"0.9rem",textAlign:"center",paddingTop:"3rem"}}>Sélectionnez un appareil et une réparation puis cliquez "Calculer"</div>}
        {result && (
          <div>
            {/* Big price */}
            <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
              <div style={{fontSize:"0.7rem",fontWeight:700,color:GRAY,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.3rem"}}>Votre prix</div>
              <div style={{fontSize:"2.5rem",fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:GREEN}}>
                {result.prix_suggere!=null?`${result.prix_suggere} $`:"—"}
              </div>
              <button onClick={copier} style={{background:"rgba(109,212,0,0.1)",border:"1px solid rgba(109,212,0,0.3)",color:GREEN,padding:"0.3rem 1rem",cursor:"pointer",fontSize:"0.8rem",fontFamily:"'DM Sans',sans-serif",marginTop:"0.3rem"}}>
                {copied?"✅ Copié!":"📋 Copier"}
              </button>
            </div>

            {/* Cost breakdown */}
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",padding:"1rem",marginBottom:"1rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",color:GRAY,fontSize:"0.85rem",marginBottom:"0.3rem"}}><span>Pièce</span><span>{result.cout_piece!=null?`${result.cout_piece} $`:"—"}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",color:GRAY,fontSize:"0.85rem",marginBottom:"0.3rem"}}><span>Main d'œuvre</span><span>{result.main_oeuvre} $</span></div>
              <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"0.4rem",display:"flex",justifyContent:"space-between",color:"#fff",fontSize:"0.9rem",fontWeight:700}}><span>Coût total</span><span>{result.cout_total!=null?`${result.cout_total} $`:"—"}</span></div>
            </div>

            {/* Competitiveness badge */}
            {(()=>{const b=compBadge(result.competitivite);return(
              <div style={{background:b.bg,border:`1px solid ${b.color}33`,padding:"0.8rem",marginBottom:"1rem",textAlign:"center"}}>
                <div style={{color:b.color,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"1rem",letterSpacing:"0.08em"}}>{b.text}</div>
              </div>
            );})()}

            {/* Competitors */}
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",padding:"1rem",marginBottom:"1rem"}}>
              <div style={{fontSize:"0.7rem",fontWeight:700,color:GRAY,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"0.5rem"}}>Concurrents</div>
              {[["CD Solution",result.concurrents?.cd_solution],["Fix Moi",result.concurrents?.fix_moi],["Mobile Klinik",result.concurrents?.mobile_klinik]].map(([name,val])=>(
                <div key={name as string} style={{display:"flex",justifyContent:"space-between",color:GRAY,fontSize:"0.85rem",marginBottom:"0.2rem"}}><span>{name}</span><span>{val!=null?`${val} $`:"—"}</span></div>
              ))}
              <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"0.3rem",marginTop:"0.3rem",display:"flex",justifyContent:"space-between",color:"#fff",fontSize:"0.88rem",fontWeight:600}}><span>Moyenne</span><span>{result.concurrents?.moyenne!=null?`${result.concurrents.moyenne} $`:"—"}</span></div>
            </div>

            {/* Device value & ratio */}
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",padding:"1rem",marginBottom:"1rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",color:GRAY,fontSize:"0.85rem",marginBottom:"0.3rem"}}><span>Valeur appareil</span><span>{result.valeur_appareil!=null?`${result.valeur_appareil} $`:"—"}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",color:result.ratio_reparation_valeur>50?"#f59e0b":result.ratio_reparation_valeur>75?RED:GRAY,fontSize:"0.85rem",fontWeight:result.ratio_reparation_valeur>50?700:400}}><span>Ratio réparation/valeur</span><span>{result.ratio_reparation_valeur!=null?`${result.ratio_reparation_valeur}%`:"—"}</span></div>
              {result.ratio_reparation_valeur>50 && <div style={{color:"#f59e0b",fontSize:"0.78rem",marginTop:"0.4rem"}}>⚠️ La réparation coûte plus de 50% de la valeur. Envisager une réduction.</div>}
              {result.ratio_reparation_valeur>75 && <div style={{color:RED,fontSize:"0.78rem",marginTop:"0.2rem"}}>🚨 Le client risque de refuser — proposer un prix réduit.</div>}
            </div>

            {/* Margin */}
            <div style={{color:GRAY,fontSize:"0.8rem",textAlign:"center"}}>Marge : {result.marge_pct!=null?`${result.marge_pct}%`:"—"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CataloguePieces() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({type_appareil:"",modele:"",type_piece:"",cout_fournisseur:"",fournisseur:"Tan Star Trade",notes:""});
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number|null>(null);

  const load = () => { prixApi.getCatalogue().then((d:any)=>setPieces(d.pieces||[])).catch(console.error).finally(()=>setLoading(false)); };
  useEffect(load,[]);

  const handleAdd = async () => {
    if(!form.type_appareil||!form.type_piece||!form.cout_fournisseur) return;
    await prixApi.addPiece({...form,cout_fournisseur:Number(form.cout_fournisseur)});
    setForm({type_appareil:"",modele:"",type_piece:"",cout_fournisseur:"",fournisseur:"Tan Star Trade",notes:""});
    setShowAdd(false); load();
  };

  const handleDelete = async (id:number) => { if(confirm("Supprimer cette pièce?")) { await prixApi.deletePiece(id); load(); } };

  const filtered = pieces.filter(p=>`${p.type_appareil} ${p.modele||""} ${p.type_piece}`.toLowerCase().includes(search.toLowerCase()));
  const labelSt:React.CSSProperties = {display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",color:GRAY,textTransform:"uppercase",marginBottom:"0.3rem"};
  const inputSt:React.CSSProperties = {width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(109,212,0,0.2)",color:"#fff",padding:"0.55rem",fontSize:"0.85rem",fontFamily:"'DM Sans',sans-serif",outline:"none"};
  const tdSt:React.CSSProperties = {padding:"0.6rem 0.8rem",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"0.82rem",color:GRAY};

  const daysSince = (d:string) => { const ms=Date.now()-new Date(d).getTime(); return Math.floor(ms/86400000); };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.2rem"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{...inputSt,maxWidth:300}}/>
        <button onClick={()=>setShowAdd(!showAdd)} style={{background:GREEN,color:NAVY,border:"none",padding:"0.5rem 1.2rem",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.9rem"}}>
          {showAdd?"✕ Fermer":"+ Ajouter une pièce"}
        </button>
      </div>

      {showAdd && (
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(109,212,0,0.15)",padding:"1.2rem",marginBottom:"1.5rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.8rem",marginBottom:"0.8rem"}}>
            <div><label style={labelSt}>Appareil *</label><input value={form.type_appareil} onChange={e=>setForm(p=>({...p,type_appareil:e.target.value}))} placeholder="iPhone 15 Pro" style={inputSt}/></div>
            <div><label style={labelSt}>Modèle</label><input value={form.modele} onChange={e=>setForm(p=>({...p,modele:e.target.value}))} placeholder="Max, Plus..." style={inputSt}/></div>
            <div><label style={labelSt}>Type de pièce *</label><input value={form.type_piece} onChange={e=>setForm(p=>({...p,type_piece:e.target.value}))} placeholder="Écran, Batterie..." style={inputSt}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:"0.8rem",marginBottom:"0.8rem"}}>
            <div><label style={labelSt}>Coût ($) *</label><input type="number" value={form.cout_fournisseur} onChange={e=>setForm(p=>({...p,cout_fournisseur:e.target.value}))} placeholder="45" style={inputSt}/></div>
            <div><label style={labelSt}>Fournisseur</label><input value={form.fournisseur} onChange={e=>setForm(p=>({...p,fournisseur:e.target.value}))} style={inputSt}/></div>
            <div><label style={labelSt}>Notes</label><input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="OLED, Compatible..." style={inputSt}/></div>
          </div>
          <button onClick={handleAdd} style={{background:GREEN,color:NAVY,border:"none",padding:"0.5rem 2rem",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>AJOUTER</button>
        </div>
      )}

      {loading?<div style={{color:GRAY}}>Chargement...</div>:(
        <div className="admin-table-scroll" style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"2px solid rgba(109,212,0,0.2)"}}>
            {["Appareil","Modèle","Pièce","Coût ($)","Fournisseur","MAJ",""].map(h=><th key={h} style={{...tdSt,color:GRAY,fontWeight:700,fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length===0 && <tr><td colSpan={7} style={{...tdSt,textAlign:"center"}}>Aucune pièce</td></tr>}
            {filtered.map(p=>{const days=daysSince(p.updated_at);return(
              <tr key={p.id} style={{cursor:"default"}}>
                <td style={tdSt}>{p.type_appareil}</td>
                <td style={tdSt}>{p.modele||"—"}</td>
                <td style={tdSt}>{p.type_piece}</td>
                <td style={{...tdSt,color:GREEN,fontWeight:600}}>{p.cout_fournisseur} $</td>
                <td style={tdSt}>{p.fournisseur}</td>
                <td style={{...tdSt,color:days>30?"#f59e0b":GRAY,fontWeight:days>30?600:400}}>{days>0?`il y a ${days}j`:"aujourd'hui"}</td>
                <td style={tdSt}><button onClick={()=>handleDelete(p.id)} style={{background:"transparent",border:"none",color:RED,cursor:"pointer",fontSize:"0.85rem"}}>🗑</button></td>
              </tr>
            );})}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

function PrixConcurrents() {
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({type_appareil:"",type_reparation:"",prix_cd_solution:"",prix_fix_moi:"",prix_mobile_klinik:"",source:""});
  const [loading, setLoading] = useState(true);

  const load = () => { prixApi.getConcurrents().then((d:any)=>setItems(d.concurrents||[])).catch(console.error).finally(()=>setLoading(false)); };
  useEffect(load,[]);

  const handleAdd = async () => {
    if(!form.type_appareil||!form.type_reparation) return;
    await prixApi.addConcurrent({
      ...form,
      prix_cd_solution:form.prix_cd_solution?Number(form.prix_cd_solution):null,
      prix_fix_moi:form.prix_fix_moi?Number(form.prix_fix_moi):null,
      prix_mobile_klinik:form.prix_mobile_klinik?Number(form.prix_mobile_klinik):null,
    });
    setForm({type_appareil:"",type_reparation:"",prix_cd_solution:"",prix_fix_moi:"",prix_mobile_klinik:"",source:""});
    setShowAdd(false); load();
  };

  const handleDelete = async (id:number) => { if(confirm("Supprimer?")) { await prixApi.deleteConcurrent(id); load(); } };

  const labelSt:React.CSSProperties = {display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",color:GRAY,textTransform:"uppercase",marginBottom:"0.3rem"};
  const inputSt:React.CSSProperties = {width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(109,212,0,0.2)",color:"#fff",padding:"0.55rem",fontSize:"0.85rem",fontFamily:"'DM Sans',sans-serif",outline:"none"};
  const tdSt:React.CSSProperties = {padding:"0.6rem 0.8rem",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"0.82rem",color:GRAY};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"1.2rem"}}>
        <button onClick={()=>setShowAdd(!showAdd)} style={{background:GREEN,color:NAVY,border:"none",padding:"0.5rem 1.2rem",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.9rem"}}>
          {showAdd?"✕ Fermer":"+ Ajouter prix concurrent"}
        </button>
      </div>

      {showAdd && (
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(109,212,0,0.15)",padding:"1.2rem",marginBottom:"1.5rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.8rem",marginBottom:"0.8rem"}}>
            <div><label style={labelSt}>Appareil *</label><input value={form.type_appareil} onChange={e=>setForm(p=>({...p,type_appareil:e.target.value}))} placeholder="iPhone 15 Pro" style={inputSt}/></div>
            <div><label style={labelSt}>Réparation *</label><input value={form.type_reparation} onChange={e=>setForm(p=>({...p,type_reparation:e.target.value}))} placeholder="Écran, Batterie..." style={inputSt}/></div>
            <div><label style={labelSt}>Source</label><input value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} placeholder="site web, appel..." style={inputSt}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.8rem",marginBottom:"0.8rem"}}>
            <div><label style={labelSt}>CD Solution ($)</label><input type="number" value={form.prix_cd_solution} onChange={e=>setForm(p=>({...p,prix_cd_solution:e.target.value}))} style={inputSt}/></div>
            <div><label style={labelSt}>Fix Moi ($)</label><input type="number" value={form.prix_fix_moi} onChange={e=>setForm(p=>({...p,prix_fix_moi:e.target.value}))} style={inputSt}/></div>
            <div><label style={labelSt}>Mobile Klinik ($)</label><input type="number" value={form.prix_mobile_klinik} onChange={e=>setForm(p=>({...p,prix_mobile_klinik:e.target.value}))} style={inputSt}/></div>
          </div>
          <button onClick={handleAdd} style={{background:GREEN,color:NAVY,border:"none",padding:"0.5rem 2rem",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>AJOUTER</button>
        </div>
      )}

      {loading?<div style={{color:GRAY}}>Chargement...</div>:(
        <div className="admin-table-scroll" style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"2px solid rgba(109,212,0,0.2)"}}>
            {["Appareil","Réparation","CD Solution","Fix Moi","Mobile Klinik","Source",""].map(h=><th key={h} style={{...tdSt,color:GRAY,fontWeight:700,fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.length===0 && <tr><td colSpan={7} style={{...tdSt,textAlign:"center"}}>Aucune donnée</td></tr>}
            {items.map(c=>(
              <tr key={c.id}>
                <td style={tdSt}>{c.type_appareil}</td>
                <td style={tdSt}>{c.type_reparation}</td>
                <td style={{...tdSt,color:c.prix_cd_solution?"#fff":GRAY}}>{c.prix_cd_solution?`${c.prix_cd_solution} $`:"—"}</td>
                <td style={{...tdSt,color:c.prix_fix_moi?"#fff":GRAY}}>{c.prix_fix_moi?`${c.prix_fix_moi} $`:"—"}</td>
                <td style={{...tdSt,color:c.prix_mobile_klinik?"#fff":GRAY}}>{c.prix_mobile_klinik?`${c.prix_mobile_klinik} $`:"—"}</td>
                <td style={tdSt}>{c.source||"—"}</td>
                <td style={tdSt}><button onClick={()=>handleDelete(c.id)} style={{background:"transparent",border:"none",color:RED,cursor:"pointer",fontSize:"0.85rem"}}>🗑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

function ValeurAppareils() {
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({type_appareil:"",valeur_marche:"",annee:"",notes:""});
  const [loading, setLoading] = useState(true);

  const load = () => { prixApi.getAppareils().then((d:any)=>setItems(d.appareils||[])).catch(console.error).finally(()=>setLoading(false)); };
  useEffect(load,[]);

  const handleAdd = async () => {
    if(!form.type_appareil||!form.valeur_marche) return;
    await prixApi.addAppareil({...form,valeur_marche:Number(form.valeur_marche),annee:form.annee?Number(form.annee):null});
    setForm({type_appareil:"",valeur_marche:"",annee:"",notes:""});
    setShowAdd(false); load();
  };

  const handleDelete = async (id:number) => { if(confirm("Supprimer?")) { await prixApi.deleteAppareil(id); load(); } };

  const labelSt:React.CSSProperties = {display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",color:GRAY,textTransform:"uppercase",marginBottom:"0.3rem"};
  const inputSt:React.CSSProperties = {width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(109,212,0,0.2)",color:"#fff",padding:"0.55rem",fontSize:"0.85rem",fontFamily:"'DM Sans',sans-serif",outline:"none"};
  const tdSt:React.CSSProperties = {padding:"0.6rem 0.8rem",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"0.82rem",color:GRAY};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"1.2rem"}}>
        <button onClick={()=>setShowAdd(!showAdd)} style={{background:GREEN,color:NAVY,border:"none",padding:"0.5rem 1.2rem",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.9rem"}}>
          {showAdd?"✕ Fermer":"+ Ajouter un appareil"}
        </button>
      </div>

      {showAdd && (
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(109,212,0,0.15)",padding:"1.2rem",marginBottom:"1.5rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.8rem",marginBottom:"0.8rem"}}>
            <div><label style={labelSt}>Appareil *</label><input value={form.type_appareil} onChange={e=>setForm(p=>({...p,type_appareil:e.target.value}))} placeholder="iPhone 15 Pro Max" style={inputSt}/></div>
            <div><label style={labelSt}>Valeur ($) *</label><input type="number" value={form.valeur_marche} onChange={e=>setForm(p=>({...p,valeur_marche:e.target.value}))} placeholder="650" style={inputSt}/></div>
            <div><label style={labelSt}>Année</label><input type="number" value={form.annee} onChange={e=>setForm(p=>({...p,annee:e.target.value}))} placeholder="2023" style={inputSt}/></div>
            <div><label style={labelSt}>Notes</label><input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="128GB, usagé..." style={inputSt}/></div>
          </div>
          <button onClick={handleAdd} style={{background:GREEN,color:NAVY,border:"none",padding:"0.5rem 2rem",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>AJOUTER</button>
        </div>
      )}

      {loading?<div style={{color:GRAY}}>Chargement...</div>:(
        <div className="admin-table-scroll" style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:"500px"}}>
          <thead><tr style={{borderBottom:"2px solid rgba(109,212,0,0.2)"}}>
            {["Appareil","Valeur marché ($)","Année","Notes",""].map(h=><th key={h} style={{...tdSt,color:GRAY,fontWeight:700,fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.length===0 && <tr><td colSpan={5} style={{...tdSt,textAlign:"center"}}>Aucun appareil</td></tr>}
            {items.map(a=>(
              <tr key={a.id}>
                <td style={tdSt}>{a.type_appareil}</td>
                <td style={{...tdSt,color:GREEN,fontWeight:600}}>{a.valeur_marche} $</td>
                <td style={tdSt}>{a.annee||"—"}</td>
                <td style={tdSt}>{a.notes||"—"}</td>
                <td style={tdSt}><button onClick={()=>handleDelete(a.id)} style={{background:"transparent",border:"none",color:RED,cursor:"pointer",fontSize:"0.85rem"}}>🗑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

// ── CLIENTS ───────────────────────────────────────────────────
function Clients() {
  const [clients, setClients]   = useState<any[]>([]);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    clientsApi.getAll().then((d:any) => setClients(d.clients || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c:any) =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-fade" style={{display:"flex",height:"100%"}}>
      <div style={{flex:1,overflow:"auto"}}>
        <Topbar title="Clients" subtitle={`${clients.length} clients enregistrés`}/>
        <div className="admin-content-pad" style={{ padding:"1.5rem 2rem" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Rechercher un client..."
            style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(109,212,0,0.2)",
              color:"#fff", padding:"0.8rem 1rem", fontSize:"0.9rem", fontFamily:"'DM Sans',sans-serif",
              marginBottom:"1.2rem", outline:"none" }}/>
          {loading ? <div style={{color:GRAY,textAlign:"center",padding:"2rem"}}>Chargement...</div> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
            {filtered.map((c:any)=>(
              <div key={c.id} onClick={()=>setSelected(c)} style={{
                background:NAVY_MID, border:`1px solid ${selected?.id===c.id?GREEN:"rgba(109,212,0,0.12)"}`,
                padding:"1.3rem", cursor:"pointer", transition:"all 0.15s"
              }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=GREEN)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=selected?.id===c.id?GREEN:"rgba(109,212,0,0.12)")}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.8rem", marginBottom:"0.8rem" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:GREEN_DIM,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, color:GREEN, fontSize:"1rem" }}>
                    {(c.prenom||"?").charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:"0.95rem" }}>{c.prenom} {c.nom}</div>
                    <div style={{ fontSize:"0.75rem", color:GRAY }}>{c.email}</div>
                  </div>
                </div>
                <div style={{ fontSize:"0.75rem", color:GRAY }}>{c.telephone}</div>
                <div style={{ fontSize:"0.72rem", color:GRAY_DIM, marginTop:"0.4rem" }}>
                  Client depuis {new Date(c.created_at).toLocaleDateString("fr-CA")}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{color:GRAY_DIM,fontSize:"0.85rem"}}>Aucun client trouvé.</div>}
          </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="admin-detail-panel" style={{ width:300, background:NAVY_MID, borderLeft:"1px solid rgba(109,212,0,0.15)",
          padding:"1.5rem", overflowY:"auto", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.1rem", fontWeight:700 }}>Profil Client</div>
            <button onClick={()=>setSelected(null)} style={{ background:"transparent", border:"none", color:GRAY, cursor:"pointer", fontSize:"1.2rem" }}>✕</button>
          </div>
          <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:GREEN_DIM, border:`2px solid ${GREEN}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, color:GREEN, fontSize:"1.6rem", margin:"0 auto 0.8rem" }}>
              {(selected.prenom||"?").charAt(0)}
            </div>
            <div style={{ fontWeight:600, fontSize:"1rem" }}>{selected.prenom} {selected.nom}</div>
            <div style={{ fontSize:"0.78rem", color:GRAY }}>{selected.email}</div>
          </div>
          {[["📞 Téléphone",selected.telephone],["📅 Inscrit le",new Date(selected.created_at).toLocaleDateString("fr-CA")]].map(([l,v])=>(
            <div key={l as string} style={{ display:"flex", justifyContent:"space-between", padding:"0.6rem 0",
              borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:"0.85rem" }}>
              <span style={{color:GRAY}}>{l}</span>
              <span style={{fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MESSAGES ─────────────────────────────────────────────────
function Messages() {
  const [msgs, setMsgs]         = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [replyText, setReplyText]   = useState("");
  const [replying, setReplying]     = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const load = useCallback(() => {
    messagesApi.getAll().then((d:any) => setMsgs(d.messages || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Reset reply form when switching messages
  useEffect(() => {
    setReplyText("");
    setReplyError(null);
  }, [selected?.id]);

  const markLu = async (id: number) => {
    try {
      await messagesApi.markLu(id);
      setMsgs(m=>m.map((x:any)=>x.id===id?{...x,lu:1}:x));
    } catch {}
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setReplying(true);
    setReplyError(null);
    try {
      const res = await messagesApi.reply(selected.id, replyText.trim()) as any;
      const now = res.replied_at || new Date().toISOString();
      // Mise à jour locale : message marqué répondu + réponse sauvegardée
      const updated = { ...selected, repondu: 1, lu: 1, reply_text: replyText.trim(), replied_at: now };
      setSelected(updated);
      setMsgs(m => m.map((x:any) => x.id === selected.id ? updated : x));
      setReplyText("");
    } catch (e: any) {
      setReplyError(e?.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setReplying(false);
    }
  };

  const toggleArchive = async (m: any) => {
    const isArchived = m.archived === 1;
    try {
      if (isArchived) await messagesApi.unarchive(m.id);
      else            await messagesApi.archive(m.id);
      const updated = { ...m, archived: isArchived ? 0 : 1 };
      setMsgs(prev => prev.map((x:any) => x.id === m.id ? updated : x));
      if (selected?.id === m.id) setSelected(updated);
    } catch (e: any) { console.error(e); }
  };

  const deleteMsg = async (m: any) => {
    if (!window.confirm("Supprimer définitivement ce message ?")) return;
    try {
      await messagesApi.delete(m.id);
      setMsgs(prev => prev.filter((x:any) => x.id !== m.id));
      if (selected?.id === m.id) setSelected(null);
    } catch (e: any) { console.error(e); }
  };

  const isRappel = (m: any) => m.sujet === "Rappel demandé";

  const markRappele = async (m: any) => {
    try {
      await messagesApi.markRepondu(m.id);
      const updated = { ...m, repondu: 1, lu: 1 };
      setMsgs(prev => prev.map((x:any) => x.id === m.id ? updated : x));
      setSelected(updated);
    } catch (e: any) { console.error(e); }
  };

  const visibleMsgs = msgs.filter((m:any) => showArchived ? m.archived === 1 : !m.archived);
  const nonLus = msgs.filter((m:any)=>!m.lu && !m.archived).length;
  const rappelsEnAttente = msgs.filter((m:any) => isRappel(m) && !m.repondu && !m.archived).length;

  return (
    <div className="admin-fade" style={{display:"flex",height:"100%"}}>
      {/* ── Liste des messages ── */}
      <div className="admin-msg-list" style={{width:340,borderRight:"1px solid rgba(109,212,0,0.1)",display:"flex",flexDirection:"column"}}>
        <div style={{ padding:"1.2rem 1.5rem", borderBottom:"1px solid rgba(109,212,0,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.4rem", fontWeight:900, margin:0 }}>Messages</h2>
              <p style={{ fontSize:"0.8rem", color:GRAY, marginTop:"0.2rem", margin:0 }}>
                {showArchived ? `${visibleMsgs.length} archivé${visibleMsgs.length !== 1 ? "s" : ""}` : `${nonLus} non lu${nonLus !== 1 ? "s" : ""}`}
                {!showArchived && rappelsEnAttente > 0 && (
                  <span style={{ marginLeft:"0.5rem", background:"rgba(109,212,0,0.15)", color:GREEN,
                    padding:"1px 7px", borderRadius:2, fontSize:"0.72rem", fontWeight:700 }}>
                    📞 {rappelsEnAttente} rappel{rappelsEnAttente !== 1 ? "s" : ""} en attente
                  </span>
                )}
              </p>
            </div>
            <button onClick={() => { setShowArchived(p=>!p); setSelected(null); }} style={{
              background: showArchived ? "rgba(109,212,0,0.1)" : "transparent",
              color: showArchived ? GREEN : GRAY,
              border: `1px solid ${showArchived ? "rgba(109,212,0,0.3)" : "rgba(255,255,255,0.1)"}`,
              padding:"0.4rem 0.8rem", cursor:"pointer", fontSize:"0.75rem",
              fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", borderRadius:2,
            }}>
              🗃 {showArchived ? "Actifs" : "Archives"}
            </button>
          </div>
        </div>
        {loading ? <div style={{padding:"2rem",color:GRAY,textAlign:"center"}}>Chargement...</div> : (
        <div style={{ overflowY:"auto", flex:1 }}>
          {visibleMsgs.map((m:any)=>(
            <div key={m.id} onClick={()=>{ setSelected(m); if(!m.lu) markLu(m.id); }}
              style={{ padding:"1rem 1.2rem", borderBottom:"1px solid rgba(255,255,255,0.04)",
                cursor:"pointer", background:selected?.id===m.id?"rgba(109,212,0,0.06)":m.lu?"transparent":"rgba(109,212,0,0.03)",
                borderLeft:`3px solid ${selected?.id===m.id?GREEN:!m.lu?GREEN:"transparent"}`,
                opacity: m.archived ? 0.65 : 1,
                transition:"all 0.15s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem", alignItems:"center" }}>
                <span style={{ fontWeight:m.lu?400:600, fontSize:"0.9rem" }}>
                  {isRappel(m) ? `📞 ${m.telephone || "—"}` : m.nom}
                </span>
                <div style={{ display:"flex", gap:"0.3rem", alignItems:"center" }}>
                  {m.archived === 1
                    ? <>
                        <span style={{ fontSize:"0.65rem", background:"rgba(255,255,255,0.06)", color:GRAY_DIM, padding:"1px 6px", borderRadius:2 }}>Archivé</span>
                        <button
                          onClick={e => { e.stopPropagation(); deleteMsg(m); }}
                          title="Supprimer définitivement"
                          style={{ background:"transparent", border:"none", color:"#f87171", cursor:"pointer",
                            fontSize:"0.85rem", padding:"1px 3px", opacity:0.7, lineHeight:1 }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
                        >🗑</button>
                      </>
                    : m.repondu
                      ? <span style={{ fontSize:"0.65rem", background:"rgba(109,212,0,0.15)", color:GREEN, padding:"1px 6px", borderRadius:2, fontWeight:600 }}>{isRappel(m) ? "✓ Rappelé" : "Répondu"}</span>
                      : !m.lu && <span style={{ width:8,height:8,borderRadius:"50%",background:GREEN,display:"inline-block" }}/>
                  }
                </div>
              </div>
              {isRappel(m) ? (
                <div style={{ fontSize:"0.75rem", background:"rgba(109,212,0,0.08)", color:GREEN,
                  padding:"2px 8px", borderRadius:2, display:"inline-block", fontWeight:700, letterSpacing:"0.06em" }}>
                  📞 RAPPEL
                </div>
              ) : (
                <div style={{ fontSize:"0.82rem", color:GREEN, marginBottom:"0.3rem", fontWeight:500 }}>{m.sujet}</div>
              )}
              {!isRappel(m) && (
                <div style={{ fontSize:"0.78rem", color:GRAY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.message}</div>
              )}
              <div style={{ fontSize:"0.72rem", color:GRAY_DIM, marginTop:"0.3rem" }}>
                {new Date(m.created_at).toLocaleString("fr-CA", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}
              </div>
            </div>
          ))}
          {visibleMsgs.length === 0 && (
            <div style={{padding:"2rem",color:GRAY_DIM,textAlign:"center"}}>
              {showArchived ? "Aucun message archivé." : "Aucun message."}
            </div>
          )}
        </div>
        )}
      </div>

      {/* ── Panneau de détail + réponse ── */}
      <div className="admin-msg-detail" style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {selected ? (
          <>
          {/* Mobile back button */}
          <button className="admin-mobile-only" onClick={()=>setSelected(null)} style={{
            background:"transparent", border:"none", color:GREEN, fontSize:"0.9rem", padding:"0.8rem 1rem",
            cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif", display:"none"
          }}>← Retour aux messages</button>
            {/* En-tête */}
            <div style={{ padding:"1.5rem 2rem", borderBottom:"1px solid rgba(109,212,0,0.1)", flexShrink:0 }}>
              {isRappel(selected) ? (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.8rem", flexWrap:"wrap" }}>
                    <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.3rem", fontWeight:700, margin:0 }}>
                      📞 Rappel téléphonique
                    </h3>
                    {selected.repondu === 1 && (
                      <span style={{ fontSize:"0.72rem", background:"rgba(109,212,0,0.12)", color:GREEN,
                        border:"1px solid rgba(109,212,0,0.3)", padding:"2px 10px", fontWeight:700, letterSpacing:"0.07em" }}>
                        ✓ RAPPELÉ
                      </span>
                    )}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginTop:"0.3rem" }}>
                    <span style={{ fontSize:"0.82rem", color:GRAY }}>
                      {new Date(selected.created_at).toLocaleString("fr-CA", { day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                    </span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:"0.5rem" }}>
                      <button onClick={() => toggleArchive(selected)} style={{
                        background: selected.archived ? "rgba(109,212,0,0.08)" : "rgba(255,255,255,0.05)",
                        color: selected.archived ? GREEN : GRAY,
                        border: `1px solid ${selected.archived ? "rgba(109,212,0,0.25)" : "rgba(255,255,255,0.1)"}`,
                        padding:"0.3rem 0.9rem", cursor:"pointer", fontSize:"0.78rem",
                        fontFamily:"'DM Sans',sans-serif", borderRadius:2, whiteSpace:"nowrap",
                      }}>
                        {selected.archived ? "↩ Désarchiver" : "🗃 Archiver"}
                      </button>
                      {selected.archived === 1 && (
                        <button onClick={() => deleteMsg(selected)} style={{
                          background:"rgba(248,113,113,0.08)", color:"#f87171",
                          border:"1px solid rgba(248,113,113,0.25)",
                          padding:"0.3rem 0.9rem", cursor:"pointer", fontSize:"0.78rem",
                          fontFamily:"'DM Sans',sans-serif", borderRadius:2, whiteSpace:"nowrap",
                        }}>🗑 Supprimer</button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.8rem", flexWrap:"wrap" }}>
                    <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.3rem", fontWeight:700, margin:0 }}>{selected.sujet}</h3>
                    {selected.repondu === 1 && (
                      <span style={{ fontSize:"0.72rem", background:"rgba(109,212,0,0.12)", color:GREEN,
                        border:"1px solid rgba(109,212,0,0.3)", padding:"2px 10px", fontWeight:700, letterSpacing:"0.07em" }}>
                        ✓ RÉPONDU
                      </span>
                    )}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginTop:"0.3rem" }}>
                    <span style={{ fontSize:"0.82rem", color:GRAY }}>
                      De : <strong style={{color:"#fff"}}>{selected.nom}</strong> — {selected.email}
                    </span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:"0.5rem" }}>
                    <button onClick={() => toggleArchive(selected)} style={{
                      background: selected.archived ? "rgba(109,212,0,0.08)" : "rgba(255,255,255,0.05)",
                      color: selected.archived ? GREEN : GRAY,
                      border: `1px solid ${selected.archived ? "rgba(109,212,0,0.25)" : "rgba(255,255,255,0.1)"}`,
                      padding:"0.3rem 0.9rem", cursor:"pointer", fontSize:"0.78rem",
                      fontFamily:"'DM Sans',sans-serif", borderRadius:2, whiteSpace:"nowrap",
                    }}>
                      {selected.archived ? "↩ Désarchiver" : "🗃 Archiver"}
                    </button>
                    {selected.archived === 1 && (
                      <button onClick={() => deleteMsg(selected)} style={{
                        background:"rgba(248,113,113,0.08)", color:"#f87171",
                        border:"1px solid rgba(248,113,113,0.25)",
                        padding:"0.3rem 0.9rem", cursor:"pointer", fontSize:"0.78rem",
                        fontFamily:"'DM Sans',sans-serif", borderRadius:2, whiteSpace:"nowrap",
                      }}>🗑 Supprimer</button>
                    )}
                    </div>
                  </div>{/* fin flex row */}
                </>
              )}
            </div>

            {/* Contenu scrollable */}
            <div style={{ flex:1, padding:"2rem", overflowY:"auto", display:"flex", flexDirection:"column", gap:"1.5rem" }}>

              {isRappel(selected) ? (
                /* ── Affichage spécial rappel ── */
                <>
                  {/* Numéro proéminent */}
                  <div style={{ background:NAVY_MID, border:`2px solid ${GREEN}`, padding:"2rem",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:"0.8rem", maxWidth:400 }}>
                    <div style={{ fontSize:"0.72rem", color:GRAY_DIM, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                      Numéro à rappeler
                    </div>
                    <a href={`tel:${selected.telephone}`} style={{
                      fontFamily:"'Barlow Condensed',sans-serif", fontSize:"2rem", fontWeight:900,
                      color:GREEN, letterSpacing:"0.06em", textDecoration:"none",
                    }}>
                      {selected.telephone || "—"}
                    </a>
                    <div style={{ fontSize:"0.78rem", color:GRAY_DIM }}>
                      Demande reçue le {new Date(selected.created_at).toLocaleString("fr-CA", { day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                    </div>
                  </div>

                  {/* Bouton / statut rappelé */}
                  {selected.repondu === 1 ? (
                    <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", color:GREEN, fontSize:"0.9rem", fontWeight:600 }}>
                      <span style={{ fontSize:"1.1rem" }}>✓</span> Ce client a été rappelé.
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:"0.72rem", color:GRAY_DIM, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.8rem" }}>
                        Une fois le client rappelé, marquez-le comme traité
                      </div>
                      <button
                        onClick={() => markRappele(selected)}
                        style={{
                          background:GREEN, color:NAVY,
                          fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700,
                          fontSize:"0.95rem", letterSpacing:"0.08em",
                          padding:"0.7rem 2rem", border:"none", cursor:"pointer",
                          clipPath:"polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                        }}
                      >
                        ✓ MARQUER COMME RAPPELÉ
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* ── Affichage message classique ── */
                <>
                  {/* Message original */}
                  <div>
                    <div style={{ fontSize:"0.72rem", color:GRAY_DIM, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.6rem" }}>
                      Message reçu · {new Date(selected.created_at).toLocaleDateString("fr-CA", { day:"numeric", month:"long", year:"numeric" })}
                    </div>
                    <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", padding:"1.5rem",
                      fontSize:"0.92rem", lineHeight:1.7, whiteSpace:"pre-wrap", maxWidth:640 }}>
                      {selected.message}
                    </div>
                  </div>

                  {/* Réponse déjà envoyée */}
                  {selected.reply_text && (
                    <div>
                      <div style={{ fontSize:"0.72rem", color:GREEN, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.6rem" }}>
                        ✓ Votre réponse envoyée
                        {selected.replied_at && (
                          <span style={{ color:GRAY_DIM, fontWeight:400, marginLeft:8 }}>
                            · {new Date(selected.replied_at).toLocaleDateString("fr-CA", { day:"numeric", month:"long", year:"numeric" })}
                          </span>
                        )}
                      </div>
                      <div style={{ background:"rgba(109,212,0,0.06)", border:"1px solid rgba(109,212,0,0.25)",
                        borderLeft:"3px solid " + GREEN, padding:"1.5rem",
                        fontSize:"0.92rem", lineHeight:1.7, whiteSpace:"pre-wrap", maxWidth:640, color:"#e8f4e0" }}>
                        {selected.reply_text}
                      </div>
                    </div>
                  )}

                  {/* Zone de réponse (si pas encore répondu) */}
                  {!selected.repondu && (
                    <div style={{ maxWidth:640 }}>
                      <div style={{ fontSize:"0.72rem", color:GRAY_DIM, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.6rem" }}>
                        Votre réponse — un email sera envoyé à {selected.email}
                      </div>
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`Bonjour ${selected.nom},\n\nMerci pour votre message...`}
                        rows={7}
                        style={{
                          width:"100%", background:NAVY_MID,
                          border:`1px solid ${replyError ? "#f87171" : "rgba(109,212,0,0.2)"}`,
                          color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:"0.92rem",
                          lineHeight:1.7, padding:"1rem", resize:"vertical",
                          outline:"none", boxSizing:"border-box",
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = GREEN; }}
                        onBlur={e => { e.currentTarget.style.borderColor = replyError ? "#f87171" : "rgba(109,212,0,0.2)"; }}
                      />
                      {replyError && (
                        <div style={{ fontSize:"0.82rem", color:"#f87171", marginTop:"0.4rem" }}>⚠ {replyError}</div>
                      )}
                      <div style={{ marginTop:"0.8rem", display:"flex", gap:"0.8rem", alignItems:"center" }}>
                        <button
                          onClick={sendReply}
                          disabled={replying || !replyText.trim()}
                          style={{
                            background: replying || !replyText.trim() ? "rgba(109,212,0,0.35)" : GREEN,
                            color: NAVY, fontFamily:"'Barlow Condensed',sans-serif",
                            fontWeight:700, fontSize:"0.95rem", letterSpacing:"0.08em",
                            padding:"0.65rem 1.8rem", border:"none",
                            cursor: replying || !replyText.trim() ? "not-allowed" : "pointer",
                            clipPath:"polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                            transition:"all 0.18s",
                          }}
                        >
                          {replying ? "ENVOI…" : "✉ ENVOYER LA RÉPONSE"}
                        </button>
                        <span style={{ fontSize:"0.78rem", color:GRAY_DIM }}>
                          Un email de notification sera envoyé automatiquement.
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:GRAY_DIM, flexDirection:"column", gap:"0.5rem" }}>
            <div style={{ fontSize:"2.5rem" }}>✉️</div>
            <div>Sélectionnez un message</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DÉCHARGES ─────────────────────────────────────────────────
function Decharges() {
  const [decharges, setDecharges] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    dechargesApi.getAll().then((d:any) => setDecharges(d.decharges || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatut = async (id: number, statut: string) => {
    try {
      await dechargesApi.updateStatut(id, statut);
      setDecharges(prev => prev.map((x:any) => x.id === id ? {...x, statut} : x));
    } catch {}
  };

  return (
    <div className="admin-fade">
      <Topbar title="Décharges" subtitle={`${decharges.length} décharges`}/>
      <div className="admin-content-pad" style={{ padding:"1.5rem 2rem" }}>
        {loading ? <div style={{color:GRAY,textAlign:"center",padding:"2rem"}}>Chargement...</div> : (
        <>
        {/* Desktop table */}
        <div className="admin-mobile-hide-table" style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", overflowX:"auto" }}>
          <table>
            <thead>
              <tr style={{ background:"rgba(109,212,0,0.04)" }}>
                {["Client","Téléphone","Appareil","Problème","Diag.","Rép.","Date","Statut","Action"].map(h=>(
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {decharges.map((d:any)=>(
                <tr key={d.id}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.02)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <td style={{...tdStyle,fontWeight:500}}>{d.nom}</td>
                  <td style={{...tdStyle,color:GRAY}}>{d.telephone}</td>
                  <td style={tdStyle}>{d.type_appareil || d.type}</td>
                  <td style={{...tdStyle,color:GRAY,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.probleme}</td>
                  <td style={{...tdStyle,textAlign:"center"}}>
                    <span style={{color:d.auth_diag==="OUI"||d.auth_diag===1?GREEN:RED,fontWeight:700,fontSize:"0.85rem"}}>
                      {d.auth_diag==="OUI"||d.auth_diag===1?"OUI":"NON"}
                    </span>
                  </td>
                  <td style={{...tdStyle,textAlign:"center"}}>
                    <span style={{color:d.auth_rep==="OUI"||d.auth_rep===1?GREEN:RED,fontWeight:700,fontSize:"0.85rem"}}>
                      {d.auth_rep==="OUI"||d.auth_rep===1?"OUI":"NON"}
                    </span>
                  </td>
                  <td style={{...tdStyle,color:GRAY,fontSize:"0.78rem"}}>
                    {new Date(d.created_at).toLocaleDateString("fr-CA")}
                  </td>
                  <td style={tdStyle}><Badge statut={d.statut}/></td>
                  <td style={tdStyle}>
                    <select value={d.statut} onChange={e=>changeStatut(d.id,e.target.value)}
                      style={{ background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                        fontSize:"0.78rem", padding:"0.3rem 0.5rem", cursor:"pointer", outline:"none" }}>
                      <option value="en_attente">En attente</option>
                      <option value="traitee">Traitée</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {decharges.length === 0 && <div style={{textAlign:"center",padding:"3rem",color:GRAY}}>Aucune décharge.</div>}
        </div>
        {/* Mobile cards */}
        <div className="admin-mobile-cards" style={{ display:"none", flexDirection:"column", gap:"0.6rem" }}>
          {decharges.map((d:any)=>(
            <div key={d.id} style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", borderRadius:14, padding:"1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.4rem" }}>
                <span style={{ fontWeight:600, fontSize:"0.95rem" }}>{d.nom}</span>
                <Badge statut={d.statut}/>
              </div>
              <div style={{ fontSize:"0.82rem", color:GRAY, marginBottom:"0.3rem" }}>{d.type_appareil || d.type}</div>
              {d.telephone && <div style={{ fontSize:"0.82rem", color:GRAY, marginBottom:"0.3rem" }}>📞 {d.telephone}</div>}
              <div style={{ display:"flex", gap:"0.8rem", marginBottom:"0.5rem", fontSize:"0.82rem" }}>
                <span>Diag: <strong style={{color:d.auth_diag==="OUI"||d.auth_diag===1?GREEN:RED}}>{d.auth_diag==="OUI"||d.auth_diag===1?"OUI":"NON"}</strong></span>
                <span>Rép: <strong style={{color:d.auth_rep==="OUI"||d.auth_rep===1?GREEN:RED}}>{d.auth_rep==="OUI"||d.auth_rep===1?"OUI":"NON"}</strong></span>
                <span style={{ color:GRAY_DIM }}>{new Date(d.created_at).toLocaleDateString("fr-CA")}</span>
              </div>
              <select value={d.statut} onChange={e=>changeStatut(d.id,e.target.value)}
                style={{ width:"100%", background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                  fontSize:"0.88rem", padding:"0.6rem 0.8rem", cursor:"pointer", outline:"none", borderRadius:4 }}>
                <option value="en_attente">En attente</option>
                <option value="traitee">Traitée</option>
              </select>
            </div>
          ))}
          {decharges.length === 0 && <div style={{textAlign:"center",padding:"2rem",color:GRAY}}>Aucune décharge.</div>}
        </div>

        <div className="admin-grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginTop:"1.5rem" }}>
          {[
            ["📋","Total décharges", decharges.length, GREEN],
            ["✅","Traitées", decharges.filter((d:any)=>d.statut==="traitee").length, BLUE],
            ["⏳","En attente", decharges.filter((d:any)=>d.statut==="en_attente").length, ORANGE],
          ].map(([icon,label,val,color])=>(
            <div key={label as string} style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", padding:"1.2rem", display:"flex", alignItems:"center", gap:"1rem" }}>
              <span style={{fontSize:"1.8rem"}}>{icon}</span>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"2rem", fontWeight:900, color:color as string, lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:"0.78rem", color:GRAY }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminNom, setAdminNom] = useState("Admin");
  const [active, setActive]     = useState("overview");
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);

    // Effacer le badge de l'app quand on ouvre le panel
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge().catch(() => {});
    }

    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Vérifier si déjà connecté (token en localStorage)
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me().then(data => {
        setAdminNom(data.nom);
        setLoggedIn(true);
      }).catch(() => {
        removeToken();
      }).finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleLogin = (_token: string, nom: string) => {
    setAdminNom(nom);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    setActive("overview");
  };

  const sections: Record<string, React.ReactNode> = {
    overview:  <Overview/>,
    rdvs:      <Rendez_vous/>,
    tickets:   <Tickets/>,
    clients:   <Clients/>,
    messages:  <Messages/>,
    decharges: <Decharges/>,
    calculateur: <Calculateur/>,
  };

  if (checking) return (
    <div className="admin-wrap" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{globalStyles}</style>
      <div style={{ color:GRAY }}>Vérification de la session...</div>
    </div>
  );

  if (!loggedIn) return (
    <div className="admin-wrap">
      <style>{globalStyles}</style>
      <Login onLogin={handleLogin}/>
    </div>
  );

  return (
    <MobileCtx.Provider value={{ isMobile, openSidebar: () => setSidebarOpen(true) }}>
      <div className="admin-wrap" style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        <style>{globalStyles}</style>
        <Sidebar active={active} setActive={setActive} adminNom={adminNom} onLogout={handleLogout}
          isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <main style={{ flex:1, marginLeft: isMobile ? 0 : 240, display:"flex", flexDirection:"column", overflow:"auto", background:NAVY }}>
          {sections[active]}
        </main>
      </div>
    </MobileCtx.Provider>
  );
}
