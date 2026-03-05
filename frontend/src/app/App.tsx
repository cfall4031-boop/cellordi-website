import React from "react";
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
    <div style={{ overflowX: "hidden" }}>
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
    </div>
  );
}
