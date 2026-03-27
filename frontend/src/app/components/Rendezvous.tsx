import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import {
  NAVY, NAVY_MID, GREEN, GREEN_GLOW,
  WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY,
  btn, inputStyle, labelStyle,
} from "../tokens";
import { rdvApi, messagesApi } from "../../api";

// ── Heures d'ouverture (fuseau Montréal) ─────────────────────────────────────
const isBusinessOpen = (): boolean => {
  const mtl = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montreal" }));
  const day = mtl.getDay();
  const h = mtl.getHours() + mtl.getMinutes() / 60;
  if (day >= 1 && day <= 5) return h >= 10 && h < 19;
  if (day === 6) return h >= 11 && h < 19;
  return false;
};

// ── Helpers calendrier ────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

// ─────────────────────────────────────────────────────────────────────────────
export function Rendezvous() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Ouverture dynamique
  const [open, setOpen] = useState(isBusinessOpen);
  useEffect(() => {
    const id = setInterval(() => setOpen(isBusinessOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Rappel (hors horaires)
  const [cbPhone, setCbPhone] = useState("");
  const [cbSent, setCbSent] = useState(false);
  const [cbLoading, setCbLoading] = useState(false);
  const handleCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cbPhone.trim()) return;
    setCbLoading(true);
    try {
      await messagesApi.send({
        nom: "Rappel demandé", email: "",
        telephone: cbPhone, sujet: "Rappel demandé",
        message: `Rappel demandé au ${cbPhone}`,
      });
    } catch {}
    setCbSent(true);
    setCbLoading(false);
  };

  // Calendrier
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDate, setSelDate] = useState("");

  // Créneaux
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selHeure, setSelHeure] = useState("");
  useEffect(() => {
    if (!selDate) { setSlots([]); setSelHeure(""); return; }
    setSlotsLoading(true);
    setSelHeure("");
    rdvApi.getSlots(selDate)
      .then((d: any) => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selDate]);

  // Formulaire (sans email)
  const [form, setForm] = useState({
    prenom: "", nom: "", telephone: "",
    service: "", probleme: "", urgence: false,
  });
  const [sent, setSent] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [hovBtn, setHovBtn] = useState(false);

  const SERVICES = t("rdv.services", { returnObjects: true }) as string[];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(p => ({
      ...p,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (!selDate) {
      setErreur(lang === "fr" ? "Veuillez sélectionner une date." : "Please select a date.");
      return;
    }
    if (slots.length > 0 && !selHeure) {
      setErreur(lang === "fr" ? "Veuillez sélectionner un créneau." : "Please select a time slot.");
      return;
    }
    setLoading(true);
    try {
      const res = await rdvApi.create({
        prenom: form.prenom,
        nom: form.nom,
        email: "",
        telephone: form.telephone,
        type_appareil: form.service || "Non spécifié",
        date_rdv: selDate,
        heure: selHeure || undefined,
        description: `Service: ${form.service}${form.urgence ? " | URGENT" : ""} | ${form.probleme}`,
      });
      setTicket(res?.numero_ticket || null);
      setSent(true);
    } catch (err: any) {
      setErreur(err.message || t("rdv.error_default"));
    } finally {
      setLoading(false);
    }
  };

  // ── Grille calendrier ───────────────────────────────────────────────────────
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayRaw = new Date(calYear, calMonth, 1).getDay(); // 0=Dim
  const firstDayMon = (firstDayRaw + 6) % 7; // 0=Lun
  const canGoPrev =
    calYear > today.getFullYear() ||
    (calYear === today.getFullYear() && calMonth > today.getMonth());
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };
  const isDisabled = (d: number) => {
    const ds = toDateStr(calYear, calMonth, d);
    return ds < todayStr || new Date(calYear, calMonth, d).getDay() === 0;
  };
  const monthLabel = (() => {
    const raw = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
      month: "long", year: "numeric",
    }).format(new Date(calYear, calMonth, 1));
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();
  const DAY_NAMES = lang === "fr"
    ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells: (number | null)[] = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // ── Rendu ───────────────────────────────────────────────────────────────────
  return (
    <section id="rendezvous" style={{ background: NAVY_MID, padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{
              fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem",
              color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase",
            }}>
              {t("rdv.tag")}
            </span>
            <h2 style={{
              fontFamily: FONT_DISPLAY, fontWeight: 900,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: WHITE,
              textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.5rem 0 0.6rem",
            }}>
              {t("rdv.title")}
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "0.95rem" }}>
              {t("rdv.subtitle")}
            </p>
          </div>
        </FadeUp>

        {/* ── Succès ── */}
        {sent ? (
          <FadeUp>
            <div style={{
              background: "rgba(109,212,0,0.08)", border: `2px solid ${GREEN}55`,
              borderRadius: "16px", padding: "3rem", textAlign: "center",
              maxWidth: "600px", margin: "0 auto",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h3 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.8rem",
                color: GREEN, textTransform: "uppercase", marginBottom: "0.8rem",
              }}>
                {t("rdv.success.title")}
              </h3>
              <p style={{ fontFamily: FONT_BODY, color: GRAY, marginBottom: "1.5rem" }}>
                {t("rdv.success.text")}
              </p>
              {ticket && (
                <div style={{
                  background: "rgba(109,212,0,0.06)", border: "1px solid rgba(109,212,0,0.35)",
                  borderRadius: "12px", padding: "1.5rem", display: "inline-block", marginBottom: "1.5rem",
                }}>
                  <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.8rem", margin: "0 0 0.4rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {t("rdv.success.ticket_label")}
                  </p>
                  <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "2rem", color: GREEN, margin: 0 }}>
                    {ticket}
                  </p>
                  <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.75rem", margin: "0.4rem 0 0" }}>
                    {t("rdv.success.ticket_hint")}
                  </p>
                </div>
              )}
              <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                {t("rdv.success.suivi_hint")} <strong style={{ color: GRAY }}>{t("rdv.success.suivi_link")}</strong> {t("rdv.success.suivi_suffix")}
              </p>
              <button
                onClick={() => {
                  setSent(false); setTicket(null); setErreur("");
                  setSelDate(""); setSlots("" as any); setSelHeure("");
                  setForm({ prenom: "", nom: "", telephone: "", service: "", probleme: "", urgence: false });
                }}
                style={{ ...btn(GREEN, NAVY) }}
              >
                {t("rdv.success.new")}
              </button>
            </div>
          </FadeUp>
        ) : (

          /* ── Layout 2 colonnes ── */
          <div className="rdv-main-grid" style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}>

            {/* ── GAUCHE : Bloc appel ── */}
            <FadeUp delay={0}>
              <div style={{
                background: "linear-gradient(160deg, rgba(109,212,0,0.07) 0%, rgba(12,12,18,0) 70%)",
                border: `1px solid ${open ? "rgba(109,212,0,0.2)" : "rgba(144,144,168,0.15)"}`,
                borderRadius: "16px",
                padding: "1.8rem",
                position: "sticky",
                top: "80px",
              }}>
                {/* Badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: open ? "rgba(109,212,0,0.1)" : "rgba(144,144,168,0.08)",
                  border: `1px solid ${open ? "rgba(109,212,0,0.25)" : "rgba(144,144,168,0.2)"}`,
                  borderRadius: "50px", padding: "0.25rem 0.75rem", marginBottom: "1.1rem",
                }}>
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%", display: "inline-block",
                    background: open ? GREEN : "#9090a8",
                    animation: open ? "pulse-dot 1.5s ease-in-out infinite" : "none",
                  }} />
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: "0.68rem",
                    color: open ? GREEN : "#9090a8",
                    letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700,
                  }}>
                    {open ? t("rdv.call.badge_open") : t("rdv.call.badge_closed")}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "1.25rem",
                  color: WHITE, margin: "0 0 0.45rem", lineHeight: 1.3,
                }}>
                  {t("rdv.call.title")}<br />{t("rdv.call.title2")}
                </h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: GRAY, margin: "0 0 1.1rem", lineHeight: 1.55 }}>
                  {t("rdv.call.sub")}
                </p>

                {/* Chips verticales */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1.4rem" }}>
                  {(t("rdv.call.chips", { returnObjects: true }) as string[]).map(chip => (
                    <span key={chip} style={{ fontFamily: FONT_BODY, fontSize: "0.76rem", color: GRAY }}>
                      {chip}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                {open ? (
                  <a
                    href="tel:5142375792"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "0.55rem", background: GREEN, color: NAVY,
                      fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "1rem",
                      textDecoration: "none", padding: "0.85rem 1.2rem",
                      borderRadius: "12px", whiteSpace: "nowrap",
                      animation: "ring-pulse 2.2s ease-out infinite",
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.01L6.6 10.8z" />
                    </svg>
                    (514) 237-5792
                  </a>
                ) : cbSent ? (
                  <p style={{ fontFamily: FONT_BODY, fontSize: "0.83rem", color: GREEN, textAlign: "center", margin: 0 }}>
                    {t("rdv.call.callback_sent")}
                  </p>
                ) : (
                  <form onSubmit={handleCallback} style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                    <p style={{ fontFamily: FONT_BODY, fontSize: "0.76rem", color: GRAY, margin: 0, lineHeight: 1.45 }}>
                      {t("rdv.call.callback_title")}
                    </p>
                    <input
                      type="tel"
                      value={cbPhone}
                      onChange={e => setCbPhone(e.target.value)}
                      placeholder={t("rdv.call.callback_placeholder")}
                      required
                      style={{ ...inputStyle, fontSize: "0.83rem", padding: "0.5rem 0.75rem" }}
                    />
                    <button
                      type="submit"
                      disabled={cbLoading}
                      style={{ ...btn(GREEN, NAVY), fontSize: "0.83rem", padding: "0.55rem", opacity: cbLoading ? 0.6 : 1 }}
                    >
                      {cbLoading ? "…" : t("rdv.call.callback_send")}
                    </button>
                  </form>
                )}

                {/* Divider bas */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "1.6rem 0 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(109,212,0,0.1)" }} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: "0.7rem", color: GRAY_DIM, letterSpacing: "0.05em" }}>
                    {t("rdv.call.divider")}
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(109,212,0,0.1)" }} />
                </div>
              </div>
            </FadeUp>

            {/* ── DROITE : Calendrier + Formulaire ── */}
            <FadeUp delay={0.1}>
              <div style={{
                background: NAVY,
                border: "1px solid rgba(109,212,0,0.1)",
                borderRadius: "16px",
                padding: "1.8rem",
              }}>

                {/* ─ Calendrier ─ */}
                <div style={{ marginBottom: "1.4rem" }}>
                  {/* Navigation mois */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <button
                      onClick={prevMonth}
                      disabled={!canGoPrev}
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px", width: "30px", height: "30px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: canGoPrev ? "pointer" : "not-allowed",
                        color: canGoPrev ? WHITE : GRAY_DIM,
                        opacity: canGoPrev ? 1 : 0.3, fontSize: "1.1rem",
                      }}
                    >
                      ‹
                    </button>
                    <span style={{
                      fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.92rem",
                      color: WHITE, textTransform: "capitalize",
                    }}>
                      {monthLabel}
                    </span>
                    <button
                      onClick={nextMonth}
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px", width: "30px", height: "30px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: WHITE, fontSize: "1.1rem",
                      }}
                    >
                      ›
                    </button>
                  </div>

                  {/* Noms des jours */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
                    {DAY_NAMES.map(d => (
                      <div key={d} style={{
                        textAlign: "center", fontFamily: FONT_BODY,
                        fontSize: "0.68rem", color: GRAY_DIM, fontWeight: 600,
                        letterSpacing: "0.03em", padding: "3px 0",
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Grille des jours */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
                    {cells.map((day, idx) => {
                      if (day === null) return <div key={`e-${idx}`} />;
                      const ds = toDateStr(calYear, calMonth, day);
                      const disabled = isDisabled(day);
                      const isToday = ds === todayStr;
                      const isSelected = ds === selDate;
                      const isSat = new Date(calYear, calMonth, day).getDay() === 6;
                      return (
                        <button
                          key={ds}
                          type="button"
                          disabled={disabled}
                          onClick={() => !disabled && setSelDate(ds)}
                          style={{
                            background: isSelected
                              ? GREEN
                              : isToday
                              ? "rgba(109,212,0,0.12)"
                              : "transparent",
                            color: disabled
                              ? "rgba(144,144,168,0.25)"
                              : isSelected
                              ? NAVY
                              : isSat
                              ? "rgba(109,212,0,0.75)"
                              : WHITE,
                            border: isToday && !isSelected
                              ? "1px solid rgba(109,212,0,0.4)"
                              : "1px solid transparent",
                            borderRadius: "8px",
                            padding: "0.42rem 0",
                            fontFamily: FONT_BODY,
                            fontSize: "0.83rem",
                            fontWeight: isSelected ? 700 : 400,
                            cursor: disabled ? "not-allowed" : "pointer",
                            textAlign: "center",
                            transition: "all 0.1s",
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ─ Créneaux ─ */}
                {selDate && (
                  <div style={{ marginBottom: "1.4rem" }}>
                    <p style={{
                      fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.75rem",
                      color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em",
                      margin: "0 0 0.55rem",
                    }}>
                      {lang === "fr" ? "Créneaux disponibles" : "Available Times"}
                    </p>
                    {slotsLoading ? (
                      <p style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY }}>
                        {lang === "fr" ? "Chargement…" : "Loading…"}
                      </p>
                    ) : slots.length === 0 ? (
                      <p style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: "#f59e0b" }}>
                        {lang === "fr"
                          ? "⚠ Aucun créneau disponible ce jour."
                          : "⚠ No slots available this day."}
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                        {slots.map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setSelHeure(h)}
                            style={{
                              background: selHeure === h ? GREEN : "rgba(255,255,255,0.05)",
                              color: selHeure === h ? NAVY : GRAY,
                              border: `1px solid ${selHeure === h ? GREEN : "rgba(109,212,0,0.2)"}`,
                              borderRadius: "8px", padding: "0.38rem 0.85rem",
                              fontFamily: FONT_BODY, fontSize: "0.83rem",
                              fontWeight: selHeure === h ? 700 : 400,
                              cursor: "pointer", transition: "all 0.1s",
                            }}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─ Séparateur ─ */}
                <div style={{ height: "1px", background: "rgba(109,212,0,0.08)", margin: "0 0 1.4rem" }} />

                {/* ─ Formulaire ─ */}
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", marginBottom: "0.9rem" }} className="rdv-grid">
                    <div>
                      <label style={labelStyle}>{t("rdv.fields.prenom")}</label>
                      <input
                        name="prenom" value={form.prenom} onChange={handleChange}
                        placeholder={t("rdv.placeholders.prenom")} required style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t("rdv.fields.nom")}</label>
                      <input
                        name="nom" value={form.nom} onChange={handleChange}
                        placeholder={t("rdv.placeholders.nom")} required style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "0.9rem" }}>
                    <label style={labelStyle}>{t("rdv.fields.telephone")}</label>
                    <input
                      name="telephone" type="tel" value={form.telephone} onChange={handleChange}
                      placeholder={t("rdv.placeholders.telephone")} required style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: "0.9rem" }}>
                    <label style={labelStyle}>{t("rdv.fields.service")}</label>
                    <select
                      name="service" value={form.service} onChange={handleChange}
                      required style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">{t("rdv.fields.select")}</option>
                      {SERVICES.map(s => (
                        <option key={s} value={s} style={{ background: NAVY }}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>{t("rdv.fields.probleme")}</label>
                    <textarea
                      name="probleme" value={form.probleme} onChange={handleChange}
                      placeholder={t("rdv.placeholders.probleme")} required rows={3}
                      style={{ ...inputStyle, resize: "vertical", fontFamily: FONT_BODY }}
                    />
                  </div>

                  <label style={{
                    display: "flex", alignItems: "center", gap: "0.65rem",
                    cursor: "pointer", marginBottom: "1.2rem",
                    fontFamily: FONT_BODY, fontSize: "0.86rem", color: GRAY,
                  }}>
                    <input
                      type="checkbox" name="urgence" checked={form.urgence}
                      onChange={handleChange}
                      style={{ width: "16px", height: "16px", accentColor: GREEN, cursor: "pointer" }}
                    />
                    <span>
                      {t("rdv.fields.urgence")}
                      <span style={{ color: GREEN, marginLeft: "0.35rem" }}>
                        {t("rdv.urgence_surcharge")}
                      </span>
                    </span>
                  </label>

                  {erreur && (
                    <div style={{
                      background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.25)",
                      color: "#ff6060", fontFamily: FONT_BODY, fontSize: "0.83rem",
                      padding: "0.55rem 0.85rem", marginBottom: "0.9rem", borderRadius: "6px",
                    }}>
                      {erreur}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...btn(loading ? "rgba(109,212,0,0.5)" : hovBtn ? GREEN_GLOW : GREEN, NAVY),
                      width: "100%", textAlign: "center",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={() => !loading && setHovBtn(true)}
                    onMouseLeave={() => setHovBtn(false)}
                  >
                    {loading ? t("rdv.sending") : t("rdv.submit")}
                  </button>
                </form>
              </div>
            </FadeUp>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .rdv-main-grid { grid-template-columns: 1fr !important; }
          .rdv-main-grid > div:first-child { position: static !important; }
        }
        @media (max-width: 480px) {
          .rdv-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes ring-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(109,212,0,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(109,212,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(109,212,0,0); }
        }
      `}</style>
    </section>
  );
}
