import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { NAVY, NAVY_MID, NAVY_LIGHT, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";
import { getArticle, getRelated, ARTICLES } from "../data/articles";

const tagColors: Record<string, string> = {
  "Réparation": "#6dd400",
  "Ordinateurs": "#38bdf8",
  "Sécurité":   "#f59e0b",
  "Conseils":   "#a78bfa",
};

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const tt = (tag: string) => t(`blog.tags.${tag}`, { defaultValue: tag });
  const article   = getArticle(slug || "");
  const related   = getRelated(slug || "", 2);


  if (!article) {
    return (
      <div style={{ minHeight: "100vh", background: NAVY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "3rem", fontWeight: 900, color: WHITE }}>404</div>
        <p style={{ fontFamily: FONT_BODY, color: GRAY }}>{t("blog.not_found")}</p>
        <Link to="/blog" style={{ ...btn(GREEN, NAVY), textDecoration: "none", display: "inline-block" }}>
          {t("blog.not_found_back")}
        </Link>
      </div>
    );
  }

  const accentColor = tagColors[article.tag] || GREEN;

  useEffect(() => {
    document.title = `${article.title} | Réparation CeLL&Ordi`;

    const setMeta = (sel: string, attr: string, val: string) => {
      let tag = document.querySelector(sel);
      if (!tag) { tag = document.createElement('meta'); document.head.appendChild(tag); }
      tag.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]',        'content', article.desc);
    setMeta('meta[property="og:title"]',       'content', `${article.title} | Réparation CeLL&Ordi`);
    setMeta('meta[property="og:description"]', 'content', article.desc);
    setMeta('meta[property="og:image"]',       'content', article.img);
    setMeta('meta[property="og:type"]',        'content', 'article');
    setMeta('meta[property="og:url"]',         'content', `https://reparationcellordi.ca/blog/${article.slug}`);

    // Attribut manquant sur les og: tags
    document.querySelector('meta[property="og:title"]')?.setAttribute('property', 'og:title');
    document.querySelector('meta[property="og:description"]')?.setAttribute('property', 'og:description');
    document.querySelector('meta[property="og:image"]')?.setAttribute('property', 'og:image');
    document.querySelector('meta[property="og:type"]')?.setAttribute('property', 'og:type');
    document.querySelector('meta[property="og:url"]')?.setAttribute('property', 'og:url');

    // JSON-LD Article schema
    const existing = document.getElementById('ld-article');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id   = 'ld-article';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.desc,
      "image": article.img,
      "datePublished": article.date,
      "author":    { "@type": "Organization", "name": "Réparation CeLL&Ordi" },
      "publisher": { "@type": "Organization", "name": "Réparation CeLL&Ordi", "url": "https://reparationcellordi.ca" },
      "url": `https://reparationcellordi.ca/blog/${article.slug}`,
    });
    document.head.appendChild(script);

    return () => {
      document.title = 'Réparation CeLL&Ordi — Cellulaire & Ordinateur';
      document.getElementById('ld-article')?.remove();
    };
  }, [article]);

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
      `}</style>

      {/* ── NAVBAR simplifiée ───────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(11,28,53,0.95)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(109,212,0,0.1)",
        padding: "0 2rem", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link to="/" style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.1rem", color: WHITE, textDecoration: "none", letterSpacing: "0.03em" }}>
          RÉPARATION <span style={{ color: GREEN }}>CeLL&amp;Ordi</span>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link to="/blog" style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY, textDecoration: "none" }}>
            {t("blog.back_blog")}
          </Link>
          <Link to="/#rendezvous" style={{ ...btn(GREEN, NAVY), textDecoration: "none", display: "inline-block", fontSize: "0.82rem", padding: "0.5rem 1.2rem" }}>
            {t("nav.cta")}
          </Link>
        </div>
      </nav>

      {/* ── HERO article ─────────────────────────────────────── */}
      <div style={{ position: "relative", height: "420px", overflow: "hidden" }}>
        <img
          src={article.img}
          alt={article.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, transparent 30%, ${NAVY} 100%)`
        }} />
        <div style={{
          position: "absolute", bottom: "2.5rem", left: "50%",
          transform: "translateX(-50%)", width: "100%", maxWidth: "860px",
          padding: "0 2rem"
        }}>
          <span style={{
            display: "inline-block",
            background: accentColor, color: NAVY,
            fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.75rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0.25rem 0.9rem", marginBottom: "1rem",
            clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)"
          }}>
            {tt(article.tag)}
          </span>
          <h1 style={{
            fontFamily: FONT_DISPLAY, fontWeight: 900,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: WHITE,
            textTransform: "uppercase", letterSpacing: "0.02em",
            lineHeight: 1.15, margin: "0 0 1rem"
          }}>
            {article.title}
          </h1>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY }}>📅 {article.date}</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY }}>⏱ {article.readTime} {t("blog.read_time")}</span>
          </div>
        </div>
      </div>

      {/* ── CONTENU ──────────────────────────────────────────── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "3rem", alignItems: "start" }} className="blog-layout">
        {/* Article principal */}
        <article>
          {/* Intro */}
          <p style={{
            fontFamily: FONT_BODY, fontSize: "1.08rem", color: GRAY,
            lineHeight: 1.8, marginBottom: "2.5rem",
            padding: "1.5rem", background: NAVY_MID,
            borderLeft: `4px solid ${accentColor}`,
          }}>
            {article.intro}
          </p>

          {/* Sections */}
          {article.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: "2.5rem" }}>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 700,
                fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                color: WHITE, textTransform: "uppercase",
                letterSpacing: "0.03em", marginBottom: "1rem",
                paddingBottom: "0.5rem",
                borderBottom: `2px solid rgba(109,212,0,0.15)`
              }}>
                {section.titre}
              </h2>

              {section.texte && (
                <p style={{ fontFamily: FONT_BODY, fontSize: "0.97rem", color: GRAY, lineHeight: 1.8, marginBottom: section.liste ? "1rem" : 0 }}>
                  {section.texte}
                </p>
              )}

              {section.liste && (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {section.liste.map((item, j) => (
                    <li key={j} style={{
                      fontFamily: FONT_BODY, fontSize: "0.95rem", color: GRAY,
                      lineHeight: 1.7, padding: "0.5rem 0 0.5rem 1.5rem",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      position: "relative"
                    }}>
                      <span style={{ position: "absolute", left: 0, color: accentColor, fontWeight: 700 }}>›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div style={{
            background: `rgba(109,212,0,0.06)`,
            border: `1px solid rgba(109,212,0,0.2)`,
            padding: "1.8rem",
            marginBottom: "3rem",
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1rem", color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.7rem" }}>
              {t("blog.summary")}
            </div>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.97rem", color: GRAY, lineHeight: 1.8, margin: 0 }}>
              {article.conclusion}
            </p>
          </div>

          {/* CTA */}
          <div style={{
            background: NAVY_MID, border: `1px solid rgba(109,212,0,0.15)`,
            padding: "2rem", textAlign: "center"
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.4rem", color: WHITE, textTransform: "uppercase", marginBottom: "0.6rem" }}>
              {t("blog.device_problem")}
            </div>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              {t("blog.techs_available")}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/#rendezvous" style={{ ...btn(GREEN, NAVY), textDecoration: "none", display: "inline-block" }}>
                {t("blog.book_rdv")}
              </Link>
              <a href="tel:5142375792" style={{ ...btn("transparent", GREEN), border: `1px solid ${GREEN}55`, textDecoration: "none", display: "inline-block" }}>
                (514) 237-5792
              </a>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside>
          {/* Articles similaires */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1rem", color: GREEN, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", paddingBottom: "0.6rem", borderBottom: `2px solid rgba(109,212,0,0.2)` }}>
              {t("blog.similar")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {related.map(rel => (
                <Link key={rel.slug} to={`/blog/${rel.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: NAVY_MID, border: "1px solid rgba(109,212,0,0.1)",
                    overflow: "hidden", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${GREEN}44`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(109,212,0,0.1)"; }}>
                    <img src={rel.img} alt={rel.title} style={{ width: "100%", height: "110px", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "0.9rem" }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: "0.7rem", color: tagColors[rel.tag] || GREEN, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {tt(rel.tag)}
                      </span>
                      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.95rem", color: WHITE, lineHeight: 1.3, marginTop: "0.3rem" }}>
                        {rel.title}
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: GRAY_DIM, marginTop: "0.4rem" }}>
                        ⏱ {rel.readTime} {t("blog.read_time")}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Infos boutique */}
            <div style={{ marginTop: "1.5rem", background: NAVY_MID, border: "1px solid rgba(109,212,0,0.1)", padding: "1.2rem" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.88rem", color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.8rem" }}>
                {t("blog.find_us")}
              </div>
              {[
                ["📍", "5050 QC-132 #203, Sainte-Catherine"],
                ["📞", "(514) 237-5792"],
                ["🕐", t("blog.hours1")],
                ["🕐", t("blog.hours2")],
              ].map(([icon, text], i) => (
                <div key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: GRAY, marginBottom: "0.4rem" }}>
                  {icon} {text}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .blog-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

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
