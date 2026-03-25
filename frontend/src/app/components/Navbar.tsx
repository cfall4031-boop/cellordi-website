import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, NAVY_LIGHT, GREEN, GREEN_GLOW, WHITE, GRAY, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hov, setHov] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");

  const navLinks = [
    { label: t("nav.services"), href: "/#services" },
    { label: t("nav.process"), href: "/#process" },
    { label: t("nav.rdv"), href: "/#rendezvous" },
    { label: t("nav.suivi"), href: "/#suivi" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.contact"), href: "/#contact" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? `${NAVY}f5` : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid rgba(109,212,0,0.12)` : "none",
        transition: "all 0.3s",
        padding: "0 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "70px",
        }}
      >
        {/* Logo */}
        <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <svg viewBox="0 0 512 512" style={{ width: "34px", height: "34px", flexShrink: 0 }}>
            <rect width="512" height="512" rx="80" fill={NAVY}/>
            <text x="256" y="235" textAnchor="middle" dominantBaseline="central"
                  fontFamily="'Arial Black',sans-serif" fontWeight={900}
                  fontSize={240} fill={GREEN} letterSpacing={-10}>CO</text>
            <rect x="176" y="345" width="160" height="16" rx="8" fill={GREEN}/>
          </svg>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: "1.4rem",
              color: WHITE,
              letterSpacing: "0.05em",
              lineHeight: 1.1,
            }}
          >
            <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, color: GRAY, letterSpacing: "0.18em", textTransform: "uppercase" }}>{t("nav.repair")}</span>
            CeLL<span style={{ color: GREEN }}>&</span>Ordi
          </span>
        </a>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }} className="nav-desktop">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHov(link.href)}
              onMouseLeave={() => setHov(null)}
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: "0.95rem",
                letterSpacing: "0.07em",
                color: hov === link.href ? GREEN : GRAY,
                textDecoration: "none",
                padding: "0.4rem 0.85rem",
                transition: "color 0.2s",
                textTransform: "uppercase",
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/#rendezvous"
            style={{
              ...btn(GREEN, NAVY),
              fontSize: "0.88rem",
              padding: "0.6rem 1.5rem",
              marginLeft: "0.5rem",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
            onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
          >
            {t("nav.cta")}
          </a>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{
              background: "none",
              border: `1px solid rgba(109,212,0,0.3)`,
              borderRadius: "4px",
              cursor: "pointer",
              padding: "0.4rem 0.7rem",
              marginLeft: "0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.08em",
            }}
          >
            <span style={{ color: i18n.language === "fr" ? GREEN : GRAY }}>FR</span>
            <span style={{ color: "rgba(109,212,0,0.4)", fontSize: "0.7rem" }}>|</span>
            <span style={{ color: i18n.language === "en" ? GREEN : GRAY }}>EN</span>
          </button>
        </div>

        {/* Burger Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "none",
            flexDirection: "column",
            gap: "5px",
            padding: "4px",
          }}
          className="nav-burger"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "24px",
                height: "2px",
                background: GREEN,
                transition: "all 0.28s ease",
                transformOrigin: "center",
                ...(i === 0 && menuOpen ? { transform: "rotate(45deg) translate(5px, 7px)" } : {}),
                ...(i === 1 && menuOpen ? { opacity: 0, transform: "scaleX(0)" } : {}),
                ...(i === 2 && menuOpen ? { transform: "rotate(-45deg) translate(5px, -7px)" } : {}),
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        style={{
          maxHeight: menuOpen ? "480px" : "0",
          overflow: "hidden",
          transition: "max-height 0.32s ease",
          background: NAVY,
          borderTop: menuOpen ? `1px solid rgba(109,212,0,0.15)` : "none",
        }}
      >
        <div style={{ padding: "1rem 2rem" }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: "1.1rem",
                letterSpacing: "0.07em",
                color: WHITE,
                textDecoration: "none",
                padding: "0.75rem 0",
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
                textTransform: "uppercase",
              }}
            >
              {link.label}
            </a>
          ))}
          {/* Mobile lang toggle */}
          <div style={{ paddingTop: "1rem", display: "flex", gap: "0.5rem" }}>
            {["fr", "en"].map((lang) => (
              <button
                key={lang}
                onClick={() => { i18n.changeLanguage(lang); setMenuOpen(false); }}
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.1em",
                  background: i18n.language === lang ? GREEN : "transparent",
                  color: i18n.language === lang ? NAVY : GRAY,
                  border: `1px solid ${i18n.language === lang ? GREEN : "rgba(255,255,255,0.15)"}`,
                  padding: "0.4rem 1rem",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-burger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
