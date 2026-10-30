import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { PageWrapper } from "./components/PageWrapper";
import { Hero } from "./components/Hero";
import { Rendezvous } from "./components/Rendezvous";
import { Suivi } from "./components/Suivi";

export default function App() {
  return (
    <>
      <PageWrapper
        title="Réparation CeLL&Ordi — Cellulaire & Ordinateur | Sainte-Catherine, QC"
        description="Réparation express de téléphones et ordinateurs à Sainte-Catherine, QC. Diagnostic gratuit, service rapide et professionnel."
      >
        <Hero />
        <Suivi />
        <Rendezvous />
      </PageWrapper>
      <Analytics />
    </>
  );
}
