import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { generateCrackTextures, CRACK_IMPACT_UV } from "./utils/crackTexture";

// ── Screen wallpaper texture (Canvas 2D) ─────────────────────────────────────
function makeScreenTexture(): THREE.CanvasTexture {
  const W = 512, H = 1024;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0d0d1a");
  g.addColorStop(1, "#070710");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Status bar shimmer
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  ctx.fillRect(0, 0, W, 55);

  // Time
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "bold 68px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("14:23", W / 2, 310);

  // Date
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "28px Inter, sans-serif";
  ctx.fillText("Lundi 20 novembre", W / 2, 368);

  // App grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const ax = 64 + col * 100, ay = 520 + row * 110;
      const hue = (col * 85 + row * 40) % 360;
      ctx.fillStyle = `hsla(${hue},35%,22%,0.8)`;
      ctx.beginPath();
      ctx.roundRect(ax - 30, ay - 30, 60, 60, 12);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.flipY = true;
  return tex;
}

// ── Screen ShaderMaterial with crack injection ────────────────────────────────
const CRACK_FRAG = /* glsl */ `
uniform float uCrack;
uniform float uGlitch;
uniform float uScreenOff;
uniform sampler2D uCrackMap;
uniform sampler2D uScreenTex;
uniform vec2 uImpact;
varying vec2 vUv;

void main() {
  vec4 screen = texture2D(uScreenTex, vUv);
  vec2 uv = vUv;

  // Glitch offset
  if (uGlitch > 0.0) {
    float sl = step(0.5, fract(uv.y * 12.0 + uGlitch * 15.0));
    uv.x += sl * uGlitch * 0.025 * sin(uv.y * 30.0);
  }

  // Crack reveal (radial from impact)
  float dist = length(uv - uImpact) / 1.55;
  float noise = fract(sin(dot(uv, vec2(127.1, 311.7))) * 43758.5);
  float edge = uCrack + noise * 0.14 - 0.07;
  float crackMask = step(dist, edge);
  float crackVal = texture2D(uCrackMap, vUv).r * crackMask;

  vec3 col = screen.rgb;
  // Crack lines: white on screen
  col = mix(col, mix(col * 0.07, vec3(0.92, 0.96, 1.0), crackVal), crackVal);

  // OLED dark zone around impact
  float impD = length(vUv - uImpact);
  float dark = smoothstep(0.38, 0.06, impD) * uScreenOff;
  col = mix(col, vec3(0.0, 0.0, 0.01), dark);

  // RGB glitch shift
  if (uGlitch > 0.01) {
    float sl2 = step(0.5, fract(vUv.y * 12.0 + uGlitch * 15.0));
    vec4 shifted = texture2D(uScreenTex, vUv + vec2(0.004, 0.0));
    col = mix(col, vec3(shifted.r, col.g, col.b), uGlitch * sl2 * 0.7);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

const CRACK_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export interface ScreenUniforms {
  uCrack: { value: number };
  uGlitch: { value: number };
  uScreenOff: { value: number };
}

interface PhoneModelProps {
  uniformsRef: React.MutableRefObject<ScreenUniforms | null>;
}

export function PhoneModel({ uniformsRef }: PhoneModelProps) {
  const { crackMap, normalMap } = useMemo(() => generateCrackTextures(), []);
  const screenTex = useMemo(() => makeScreenTexture(), []);

  const screenUniforms = useMemo<ScreenUniforms>(() => ({
    uCrack:     { value: 0 },
    uGlitch:    { value: 0 },
    uScreenOff: { value: 0 },
    uCrackMap:  { value: crackMap },
    uScreenTex: { value: screenTex },
    uImpact:    { value: CRACK_IMPACT_UV },
  } as unknown as ScreenUniforms), [crackMap, screenTex]);

  useEffect(() => {
    uniformsRef.current = screenUniforms;
  }, [screenUniforms, uniformsRef]);

  // Phone dimensions
  const W = 0.72, H = 1.52, D = 0.078;

  return (
    <group>
      {/* ── Frame (titanium) ────────────────────────────────── */}
      <RoundedBox args={[W, H, D]} radius={0.07} smoothness={4} castShadow>
        <meshPhysicalMaterial
          color="#928e88"
          metalness={1}
          roughness={0.32}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* ── Back glass ──────────────────────────────────────── */}
      <mesh position={[0, 0, -D / 2 - 0.001]}>
        <planeGeometry args={[W - 0.02, H - 0.02]} />
        <meshPhysicalMaterial
          color="#1a1a22"
          metalness={0.1}
          roughness={0.55}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* ── Screen ──────────────────────────────────────────── */}
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <planeGeometry args={[W - 0.025, H - 0.028]} />
        <shaderMaterial
          vertexShader={CRACK_VERT}
          fragmentShader={CRACK_FRAG}
          uniforms={screenUniforms as unknown as Record<string, THREE.IUniform>}
        />
      </mesh>

      {/* Dynamic island */}
      <mesh position={[0, H / 2 - 0.07, D / 2 + 0.002]}>
        <capsuleGeometry args={[0.025, 0.08, 4, 16]} />
        <meshStandardMaterial color="#0a0a10" />
      </mesh>

      {/* ── Camera bump ─────────────────────────────────────── */}
      <group position={[W / 2 - 0.19, H / 2 - 0.24, -D / 2 - 0.016]}>
        <RoundedBox args={[0.28, 0.38, 0.03]} radius={0.04} smoothness={3}>
          <meshPhysicalMaterial color="#1e1e26" metalness={0.8} roughness={0.4} />
        </RoundedBox>
        {([ [-0.06, 0.08], [0.06, 0.08], [0, -0.09] ] as [number, number][]).map(([lx, ly], i) => (
          <group key={i} position={[lx, ly, 0.018]}>
            {/* Outer ring */}
            <mesh>
              <cylinderGeometry args={[0.055, 0.055, 0.004, 32]} />
              <meshPhysicalMaterial color="#888888" metalness={1} roughness={0.2} />
            </mesh>
            {/* Lens glass */}
            <mesh position={[0, 0, 0.003]}>
              <cylinderGeometry args={[0.044, 0.044, 0.006, 32]} />
              <meshPhysicalMaterial
                color="#0a0a0f"
                metalness={0.1}
                roughness={0.04}
                clearcoat={1}
                clearcoatRoughness={0.02}
                envMapIntensity={1.5}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Side buttons ────────────────────────────────────── */}
      {/* Volume up */}
      <mesh position={[-W / 2 - 0.003, H / 2 - 0.5, 0]}>
        <boxGeometry args={[0.01, 0.1, 0.06]} />
        <meshPhysicalMaterial color="#888" metalness={1} roughness={0.3} />
      </mesh>
      {/* Volume down */}
      <mesh position={[-W / 2 - 0.003, H / 2 - 0.65, 0]}>
        <boxGeometry args={[0.01, 0.1, 0.06]} />
        <meshPhysicalMaterial color="#888" metalness={1} roughness={0.3} />
      </mesh>
      {/* Power */}
      <mesh position={[W / 2 + 0.003, H / 2 - 0.52, 0]}>
        <boxGeometry args={[0.01, 0.14, 0.06]} />
        <meshPhysicalMaterial color="#888" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}
