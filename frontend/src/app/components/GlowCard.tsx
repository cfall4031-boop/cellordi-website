import React, { useRef } from "react";

interface GlowCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glowColor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

/**
 * Carte avec effet "glow" qui suit le curseur.
 * Applique un radial-gradient vert en overlay sur la carte au survol.
 */
export function GlowCard({
  children,
  style,
  glowColor = "rgba(109,212,0,0.13)",
  onMouseEnter,
  onMouseLeave,
  className,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    ref.current?.style.setProperty("--glow-x", "-999px");
    ref.current?.style.setProperty("--glow-y", "-999px");
    onMouseLeave?.();
  };

  // Extract the base background from style, we layer the glow on top
  const baseStyle = style || {};

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...baseStyle,
        background: `radial-gradient(240px circle at var(--glow-x, -999px) var(--glow-y, -999px), ${glowColor}, transparent 60%), ${baseStyle.background || "transparent"}`,
      }}
    >
      {children}
    </div>
  );
}
