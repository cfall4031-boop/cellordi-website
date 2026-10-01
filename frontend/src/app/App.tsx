import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Rendezvous } from "./components/Rendezvous";
import { Suivi } from "./components/Suivi";
import { Decharge } from "./components/Decharge";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

import "../styles/fonts.css";

export default function App() {
  return (
    <>
    <motion.div
      style={{ overflowX: "hidden" }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: "easeInOut" }}
    >
      <Navbar />
      <Hero />
      <Services />
      <Rendezvous />
      <Suivi />
      <Decharge />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />


      {/* Mobile sticky CTA bar */}
      <div className="mobile-cta-bar">
        <a href="tel:5142375792" className="cta-call">📞 Appeler</a>
        <a href="/#rendezvous" className="cta-rdv">📅 Prendre rendez-vous</a>
      </div>

      {/* Global animations injected once */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: #0c0c12; }

        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes gridScroll {
          0%   { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(109,212,0,0.3); }
          50%       { box-shadow: 0 0 28px rgba(109,212,0,0.6); }
        }

        /* Smooth scroll offset for fixed navbar */
        section[id] { scroll-margin-top: 70px; }

        @keyframes ring-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(109,212,0,0.55), 0 6px 28px rgba(109,212,0,0.4); }
          60%  { box-shadow: 0 0 0 14px rgba(109,212,0,0), 0 6px 28px rgba(109,212,0,0.4); }
          100% { box-shadow: 0 0 0 0 rgba(109,212,0,0), 0 6px 28px rgba(109,212,0,0.4); }
        }

        /* Mobile sticky CTA bar */
        .mobile-cta-bar { display: none; }
        @media (max-width: 768px) {
          .mobile-cta-bar {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 999;
            background: rgba(12,12,18,0.96);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-top: 1px solid rgba(109,212,0,0.25);
            padding: 0.6rem 1rem;
            gap: 0.6rem;
          }
          .mobile-cta-bar a {
            flex: 1; display: flex; align-items: center; justify-content: center;
            gap: 0.4rem; padding: 0.7rem 0.5rem;
            border-radius: 6px; text-decoration: none;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700; font-size: 0.95rem; letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          .mobile-cta-bar .cta-call {
            background: #6dd400; color: #0c0c12;
            box-shadow: 0 0 18px rgba(109,212,0,0.35);
          }
          .mobile-cta-bar .cta-rdv {
            background: transparent; color: #6dd400;
            border: 1.5px solid rgba(109,212,0,0.5);
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0c0c12; }
        ::-webkit-scrollbar-thumb { background: rgba(109,212,0,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(109,212,0,0.6); }

        /* Input focus ring */
        input:focus, textarea:focus, select:focus {
          border-color: rgba(109,212,0,0.5) !important;
          box-shadow: 0 0 0 2px rgba(109,212,0,0.1);
        }

        /* Selection color */
        ::selection {
          background: rgba(109,212,0,0.25);
          color: #fff;
        }
      `}</style>
    </motion.div>
    <Analytics />
    </>
  );
}
