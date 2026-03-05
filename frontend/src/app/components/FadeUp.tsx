import React, { useEffect, useRef, useState } from "react";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}

export function FadeUp({ children, delay = 0, style = {} }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        animation: vis ? `fadeUp 0.65s ease ${delay}s both` : "none",
        opacity: vis ? undefined : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
