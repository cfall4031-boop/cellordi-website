import React from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";

export default function NotFound() {
  const { t } = useTranslation();

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

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
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
          {t("notfound.label")}
        </div>

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
          {t("notfound.title")}
        </h1>

        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "1rem",
            color: GRAY,
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          {t("notfound.desc")}
        </p>

        <Link
          to="/"
          style={{ ...btn(GREEN, NAVY), textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
          onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
        >
          {t("notfound.back")}
        </Link>

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
            { key: "rdv" as const, href: "/#rendezvous" },
            { key: "suivi" as const, href: "/#suivi" },
            { key: "contact" as const, href: "/#contact" },
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
              {t(`notfound.links.${link.key}`)}
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
