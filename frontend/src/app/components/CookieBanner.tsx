import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, WHITE, GRAY, FONT_BODY } from "../tokens";

export const CONSENT_KEY = "cellordi_cookie_consent";

export function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(CONSENT_KEY)
  );

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem(CONSENT_KEY, "refused");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#13131e",
        borderTop: `1px solid rgba(109,212,0,0.25)`,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
        fontFamily: FONT_BODY,
      }}
    >
      {/* Bouton fermer (ignorer) */}
      <button
        onClick={() => setVisible(false)}
        aria-label="Fermer"
        style={{
          position: "absolute",
          top: "10px",
          right: "14px",
          background: "transparent",
          border: "none",
          color: GRAY,
          fontSize: "18px",
          lineHeight: 1,
          cursor: "pointer",
          padding: "2px 6px",
          opacity: 0.7,
        }}
      >
        ✕
      </button>

      <span style={{ fontSize: "20px", flexShrink: 0 }}>🍪</span>

      <p
        style={{
          flex: 1,
          margin: 0,
          color: GRAY,
          fontSize: "13px",
          lineHeight: 1.55,
          minWidth: "220px",
        }}
      >
        <strong style={{ color: WHITE }}>{t("cookie.title")}</strong>
        {" "}— {t("cookie.text")}{" "}
        <strong style={{ color: WHITE }}>{t("cookie.law")}</strong>
        {t("cookie.text2")}
      </p>

      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={refuse}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: GRAY,
            fontSize: "13px",
            fontFamily: FONT_BODY,
            cursor: "pointer",
          }}
        >
          {t("cookie.refuse")}
        </button>
        <button
          onClick={accept}
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            border: "none",
            background: GREEN,
            color: "#0c0c12",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: FONT_BODY,
            cursor: "pointer",
          }}
        >
          {t("cookie.accept")}
        </button>
      </div>
    </div>
  );
}
