import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, GREEN_GLOW, WHITE, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

// Téléphone cassé — fond noir naturel
const PHONE_IMG = "/phone-cracked.jpg";

export function Hero() {
  const { t } = useTranslation();
  const [hovCta, setHovCta] = useState(false);
  const [hovSec, setHovSec] = useState(false);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: NAVY,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >


      {/* ── Ligne verte top gauche ── */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "30%", height: "2px",
        background: `linear-gradient(90deg, ${GREEN}bb, transparent)`,
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* ══════════════════════════════════════════════════
          COLONNE GAUCHE — Contenu texte + CTAs
      ══════════════════════════════════════════════════ */}
      <div
        id="hero-left"
        style={{
          flex: "0 0 50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 4rem 0 4rem",
          paddingTop: "120px",
          paddingBottom: "80px",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Badge diagnostic gratuit */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.55rem",
          background: "rgba(109,212,0,0.08)",
          border: "1px solid rgba(109,212,0,0.25)",
          borderRadius: "100px",
          padding: "0.35rem 1.1rem",
          marginBottom: "2rem",
          width: "fit-content",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "0.75rem",
            color: GREEN,
            letterSpacing: "0.16em",
            fontWeight: 700,
            textTransform: "uppercase" as const,
          }}>
            {t("hero.tag")}
          </span>
        </div>

        {/* H1 — punch court */}
        <h1 style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 900,
          fontSize: "clamp(2.8rem, 5vw, 5rem)",
          color: WHITE,
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          textTransform: "uppercase" as const,
          margin: "0 0 0.6rem",
        }}>
          {t("hero.main_title")}
        </h1>

        {/* Sous-titre service — vert */}
        <p style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
          color: GREEN,
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
          margin: "0 0 2.8rem",
          opacity: 0.9,
        }}>
          {t("hero.headline2")}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" as const }}>
          <a
            href="tel:5142375792"
            style={{
              ...btn(hovCta ? GREEN_GLOW : GREEN, "#0c0c12"),
              fontSize: "0.95rem",
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              boxShadow: hovCta ? `0 0 28px rgba(109,212,0,0.55)` : `0 0 14px rgba(109,212,0,0.28)`,
              padding: "0.85rem 1.8rem",
              borderRadius: "6px",
            }}
            onMouseEnter={() => setHovCta(true)}
            onMouseLeave={() => setHovCta(false)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.01L6.6 10.8z"/>
            </svg>
            {t("hero.cta_call")}
          </a>
          <a
            href="#suivi"
            style={{
              ...btn("transparent", hovSec ? GREEN : WHITE),
              border: `1px solid ${hovSec ? GREEN : "rgba(255,255,255,0.22)"}`,
              fontSize: "0.95rem",
              padding: "0.85rem 1.8rem",
              borderRadius: "6px",
            }}
            onMouseEnter={() => setHovSec(true)}
            onMouseLeave={() => setHovSec(false)}
          >
            {t("hero.cta_suivi")} →
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          COLONNE DROITE — Téléphone cassé (principal)
      ══════════════════════════════════════════════════ */}
      <div
        id="hero-right"
        style={{
          flex: "0 0 50%",
          position: "relative",
          overflow: "visible",
          zIndex: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Fondu haut — image vers fond hero */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "35%",
          background: `linear-gradient(to bottom, ${NAVY} 0%, transparent 100%)`,
          pointerEvents: "none", zIndex: 7,
        }} />
        {/* Fondu bas — vers couleur de la section suivante */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "30%",
          background: `linear-gradient(to top, #101016 0%, transparent 100%)`,
          pointerEvents: "none", zIndex: 7,
        }} />
        {/* Fondu gauche */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0,
          width: "12%",
          background: `linear-gradient(to right, ${NAVY} 0%, transparent 100%)`,
          pointerEvents: "none", zIndex: 7,
        }} />

        {/* Téléphone cassé — fond noir, affiché directement */}
        <img
          id="hero-phone"
          src={PHONE_IMG}
          alt="Téléphone écran cassé"
          style={{
            position: "relative",
            width: "85%",
            maxWidth: "480px",
            transform: "rotate(-5deg) translateY(-20px)",
            zIndex: 6,
          }}
        />

      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.6); }
        }
        @media (max-width: 900px) {
          #hero {
            flex-direction: column !important;
            align-items: stretch !important;
            min-height: unset !important;
          }
          #hero-left {
            flex: none !important;
            padding: 1.8rem !important;
            padding-top: 110px !important;
            padding-bottom: 2rem !important;
          }
          #hero-right {
            flex: none !important;
            height: 420px !important;
            overflow: hidden !important;
          }
          #hero-phone {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center top !important;
            transform: none !important;
            position: absolute !important;
            top: 0; left: 0;
          }
        }
      `}</style>
    </section>
  );
}
