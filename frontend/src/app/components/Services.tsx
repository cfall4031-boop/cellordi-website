import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import { GlowCard } from "./GlowCard";
import { TypewriterTitle } from "./TypewriterTitle";
import { NAVY, NAVY_MID, NAVY_LIGHT, GREEN, GREEN_GLOW, WHITE, GRAY, FONT_DISPLAY, FONT_BODY } from "../tokens";

// ─── Icônes SVG ──────────────────────────────────────────────────────────────
const IconPhone = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
    <line x1="9" y1="6" x2="15" y2="6" strokeOpacity="0.5"/>
  </svg>
);

const IconLaptop = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="13" rx="2"/>
    <path d="M2 19h20"/>
    <path d="M9 19l1-2h4l1 2"/>
    <line x1="8" y1="9" x2="16" y2="9" strokeOpacity="0.5"/>
    <line x1="8" y1="12" x2="13" y2="12" strokeOpacity="0.5"/>
  </svg>
);

const IconShield = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

// Signal bars — Forfaits Cellulaires
const IconSignal = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="16" width="3" height="5" rx="0.5"/>
    <rect x="7.5" y="11" width="3" height="10" rx="0.5"/>
    <rect x="13" y="6" width="3" height="15" rx="0.5"/>
    <rect x="18.5" y="1" width="3" height="20" rx="0.5"/>
  </svg>
);

// Wifi + maison — Internet Résidentiel
const IconWifiHome = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 8.5C5 5 9.3 3 12 3s7 2 10.5 5.5" strokeOpacity="0.45"/>
    <path d="M4.5 11.5C7 9 9.7 8 12 8s5 1 7.5 3.5" strokeOpacity="0.7"/>
    <path d="M7.5 14.5C9 13 10.5 12.5 12 12.5s3 .5 4.5 2"/>
    <circle cx="12" cy="18" r="1.2" fill={GREEN} stroke="none"/>
    <path d="M10 21h4" strokeOpacity="0.5"/>
  </svg>
);

// Casque + étoile — Conseiller Télécom
const IconHeadsetStar = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11a9 9 0 0 1 18 0"/>
    <rect x="2" y="11" width="3" height="5" rx="1.5"/>
    <rect x="19" y="11" width="3" height="5" rx="1.5"/>
    <path d="M21 16v1a4 4 0 0 1-4 4h-2" strokeOpacity="0.6"/>
    <polygon points="12,13 12.9,15.5 15.5,15.5 13.4,17 14.1,19.5 12,18 9.9,19.5 10.6,17 8.5,15.5 11.1,15.5" fill={GREEN} fillOpacity="0.25" stroke={GREEN} strokeWidth="1"/>
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const SERVICE_SLUGS = [
  { slug: "cellulaires", Icon: IconPhone },
  { slug: "ordinateurs", Icon: IconLaptop },
  { slug: "informatique", Icon: IconShield },
  { slug: "forfait",     Icon: IconSignal },
  { slug: "internet",   Icon: IconWifiHome },
  { slug: "telecom",    Icon: IconHeadsetStar },
];

export function Services() {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="services" style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {t("services.tag")}
            </span>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
              <TypewriterTitle text={t("services.title")} />
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", maxWidth: "520px", margin: "0 auto" }}>
              {t("services.subtitle")}
            </p>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {SERVICE_SLUGS.map(({ slug, Icon }, i) => {
            const items = t(`services.items.${slug}.items`, { returnObjects: true }) as string[];
            return (
              <FadeUp key={slug} delay={i * 0.08}>
                <a
                  href={`/services/${slug}`}
                  style={{ textDecoration: "none", display: "block", height: "100%" }}
                >
                  <GlowCard
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: hovered === i ? NAVY_LIGHT : NAVY,
                      border: `1px solid ${hovered === i ? GREEN + "66" : "rgba(255,255,255,0.05)"}`,
                      padding: "2rem",
                      transition: "all 0.25s",
                      cursor: "pointer",
                      transform: hovered === i ? "translateY(-5px)" : "translateY(0)",
                      boxShadow: hovered === i ? `0 12px 40px rgba(109,212,0,0.12)` : "none",
                      height: "100%",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        background: `rgba(109,212,0,0.1)`,
                        border: `1px solid rgba(109,212,0,0.25)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.2rem",
                        clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                        transition: "background 0.25s",
                        ...(hovered === i ? { background: "rgba(109,212,0,0.18)" } : {}),
                      }}
                    >
                      <Icon />
                    </div>

                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.3rem", color: WHITE, marginBottom: "0.6rem", letterSpacing: "0.03em" }}>
                      {t(`services.items.${slug}.title`)}
                    </h3>

                    <p style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: GRAY, lineHeight: 1.65, marginBottom: "1.2rem" }}>
                      {t(`services.items.${slug}.desc`)}
                    </p>

                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      {items.map((item) => (
                        <li
                          key={item}
                          style={{
                            fontFamily: FONT_BODY,
                            fontSize: "0.85rem",
                            color: "#c8c8dc",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span style={{ color: GREEN, fontSize: "0.7rem", flexShrink: 0 }}>▶</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "1.5rem",
                        paddingTop: "1.2rem",
                        borderTop: `1px solid rgba(109,212,0,${hovered === i ? "0.2" : "0.08"})`,
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: hovered === i ? GREEN_GLOW : GREEN,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        transition: "all 0.2s",
                      }}
                    >
                      {t("services.cta")}
                      <span style={{ transition: "transform 0.2s", transform: hovered === i ? "translateX(4px)" : "translateX(0)", display: "flex" }}>
                        <IconArrow />
                      </span>
                    </div>
                  </GlowCard>
                </a>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
