import React, { Suspense, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, SMAA, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Scene } from "./Scene";

interface PhoneCanvasProps {
  progressRef: React.MutableRefObject<number>;
  isMobile?: boolean;
}

export function PhoneCanvas({ progressRef, isMobile = false }: PhoneCanvasProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      frameloop="demand"
      camera={{ fov: 48, near: 0.1, far: 50, position: [0, 0, 4] }}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
        antialias: false, // SMAA handles AA
      }}
      aria-hidden="true"
    >
      <color attach="background" args={["#0b0b0c"]} />

      <Suspense fallback={null}>
        <Scene progressRef={progressRef} isMobile={isMobile} />
      </Suspense>

      <EffectComposer multisampling={0}>
        <SMAA />
        <Vignette eskil={false} offset={0.28} darkness={0.55} />
        <Noise opacity={0.03} premultiplied={false} blendFunction={BlendFunction.SCREEN} />
      </EffectComposer>
    </Canvas>
  );
}
