import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, NAVY_LIGHT, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn, inputStyle, labelStyle } from "../tokens";
import { ticketsApi } from "../../api";

type TicketUpdate = {
  id: number;
  message: string;
  created_at: string;
};

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
  updates?: TicketUpdate[];
};

export function Suivi() {
  const { t } = useTranslation();
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
    <section id="suivi" style={{ background: NAVY, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {t("suivi.tag")}
            </span>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
              {t("suivi.title")}
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem" }}>
              {t("suivi.subtitle")}
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <form onSubmit={handleSearch} style={{ marginBottom: "2rem" }}>
            <label style={labelStyle}>{t("suivi.label")}</label>
            <div style={{ display: "flex", gap: "0.8rem" }}>
              <input
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                placeholder={t("suivi.placeholder")}
                required
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="submit"
                style={{ ...btn(hovBtn ? GREEN_GLOW : GREEN, NAVY), whiteSpace: "nowrap" }}
                onMouseEnter={() => setHovBtn(true)}
                onMouseLeave={() => setHovBtn(false)}
              >
                {t("suivi.btn")}
              </button>
            </div>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: GRAY_DIM, marginTop: "0.5rem" }}>
              {loading ? t("suivi.loading") : t("suivi.hint")}
            </p>
          </form>
        </FadeUp>

        {result === "not_found" && (
          <FadeUp>
            <div style={{ background: "rgba(255,60,60,0.07)", border: "1px solid rgba(255,60,60,0.2)", padding: "1.5rem", textAlign: "center" }}>
              <span style={{ fontFamily: FONT_BODY, color: "#ff6060", fontSize: "0.95rem" }}>
                {t("suivi.not_found")}
              </span>
            </div>
          </FadeUp>
        )}

        {result && result !== "not_found" && (
          <FadeUp>
            <div style={{ background: NAVY_MID, border: `1px solid ${GREEN}33`, padding: "2rem" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.1rem", color: WHITE, letterSpacing: "0.05em" }}>
                    {ticket.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: GRAY, marginTop: "0.2rem" }}>
                    {result.prenom} {result.nom} · {result.type_appareil}
                  </div>
                </div>
                <span style={{ background: `rgba(109,212,0,0.12)`, border: `1px solid ${GREEN}44`, color: GREEN, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.08em", padding: "0.3rem 0.9rem", textTransform: "uppercase" }}>
                  {result.etape_actuelle.label}
                </span>
              </div>

              {/* Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${GREEN}44` }} className="suivi-details">
                {[
                  { label: t("suivi.result.device"), val: result.type_appareil },
                  { label: t("suivi.result.problem"), val: result.probleme },
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
                  <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY }}>{t("suivi.result.progress")}</span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.9rem", color: GREEN }}>{progress}%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${GREEN}, ${GREEN_GLOW})`, borderRadius: "3px", transition: "width 1s ease" }} />
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {result.toutes_etapes.map((step, i) => {
                  const done = i <= result.etape_actuelle.index;
                  const current = i === result.etape_actuelle.index;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", opacity: done ? 1 : 0.4 }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: done ? GREEN : "transparent",
                        border: `2px solid ${done ? GREEN : GRAY_DIM}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, fontSize: "0.75rem",
                        color: done ? NAVY : GRAY_DIM, fontWeight: 700,
                      }}>
                        {done ? "✓" : ""}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: done ? WHITE : GRAY_DIM }}>
                          {step.label}
                          {current && (
                            <span style={{ color: GREEN, marginLeft: "0.5rem", fontSize: "0.75rem", fontWeight: 700 }}>
                              {t("suivi.result.in_progress")}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tracking updates timeline */}
              {result.updates && result.updates.length > 0 && (
                <div style={{ marginTop: "1.8rem", borderTop: `1px solid ${GREEN}22`, paddingTop: "1.5rem" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.85rem", color: GREEN,
                    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.2rem" }}>
                    {t("suivi.result.updates_title")}
                  </div>
                  <div style={{ borderLeft: `2px solid ${GREEN}33`, paddingLeft: "1.2rem", display: "flex",
                    flexDirection: "column", gap: "1rem" }}>
                    {result.updates.map((u) => (
                      <div key={u.id} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: "-1.55rem", top: "0.35rem", width: "10px",
                          height: "10px", borderRadius: "50%", background: GREEN }} />
                        <div style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: GRAY_DIM, marginBottom: "0.25rem" }}>
                          {new Date(u.created_at).toLocaleString("fr-CA", {
                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                        <div style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: WHITE, lineHeight: 1.5 }}>
                          {u.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
