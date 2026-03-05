import React, { useState } from "react";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, NAVY_LIGHT, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn, inputStyle, labelStyle } from "../tokens";
import { ticketsApi } from "../../api";

type TicketResult = {
  numero: string;
  prenom: string;
  nom: string;
  type_appareil: string;
  probleme: string;
  statut: string;
  date_estimee?: string;
  etape_actuelle: { label: string; index: number };
  toutes_etapes: { label: string }[];
};

export function Suivi() {
  const [ticket, setTicket] = useState("");
  const [result, setResult] = useState<TicketResult | null | "not_found">(null);
  const [loading, setLoading] = useState(false);
  const [hovBtn, setHovBtn] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await ticketsApi.suivi(ticket.trim().toUpperCase());
      setResult(data);
    } catch {
      setResult("not_found");
    } finally {
      setLoading(false);
    }
  };

  const progress = result && result !== "not_found"
    ? Math.round(((result.etape_actuelle.index + 1) / result.toutes_etapes.length) * 100)
    : 0;

  return (
    <section
      id="suivi"
      style={{ background: NAVY, padding: "7rem 2rem" }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: "0.82rem",
                color: GREEN,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Votre réparation
            </span>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 900,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: WHITE,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                margin: "0.6rem 0 1rem",
              }}
            >
              Suivi en Temps Réel
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem" }}>
              Entrez votre numéro de ticket reçu par SMS/email pour suivre l'avancement.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <form onSubmit={handleSearch} style={{ marginBottom: "2rem" }}>
            <label style={labelStyle}>Numéro de ticket</label>
            <div style={{ display: "flex", gap: "0.8rem" }}>
              <input
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                placeholder="Ex: REP-2024-001"
                required
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="submit"
                style={{ ...btn(hovBtn ? GREEN_GLOW : GREEN, NAVY), whiteSpace: "nowrap" }}
                onMouseEnter={() => setHovBtn(true)}
                onMouseLeave={() => setHovBtn(false)}
              >
                Rechercher
              </button>
            </div>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: GRAY_DIM, marginTop: "0.5rem" }}>
              {loading ? "Recherche en cours..." : "Entrez le numéro de ticket reçu par SMS/email (ex: RCO-20260225-001)"}
            </p>
          </form>
        </FadeUp>

        {result === "not_found" && (
          <FadeUp>
            <div
              style={{
                background: "rgba(255,60,60,0.07)",
                border: "1px solid rgba(255,60,60,0.2)",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <span style={{ fontFamily: FONT_BODY, color: "#ff6060", fontSize: "0.95rem" }}>
                ❌ Aucun ticket trouvé avec ce numéro. Vérifiez votre SMS/email de confirmation.
              </span>
            </div>
          </FadeUp>
        )}

        {result && result !== "not_found" && (
          <FadeUp>
            <div
              style={{
                background: NAVY_MID,
                border: `1px solid ${GREEN}33`,
                padding: "2rem",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      color: WHITE,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {ticket.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: GRAY, marginTop: "0.2rem" }}>
                    {result.prenom} {result.nom} · {result.type_appareil}
                  </div>
                </div>
                <span
                  style={{
                    background: `rgba(109,212,0,0.12)`,
                    border: `1px solid ${GREEN}44`,
                    color: GREEN,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    letterSpacing: "0.08em",
                    padding: "0.3rem 0.9rem",
                    textTransform: "uppercase",
                  }}
                >
                  {result.etape_actuelle.label}
                </span>
              </div>

              {/* Details grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.02)",
                  borderLeft: `3px solid ${GREEN}44`,
                }}
                className="suivi-details"
              >
                {[
                  { label: "Appareil", val: result.type_appareil },
                  { label: "Problème", val: result.probleme },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: GRAY_DIM, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: WHITE }}>
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY }}>Progression</span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.9rem", color: GREEN }}>{progress}%</span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "rgba(255,255,255,0.07)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${GREEN}, ${GREEN_GLOW})`,
                      borderRadius: "3px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {result.toutes_etapes.map((step, i) => {
                  const done = i <= result.etape_actuelle.index;
                  const current = i === result.etape_actuelle.index;
                  return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      opacity: done ? 1 : 0.4,
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: done ? GREEN : "transparent",
                        border: `2px solid ${done ? GREEN : GRAY_DIM}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.75rem",
                        color: done ? NAVY : GRAY_DIM,
                        fontWeight: 700,
                      }}
                    >
                      {done ? "✓" : ""}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: done ? WHITE : GRAY_DIM }}>
                        {step.label}
                        {current && (
                          <span style={{ color: GREEN, marginLeft: "0.5rem", fontSize: "0.75rem", fontWeight: 700 }}>
                            ← En cours
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </FadeUp>
        )}
      </div>

      <style>{`
        @media (max-width: 500px) {
          .suivi-details { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
