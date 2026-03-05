import React, { useState } from "react";
import { FadeUp } from "./FadeUp";
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

const IconGlobe = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12" strokeOpacity="0.5"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconCloud = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    <polyline points="16 16 12 12 8 16" strokeOpacity="0.7"/>
    <line x1="12" y1="12" x2="12" y2="21" strokeOpacity="0.7"/>
  </svg>
);

const IconWrench = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── Données ─────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    slug: "cellulaires",
    Icon: IconPhone,
    title: "Réparation Cellulaires",
    desc: "Écrans brisés, batteries, caméras, connecteurs de charge. iPhone, Samsung, Huawei et plus.",
    items: ["Remplacement écran", "Batterie certifiée", "Caméra & capteurs", "Connecteur USB / Lightning"],
  },
  {
    slug: "ordinateurs",
    Icon: IconLaptop,
    title: "Réparation Ordinateurs",
    desc: "PC et Mac — virus, lenteur, disque dur, écran, clavier. Récupération de données.",
    items: ["Nettoyage virus/malware", "Remplacement HDD/SSD", "Upgrade RAM", "Réparation écran laptop"],
  },
  {
    slug: "informatique",
    Icon: IconShield,
    title: "Services Informatiques",
    desc: "Installation OS, configuration réseau, antivirus, sauvegarde automatique.",
    items: ["Install. Windows / macOS", "Réseau & WiFi sécurisé", "Antivirus entreprise", "Sauvegarde cloud"],
  },
  {
    slug: "web",
    Icon: IconGlobe,
    title: "Développement Web",
    desc: "Sites vitrine, e-commerce et applications web sur mesure pour votre entreprise.",
    items: ["Site vitrine & SEO", "E-commerce Stripe", "Application web React", "Maintenance mensuelle"],
  },
  {
    slug: "cloud",
    Icon: IconCloud,
    title: "Solutions Cloud",
    desc: "Migration cloud, stockage sécurisé, synchronisation multi-appareils.",
    items: ["Migration Google / M365", "Google Workspace", "NAS & stockage local", "Sauvegarde automatisée"],
  },
  {
    slug: "entretien",
    Icon: IconWrench,
    title: "Contrats d'Entretien",
    desc: "Maintenance préventive pour entreprises. Support prioritaire et suivi personnalisé.",
    items: ["Maintenance mensuelle", "Support prioritaire < 4h", "Audit sécurité", "Rapport IT mensuel"],
  },
];

// ─── Composant ───────────────────────────────────────────────────────────────
export function Services() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="services"
      style={{
        background: NAVY_MID,
        padding: "7rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
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
              Ce qu'on fait
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
              Nos Services
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", maxWidth: "520px", margin: "0 auto" }}>
              Du diagnostic gratuit à la réparation express, nous couvrons tous vos besoins technologiques.
              Cliquez sur un service pour en savoir plus.
            </p>
          </div>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {SERVICES.map((svc, i) => (
            <FadeUp key={svc.title} delay={i * 0.08}>
              <a
                href={`/services/${svc.slug}`}
                style={{ textDecoration: "none", display: "block", height: "100%" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
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
                  {/* Icon */}
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
                    <svc.Icon />
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      color: WHITE,
                      marginBottom: "0.6rem",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {svc.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: "0.9rem",
                      color: GRAY,
                      lineHeight: 1.65,
                      marginBottom: "1.2rem",
                    }}
                  >
                    {svc.desc}
                  </p>

                  {/* Bullet items — contraste amélioré */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {svc.items.map((item) => (
                      <li
                        key={item}
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: "0.85rem",
                          color: "#c8c8dc",   /* ← contraste nettement amélioré */
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

                  {/* "En savoir plus" link */}
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
                    En savoir plus
                    <span style={{ transition: "transform 0.2s", transform: hovered === i ? "translateX(4px)" : "translateX(0)", display: "flex" }}>
                      <IconArrow />
                    </span>
                  </div>
                </div>
              </a>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
