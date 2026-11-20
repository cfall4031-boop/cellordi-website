import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { generateShards, applyShardMatrix, IMPACT_WORLD } from "./utils/shardData";

// Irregular shard geometry — a small convex quadrilateral
function createShardGeo(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  // Two triangles (irregular quad)
  const v = new Float32Array([
     0.0,  1.0,  0.0,
    -0.9, -0.6,  0.04,
     0.3, -0.9, -0.04,
     0.0,  1.0,  0.0,
     0.3, -0.9, -0.04,
     1.0,  0.2,  0.02,
  ]);
  geo.setAttribute("position", new THREE.BufferAttribute(v, 3));
  geo.computeVertexNormals();
  return geo;
}

interface GlassShardsProps {
  count?: number;
  progressRef: React.MutableRefObject<number>;
}

export function GlassShards({ count = 80, progressRef }: GlassShardsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const shards = useMemo(() => generateShards(count), [count]);
  const geo    = useMemo(() => createShardGeo(), []);
  const mat    = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#c8d8f0",
    metalness: 0.05,
    roughness: 0.08,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
    envMapIntensity: 1.2,
  }), []);

  // Hidden matrix (scale = 0) used when shards should not be visible
  const hiddenMatrix = useMemo(() => {
    const m = new THREE.Matrix4();
    m.makeScale(0, 0, 0);
    return m;
  }, []);

  // Initialize all instances as hidden
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      meshRef.current.setMatrixAt(i, hiddenMatrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, hiddenMatrix]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const p = progressRef.current;

    // Shards are only active during impact + settle + close-up + repair
    // p ∈ [0.33, 0.87]
    if (p < 0.33 || p > 0.87) {
      for (let i = 0; i < count; i++) {
        mesh.setMatrixAt(i, hiddenMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      return;
    }

    // t=0: at impact, t=1: fully dispersed
    let t: number;
    if (p < 0.60) {
      // Flying out: p 0.35→0.60 maps to t 0→1
      t = Math.min((p - 0.33) / 0.27, 1.0);
    } else {
      // Flying back: p 0.60→0.87 maps to t 1→0
      t = 1.0 - Math.min((p - 0.60) / 0.27, 1.0);
    }

    // Fade out near ends of active range
    const fadeIn  = Math.min((p - 0.33) / 0.04, 1.0);
    const fadeOut = Math.min((0.87 - p) / 0.04, 1.0);
    mat.opacity = 0.78 * fadeIn * fadeOut;

    for (let i = 0; i < count; i++) {
      applyShardMatrix(shards[i], t, mesh, i);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, mat, count]} castShadow>
    </instancedMesh>
  );
}
