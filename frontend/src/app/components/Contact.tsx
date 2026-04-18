import React from "react";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import { TypewriterTitle } from "./TypewriterTitle";
import { NAVY, NAVY_MID, GREEN, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY } from "../tokens";


const MAPS_URL = "https://www.google.com/maps/search/5050+QC-132+%23203,+Sainte-Catherine,+QC+J5C+1L4";

const IconMapPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconMapSvg = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);

const IconSendSvg = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export function Contact() {
  const { t } = useTranslation();

  const hours = t("contact.info.hours", { returnObjects: true }) as string[];

  const CONTACT_INFO = [
    { Icon: IconMapPin, titleKey: "contact.info.address_title", lines: ["5050 QC-132 #203", "Sainte-Catherine, QC J5C 1L4"] },
    { Icon: IconPhone, titleKey: "contact.info.phone_title", lines: ["(514) 237-5792"] },
    { Icon: IconMail, titleKey: "contact.info.email_title", lines: ["reparationcellulaire.ordinateur@gmail.com"] },
    { Icon: IconClock, titleKey: "contact.info.hours_title", lines: hours },
  ];

  return (
    <section id="contact" style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {t("contact.tag")}
            </span>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
              <TypewriterTitle text={t("contact.title")} />
            </h2>
          </div>
        </FadeUp>

        <FadeUp delay={0}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "2rem" }} className="contact-info-grid">
              {CONTACT_INFO.map((info) => (
                <div key={info.titleKey} style={{ background: NAVY, border: "1px solid rgba(109,212,0,0.1)", padding: "1.4rem" }}>
                  <div style={{ marginBottom: "0.7rem" }}><info.Icon /></div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.95rem", color: GREEN, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
                    {t(info.titleKey)}
                  </div>
                  {info.lines.map((line, i) => (
                    <div key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: i === 0 ? WHITE : GRAY, lineHeight: 1.6, wordBreak: "break-word" }}>
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Map */}
            <div style={{ background: NAVY, border: "1px solid rgba(109,212,0,0.1)", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.75rem" }}>
              <IconMapSvg />
              <span style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY_DIM, textAlign: "center", padding: "0 1rem" }}>
                5050 QC-132 #203, Sainte-Catherine
              </span>
              <a href={MAPS_URL} target="_blank" rel="noreferrer" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.85rem", color: GREEN, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {t("contact.map_link")}
              </a>
            </div>
          </div>
        </FadeUp>
      </div>

      <style>{`
        @media (max-width: 500px) {
          .contact-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
