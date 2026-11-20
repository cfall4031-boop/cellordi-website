import React from "react";

export const NAVY       = "#0c0c12";
export const NAVY_MID   = "#101016";
export const NAVY_LIGHT = "#18181f";
export const GREEN      = "#6dd400";   // CTA uniquement
export const GREEN_GLOW = "#8fff1a";   // CTA hover uniquement
export const GRAY       = "#9090a8";
export const GRAY_DIM   = "#484860";
export const WHITE      = "#ffffff";

export const FONT_DISPLAY = "'Inter Tight', 'Inter', sans-serif";
export const FONT_BODY    = "'Inter Tight', 'Inter', sans-serif";

// btn — rectangle simple, vert uniquement pour CTA
export const btn = (bg: string, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: bg,
  color,
  fontFamily: FONT_DISPLAY,
  fontWeight: 500,
  fontSize: "0.95rem",
  letterSpacing: "0.01em",
  padding: "0.8rem 1.8rem",
  border: "none",
  cursor: "pointer",
  borderRadius: "3px",
  transition: "all 0.2s",
  display: "inline-block",
  textDecoration: "none",
  ...extra,
});

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: WHITE,
  fontFamily: FONT_BODY,
  fontSize: "1rem",
  padding: "0.85rem 1rem",
  outline: "none",
  borderRadius: "3px",
  boxSizing: "border-box",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONT_BODY,
  fontSize: "0.82rem",
  color: GRAY,
  marginBottom: "0.4rem",
};
