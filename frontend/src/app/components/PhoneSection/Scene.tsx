import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { PhoneModel, ScreenUniforms } from "./PhoneModel";
import { GlassShards } from "./GlassShards";
import { Lighting } from "./Lighting";
import { registerInvalidate, unregisterInvalidate } from "./phoneRender";

// ── Easing helpers ──────────────────────────────────────────────────────────
const easeInPow2 = (t: number) => t * t;
const smoothstep  = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function remap(value: number, inMin: number, inMax: number): number {
  return clamp01((value - inMin) / (inMax - inMin));
}

// Camera shake — small world-space offset decaying over time
let shakeX = 0, shakeY = 0, shakeDecay = 0;
function triggerShake() {
  shakeX = (Math.random() - 0.5) * 0.025;
  shakeY = (Math.random() - 0.5) * 0.015;
  shakeDecay = 1;
}

interface SceneProps {
  progressRef: React.MutableRefObject<number>;
  isMobile?: boolean;
}

export function Scene({ progressRef, isMobile = false }: SceneProps) {
  const { camera, invalidate } = useThree();
  const phoneRef   = useRef<THREE.Group>(null);
  const uniformsRef = useRef<ScreenUniforms | null>(null);
  const lastP      = useRef(-1);
  const hasShaken  = useRef(false);
  const shardCount = isMobile ? 40 : 80;

  useEffect(() => {
    registerInvalidate(invalidate);
    return () => unregisterInvalidate();
  }, [invalidate]);

  // Set initial camera
  useEffect(() => {
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(({ clock: _clock }) => {
    const p = progressRef.current;
    if (Math.abs(p - lastP.current) < 0.00005) return;
    lastP.current = p;

    const phone = phoneRef.current;
    if (!phone) return;
    const uni = uniformsRef.current;

    // ── Camera ─────────────────────────────────────────────────────
    const camBase = { x: 0, y: 0, z: 4 };

    // Dolly in during gros-plan (0.45 → 0.60)
    const dollyT  = remap(p, 0.45, 0.60);
    const dollyTr = remap(p, 0.60, 0.80); // retreat
    const dollyIn = smoothstep(dollyT) - smoothstep(dollyTr);
    camBase.z = lerp(4, 2.4, Math.max(0, dollyIn));

    // Camera shake at impact
    if (p >= 0.35 && !hasShaken.current) { triggerShake(); hasShaken.current = true; }
    if (p < 0.30) hasShaken.current = false;

    if (shakeDecay > 0) {
      shakeDecay = Math.max(0, shakeDecay - 0.08);
      camera.position.set(
        camBase.x + shakeX * shakeDecay,
        camBase.y + shakeY * shakeDecay,
        camBase.z,
      );
    } else {
      camera.position.set(camBase.x, camBase.y, camBase.z);
    }
    camera.lookAt(0, 0, 0);

    // ── Phone transform ───────────────────────────────────────────
    if (p <= 0.15) {
      // Gentle float: subtle sin oscillation driven by progress
      phone.position.set(0, Math.sin(p * 60) * 0.04, 0);
      phone.rotation.set(0.1, Math.sin(p * 25) * 0.07, 0);
    }
    else if (p <= 0.35) {
      // Fall
      const t = easeInPow2(remap(p, 0.15, 0.35));
      phone.position.set(
        lerp(0, -0.3, t),
        lerp(Math.sin(0.15 * 60) * 0.04, -0.85, t),
        0,
      );
      phone.rotation.set(
        lerp(0.1, -0.55, t),
        lerp(Math.sin(0.15 * 25) * 0.07, 0.4, t),
        lerp(0, 0.45, t),
      );
    }
    else if (p <= 0.45) {
      // Settle after impact — small bounce
      const t = remap(p, 0.35, 0.45);
      const bounce = Math.sin(t * Math.PI) * 0.08 * (1 - t * 0.5);
      phone.position.set(-0.3, -0.85 + bounce, 0);
      phone.rotation.set(
        lerp(-0.55, -0.1, smoothstep(t)),
        lerp(0.4, 0.3, smoothstep(t)),
        lerp(0.45, 0.35, smoothstep(t)),
      );
    }
    else if (p <= 0.60) {
      // Lying flat, camera closing in
      phone.position.set(-0.3, -0.85, 0);
      phone.rotation.set(-0.1, 0.3, 0.35);
    }
    else if (p <= 0.85) {
      // Repair: everything reverses
      const t = smoothstep(remap(p, 0.60, 0.85));
      phone.position.set(
        lerp(-0.3, 0, t),
        lerp(-0.85, Math.sin(0.15 * 60) * 0.04, t),
        0,
      );
      phone.rotation.set(
        lerp(-0.1, 0.1, t),
        lerp(0.3, Math.sin(0.15 * 25) * 0.07, t),
        lerp(0.35, 0, t),
      );
    }
    else {
      // Fully repaired, back to float
      phone.position.set(0, Math.sin(p * 60) * 0.04, 0);
      phone.rotation.set(0.1, Math.sin(p * 25) * 0.07, 0);
    }

    // ── Screen shader uniforms ────────────────────────────────────
    if (uni) {
      // Crack grows 0.35→0.45 and shrinks 0.60→0.82
      let crack = 0;
      if (p >= 0.35 && p <= 0.60) {
        crack = smoothstep(remap(p, 0.35, 0.47));
      } else if (p > 0.60 && p <= 0.85) {
        crack = 1 - smoothstep(remap(p, 0.60, 0.82));
      } else if (p > 0.85) {
        crack = 0;
      }
      uni.uCrack.value = crack;

      // Glitch flash right at impact (p ≈ 0.35)
      const glitchT = remap(p, 0.35, 0.37);
      uni.uGlitch.value = glitchT < 1 ? Math.sin(glitchT * Math.PI) * 0.9 : 0;

      // Screen dark zone appears after crack settles
      uni.uScreenOff.value = smoothstep(remap(p, 0.42, 0.52))
                           * (1 - smoothstep(remap(p, 0.68, 0.84)));
    }

    invalidate();
  });

  return (
    <>
      <Lighting />
      <group ref={phoneRef}>
        <PhoneModel uniformsRef={uniformsRef} />
      </group>
      <GlassShards count={shardCount} progressRef={progressRef} />
    </>
  );
}
