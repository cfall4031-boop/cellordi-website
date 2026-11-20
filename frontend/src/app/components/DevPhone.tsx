import React from "react";
import { PhoneSection } from "./PhoneSection";

/** Standalone test page — /dev/phone */
export default function DevPhone() {
  return (
    <div style={{ background: "#0b0b0c", minHeight: "100vh" }}>
      {/* Small debug banner */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", borderBottom: "1px solid #333",
        padding: "0.4rem 1rem", fontSize: "0.72rem", color: "#666",
        fontFamily: "monospace",
      }}>
        /dev/phone — scroll to drive animation · progress shown in console
      </div>
      <div style={{ paddingTop: 32 }}>
        <PhoneSection />
      </div>
    </div>
  );
}
