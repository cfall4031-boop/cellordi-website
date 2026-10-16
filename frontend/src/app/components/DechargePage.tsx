import React from "react";
import { PageWrapper } from "./PageWrapper";
import { Decharge } from "./Decharge";

export default function DechargePage() {
  return (
    <PageWrapper
      title="Fiche de décharge — CeLL&Ordi"
      description="Remplissez la fiche de décharge de responsabilité avant de déposer votre appareil chez CeLL&Ordi."
    >
      <div style={{ paddingTop: "70px" }}>
        <Decharge />
      </div>
    </PageWrapper>
  );
}
