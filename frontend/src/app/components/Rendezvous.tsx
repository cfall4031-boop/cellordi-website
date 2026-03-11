import React, { useState } from "react";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn, inputStyle, labelStyle } from "../tokens";
import { rdvApi } from "../../api";

const SERVICES = [
  "Réparation cellulaire",
  "Réparation ordinateur",
  "Service informatique",
  "Développement web",
  "Solution cloud",
  "Contrat d'entretien",
  "Autre",
];

const DISPOS = [
  "Matin (9h–12h)",
  "Après-midi (12h–17h)",
  "Fin de journée (17h–19h)",
];

export function Rendezvous() {
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    service: "", appareil: "", probleme: "",
    date: "", dispo: "", urgence: false,
  });
  const [sent, setSent] = useState(false);
  const [ticketNumero, setTicketNumero] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [hovBtn, setHovBtn] = useState(false);

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
    setLoading(true);
    try {
      const res = await rdvApi.create({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        type_appareil: form.service || form.appareil || "Non spécifié",
        date_rdv: form.date,
        description: `Service: ${form.service} | Appareil: ${form.appareil} | Dispo: ${form.dispo}${form.urgence ? " | URGENT" : ""} | ${form.probleme}`,
      });
      setTicketNumero(res?.ticket?.numero || null);
      setSent(true);
    } catch (err: any) {
      setErreur(err.message || "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="rendezvous"
      style={{ background: NAVY_MID, padding: "7rem 2rem" }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
              Réservation en ligne
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
              Prendre Rendez-vous
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem" }}>
              Remplissez ce formulaire et nous vous confirmons votre RDV sous 1h.
            </p>
          </div>
        </FadeUp>

        {sent ? (
          <FadeUp>
            <div
              style={{
                background: `rgba(109,212,0,0.08)`,
                border: `2px solid ${GREEN}55`,
                borderRadius: "16px",
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h3
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: "1.8rem",
                  color: GREEN,
                  textTransform: "uppercase",
                  marginBottom: "0.8rem",
                }}
              >
                Rendez-vous confirmé !
              </h3>
              <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", marginBottom: "1.5rem" }}>
                Votre demande a bien été reçue. Vous recevrez une confirmation par email.
              </p>

              {ticketNumero && (
                <div
                  style={{
                    background: "rgba(109,212,0,0.06)",
                    border: "1px solid rgba(109,212,0,0.35)",
                    borderRadius: "12px",
                    padding: "1.5rem 2rem",
                    display: "inline-block",
                    marginBottom: "1.5rem",
                  }}
                >
                  <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.8rem", margin: "0 0 0.5rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Votre numéro de suivi
                  </p>
                  <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "2rem", color: GREEN, letterSpacing: "0.15em", margin: 0 }}>
                    {ticketNumero}
                  </p>
                  <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.78rem", margin: "0.5rem 0 0" }}>
                    Conservez ce numéro pour suivre votre réparation
                  </p>
                </div>
              )}

              <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                Utilisez la section <strong style={{ color: GRAY }}>Suivi de ticket</strong> ci-dessous pour suivre l'avancement.
              </p>

              <button
                onClick={() => {
                  setSent(false);
                  setTicketNumero(null);
                  setErreur("");
                  setForm({
                    nom: "", prenom: "", email: "", telephone: "",
                    service: "", appareil: "", probleme: "",
                    date: "", dispo: "", urgence: false,
                  });
                }}
                style={{ ...btn(GREEN, NAVY), marginTop: "0.5rem" }}
              >
                Nouvelle demande
              </button>
            </div>
          </FadeUp>
        ) : (
          <FadeUp delay={0.1}>
            <form
              onSubmit={handleSubmit}
              style={{
                background: NAVY,
                border: "1px solid rgba(109,212,0,0.12)",
                padding: "2.5rem",
              }}
            >
              {/* Identité */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.2rem",
                  marginBottom: "1.2rem",
                }}
                className="rdv-grid"
              >
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Jean"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Dupont"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.2rem",
                  marginBottom: "1.2rem",
                }}
                className="rdv-grid"
              >
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jean@exemple.com"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone *</label>
                  <input
                    name="telephone"
                    type="tel"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="514-555-1234"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Service + Appareil */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.2rem",
                  marginBottom: "1.2rem",
                }}
                className="rdv-grid"
              >
                <div>
                  <label style={labelStyle}>Service souhaité *</label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s} style={{ background: NAVY }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Modèle d'appareil</label>
                  <input
                    name="appareil"
                    value={form.appareil}
                    onChange={handleChange}
                    placeholder="Ex: iPhone 14, Dell XPS 15"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>Description du problème *</label>
                <textarea
                  name="probleme"
                  value={form.probleme}
                  onChange={handleChange}
                  placeholder="Décrivez brièvement le problème rencontré..."
                  required
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: FONT_BODY,
                  }}
                />
              </div>

              {/* Date + Dispo */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.2rem",
                  marginBottom: "1.2rem",
                }}
                className="rdv-grid"
              >
                <div>
                  <label style={labelStyle}>Date souhaitée *</label>
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Disponibilité *</label>
                  <select
                    name="dispo"
                    value={form.dispo}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">-- Choisir --</option>
                    {DISPOS.map((d) => (
                      <option key={d} value={d} style={{ background: NAVY }}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Urgence checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                  marginBottom: "2rem",
                  fontFamily: FONT_BODY,
                  fontSize: "0.9rem",
                  color: GRAY,
                }}
              >
                <input
                  type="checkbox"
                  name="urgence"
                  checked={form.urgence}
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: GREEN,
                    cursor: "pointer",
                  }}
                />
                <span>
                  Réparation urgente — je souhaite être traité en priorité
                  <span style={{ color: GREEN, marginLeft: "0.4rem" }}>+15%</span>
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
                {loading ? "Envoi en cours..." : "Envoyer ma demande de RDV"}
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
