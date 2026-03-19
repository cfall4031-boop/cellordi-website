import React, { useState, useEffect, useCallback } from "react";
import {
  authApi, rdvApi, ticketsApi, clientsApi,
  messagesApi, dechargesApi, setToken, removeToken, getToken
} from "../../api";

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
      <div style={{ width:400, animation:"adminFadeIn 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.8rem", fontWeight:900, marginBottom:"0.3rem" }}>
            RÉPARATION <span style={{color:GREEN}}>CeLL&amp;Ordi</span>
          </div>
          <div style={{ fontSize:"0.82rem", color:GRAY, letterSpacing:"0.1em", textTransform:"uppercase" }}>
            Panneau d'administration
          </div>
        </div>
        <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.15)", padding:"2.5rem" }}>
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
];

function Sidebar({ active, setActive, adminNom, onLogout }: {
  active: string; setActive: (s: string) => void;
  adminNom: string; onLogout: () => void;
}) {
  return (
    <aside style={{
      width:240, flexShrink:0, background:NAVY_MID,
      borderRight:"1px solid rgba(109,212,0,0.1)",
      display:"flex", flexDirection:"column",
      position:"fixed", top:0, left:0, bottom:0, zIndex:50
    }}>
      <div style={{ padding:"1.5rem 1.2rem", borderBottom:"1px solid rgba(109,212,0,0.1)" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:"1.1rem" }}>
          RÉPARATION <span style={{color:GREEN}}>CeLL&amp;Ordi</span>
        </div>
        <div style={{ fontSize:"0.7rem", color:GRAY_DIM, letterSpacing:"0.08em", marginTop:"0.2rem" }}>ADMIN PANEL</div>
      </div>

      <nav style={{ flex:1, padding:"1rem 0", overflowY:"auto" }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={()=>setActive(item.id)} style={{
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
  );
}

// ── TOPBAR ────────────────────────────────────────────────────
function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const now = new Date().toLocaleDateString("fr-CA", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  return (
    <div style={{ padding:"1.5rem 2rem", borderBottom:"1px solid rgba(109,212,0,0.1)",
      display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.6rem", fontWeight:900, margin:0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize:"0.82rem", color:GRAY, marginTop:"0.1rem", margin:0 }}>{subtitle}</p>}
      </div>
      <div style={{ fontSize:"0.82rem", color:GRAY_DIM }}>{now}</div>
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
      <div style={{ padding:"2rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
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

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
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
function Rendez_vous() {
  const [rdvs, setRdvs]     = useState<any[]>([]);
  const [filter, setFilter] = useState("actifs");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    rdvApi.getAll().then((d:any) => setRdvs(d.rendezvous || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered =
    filter === "actifs"   ? rdvs.filter((r:any) => ["en_attente","confirme"].includes(r.statut)) :
    filter === "archives" ? rdvs.filter((r:any) => ["complete","annule"].includes(r.statut)) :
    filter === "tous"     ? rdvs :
    rdvs.filter((r:any) => r.statut === filter);

  const changeStatut = async (id: number, statut: string) => {
    try {
      await rdvApi.updateStatut(id, statut);
      setRdvs(prev => prev.map((x:any) => x.id === id ? {...x, statut} : x));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="admin-fade">
      <Topbar title="Rendez-vous" subtitle={`${filtered.length} rendez-vous`}/>
      <div style={{ padding:"1.5rem 2rem" }}>
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          {["actifs","en_attente","confirme","archives","tous"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              background:filter===f ? (f==="archives"?"rgba(255,255,255,0.12)":GREEN) : "rgba(255,255,255,0.05)",
              color:filter===f ? (f==="archives"?"#fff":NAVY) : (f==="archives"?GRAY:"#fff"),
              border:`1px solid ${f==="archives"?"rgba(255,255,255,0.15)":"rgba(109,212,0,0.2)"}`,
              padding:"0.4rem 1rem", fontSize:"0.82rem", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s"
            }}>
              {f==="actifs" ? "✓ Actifs" : f==="archives" ? "🗃 Archives" : f==="tous" ? "Tous" : statutColors[f]?.label||f}
            </button>
          ))}
          <button onClick={load} style={{ background:"transparent", color:GRAY, border:"1px solid rgba(255,255,255,0.1)",
            padding:"0.4rem 1rem", fontSize:"0.82rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginLeft:"auto" }}>
            ↻ Actualiser
          </button>
        </div>
        {loading ? <div style={{color:GRAY,textAlign:"center",padding:"2rem"}}>Chargement...</div> : (
        <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", overflowX:"auto" }}>
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
                  <td style={{...tdStyle, color:GRAY}}>{r.telephone}</td>
                  <td style={tdStyle}>{r.type_appareil}</td>
                  <td style={{...tdStyle, color:GRAY}}>{r.date_rdv}</td>
                  <td style={tdStyle}>
                    <span style={{background:GREEN_DIM,color:GREEN,padding:"0.2rem 0.5rem",fontWeight:600,fontSize:"0.82rem"}}>
                      {r.heure || "—"}
                    </span>
                  </td>
                  <td style={tdStyle}><Badge statut={r.statut}/></td>
                  <td style={tdStyle}>
                    <select value={r.statut} onChange={e=>changeStatut(r.id,e.target.value)}
                      style={{ background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                        fontSize:"0.78rem", padding:"0.3rem 0.5rem", cursor:"pointer", outline:"none" }}>
                      <option value="en_attente">En attente</option>
                      <option value="confirme">Confirmer</option>
                      <option value="complete">Compléter</option>
                      <option value="annule">Annuler</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"3rem", color:GRAY }}>Aucun rendez-vous pour ce filtre.</div>
          )}
        </div>
        )}
      </div>
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

  const statutsList = ["recu","diagnostic","en_cours","termine","pret","livre"];

  return (
    <div className="admin-fade" style={{display:"flex", height:"100%"}}>
      <div style={{flex:1, overflow:"auto"}}>
        <Topbar title="Tickets de Réparation" subtitle={`${filtered.length} ticket${filtered.length !== 1 ? "s" : ""} actif${filtered.length !== 1 ? "s" : ""}${!showArchived ? " — livrés masqués" : ""}`}/>
        <div style={{ padding:"1.5rem 2rem" }}>
          <div style={{display:"flex", gap:"0.8rem", marginBottom:"1.2rem"}}>
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
          <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", overflowX:"auto" }}>
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
                    <td style={tdStyle}>
                      <select value={t.statut} onChange={e=>{e.stopPropagation();changeStatut(t.id,e.target.value);}}
                        onClick={e=>e.stopPropagation()}
                        style={{ background:NAVY, border:"1px solid rgba(109,212,0,0.2)", color:"#fff",
                          fontSize:"0.78rem", padding:"0.3rem 0.5rem", cursor:"pointer", outline:"none" }}>
                        {statutsList.map(s=><option key={s} value={s}>{statutColors[s]?.label||s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{textAlign:"center",padding:"3rem",color:GRAY}}>Aucun ticket trouvé.</div>}
          </div>
          )}
        </div>
      </div>

      {/* Panneau détail */}
      {selected && (
        <div style={{ width:300, background:NAVY_MID, borderLeft:"1px solid rgba(109,212,0,0.15)",
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
      <div style={{background:NAVY_MID,border:"1px solid rgba(109,212,0,0.2)",padding:"2rem",width:500,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.3rem",fontWeight:900}}>Nouveau Ticket</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:GRAY,cursor:"pointer",fontSize:"1.3rem"}}>✕</button>
        </div>
        <form onSubmit={handle}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
            {field("prenom","Prénom *",{required:true,placeholder:"Jean"})}
            {field("nom","Nom *",{required:true,placeholder:"Dupont"})}
            {field("email","Email *",{required:true,type:"email",placeholder:"jean@ex.com"})}
            {field("telephone","Téléphone",{placeholder:"514-555-1234"})}
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
        <div style={{ padding:"1.5rem 2rem" }}>
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
        <div style={{ width:300, background:NAVY_MID, borderLeft:"1px solid rgba(109,212,0,0.15)",
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

  const visibleMsgs = msgs.filter((m:any) => showArchived ? m.archived === 1 : !m.archived);
  const nonLus = msgs.filter((m:any)=>!m.lu && !m.archived).length;

  return (
    <div className="admin-fade" style={{display:"flex",height:"100%"}}>
      {/* ── Liste des messages ── */}
      <div style={{width:340,borderRight:"1px solid rgba(109,212,0,0.1)",display:"flex",flexDirection:"column"}}>
        <div style={{ padding:"1.2rem 1.5rem", borderBottom:"1px solid rgba(109,212,0,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.4rem", fontWeight:900, margin:0 }}>Messages</h2>
              <p style={{ fontSize:"0.8rem", color:GRAY, marginTop:"0.2rem", margin:0 }}>
                {showArchived ? `${visibleMsgs.length} archivé${visibleMsgs.length !== 1 ? "s" : ""}` : `${nonLus} non lu${nonLus !== 1 ? "s" : ""}`}
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
                <span style={{ fontWeight:m.lu?400:600, fontSize:"0.9rem" }}>{m.nom}</span>
                <div style={{ display:"flex", gap:"0.3rem", alignItems:"center" }}>
                  {m.archived === 1
                    ? <span style={{ fontSize:"0.65rem", background:"rgba(255,255,255,0.06)", color:GRAY_DIM, padding:"1px 6px", borderRadius:2 }}>Archivé</span>
                    : m.repondu
                      ? <span style={{ fontSize:"0.65rem", background:"rgba(109,212,0,0.15)", color:GREEN, padding:"1px 6px", borderRadius:2, fontWeight:600 }}>Répondu</span>
                      : !m.lu && <span style={{ width:8,height:8,borderRadius:"50%",background:GREEN,display:"inline-block" }}/>
                  }
                </div>
              </div>
              <div style={{ fontSize:"0.82rem", color:GREEN, marginBottom:"0.3rem", fontWeight:500 }}>{m.sujet}</div>
              <div style={{ fontSize:"0.78rem", color:GRAY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.message}</div>
              <div style={{ fontSize:"0.72rem", color:GRAY_DIM, marginTop:"0.3rem" }}>
                {new Date(m.created_at).toLocaleDateString("fr-CA")}
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
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {selected ? (
          <>
            {/* En-tête */}
            <div style={{ padding:"1.5rem 2rem", borderBottom:"1px solid rgba(109,212,0,0.1)", flexShrink:0 }}>
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
                <button onClick={() => toggleArchive(selected)} style={{
                  marginLeft:"auto", background: selected.archived ? "rgba(109,212,0,0.08)" : "rgba(255,255,255,0.05)",
                  color: selected.archived ? GREEN : GRAY,
                  border: `1px solid ${selected.archived ? "rgba(109,212,0,0.25)" : "rgba(255,255,255,0.1)"}`,
                  padding:"0.3rem 0.9rem", cursor:"pointer", fontSize:"0.78rem",
                  fontFamily:"'DM Sans',sans-serif", borderRadius:2, whiteSpace:"nowrap",
                }}>
                  {selected.archived ? "↩ Désarchiver" : "🗃 Archiver"}
                </button>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div style={{ flex:1, padding:"2rem", overflowY:"auto", display:"flex", flexDirection:"column", gap:"1.5rem" }}>

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
      <div style={{ padding:"1.5rem 2rem" }}>
        {loading ? <div style={{color:GRAY,textAlign:"center",padding:"2rem"}}>Chargement...</div> : (
        <>
        <div style={{ background:NAVY_MID, border:"1px solid rgba(109,212,0,0.12)", overflowX:"auto" }}>
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

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginTop:"1.5rem" }}>
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
    <div className="admin-wrap" style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <style>{globalStyles}</style>
      <Sidebar active={active} setActive={setActive} adminNom={adminNom} onLogout={handleLogout}/>
      <main style={{ flex:1, marginLeft:240, display:"flex", flexDirection:"column", overflow:"auto", background:NAVY }}>
        {sections[active]}
      </main>
    </div>
  );
}
