import React from "react";
import { motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Process } from "./components/Process";
import { Rendezvous } from "./components/Rendezvous";
import { Suivi } from "./components/Suivi";
import { Decharge } from "./components/Decharge";
import { Testimonials } from "./components/Testimonials";
import { Blog } from "./components/Blog";
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
      <Process />
      <Rendezvous />
      <Suivi />
      <Decharge />
      <Testimonials />
      <Blog />
      <Contact />
      <Footer />

      {/* === BOUTON STICKY "APPELER" — optimisé Meta Ads mobile === */}
      <a
        href="tel:5142375792"
        className="sticky-call-btn"
        style={{
          position: "fixed",
          zIndex: 9999,
          bottom: "1.8rem",
          right: "1.8rem",
          background: "#6dd400",
          color: "#0c0c12",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: "0.95rem",
          letterSpacing: "0.07em",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          padding: "0.85rem 1.5rem",
          borderRadius: "50px",
          boxShadow: "0 6px 28px rgba(109,212,0,0.4)",
          animation: "ring-pulse 2.2s ease-out infinite",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.01L6.6 10.8z"/>
        </svg>
        Appeler
      </a>

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
