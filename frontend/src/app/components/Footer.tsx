import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

const GOOGLE_URL = "https://share.google/PYU26hHKgOFczWqgO";

const IconGoogle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function Footer() {
  const { t } = useTranslation();
  const [hovSocials, setHovSocials] = useState<string | null>(null);

  const LINKS: Record<string, { label: string; href: string }[]> = {
    [t("footer.sections.services")]: [
      { label: t("footer.links.cell"),  href: "/services/cellulaires" },
      { label: t("footer.links.pc"),    href: "/services/ordinateurs" },
      { label: t("footer.links.it"),    href: "/services/informatique" },
      { label: t("footer.links.web"),   href: "/services/web" },
      { label: t("footer.links.cloud"), href: "/services/cloud" },
    ],
    [t("footer.sections.info")]: [
      { label: t("footer.links.about"),   href: "/#about" },
      { label: t("footer.links.blog"),    href: "/blog" },
      { label: t("footer.links.privacy"), href: "#" },
      { label: t("footer.links.cgv"),     href: "#" },
    ],
    [t("footer.sections.contact")]: [
      { label: "(514) 237-5792",                              href: "tel:+15142375792" },
      { label: "reparationcellulaire.ordinateur@gmail.com",   href: "mailto:reparationcellulaire.ordinateur@gmail.com" },
      { label: "5050 QC-132 #203",                            href: "#" },
      { label: "Sainte-Catherine, QC J5C 1L4",                href: "#" },
    ],
  };

  return (
    <footer style={{ background: NAVY, borderTop: "1px solid rgba(109,212,0,0.1)", padding: "5rem 2rem 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "4rem" }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "1.2rem" }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.4rem", color: WHITE, letterSpacing: "0.05em", lineHeight: 1.1 }}>
                <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, color: GRAY, letterSpacing: "0.18em", textTransform: "uppercase" }}>{t("footer.repair")}</span>
                CeLL<span style={{ color: GREEN }}>&</span>Ordi
              </span>
            </div>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY, lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: "260px" }}>
              {t("footer.tagline")}
            </p>

            <a
              href={GOOGLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "0.5rem 0.9rem",
                marginBottom: "1.2rem",
                textDecoration: "none",
                transition: "all 0.2s",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(66,133,244,0.1)"; e.currentTarget.style.borderColor = "rgba(66,133,244,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <IconGoogle size={16} />
              <span style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: GRAY }}>{t("footer.google_reviews")}</span>
              <span style={{ color: "#FBBC05", fontSize: "0.78rem", letterSpacing: "0.02em" }}>★★★★★</span>
            </a>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <a
                href={GOOGLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Google"
                onMouseEnter={() => setHovSocials("Google")}
                onMouseLeave={() => setHovSocials(null)}
                style={{
                  width: "36px",
                  height: "36px",
                  background: hovSocials === "Google" ? `rgba(109,212,0,0.15)` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${hovSocials === "Google" ? GREEN + "55" : "rgba(255,255,255,0.07)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  textDecoration: "none",
                  borderRadius: "4px",
                }}
              >
                <IconGoogle size={15} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.85rem", color: WHITE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.2rem" }}>
                {title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = GRAY)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY_DIM }}>
            © 2026 CeLL&Ordi — {t("footer.copyright")}
          </span>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: GREEN,
                borderRadius: "50%",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY_DIM }}>
              {t("footer.status")}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
