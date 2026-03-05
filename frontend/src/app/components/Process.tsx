import React from "react";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, GREEN, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY } from "../tokens";

const IconSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11" strokeOpacity="0.5"/>
    <line x1="11" y1="8" x2="11" y2="14" strokeOpacity="0.5"/>
  </svg>
);

const IconClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="9" y1="11" x2="15" y2="11" strokeOpacity="0.6"/>
    <line x1="9" y1="14" x2="13" y2="14" strokeOpacity="0.6"/>
  </svg>
);

const IconGear = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const STEPS = [
  {
    num: "01",
    Icon: IconSearch,
    title: "Diagnostic Gratuit",
    desc: "Apportez votre appareil en boutique ou remplissez le formulaire en ligne. Notre technicien évalue l'état en 30 minutes.",
  },
  {
    num: "02",
    Icon: IconClipboard,
    title: "Devis Transparent",
    desc: "Vous recevez un devis détaillé par SMS/email. Pas de frais cachés — vous acceptez ou refusez en toute liberté.",
  },
  {
    num: "03",
    Icon: IconGear,
    title: "Réparation Express",
    desc: "Nos techniciens certifiés utilisent des pièces de qualité OEM. La majorité des réparations en moins de 2 heures.",
  },
  {
    num: "04",
    Icon: IconCheckCircle,
    title: "Récupération & Suivi",
    desc: "Récupérez votre appareil entièrement testé. Suivez votre réparation par numéro de ticket en temps réel.",
  },
];

export function Process() {
  return (
    <section
      id="process"
      style={{ background: NAVY, padding: "7rem 2rem", position: "relative", overflow: "hidden" }}
    >
      {/* Subtle background accent */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(109,212,0,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
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
              Comment ça marche
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
              Notre Processus
            </h2>
          </div>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "0",
            position: "relative",
          }}
          className="process-grid"
        >
          {/* Connecting line */}
          <div
            style={{
              position: "absolute",
              top: "52px",
              left: "calc(12.5%)",
              right: "calc(12.5%)",
              height: "2px",
              background: `linear-gradient(90deg, ${GREEN}33, ${GREEN}88, ${GREEN}33)`,
              zIndex: 0,
            }}
            className="process-line"
          />

          {STEPS.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.12}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "0 1.5rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Step icon circle */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: `rgba(109,212,0,0.08)`,
                    border: `2px solid ${GREEN}55`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    position: "relative",
                    animation: "glowPulse 3s ease-in-out infinite",
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  <step.Icon />
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "22px",
                      height: "22px",
                      background: GREEN,
                      borderRadius: "50%",
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 900,
                      fontSize: "0.7rem",
                      color: NAVY,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 900,
                    fontSize: "3.5rem",
                    color: `rgba(109,212,0,0.08)`,
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    letterSpacing: "-0.02em",
                    userSelect: "none",
                    zIndex: -1,
                  }}
                >
                  {step.num}
                </div>

                <h3
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: WHITE,
                    marginBottom: "0.8rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.9rem",
                    color: GRAY,
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(109,212,0,0.3); }
          50% { box-shadow: 0 0 28px rgba(109,212,0,0.6); }
        }
        @media (max-width: 768px) {
          .process-line { display: none !important; }
          .process-grid { gap: 2.5rem !important; }
        }
      `}</style>
    </section>
  );
}