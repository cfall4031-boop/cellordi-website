import React from "react";
import { PageWrapper } from "./PageWrapper";
import { Testimonials } from "./Testimonials";

export default function AvisPage() {
  return (
    <PageWrapper
      title="Avis clients — CeLL&Ordi"
      description="Découvrez ce que pensent nos clients de CeLL&Ordi. Avis et témoignages sur nos services de réparation."
    >
      <div style={{ paddingTop: "70px" }}>
        <Testimonials />
      </div>
    </PageWrapper>
  );
}
