import React, { useState, useEffect, useRef } from "react";
import { GREEN } from "../tokens";

interface Props {
  text: string;
  speed?: number;             // ms per character
  cursorColor?: string;
  threshold?: number;         // IntersectionObserver threshold
}

/**
 * Types the text in character-by-character once the element scrolls into view.
 * Plays once — cursor disappears after typing is complete.
 * Wrap inside an <h2> or any tag you want, keeping its styles.
 */
export function TypewriterTitle({
  text,
  speed = 52,
  cursorColor = GREEN,
  threshold = 0.4,
}: Props) {
  const [display, setDisplay] = useState("");
  const [done, setDone]       = useState(false);
  const spanRef    = useRef<HTMLSpanElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPlayed  = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          observer.disconnect();

          let i = 0;
          const tick = () => {
            i++;
            setDisplay(text.slice(0, i));
            if (i < text.length) {
              timerRef.current = setTimeout(tick, speed);
            } else {
              setDone(true);
            }
          };
          // Small initial delay so the section has settled before typing starts
          timerRef.current = setTimeout(tick, 180);
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, threshold]);

  return (
    <span ref={spanRef}>
      {display || "\u00a0" /* nbsp keeps height before animation starts */}
      {!done && (
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "3px",
            height: "0.82em",
            background: cursorColor,
            marginLeft: "5px",
            verticalAlign: "middle",
            borderRadius: "1px",
            animation: "blink-cursor 1s step-end infinite",
          }}
        />
      )}
    </span>
  );
}
