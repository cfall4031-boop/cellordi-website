import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import {
  NAVY, NAVY_MID, NAVY_LIGHT, GREEN, WHITE, GRAY, GRAY_DIM,
  FONT_DISPLAY, FONT_BODY,
} from "../tokens";

const STAR_COLOR = "#FBBC05";
const GOOGLE_URL = "https://share.google/0amWudWGtFZ0jcD07";

type GoogleReview = {
  kind: "google";
  name: string;
  init: string;
  color: string;
  stars: number;
  text: string;
  since: string;
};

type Testimonial = {
  kind: "testimonial";
  name: string;
  role: string;
  init: string;
  color: string;
  text: string;
  highlight: string;
};

type Entry = GoogleReview | Testimonial;

type Category = {
  id: string;
  rating: number;
  entries: Entry[];
};

const REVIEWS: GoogleReview[] = [
  {
    kind: "google",
    name: "Thomas",
    init: "T",
    color: "#4285F4",
    stars: 5,
    text: "Very good service and excellent work — better than new. Went out of his way to help me out. Highly recommend! 🔥",
    since: "Il y a 3 semaines",
  },
  {
    kind: "google",
    name: "Audrey",
    init: "A",
    color: "#EA4335",
    stars: 5,
    text: "Le cellulaire fonctionne à merveille 😍 Réparation rapide, prix raisonnable et souci du bon travail. Le propriétaire est très attentionné — merci !",
    since: "Il y a 5 mois",
  },
  {
    kind: "google",
    name: "Marcel",
    init: "M",
    color: "#34A853",
    stars: 5,
    text: "J'ai fait changer la coque arrière en verre de mon Samsung S23 Ultra. Wow, très rapide comme service et résultat impeccable. Je recommande fortement !",
    since: "Il y a 6 mois",
  },
];

const GoogleCard = ({ entry, hov }: { entry: GoogleReview; hov: boolean }) => (
  <div style={{
    background: hov ? NAVY_LIGHT : NAVY_MID,
    border: `1px solid ${hov ? "rgba(109,212,0,0.25)" : "rgba(255,255,255,0.06)"}`,
    padding: "1.8rem",
    transition: "all 0.25s",
    transform: hov ? "translateY(-4px)" : "translateY(0)",
    boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.3)" : "none",
    display: "flex", flexDirection: "column", gap: "1rem",
    height: "100%", boxSizing: "border-box",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "50%",
          background: entry.color, display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 700,
          fontSize: "1rem", color: WHITE, flexShrink: 0,
        }}>{entry.init}</div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.95rem", color: WHITE }}>
            {entry.name}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: GRAY_DIM }}>
            {entry.since}
          </div>
        </div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.55, flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </div>
    <span style={{ color: STAR_COLOR, fontSize: "0.9rem", letterSpacing: "1px" }}>
      {"★".repeat(entry.stars)}
    </span>
    <p style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: "#c8c8dc", lineHeight: 1.7, margin: 0, flex: 1 }}>
      "{entry.text}"
    </p>
  </div>
);

const TestimonialCard = ({ entry, hov }: { entry: Testimonial; hov: boolean }) => (
  <div style={{
    background: hov ? NAVY_LIGHT : NAVY_MID,
    borderLeft: `3px solid ${hov ? GREEN : "rgba(109,212,0,0.35)"}`,
    borderTop: `1px solid ${hov ? "rgba(109,212,0,0.2)" : "rgba(255,255,255,0.05)"}`,
    borderRight: `1px solid ${hov ? "rgba(109,212,0,0.2)" : "rgba(255,255,255,0.05)"}`,
    borderBottom: `1px solid ${hov ? "rgba(109,212,0,0.2)" : "rgba(255,255,255,0.05)"}`,
    padding: "2rem 1.8rem",
    transition: "all 0.25s",
    transform: hov ? "translateY(-4px)" : "translateY(0)",
    boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.3)" : "none",
    display: "flex", flexDirection: "column", gap: "1.2rem",
    height: "100%", boxSizing: "border-box",
  }}>
    <span style={{ fontFamily: "Georgia, serif", fontSize: "3.5rem", lineHeight: 0.8, color: GREEN, opacity: 0.35, display: "block", marginBottom: "-0.5rem" }}>❝</span>
    <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.05rem", color: WHITE, lineHeight: 1.4, margin: 0 }}>
      {entry.highlight}
    </p>
    <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY, lineHeight: 1.75, margin: 0, flex: 1 }}>
      {entry.text}
    </p>
    <div style={{ height: "1px", background: "rgba(109,212,0,0.12)" }} />
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{
        width: "38px", height: "38px", borderRadius: "50%",
        background: `linear-gradient(135deg, ${entry.color}cc, ${entry.color}66)`,
        border: `1px solid ${entry.color}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT_DISPLAY, fontWeight: 700,
        fontSize: "0.95rem", color: WHITE, flexShrink: 0,
      }}>{entry.init}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.9rem", color: WHITE }}>
        {entry.name}
      </div>
    </div>
  </div>
);

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function Testimonials() {
  const { t } = useTranslation();
  const [hovCard, setHovCard] = useState<number | null>(null);

  return (
    <section id="testimonials" style={{ background: NAVY, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {t("testimonials.tag")}
            </span>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
              {t("testimonials.title")}
            </h2>

            <a href={GOOGLE_URL} target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.6rem",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "100px", padding: "0.4rem 1.2rem",
                textDecoration: "none", transition: "all 0.2s", marginTop: "0.5rem",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(251,188,5,0.08)"; e.currentTarget.style.borderColor = "rgba(251,188,5,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <GoogleLogo />
              <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY }}>{t("testimonials.google_rating")}</span>
              <span style={{ color: STAR_COLOR, fontSize: "0.85rem" }}>★</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.9rem", color: WHITE }}>4.8</span>
              <span style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: GRAY_DIM }}>{t("testimonials.reviews_count")}</span>
            </a>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {REVIEWS.map((entry, i) => (
            <FadeUp key={entry.name} delay={i * 0.08}>
              <div onMouseEnter={() => setHovCard(i)} onMouseLeave={() => setHovCard(null)} style={{ height: "100%" }}>
                <GoogleCard entry={entry} hov={hovCard === i} />
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.25}>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <a href={GOOGLE_URL} target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.6rem",
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.88rem",
                letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN,
                textDecoration: "none", padding: "0.6rem 1.4rem",
                border: "1px solid rgba(109,212,0,0.25)", borderRadius: "100px",
                background: "rgba(109,212,0,0.05)", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(109,212,0,0.12)"; e.currentTarget.style.borderColor = "rgba(109,212,0,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(109,212,0,0.05)"; e.currentTarget.style.borderColor = "rgba(109,212,0,0.25)"; }}
            >
              <span style={{ color: STAR_COLOR }}>★★★★★</span>
              {t("testimonials.cta")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
