import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import {
  NAVY_MID, GREEN, WHITE, GRAY, GRAY_DIM,
  FONT_DISPLAY, FONT_BODY,
} from "../tokens";

export function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const items = t("faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>;

  return (
    <section id="faq" style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
      <style>{`
        .faq-wrap {
          display: flex;
          gap: 5rem;
          align-items: flex-start;
        }
        .faq-left {
          flex: 0 0 30%;
          position: sticky;
          top: 90px;
        }
        .faq-right {
          flex: 1;
        }
        .faq-item-btn {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 1.3rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          text-align: left;
        }
        .faq-item-btn:hover .faq-q {
          color: ${GREEN} !important;
        }
        @media (max-width: 768px) {
          .faq-wrap { flex-direction: column; gap: 2.5rem; }
          .faq-left { position: static !important; flex: none; width: 100%; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="faq-wrap">

          {/* Left column — sticky title + CTA */}
          <FadeUp>
            <div className="faq-left">
              <span style={{
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem",
                color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase",
              }}>
                {t("faq.tag")}
              </span>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 900,
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: WHITE,
                textTransform: "uppercase", letterSpacing: "0.02em",
                margin: "0.6rem 0 1rem", lineHeight: 1.1,
              }}>
                {t("faq.title")}
              </h2>
              <p style={{
                fontFamily: FONT_BODY, fontSize: "0.95rem", color: GRAY,
                lineHeight: 1.75, margin: "0 0 2rem",
              }}>
                {t("faq.subtitle")}
              </p>
              <a
                href="/#contact"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.85rem",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: GREEN, textDecoration: "none",
                  padding: "0.65rem 1.4rem",
                  border: "1px solid rgba(109,212,0,0.3)",
                  borderRadius: "100px",
                  background: "rgba(109,212,0,0.06)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(109,212,0,0.14)"; e.currentTarget.style.borderColor = "rgba(109,212,0,0.55)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(109,212,0,0.06)"; e.currentTarget.style.borderColor = "rgba(109,212,0,0.3)"; }}
              >
                {t("faq.contact_btn")}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            </div>
          </FadeUp>

          {/* Right column — accordion */}
          <div className="faq-right">
            {items.map((item, i) => (
              <FadeUp key={i} delay={i * 0.055}>
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <button
                    className="faq-item-btn"
                    onClick={() => setOpen(open === i ? null : i)}
                    aria-expanded={open === i}
                  >
                    <span
                      className="faq-q"
                      style={{
                        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1rem",
                        color: open === i ? GREEN : WHITE,
                        transition: "color 0.2s",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.q}
                    </span>
                    <span style={{
                      color: GREEN,
                      fontSize: "1.5rem",
                      fontWeight: 300,
                      flexShrink: 0,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      transition: "transform 0.25s",
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                    }}>
                      +
                    </span>
                  </button>
                  <div style={{
                    maxHeight: open === i ? "500px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.32s ease",
                  }}>
                    <p style={{
                      fontFamily: FONT_BODY, fontSize: "0.92rem", color: GRAY,
                      lineHeight: 1.8, margin: "0 0 1.4rem", paddingRight: "2.5rem",
                    }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}

            {/* Bottom note */}
            <FadeUp delay={0.4}>
              <div style={{
                marginTop: "2.5rem", padding: "1.2rem 1.5rem",
                background: "rgba(109,212,0,0.04)",
                border: "1px solid rgba(109,212,0,0.12)",
                borderRadius: "2px",
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
                <span style={{ color: GREEN, fontSize: "1.1rem" }}>💬</span>
                <p style={{
                  fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY_DIM,
                  margin: 0, lineHeight: 1.6,
                }}>
                  {t("faq.footer_note")}
                </p>
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
}
