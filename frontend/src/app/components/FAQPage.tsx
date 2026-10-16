import React from "react";
import { PageWrapper } from "./PageWrapper";
import { FAQ } from "./FAQ";

export default function FAQPage() {
  return (
    <PageWrapper
      title="FAQ — CeLL&Ordi | Questions fréquentes"
      description="Réponses aux questions fréquentes sur nos services de réparation de cellulaires et d'ordinateurs à Sainte-Catherine."
    >
      <div style={{ paddingTop: "70px" }}>
        <FAQ />
      </div>
    </PageWrapper>
  );
}
