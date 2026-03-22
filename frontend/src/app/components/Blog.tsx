import React, { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FadeUp } from "./FadeUp";
import { NAVY, NAVY_MID, GREEN, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";
import { ARTICLES } from "../data/articles";

// Afficher seulement les 3 premiers articles sur la page d'accueil
const PREVIEW = ARTICLES.slice(0, 3);

export function Blog() {
  const { t } = useTranslation();
  const tt = (tag: string) => t(`blog.tags.${tag}`, { defaultValue: tag });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="blog" style={{ background: NAVY, padding: "7rem 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <FadeUp>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "4rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {t("blog.tag")}
              </span>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 0" }}>
                {t("blog.title")}
              </h2>
            </div>
            <Link
              to="/blog"
              style={{ ...btn("transparent", GREEN), border: `1px solid ${GREEN}55`, fontSize: "0.88rem", padding: "0.6rem 1.5rem", textDecoration: "none", display: "inline-block" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `rgba(109,212,0,0.1)`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {t("blog.all")}
            </Link>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {PREVIEW.map((art, i) => (
            <FadeUp key={art.slug} delay={i * 0.1}>
              <Link
                to={`/blog/${art.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: NAVY_MID,
                    border: `1px solid ${hovered === i ? GREEN + "44" : "rgba(255,255,255,0.05)"}`,
                    overflow: "hidden",
                    transition: "all 0.25s",
                    transform: hovered === i ? "translateY(-4px)" : "translateY(0)",
                    boxShadow: hovered === i ? `0 8px 32px rgba(109,212,0,0.08)` : "none",
                    cursor: "pointer",
                  }}
                >
                  {/* Image */}
                  <div style={{ position: "relative", overflow: "hidden", height: "200px" }}>
                    <img
                      src={art.img}
                      alt={art.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s",
                        transform: hovered === i ? "scale(1.05)" : "scale(1)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, transparent 50%, rgba(11,28,53,0.8) 100%)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "1rem",
                        left: "1rem",
                        background: GREEN,
                        color: NAVY,
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "0.25rem 0.75rem",
                        clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
                      }}
                    >
                      {tt(art.tag)}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: GRAY_DIM }}>{art.date}</span>
                      <span style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: GRAY_DIM }}>⏱ {art.readTime} {t("blog.read_time")}</span>
                    </div>

                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.2rem", color: WHITE, marginBottom: "0.7rem", lineHeight: 1.3, letterSpacing: "0.02em" }}>
                      {art.title}
                    </h3>

                    <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY, lineHeight: 1.65, marginBottom: "1.2rem" }}>
                      {art.desc}
                    </p>

                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.88rem", color: GREEN, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      {t("blog.read_more")}
                    </span>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
