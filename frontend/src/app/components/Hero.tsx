import React, { useState } from "react";
import { NAVY, GREEN, GREEN_GLOW, WHITE, GRAY, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

const HERO_IMG = "https://images.unsplash.com/photo-1746005718004-1f992c399428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwcmVwYWlyJTIwdGVjaG5pY2lhbiUyMHNjcmVlbiUyMHJlcGxhY2VtZW50fGVufDF8fHx8MTc3MjAwODQ4OHww&ixlib=rb-4.1.0&q=80&w=1080";

export function Hero() {
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
      {/* ── Atmospheric glow blob — centre-haut ── */}
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

      {/* Glow secondaire — coin gauche bas */}
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

      {/* Full-bleed image — fondue dans le fond */}
      <img
        src={HERO_IMG}
        alt="Réparation téléphone"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 1,
          opacity: 0.7,
        }}
      />

      {/* Gradient image → fond vertical */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
            to bottom,
            ${NAVY}cc 0%,
            ${NAVY}88 40%,
            ${NAVY}aa 75%,
            ${NAVY} 100%
          )`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Fade right → left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
            to right,
            ${NAVY}ee 0%,
            ${NAVY}99 50%,
            ${NAVY}55 100%
          )`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Noise / grain subtil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            -52deg,
            rgba(109,212,0,0.018) 0px,
            rgba(109,212,0,0.018) 1px,
            transparent 1px,
            transparent 64px
          )`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Ligne accent verte haut gauche */}
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

      {/* ── Contenu ── */}
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
        <div style={{ maxWidth: "600px" }}>

          {/* Badge tagline */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "rgba(109,212,0,0.07)",
              border: "1px solid rgba(109,212,0,0.22)",
              borderRadius: "100px",
              padding: "0.4rem 1.1rem",
              marginBottom: "2rem",
            }}
          >
            <span style={{ color: GREEN, fontSize: "0.6rem", lineHeight: 1, opacity: 0.85 }}>✦</span>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "0.78rem",
                color: GREEN,
                letterSpacing: "0.16em",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Répare · Optimise · Évolue
            </span>
            <span style={{ color: GREEN, fontSize: "0.6rem", lineHeight: 1, opacity: 0.85 }}>✦</span>
          </div>

          {/* H1 avec touche spéciale verte + soulignement animé sur "Cellulaires" */}
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: "clamp(3.4rem, 7vw, 6.2rem)",
              color: WHITE,
              lineHeight: 1.0,
              margin: "0 0 1.6rem",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
            }}
          >
            Réparation
            <br />
            <span
              style={{
                color: GREEN,
                position: "relative",
                display: "inline-block",
              }}
            >
              Cellulaires
              {/* Underline glow animé */}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "-4px",
                  width: "100%",
                  height: "3px",
                  background: `linear-gradient(90deg, ${GREEN}, ${GREEN_GLOW}, transparent)`,
                  borderRadius: "2px",
                  animation: "underlineGlow 2.5s ease-in-out infinite",
                }}
              />
            </span>
            <br />
            <span style={{ color: WHITE }}>&amp; Ordinateurs</span>
          </h1>

          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "1.05rem",
              color: GRAY,
              lineHeight: 1.75,
              marginBottom: "2.8rem",
              maxWidth: "460px",
            }}
          >
            Experts en réparation de cellulaires &amp; ordinateurs, soutien informatique et conception web. Pièces certifiées, diagnostics précis et solutions sur mesure pour particuliers et entreprises.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="#rendezvous"
              style={{
                ...btn(hovCta ? GREEN_GLOW : GREEN, "#0c0c12"),
                fontSize: "1rem",
                boxShadow: hovCta
                  ? `0 0 24px rgba(109,212,0,0.5)`
                  : `0 0 12px rgba(109,212,0,0.25)`,
              }}
              onMouseEnter={() => setHovCta(true)}
              onMouseLeave={() => setHovCta(false)}
            >
              Prendre Rendez-vous
            </a>
            <a
              href="#suivi"
              style={{
                ...btn("transparent", hovSec ? GREEN : WHITE),
                border: `1px solid ${hovSec ? GREEN : "rgba(255,255,255,0.18)"}`,
                fontSize: "1rem",
              }}
              onMouseEnter={() => setHovSec(true)}
              onMouseLeave={() => setHovSec(false)}
            >
              Suivre ma réparation
            </a>
          </div>
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
            opacity: 0.18;
          }
        }
      `}</style>
    </section>
  );
}
