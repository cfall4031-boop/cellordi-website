import React from "react";
import { PageWrapper } from "./PageWrapper";
import { Contact } from "./Contact";

export default function ContactPage() {
  return (
    <PageWrapper
      title="Contact — CeLL&Ordi | Sainte-Catherine, QC"
      description="Contactez CeLL&Ordi : téléphone, email, adresse et horaires d'ouverture. Réparation cellulaire et ordinateur à Sainte-Catherine."
    >
      <div style={{ paddingTop: "70px" }}>
        <Contact />
      </div>
    </PageWrapper>
  );
}
