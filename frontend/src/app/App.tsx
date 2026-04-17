import React from "react";
import { motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Rendezvous } from "./components/Rendezvous";
import { Suivi } from "./components/Suivi";
import { Decharge } from "./components/Decharge";
import { Testimonials } from "./components/Testimonials";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

import "../styles/fonts.css";

export default function App() {
  return (
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
      <Contact />
      <Footer />


      {/* Global animations injected once */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: #0c0c12; }

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

        /* Sticky call button — mobile: pill subtil semi-transparent */
        @media (max-width: 600px) {
          .sticky-call-btn {
            bottom: 1.2rem !important;
            right: 1.2rem !important;
            background: rgba(12,12,18,0.75) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: #6dd400 !important;
            border: 1px solid rgba(109,212,0,0.35) !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
            font-size: 0.88rem !important;
            padding: 0.7rem 1.25rem !important;
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
  );
}
