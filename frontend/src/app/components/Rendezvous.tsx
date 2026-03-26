import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn, inputStyle, labelStyle } from "../tokens";
import { rdvApi } from "../../api";


export function Rendezvous() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    service: "", appareil: "", probleme: "",
    date: "", heure: "", urgence: false,
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [ticketNumero, setTicketNumero] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [hovBtn, setHovBtn] = useState(false);

  const SERVICES = t("rdv.services", { returnObjects: true }) as string[];

  // Charger les créneaux disponibles quand la date change
  useEffect(() => {
    if (!form.date) { setSlots([]); return; }
    setSlotsLoading(true);
    setForm(prev => ({ ...prev, heure: "" })); // reset créneau si date change
    rdvApi.getSlots(form.date)
      .then((d: any) => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [form.date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    // Validation créneau
    if (form.date && slots.length > 0 && !form.heure) {
      setErreur("Veuillez sélectionner un créneau horaire.");
      return;
    }
    setLoading(true);
    try {
      const res = await rdvApi.create({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        type_appareil: form.service || form.appareil || "Non spécifié",
        date_rdv: form.date,
        heure: form.heure || undefined,
        description: `Service: ${form.service} | Appareil: ${form.appareil}${form.urgence ? " | URGENT" : ""} | ${form.probleme}`,
      });
      setTicketNumero(res?.numero_ticket || null);
      setSent(true);
    } catch (err: any) {
      setErreur(err.message || t("rdv.error_default"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rendezvous" style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {t("rdv.tag")}
            </span>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
              {t("rdv.title")}
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem" }}>
              {t("rdv.subtitle")}
            </p>
          </div>
        </FadeUp>

        {sent ? (
          <FadeUp>
            <div style={{ background: `rgba(109,212,0,0.08)`, border: `2px solid ${GREEN}55`, borderRadius: "16px", padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.8rem", color: GREEN, textTransform: "uppercase", marginBottom: "0.8rem" }}>
                {t("rdv.success.title")}
              </h3>
              <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", marginBottom: "1.5rem" }}>
                {t("rdv.success.text")}
              </p>

              {ticketNumero && (
                <div style={{ background: "rgba(109,212,0,0.06)", border: "1px solid rgba(109,212,0,0.35)", borderRadius: "12px", padding: "1.5rem 2rem", display: "inline-block", marginBottom: "1.5rem" }}>
                  <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.8rem", margin: "0 0 0.5rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {t("rdv.success.ticket_label")}
                  </p>
                  <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "2rem", color: GREEN, letterSpacing: "0.15em", margin: 0 }}>
                    {ticketNumero}
                  </p>
                  <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.78rem", margin: "0.5rem 0 0" }}>
                    {t("rdv.success.ticket_hint")}
                  </p>
                </div>
              )}

              <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                {t("rdv.success.suivi_hint")} <strong style={{ color: GRAY }}>{t("rdv.success.suivi_link")}</strong> {t("rdv.success.suivi_suffix")}
              </p>

              <button
                onClick={() => {
                  setSent(false);
                  setTicketNumero(null);
                  setErreur("");
                  setForm({ nom: "", prenom: "", email: "", telephone: "", service: "", appareil: "", probleme: "", date: "", heure: "", urgence: false });
                  setSlots([]);
                }}
                style={{ ...btn(GREEN, NAVY), marginTop: "0.5rem" }}
              >
                {t("rdv.success.new")}
              </button>
            </div>
          </FadeUp>
        ) : (
          <FadeUp delay={0.1}>
            <form onSubmit={handleSubmit} style={{ background: NAVY, border: "1px solid rgba(109,212,0,0.12)", padding: "2.5rem" }}>
              {/* Identity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                <div>
                  <label style={labelStyle}>{t("rdv.fields.prenom")}</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange} placeholder={t("rdv.placeholders.prenom")} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t("rdv.fields.nom")}</label>
                  <input name="nom" value={form.nom} onChange={handleChange} placeholder={t("rdv.placeholders.nom")} required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                <div>
                  <label style={labelStyle}>{t("rdv.fields.email")}</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder={t("rdv.placeholders.email")} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t("rdv.fields.telephone")}</label>
                  <input name="telephone" type="tel" value={form.telephone} onChange={handleChange} placeholder={t("rdv.placeholders.telephone")} required style={inputStyle} />
                </div>
              </div>

              {/* Service + Device */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }} className="rdv-grid">
                <div>
                  <label style={labelStyle}>{t("rdv.fields.service")}</label>
                  <select name="service" value={form.service} onChange={handleChange} required style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">{t("rdv.fields.select")}</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s} style={{ background: NAVY }}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t("rdv.fields.appareil")}</label>
                  <input name="appareil" value={form.appareil} onChange={handleChange} placeholder={t("rdv.placeholders.appareil")} style={inputStyle} />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>{t("rdv.fields.probleme")}</label>
                <textarea name="probleme" value={form.probleme} onChange={handleChange} placeholder={t("rdv.placeholders.probleme")} required rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: FONT_BODY }} />
              </div>

              {/* Date */}
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>{t("rdv.fields.date")}</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} required
                  style={{ ...inputStyle, colorScheme: "dark", maxWidth: "300px" }} />
              </div>

              {/* Créneaux dynamiques */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>{t("rdv.fields.dispo")}</label>
                {!form.date && (
                  <p style={{ color: GRAY_DIM, fontFamily: FONT_BODY, fontSize: "0.88rem", margin: "0.3rem 0 0" }}>
                    ← Choisissez d'abord une date ci-dessus
                  </p>
                )}
                {form.date && slotsLoading && (
                  <p style={{ color: GRAY, fontFamily: FONT_BODY, fontSize: "0.88rem", margin: "0.3rem 0 0" }}>
                    Chargement des créneaux…
                  </p>
                )}
                {form.date && !slotsLoading && slots.length === 0 && (
                  <p style={{ color: "#f59e0b", fontFamily: FONT_BODY, fontSize: "0.88rem", margin: "0.3rem 0 0" }}>
                    ⚠ Aucun créneau disponible ce jour (fermé ou non configuré).
                  </p>
                )}
                {slots.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {slots.map(h => (
                      <button key={h} type="button" onClick={() => setForm(p => ({ ...p, heure: h }))}
                        style={{
                          background: form.heure === h ? GREEN : "rgba(255,255,255,0.04)",
                          color: form.heure === h ? NAVY : GRAY,
                          border: `1px solid ${form.heure === h ? GREEN : "rgba(109,212,0,0.25)"}`,
                          padding: "0.45rem 1rem", fontSize: "0.9rem",
                          cursor: "pointer", fontFamily: FONT_BODY,
                          fontWeight: form.heure === h ? 700 : 400,
                          transition: "all 0.15s",
                        }}>
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Urgency */}
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", marginBottom: "2rem", fontFamily: FONT_BODY, fontSize: "0.9rem", color: GRAY }}>
                <input
                  type="checkbox"
                  name="urgence"
                  checked={form.urgence}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: GREEN, cursor: "pointer" }}
                />
                <span>
                  {t("rdv.fields.urgence")}
                  <span style={{ color: GREEN, marginLeft: "0.4rem" }}>{t("rdv.urgence_surcharge")}</span>
                </span>
              </label>

              {erreur && (
                <div style={{ background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.25)", color: "#ff6060", fontFamily: FONT_BODY, fontSize: "0.88rem", padding: "0.7rem 1rem", marginBottom: "1rem" }}>
                  {erreur}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ ...btn(loading ? "rgba(109,212,0,0.5)" : hovBtn ? GREEN_GLOW : GREEN, NAVY), width: "100%", textAlign: "center", cursor: loading ? "not-allowed" : "pointer" }}
                onMouseEnter={() => !loading && setHovBtn(true)}
                onMouseLeave={() => setHovBtn(false)}
              >
                {loading ? t("rdv.sending") : t("rdv.submit")}
              </button>
            </form>
          </FadeUp>
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
