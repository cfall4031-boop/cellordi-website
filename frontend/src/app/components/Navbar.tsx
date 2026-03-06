import React, { useState, useEffect } from "react";
import { NAVY, NAVY_LIGHT, GREEN, GREEN_GLOW, WHITE, GRAY, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Processus", href: "/#process" },
  { label: "Rendez-vous", href: "/#rendezvous" },
  { label: "Suivi", href: "/#suivi" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hov, setHov] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
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
            <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, color: GRAY, letterSpacing: "0.18em", textTransform: "uppercase" }}>Réparation</span>
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
            Prendre RDV
          </a>
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

      {/* Mobile Menu — animé avec maxHeight */}
      <div
        style={{
          maxHeight: menuOpen ? "420px" : "0",
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