import * as THREE from "three";

const SIZE = 1024;
// Impact at UV (0.28, 0.28) → canvas (y flipped): cx = 0.28*S, cy = (1-0.28)*S
const IX = Math.round(0.28 * SIZE);
const IY = Math.round(0.72 * SIZE);

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = ((s * 1664525 + 1013904223) | 0) >>> 0;
    return s / 0xffffffff;
  };
}

function drawCrack(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  angle: number,
  length: number,
  rand: () => number,
  depth = 0,
) {
  if (length < 18 || depth > 2) return;
  let x = x0, y = y0, a = angle, rem = length;
  ctx.beginPath();
  ctx.moveTo(x, y);
  while (rem > 0) {
    const seg = Math.min(18 + rand() * 28, rem);
    a += (rand() - 0.5) * 0.45;
    x += Math.cos(a) * seg;
    y += Math.sin(a) * seg;
    ctx.lineTo(x, y);
    rem -= seg;
    if (depth < 2 && rand() < 0.28 && rem > 40) {
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      const ba = a + (rand() < 0.5 ? 1 : -1) * (0.5 + rand() * 0.9);
      drawCrack(ctx, x, y, ba, rem * (0.25 + rand() * 0.35), rand, depth + 1);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }
  ctx.stroke();
}

export function generateCrackTextures(): {
  crackMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const rand = lcg(42);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 15 radial cracks from impact
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2 + (rand() - 0.5) * 0.42;
    const len   = 160 + rand() * 340;
    ctx.lineWidth = 0.9 + rand() * 1.4;
    drawCrack(ctx, IX, IY, angle, len, rand);
  }

  // 3 broken concentric arcs
  for (let ring = 0; ring < 3; ring++) {
    const r = 55 + ring * 85 + rand() * 25;
    ctx.lineWidth = 0.8 + ring * 0.3;
    ctx.strokeStyle = `rgba(255,255,255,${0.65 - ring * 0.12})`;
    for (let arc = 0; arc < 5 + ring; arc++) {
      const sa = rand() * Math.PI * 2;
      const span = 0.25 + rand() * 0.75;
      ctx.beginPath();
      ctx.arc(IX, IY, r, sa, sa + span);
      ctx.stroke();
    }
  }

  // Impact crater
  const g = ctx.createRadialGradient(IX, IY, 0, IX, IY, 22);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.6, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(IX, IY, 22, 0, Math.PI * 2);
  ctx.fill();

  const crackMap = new THREE.CanvasTexture(canvas);
  crackMap.flipY = false;
  crackMap.needsUpdate = true;

  // ── Derive normal map (Sobel emboss) ──────────────────────────
  const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
  const nCanvas = document.createElement("canvas");
  nCanvas.width = SIZE;
  nCanvas.height = SIZE;
  const nCtx = nCanvas.getContext("2d")!;
  nCtx.fillStyle = "rgb(128,128,255)";
  nCtx.fillRect(0, 0, SIZE, SIZE);
  const nData = nCtx.getImageData(0, 0, SIZE, SIZE);

  const px = imgData.data;
  for (let y = 1; y < SIZE - 1; y++) {
    for (let x = 1; x < SIZE - 1; x++) {
      const r = px[(y * SIZE + x) * 4];
      if (r < 15) continue;
      const l = px[(y * SIZE + (x - 1)) * 4];
      const ri = px[(y * SIZE + (x + 1)) * 4];
      const u = px[((y - 1) * SIZE + x) * 4];
      const d = px[((y + 1) * SIZE + x) * 4];
      const nx = ((ri - l) / 255) * 0.5 + 0.5;
      const ny = ((d - u) / 255) * 0.5 + 0.5;
      const len = Math.hypot(nx - 0.5, ny - 0.5, 1);
      const idx = (y * SIZE + x) * 4;
      nData.data[idx]     = Math.round(((nx - 0.5) / len + 0.5) * 255);
      nData.data[idx + 1] = Math.round(((ny - 0.5) / len + 0.5) * 255);
      nData.data[idx + 2] = Math.round((1 / len) * 255);
      nData.data[idx + 3] = 255;
    }
  }
  nCtx.putImageData(nData, 0, 0);

  const normalMap = new THREE.CanvasTexture(nCanvas);
  normalMap.flipY = false;
  normalMap.needsUpdate = true;

  return { crackMap, normalMap };
}

/** UV coord of the impact point (for the shader) */
export const CRACK_IMPACT_UV = new THREE.Vector2(0.28, 0.28);
