import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, NAVY_MID, GREEN, GREEN_GLOW, WHITE, GRAY, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

const HERO_IMG = "https://images.unsplash.com/photo-1746005718004-1f992c399428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwcmVwYWlyJTIwdGVjaG5pY2lhbiUyMHNjcmVlbiUyMHJlcGxhY2VtZW50fGVufDF8fHx8MTc3MjAwODQ4OHww&ixlib=rb-4.1.0&q=80&w=1080";

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
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "700px",
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(109,212,0,0.13) 0%, rgba(40,100,0,0.07) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(109,212,0,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(60px)",
        }}
      />
      {/* Image de fond (fallback subtil) */}
      <img
        src={HERO_IMG}
        alt={t("hero.img_alt")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 1,
          opacity: 0.15,
        }}
      />

      {/* Vidéo cinématique en fond */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          zIndex: 1,
          opacity: 0.38,
          pointerEvents: "none",
        }}
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, ${NAVY}99 0%, ${NAVY}55 40%, ${NAVY}77 75%, ${NAVY} 100%)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to right, ${NAVY}dd 0%, ${NAVY}77 50%, ${NAVY}33 100%)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Coupure arrondie bas avec CTA — style iSaute */}
      <div
        style={{
          position: "absolute",
          bottom: -2,
          left: "-8%",
          right: "-8%",
          background: NAVY_MID,
          borderRadius: "50% 50% 0 0",
          paddingTop: "95px",
          paddingBottom: "44px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.2rem",
          flexWrap: "wrap",
          zIndex: 6,
        }}
      >
        <a
          href="#rendezvous"
          style={{
            ...btn(hovCta ? GREEN_GLOW : GREEN, "#0c0c12"),
            fontSize: "1rem",
            boxShadow: hovCta ? `0 0 24px rgba(109,212,0,0.5)` : `0 0 12px rgba(109,212,0,0.25)`,
          }}
          onMouseEnter={() => setHovCta(true)}
          onMouseLeave={() => setHovCta(false)}
        >
          {t("hero.cta_rdv")}
        </a>
        <a
          href="#suivi"
          style={{
            ...btn("transparent", hovSec ? GREEN : WHITE),
            border: `1px solid ${hovSec ? GREEN : "rgba(255,255,255,0.25)"}`,
            fontSize: "1rem",
          }}
          onMouseEnter={() => setHovSec(true)}
          onMouseLeave={() => setHovSec(false)}
        >
          {t("hero.cta_suivi")}
        </a>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(-52deg, rgba(109,212,0,0.018) 0px, rgba(109,212,0,0.018) 1px, transparent 1px, transparent 64px)`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "35%",
          height: "2px",
          background: `linear-gradient(90deg, ${GREEN}bb, transparent)`,
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          width: "100%",
          position: "relative",
          zIndex: 5,
          paddingTop: "100px",
          paddingBottom: "100px",
        }}
      >
        <div style={{ maxWidth: "960px", textAlign: "center", margin: "0 auto" }}>

          {/* Badge tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "rgba(109,212,0,0.07)",
              border: "1px solid rgba(109,212,0,0.22)",
              borderRadius: "100px",
              padding: "0.4rem 1.2rem",
              marginBottom: "1.8rem",
            }}
          >
            <span style={{ color: GREEN, fontSize: "0.6rem", opacity: 0.85 }}>✦</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.78rem", color: GREEN, letterSpacing: "0.18em", fontWeight: 700, textTransform: "uppercase" }}>
              {t("hero.tag")}
            </span>
            <span style={{ color: GREEN, fontSize: "0.6rem", opacity: 0.85 }}>✦</span>
          </div>

          {/* Grand titre d'impact — style iSaute */}
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)",
              color: WHITE,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              margin: "0 0 1.8rem",
            }}
          >
            Réparation Cellulaires & Ordinateurs — Experts à votre service
          </h1>

          {/* Description */}
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.75,
              marginBottom: "2.8rem",
              fontWeight: 500,
              maxWidth: "680px",
              margin: "0 auto 2.8rem",
            }}
          >
            {t("hero.subtitle")}
          </p>

        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(1.5); }
        }
        @keyframes underlineGlow {
          0%, 100% { opacity: 1;   filter: blur(0px);   width: 100%; }
          50%       { opacity: 0.7; filter: blur(1.5px); width: 85%; }
        }
        @media (max-width: 768px) {
          section#hero img {
            width: 100%;
            opacity: 0.1;
          }
          section#hero video {
            opacity: 0.22;
          }
        }
      `}</style>
    </section>
  );
}
