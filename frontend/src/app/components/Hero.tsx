import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, GREEN_GLOW, WHITE, GRAY, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

function useTypewriter(
  phrases: string[],
  typeMs  = 65,
  deleteMs = 32,
  holdMs  = 1900,
) {
  const [display, setDisplay] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!phrases.length) return;
    let alive = true;
    let idx   = 0;

    const wait = (ms: number) =>
      new Promise<void>((res) => { timerRef.current = setTimeout(res, ms); });

    async function loop() {
      while (alive) {
        const phrase = phrases[idx];
        for (let i = 1; i <= phrase.length && alive; i++) {
          setDisplay(phrase.slice(0, i));
          await wait(typeMs);
        }
        await wait(holdMs);
        for (let i = phrase.length - 1; i >= 0 && alive; i--) {
          setDisplay(phrase.slice(0, i));
          await wait(deleteMs);
        }
        await wait(380);
        idx = (idx + 1) % phrases.length;
      }
    }

    loop();

    return () => {
      alive = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return display;
}

export function Hero() {
  const { t } = useTranslation();
  const [hovCta, setHovCta] = useState(false);
  const [hovSec, setHovSec] = useState(false);

  const phrases = t("hero.phrases", { returnObjects: true }) as string[];
  const typed   = useTypewriter(phrases);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#0c0c12",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      {/* Image de fond plein écran */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/hero-crack.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        filter: "grayscale(1) contrast(1.6) brightness(0.35)",
        zIndex: 0,
      }} />
      {/* Voile uniforme + fondu bas vers le noir */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(12,12,18,0.45) 0%, rgba(12,12,18,0.45) 60%, #0c0c12 100%)",
        zIndex: 1,
      }} />

      {/* Séparateur top subtil */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "1px",
        background: "rgba(255,255,255,0.06)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* COLONNE GAUCHE */}
      <div
        id="hero-left"
        style={{
          flex: "1 1 100%",
          maxWidth: 680,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 4rem",
          paddingTop: "120px",
          paddingBottom: "80px",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Label discret */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem",
          width: "fit-content",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(255,255,255,0.4)", display: "inline-block",
          }} />
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "0.78rem",
            color: GRAY,
            fontWeight: 400,
          }}>
            {t("hero.tag")}
          </span>
        </div>

        {/* H1 — poids normal, pas d'uppercase */}
        <h1 style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 500,
          fontSize: "clamp(2.8rem, 5vw, 5rem)",
          color: WHITE,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          margin: "0 0 0.6rem",
        }}>
          {t("hero.prefix")}
          <br />
          <span id="hero-typed" style={{ color: WHITE, whiteSpace: "nowrap" }}>
            {typed}
          </span>
          {/* Curseur blanc discret */}
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: "2px",
              height: "0.78em",
              background: "rgba(255,255,255,0.5)",
              marginLeft: "5px",
              verticalAlign: "middle",
              borderRadius: "1px",
              animation: "blink-cursor 1s step-end infinite",
            }}
          />
        </h1>

        {/* Sous-titre — gris, poids normal */}
        <p style={{
          fontFamily: FONT_BODY,
          fontWeight: 400,
          fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
          color: GRAY,
          margin: "0 0 2.8rem",
          lineHeight: 1.5,
        }}>
          {t("hero.headline2")}
        </p>

        {/* CTAs — vert uniquement ici */}
        <div className="hero-ctas" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" as const }}>
          <a
            href="tel:5142375792"
            style={{
              ...btn(hovCta ? GREEN_GLOW : GREEN, "#0c0c12"),
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
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
              ...btn("transparent", hovSec ? WHITE : GRAY),
              border: `1px solid ${hovSec ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"}`,
            }}
            onMouseEnter={() => setHovSec(true)}
            onMouseLeave={() => setHovSec(false)}
          >
            {t("hero.cta_suivi")} →
          </a>
        </div>
      </div>

      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
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
          #hero-left h1 {
            font-size: clamp(1.5rem, 6.5vw, 2.8rem) !important;
          }
          #hero-typed {
            white-space: nowrap !important;
          }
        }
      `}</style>
    </section>
  );
}
