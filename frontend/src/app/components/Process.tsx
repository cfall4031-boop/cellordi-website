import React from "react";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, WHITE, GRAY_DIM, FONT_DISPLAY, FONT_BODY } from "../tokens";

export function Process() {
  const { t } = useTranslation();
  const steps = t("process.steps", { returnObjects: true }) as Array<{ num: string; title: string; desc: string }>;

  return (
    <section id="process" style={{
      background: NAVY,
      padding: "1.6rem 2rem",
      borderTop: "1px solid rgba(109,212,0,0.08)",
      borderBottom: "1px solid rgba(109,212,0,0.08)",
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0.4rem",
      }} className="process-strip">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              background: "rgba(109,212,0,0.06)",
              border: "1px solid rgba(109,212,0,0.15)",
              borderRadius: "50px",
              padding: "0.45rem 1rem 0.45rem 0.45rem",
            }}>
              <span style={{
                width: "24px",
                height: "24px",
                background: GREEN,
                borderRadius: "50%",
                fontFamily: FONT_DISPLAY,
                fontWeight: 900,
                fontSize: "0.72rem",
                color: NAVY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: "0.8rem",
                color: WHITE,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: "0.9rem",
                color: GRAY_DIM,
                userSelect: "none",
              }} className="process-arrow">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .process-strip { gap: 0.5rem 0.4rem !important; }
          .process-arrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}
