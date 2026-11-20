import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestFrame } from "../phoneRender";

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress() {
  const outerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        requestFrame();
      },
    });

    return () => { st.kill(); };
  }, []);

  return { outerRef, progressRef };
}
