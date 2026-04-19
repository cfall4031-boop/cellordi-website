/**
 * Floating label input components — label starts inside the field
 * and floats up (animates to top) on focus or when a value is present.
 *
 * Exports: FloatingInput, FloatingTextarea, FloatingSelect
 */
import React, { useState } from "react";
import { GREEN, WHITE, GRAY, GRAY_DIM, FONT_BODY } from "../tokens";

// ── shared label transition styles ──────────────────────────────────────────
const labelBase: React.CSSProperties = {
  position: "absolute",
  left: "1rem",
  pointerEvents: "none",
  fontFamily: FONT_BODY,
  lineHeight: 1,
  transition: "top 0.18s ease, font-size 0.18s ease, color 0.18s ease, letter-spacing 0.18s ease",
};

const labelFloated = (focused: boolean): React.CSSProperties => ({
  top: "0.42rem",
  fontSize: "0.68rem",
  color: focused ? GREEN : GRAY,
  letterSpacing: "0.06em",
});

const labelResting: React.CSSProperties = {
  fontSize: "0.9rem",
  color: GRAY_DIM,
  letterSpacing: "0.02em",
};

// ── shared field styles ──────────────────────────────────────────────────────
function fieldStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${focused ? "rgba(109,212,0,0.5)" : "rgba(109,212,0,0.18)"}`,
    color: WHITE,
    fontFamily: FONT_BODY,
    fontSize: "0.95rem",
    padding: "1.45rem 1rem 0.5rem",
    outline: "none",
    borderRadius: "2px",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? "0 0 0 3px rgba(109,212,0,0.08)" : "none",
  };
}

// ═══════════════════════════════════════════════════════════════════
// FloatingInput
// ═══════════════════════════════════════════════════════════════════
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;           // optional hint below the field
  containerStyle?: React.CSSProperties;
};

export function FloatingInput({
  label, hint, value, onFocus, onBlur, containerStyle, style, ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || (value !== "" && value !== undefined && value !== null);

  return (
    <div style={{ position: "relative", ...containerStyle }}>
      <input
        value={value}
        placeholder=""
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={{ ...fieldStyle(focused), ...style }}
        {...props}
      />
      <label style={{
        ...labelBase,
        ...(floated
          ? { ...labelFloated(focused), top: "0.42rem" }
          : { ...labelResting, top: "50%", transform: "translateY(-50%)" }),
      }}>
        {label}
      </label>
      {hint && (
        <span style={{
          display: "block", fontFamily: FONT_BODY,
          fontSize: "0.72rem", color: GRAY_DIM,
          marginTop: "0.3rem", lineHeight: 1.4,
        }}>
          {hint}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FloatingTextarea
// ═══════════════════════════════════════════════════════════════════
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  containerStyle?: React.CSSProperties;
};

export function FloatingTextarea({
  label, value, onFocus, onBlur, rows = 3, containerStyle, style, ...props
}: TextareaProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || (value !== "" && value !== undefined && value !== null);

  return (
    <div style={{ position: "relative", ...containerStyle }}>
      <textarea
        value={value}
        rows={rows}
        placeholder=""
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={{
          ...fieldStyle(focused),
          resize: "vertical",
          ...style,
        }}
        {...props}
      />
      <label style={{
        ...labelBase,
        ...(floated
          ? { ...labelFloated(focused), top: "0.5rem" }
          : { ...labelResting, top: "1rem" }),
      }}>
        {label}
      </label>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FloatingSelect
// ═══════════════════════════════════════════════════════════════════
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  containerStyle?: React.CSSProperties;
  children: React.ReactNode;
};

export function FloatingSelect({
  label, value, onFocus, onBlur, containerStyle, children, style, ...props
}: SelectProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || (value !== "" && value !== undefined);

  return (
    <div style={{ position: "relative", ...containerStyle }}>
      <select
        value={value}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={{
          ...fieldStyle(focused),
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          color: floated ? WHITE : "transparent",
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      {/* Custom arrow */}
      <span style={{
        position: "absolute", right: "1rem", top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: focused ? GREEN : GRAY_DIM,
        fontSize: "0.65rem",
        transition: "color 0.2s",
      }}>▼</span>
      <label style={{
        ...labelBase,
        ...(floated
          ? { ...labelFloated(focused), top: "0.42rem" }
          : { ...labelResting, top: "50%", transform: "translateY(-50%)" }),
      }}>
        {label}
      </label>
    </div>
  );
}
