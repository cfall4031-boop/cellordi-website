import React from "react";
import { Environment, ContactShadows } from "@react-three/drei";

export function Lighting() {
  return (
    <>
      {/* Studio HDRI — no background visible */}
      <Environment preset="studio" background={false} />

      {/* Key light — soft top-left */}
      <directionalLight position={[-3, 5, 2]} intensity={1.3} castShadow={false} />

      {/* Rim light — behind, cool blue tint for silhouette */}
      <directionalLight position={[2, 1, -4]} intensity={0.5} color="#b8c8ff" />

      {/* Soft fill from below (bounce light from imaginary floor) */}
      <directionalLight position={[0, -2, 1]} intensity={0.12} color="#ffffff" />

      {/* Contact shadows on invisible floor */}
      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.5}
        blur={2.5}
        far={3}
        resolution={256}
      />
    </>
  );
}
