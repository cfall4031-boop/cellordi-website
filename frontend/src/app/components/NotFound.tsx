import React from "react";
import { Link } from "react-router";
import { NAVY, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: NAVY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid animation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(109,212,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(109,212,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          animation: "gridScroll 8s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(109,212,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
        {/* 404 number */}
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: "clamp(6rem, 20vw, 12rem)",
            color: GREEN,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            marginBottom: "0",
            opacity: 0.9,
          }}
        >
          404
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: "0.8rem",
            color: GREEN,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Page introuvable
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
            color: WHITE,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            margin: "0 0 1rem",
          }}
        >
          Oups, cette page n'existe pas
        </h1>

        {/* Description */}
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "1rem",
            color: GRAY,
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          La page que vous cherchez a peut-être été déplacée, supprimée, ou n'a jamais existé.
          Retournez à l'accueil pour continuer.
        </p>

        {/* CTA */}
        <Link
          to="/"
          style={{ ...btn(GREEN, NAVY), textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
          onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
        >
          ← Retour à l'accueil
        </Link>

        {/* Secondary links */}
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Prendre un RDV", href: "/#rendezvous" },
            { label: "Suivi de réparation", href: "/#suivi" },
            { label: "Nous contacter", href: "/#contact" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.9rem",
                color: GRAY_DIM,
                textDecoration: "none",
                borderBottom: `1px solid ${GRAY_DIM}44`,
                paddingBottom: "2px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
              onMouseLeave={(e) => (e.currentTarget.style.color = GRAY_DIM)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gridScroll {
          0%   { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }
      `}</style>
    </div>
  );
}
