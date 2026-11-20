import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, GREEN_GLOW, WHITE, GRAY, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

function PhoneCrackAnimation() {
  const c = (delay: number, stroke: string, w: number) => ({
    strokeDasharray: 300,
    strokeDashoffset: 300,
    stroke,
    strokeWidth: w,
    fill: "none" as const,
    strokeLinecap: "round" as const,
    style: {
      animation: "crack 7s linear infinite",
      animationDelay: `${delay}s`,
      animationFillMode: "backwards" as const,
    },
  });

  return (
    <>
      <style>{`
        @keyframes phone-shake {
          0%,  7%,  20%, 100% { transform: rotate(-3deg) translateY(-15px); }
          7.5% { transform: rotate(-5.5deg) translateY(-12px) translateX(-6px); }
          8.2% { transform: rotate(-1deg)   translateY(-18px) translateX(5px); }
          9%   { transform: rotate(-4deg)   translateY(-14px) translateX(-3px); }
          9.8% { transform: rotate(-3deg)   translateY(-15px); }
        }
        @keyframes screen-flash {
          0%,  7%,  12%, 85% { fill: #07070f; }
          7.6% { fill: rgba(255,255,255,0.88); }
          8.4% { fill: rgba(190,220,255,0.18); }
          9.5% { fill: #07070f; }
          92%  { fill: #07070f; }
          98%  { fill: #030308; }
          100% { fill: #030308; }
        }
        @keyframes impact-ring {
          0%,  7%,  11%, 100% { opacity: 0; }
          7.6% { opacity: 0.9; r: 4; }
          8.5% { opacity: 0.3; r: 16; }
          10%  { opacity: 0;   r: 24; }
        }
        @keyframes crack {
          0%   { stroke-dashoffset: 300; opacity: 0; }
          5%   { stroke-dashoffset: 0;   opacity: 1; }
          65%  { stroke-dashoffset: 0;   opacity: 1; }
          78%  { stroke-dashoffset: 0;   opacity: 0; }
          80%  { stroke-dashoffset: 300; opacity: 0; }
          100% { stroke-dashoffset: 300; opacity: 0; }
        }
        .phone-crack-wrap   { animation: phone-shake 7s ease infinite; transform-origin: center; transform-box: fill-box; }
        .phone-crack-screen { animation: screen-flash 7s ease infinite; }
        .phone-crack-ring   { animation: impact-ring 7s ease infinite; }
      `}</style>

      <svg
        className="phone-crack-wrap"
        viewBox="0 0 180 360"
        xmlns="http://www.w3.org/2000/svg"
        id="hero-phone-svg"
        style={{ width: "220px", maxWidth: "100%", filter: "drop-shadow(0 24px 64px rgba(0,0,0,0.65))" }}
      >
        <rect x="8" y="8" width="164" height="344" rx="22" fill="#1b1b28" stroke="#262638" strokeWidth="1.5"/>
        <rect x="6"   y="90"  width="3" height="28" rx="1.5" fill="#262638"/>
        <rect x="6"   y="125" width="3" height="20" rx="1.5" fill="#262638"/>
        <rect x="171" y="102" width="3" height="40" rx="1.5" fill="#262638"/>
        <rect className="phone-crack-screen" x="16" y="26" width="148" height="278" rx="10"/>
        <rect x="63" y="34" width="54" height="15" rx="7.5" fill="#1b1b28"/>
        <rect x="65" y="316" width="50" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
        <rect x="16" y="26" width="148" height="278" rx="10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
        <circle className="phone-crack-ring" cx="90" cy="162" r="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>

        {/* araignée au point d'impact */}
        <path d="M90,162 L76,143"  {...c(0.60, "rgba(255,255,255,0.72)", 0.65)}/>
        <path d="M90,162 L104,146" {...c(0.63, "rgba(255,255,255,0.72)", 0.65)}/>
        <path d="M90,162 L85,180"  {...c(0.66, "rgba(255,255,255,0.65)", 0.60)}/>
        {/* diagonales principales */}
        <path d="M90,162 L140,70"  {...c(0.60, "rgba(255,255,255,0.90)", 1.4)}/>
        <path d="M90,162 L36,290"  {...c(0.72, "rgba(255,255,255,0.84)", 1.3)}/>
        {/* branches secondaires */}
        <path d="M90,162 L157,195" {...c(0.82, "rgba(255,255,255,0.72)", 1.0)}/>
        <path d="M90,162 L26,86"   {...c(0.90, "rgba(255,255,255,0.66)", 0.9)}/>
        <path d="M90,162 L150,255" {...c(0.96, "rgba(255,255,255,0.60)", 0.85)}/>
        {/* sous-branches */}
        <path d="M120,110 L150,99" {...c(1.08, "rgba(255,255,255,0.52)", 0.70)}/>
        <path d="M60,230 L24,218"  {...c(1.14, "rgba(255,255,255,0.50)", 0.65)}/>
        <path d="M134,76 L148,68"  {...c(1.20, "rgba(255,255,255,0.42)", 0.55)}/>
      </svg>
    </>
  );
}

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
        background: NAVY,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
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
          flex: "0 0 50%",
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

      {/* COLONNE DROITE — animation téléphone */}
      <div
        id="hero-right"
        style={{
          flex: "0 0 50%",
          position: "relative",
          zIndex: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PhoneCrackAnimation />
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
          #hero-right {
            flex: none !important;
            height: 340px !important;
          }
          #hero-phone-svg {
            width: 150px !important;
          }
        }
      `}</style>
    </section>
  );
}
