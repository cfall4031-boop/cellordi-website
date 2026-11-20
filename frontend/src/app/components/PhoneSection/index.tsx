// @refresh reset
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useScrollProgress } from "./hooks/useScrollProgress";
import { FONT_DISPLAY, FONT_BODY, GREEN, WHITE, GRAY, NAVY, btn } from "../../tokens";

const PhoneCanvas = lazy(() =>
  import("./PhoneCanvas").then((m) => ({ default: m.PhoneCanvas }))
);

// ── Static poster shown while Three.js loads ──────────────────────────────
function PhonePoster() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0b0b0c",
    }}>
      <svg viewBox="0 0 72 148" width="180" style={{ opacity: 0.18 }}>
        <rect x="2" y="2" width="68" height="144" rx="10" fill="none"
          stroke="white" strokeWidth="2" />
        <rect x="8" y="10" width="56" height="110" rx="4" fill="none"
          stroke="white" strokeWidth="1" />
        <rect x="26" y="6" width="20" height="4" rx="2" fill="white" opacity="0.4" />
        <rect x="22" y="135" width="28" height="3" rx="1.5" fill="white" opacity="0.3" />
      </svg>
    </div>
  );
}

// ── Overlay text with fade by progress ───────────────────────────────────
interface OverlayProps {
  children: React.ReactNode;
  pIn: number;   // start fade-in
  pFull: number; // fully visible
  pOut: number;  // start fade-out
  pGone: number; // fully hidden
  progress: number;
  style?: React.CSSProperties;
}
function Overlay({ children, pIn, pFull, pOut, pGone, progress, style }: OverlayProps) {
  const t =
    progress < pIn    ? 0 :
    progress < pFull  ? (progress - pIn)   / (pFull - pIn) :
    progress < pOut   ? 1 :
    progress < pGone  ? 1 - (progress - pOut) / (pGone - pOut) :
    0;
  if (t <= 0) return null;
  return (
    <div style={{
      opacity: t,
      transform: `translateY(${(1 - t) * 18}px)`,
      transition: "none",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Reduced-motion fallback ───────────────────────────────────────────────
function ReducedMotionFallback() {
  const { t } = useTranslation();
  return (
    <div style={{
      padding: "5rem 2rem",
      display: "flex", gap: "3rem", flexWrap: "wrap",
      alignItems: "center", justifyContent: "center",
      background: NAVY,
    }}>
      {[
        { label: t("phone3d.text1"), icon: "📱" },
        { label: t("phone3d.text2"), icon: "🔧" },
        { label: t("phone3d.text3"), icon: "✨" },
      ].map(({ label, icon }) => (
        <div key={label} style={{ textAlign: "center", maxWidth: 200 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{icon}</div>
          <p style={{ fontFamily: FONT_BODY, color: WHITE, fontWeight: 500, fontSize: "1.1rem" }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export function PhoneSection() {
  const { t } = useTranslation();
  const { outerRef, progressRef } = useScrollProgress();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [progress, setProgress]     = useState(0); // for overlay animations
  const prefersReduced = useRef(
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Lazy-load Three.js when section approaches viewport
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const el = outerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShouldLoad(true); obs.disconnect(); } },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [outerRef]);

  // Sync progress to React state at ~60fps for overlay animations
  useEffect(() => {
    let raf = 0;
    function tick() {
      setProgress(progressRef.current);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  if (prefersReduced.current) {
    return <ReducedMotionFallback />;
  }

  return (
    <section
      ref={outerRef}
      aria-label={t("phone3d.aria")}
      style={{ position: "relative", height: "300vh" }}
    >
      {/* Sticky inner — 100vh viewport */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        background: "#0b0b0c",
      }}>
        {/* Canvas layer */}
        {shouldLoad
          ? (
            <Suspense fallback={<PhonePoster />}>
              <PhoneCanvas progressRef={progressRef} isMobile={isMobile} />
            </Suspense>
          )
          : <PhonePoster />
        }

        {/* HTML text overlays */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "flex-start",
          padding: "0 8%", pointerEvents: "none", zIndex: 10,
        }}>
          {/* Text 1 — intro */}
          <Overlay pIn={0.02} pFull={0.08} pOut={0.22} pGone={0.32} progress={progress}>
            <p style={{
              fontFamily: FONT_DISPLAY, fontWeight: 400,
              fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "-0.01em",
              maxWidth: 420,
            }}>
              {t("phone3d.text1")}
            </p>
          </Overlay>

          {/* Text 2 — close-up */}
          <Overlay pIn={0.47} pFull={0.52} pOut={0.62} pGone={0.68} progress={progress}>
            <p style={{
              fontFamily: FONT_DISPLAY, fontWeight: 400,
              fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "-0.01em",
              maxWidth: 420,
            }}>
              {t("phone3d.text2")}
            </p>
          </Overlay>

          {/* Text 3 — repaired + CTA */}
          <Overlay pIn={0.87} pFull={0.92} pOut={1.00} pGone={1.00} progress={progress}
            style={{ pointerEvents: progress >= 0.87 ? "auto" : "none" }}>
            <p style={{
              fontFamily: FONT_DISPLAY, fontWeight: 500,
              fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
              color: WHITE, letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}>
              {t("phone3d.text3")}
            </p>
            <a
              href="tel:5142375792"
              style={{ ...btn(GREEN, "#0c0c12"), display: "inline-block" }}
            >
              {t("phone3d.cta")}
            </a>
          </Overlay>
        </div>

        {/* Scroll hint (early progress only) */}
        {progress < 0.05 && (
          <div style={{
            position: "absolute", bottom: "2rem", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "0.4rem", opacity: 1 - progress * 20,
          }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: GRAY }}>scroll</span>
            <div style={{
              width: 1, height: 32,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)",
            }} />
          </div>
        )}
      </div>
    </section>
  );
}
