import React from "react";

// Design Tokens — CeLL&Ordi  (Dark/Black palette)
export const NAVY       = "#0c0c12";   // near-black, main background
export const NAVY_MID   = "#101016";   // slightly lighter — alternating sections
export const NAVY_LIGHT = "#18181f";   // card/surface dark
export const GREEN      = "#6dd400";   // lime green accent (unchanged)
export const GREEN_GLOW = "#8fff1a";   // brighter green on hover
export const GRAY       = "#9090a8";   // body text, cool-tinted
export const GRAY_DIM   = "#3a3a52";   // subtle / dim text
export const WHITE      = "#ffffff";

// Typography
export const FONT_DISPLAY = "'Space Grotesk', sans-serif";
export const FONT_BODY    = "'Space Grotesk', sans-serif";

// Shared styles
export const btn = (bg: string, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: bg,
  color,
  fontFamily: FONT_DISPLAY,
  fontWeight: 700,
  fontSize: "1.05rem",
  letterSpacing: "0.09em",
  padding: "0.85rem 2rem",
  border: "none",
  cursor: "pointer",
  clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
  transition: "all 0.2s",
  display: "inline-block",
  textDecoration: "none",
  ...extra,
});

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(109,212,0,0.18)",
  color: WHITE,
  fontFamily: FONT_BODY,
  fontSize: "0.95rem",
  padding: "0.85rem 1rem",
  outline: "none",
  borderRadius: "2px",
  boxSizing: "border-box",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONT_BODY,
  fontSize: "0.82rem",
  color: GRAY,
  marginBottom: "0.4rem",
  letterSpacing: "0.04em",
};
