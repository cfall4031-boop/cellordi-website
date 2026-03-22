import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { NAVY, NAVY_MID, GREEN, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";
import { ARTICLES } from "../data/articles";

const tagColors: Record<string, string> = {
  "Réparation": "#6dd400",
  "Ordinateurs": "#38bdf8",
  "Sécurité":   "#f59e0b",
  "Conseils":   "#a78bfa",
};

// Tags internes en FR (pour filtrer les articles), affichage traduit via t()
const TAGS = ["Tous", ...Array.from(new Set(ARTICLES.map(a => a.tag)))];

export default function BlogListing() {
  const { t } = useTranslation();
  const tt = (tag: string) => t(`blog.tags.${tag}`, { defaultValue: tag });
  const [activeTag, setActiveTag] = useState("Tous");
  const [hovered, setHovered]     = useState<string | null>(null);

  const filtered = activeTag === "Tous" ? ARTICLES : ARTICLES.filter(a => a.tag === activeTag);

  useEffect(() => {
    document.title = 'Blog Conseils & Réparation | Réparation CeLL&Ordi';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', "Conseils d'experts en réparation de téléphones et ordinateurs à Sainte-Catherine, Québec. Guides pratiques pour diagnostiquer et résoudre les pannes les plus courantes.");
    return () => { document.title = 'Réparation CeLL&Ordi — Cellulaire & Ordinateur'; };
  }, []);

  return (
    <motion.div
      style={{ background: NAVY, minHeight: "100vh", color: WHITE }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: "easeInOut" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #0b1c35; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0b1c35; }
        ::-webkit-scrollbar-thumb { background: rgba(109,212,0,0.3); border-radius: 3px; }
        ::selection { background: rgba(109,212,0,0.25); color: #fff; }
        @media (max-width: 600px) {
          .blog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(11,28,53,0.95)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(109,212,0,0.1)",
        padding: "0 2rem", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link to="/" style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.1rem", color: WHITE, textDecoration: "none" }}>
          RÉPARATION <span style={{ color: GREEN }}>CeLL&amp;Ordi</span>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link to="/#blog" style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY, textDecoration: "none" }}>
            {t("blog.back_main")}
          </Link>
          <Link to="/#rendezvous" style={{ ...btn(GREEN, NAVY), textDecoration: "none", display: "inline-block", fontSize: "0.82rem", padding: "0.5rem 1.2rem" }}>
            {t("nav.cta")}
          </Link>
        </div>
      </nav>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, rgba(14,32,64,1) 100%)`,
        borderBottom: "1px solid rgba(109,212,0,0.1)",
        padding: "5rem 2rem 4rem",
        textAlign: "center"
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {t("blog.tag")}
        </span>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(2.5rem, 5vw, 4rem)", color: WHITE, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0.6rem 0 1rem" }}>
          {t("blog.title")}
        </h1>
        <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
          {t("blog.header_sub")}
        </p>
      </div>

      {/* ── FILTRES ────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem 1rem" }}>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          {TAGS.map(tag => {
            const isActive = activeTag === tag;
            const color = tag === "Tous" ? GREEN : (tagColors[tag] || GREEN);
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  background: isActive ? color : "rgba(255,255,255,0.05)",
                  color: isActive ? (tag === "Tous" ? "#0b1c35" : "#0b1c35") : GRAY,
                  border: `1px solid ${isActive ? color : "rgba(255,255,255,0.1)"}`,
                  fontFamily: FONT_BODY, fontWeight: isActive ? 700 : 400,
                  fontSize: "0.88rem", padding: "0.45rem 1.1rem",
                  cursor: "pointer", transition: "all 0.18s",
                  letterSpacing: "0.03em",
                }}
              >
                {tt(tag)}
                {tag !== "Tous" && (
                  <span style={{ marginLeft: "0.4rem", fontSize: "0.78rem", opacity: 0.7 }}>
                    ({ARTICLES.filter(a => a.tag === tag).length})
                  </span>
                )}
              </button>
            );
          })}
          <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY_DIM, alignSelf: "center", marginLeft: "auto" }}>
            {t(filtered.length === 1 ? "blog.articles_count_one" : "blog.articles_count_other", { count: filtered.length })}
          </span>
        </div>

        {/* ── GRILLE D'ARTICLES ──────────────────────────── */}
        <div
          className="blog-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", paddingBottom: "5rem" }}
        >
          {filtered.map(art => (
            <Link key={art.slug} to={`/blog/${art.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <div
                onMouseEnter={() => setHovered(art.slug)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: NAVY_MID,
                  border: `1px solid ${hovered === art.slug ? (tagColors[art.tag] || GREEN) + "55" : "rgba(255,255,255,0.05)"}`,
                  overflow: "hidden",
                  transition: "all 0.25s",
                  transform: hovered === art.slug ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: hovered === art.slug ? `0 8px 32px rgba(0,0,0,0.2)` : "none",
                  cursor: "pointer",
                  height: "100%",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", overflow: "hidden", height: "210px" }}>
                  <img
                    src={art.img}
                    alt={art.title}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      transition: "transform 0.4s",
                      transform: hovered === art.slug ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(11,28,53,0.7) 100%)" }} />
                  <span style={{
                    position: "absolute", top: "1rem", left: "1rem",
                    background: tagColors[art.tag] || GREEN,
                    color: NAVY, fontFamily: FONT_DISPLAY, fontWeight: 700,
                    fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "0.2rem 0.7rem",
                    clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
                  }}>
                    {tt(art.tag)}
                  </span>
                </div>

                {/* Contenu */}
                <div style={{ padding: "1.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.7rem" }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: GRAY_DIM }}>{art.date}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: GRAY_DIM }}>⏱ {art.readTime}</span>
                  </div>

                  <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.15rem", color: WHITE, marginBottom: "0.6rem", lineHeight: 1.3, letterSpacing: "0.02em" }}>
                    {art.title}
                  </h2>

                  <p style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: GRAY, lineHeight: 1.65, marginBottom: "1.1rem" }}>
                    {art.desc}
                  </p>

                  <span style={{
                    fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.85rem",
                    color: tagColors[art.tag] || GREEN,
                    letterSpacing: "0.07em", textTransform: "uppercase"
                  }}>
                    {t("blog.read_more")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Retour à l'accueil */}
      <div style={{
        background: NAVY_MID,
        borderTop: "1px solid rgba(109,212,0,0.12)",
        padding: "3rem 2rem",
        textAlign: "center",
      }}>
        <p style={{ color: GRAY, fontFamily: FONT_DISPLAY, fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          {t("blog.need_repair")}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ ...btn(GREEN, NAVY), textDecoration: "none" }}>{t("blog.back_home")}</a>
          <a href="/#rendezvous" style={{ ...btn("transparent", GREEN), border: `1px solid ${GREEN}`, textDecoration: "none" }}>{t("blog.book_rdv")}</a>
        </div>
      </div>
    </motion.div>
  );
}
