import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { NAVY, GREEN, GREEN_GLOW, WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn } from "../tokens";
import { ARTICLES } from "../data/articles";

// ── Données de recherche statiques ────────────────────────────────────────────
type SearchItem = { label: string; sub?: string; href: string; cat: string };

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [hov, setHov]                 = useState<string | null>(null);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer la recherche en cliquant à l'extérieur ou Escape
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", onKey); };
  }, [searchOpen]);

  // Focus auto sur l'input quand le panel s'ouvre
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const toggleLang = () => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");

  const navLinks = [
    { label: t("nav.services"),  href: "/#services" },
    { label: t("nav.rdv"),       href: "/#rendezvous" },
    { label: t("nav.suivi"),     href: "/#suivi" },
    { label: t("nav.blog"),      href: "/blog" },
    { label: t("nav.contact"),   href: "/#contact" },
    { label: t("nav.decharge"),  href: "/#decharge" },
  ];

  // ── Données recherche ──────────────────────────────────────────────────────
  const isFR = i18n.language === "fr";

  const SECTIONS: SearchItem[] = [
    { label: isFR ? "Services"         : "Services",        href: "/#services",    cat: isFR ? "Section" : "Section" },
    { label: isFR ? "Rendez-vous"      : "Appointment",     href: "/#rendezvous",  cat: isFR ? "Section" : "Section" },
    { label: isFR ? "Suivi réparation" : "Repair tracking", href: "/#suivi",       cat: isFR ? "Section" : "Section" },
    { label: isFR ? "Fiche de décharge": "Drop-off form",   href: "/#decharge",    cat: isFR ? "Section" : "Section" },
    { label: isFR ? "Contact"          : "Contact",         href: "/#contact",     cat: isFR ? "Section" : "Section" },
    { label: isFR ? "Blog"             : "Blog",            href: "/blog",         cat: isFR ? "Section" : "Section" },
  ];

  const SERVICE_KEYS = ["cellulaires", "ordinateurs", "informatique", "web", "cloud", "entretien"];
  const SERVICES: SearchItem[] = SERVICE_KEYS.map((k) => ({
    label: t(`services.items.${k}.title`),
    sub:   t(`services.items.${k}.desc`),
    href:  `/#services`,
    cat:   isFR ? "Service" : "Service",
  }));

  const BLOG_ITEMS: SearchItem[] = ARTICLES.map((a) => ({
    label: a.title,
    sub:   a.desc,
    href:  `/blog/${a.slug}`,
    cat:   "Blog",
  }));

  const ALL_ITEMS: SearchItem[] = [...SECTIONS, ...SERVICES, ...BLOG_ITEMS];

  const q = searchQuery.toLowerCase().trim();
  const results: SearchItem[] = q.length >= 2
    ? ALL_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(q) ||
        (item.sub || "").toLowerCase().includes(q)
      ).slice(0, 8)
    : [];

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  // ── Icône loupe SVG ───────────────────────────────────────────────────────
  const SearchIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );

  return (
    <div ref={searchRef}>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          background: scrolled || searchOpen ? `${NAVY}f5` : "transparent",
          backdropFilter: scrolled || searchOpen ? "blur(12px)" : "none",
          borderBottom: scrolled || searchOpen ? `1px solid rgba(109,212,0,0.12)` : "none",
          transition: "all 0.3s",
          padding: "0 2rem",
        }}
      >
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "70px",
        }}>
          {/* Logo */}
          <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <svg viewBox="0 0 512 512" style={{ width: "34px", height: "34px", flexShrink: 0 }}>
              <rect width="512" height="512" rx="80" fill={NAVY}/>
              <text x="256" y="235" textAnchor="middle" dominantBaseline="central"
                    fontFamily="'Arial Black',sans-serif" fontWeight={900}
                    fontSize={240} fill={GREEN} letterSpacing={-10}>CO</text>
              <rect x="176" y="345" width="160" height="16" rx="8" fill={GREEN}/>
            </svg>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.4rem", color: WHITE, letterSpacing: "0.05em", lineHeight: 1.1 }}>
              <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, color: GRAY, letterSpacing: "0.18em", textTransform: "uppercase" }}>{t("nav.repair")}</span>
              CeLL<span style={{ color: GREEN }}>&</span>Ordi
            </span>
          </a>

          {/* Desktop Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }} className="nav-desktop">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHov(link.href)}
                onMouseLeave={() => setHov(null)}
                style={{
                  fontFamily: FONT_DISPLAY, fontWeight: 600,
                  fontSize: "0.82rem", letterSpacing: "0.06em",
                  color: hov === link.href ? GREEN : GRAY,
                  textDecoration: "none", padding: "0.4rem 0.65rem",
                  transition: "color 0.2s", textTransform: "uppercase",
                }}
              >
                {link.label}
              </a>
            ))}

            {/* CTA */}
            <a
              href="/#rendezvous"
              style={{ ...btn(GREEN, NAVY), fontSize: "0.88rem", padding: "0.6rem 1.5rem", marginLeft: "0.5rem" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_GLOW)}
              onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
            >
              {t("nav.cta")}
            </a>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              style={{
                background: "none", border: `1px solid rgba(109,212,0,0.3)`,
                borderRadius: "4px", cursor: "pointer",
                padding: "0.4rem 0.7rem", marginLeft: "0.6rem",
                display: "flex", alignItems: "center", gap: "0.2rem",
                fontFamily: FONT_DISPLAY, fontWeight: 700,
                fontSize: "0.78rem", letterSpacing: "0.08em",
              }}
            >
              <span style={{ color: i18n.language === "fr" ? GREEN : GRAY }}>FR</span>
              <span style={{ color: "rgba(109,212,0,0.4)", fontSize: "0.7rem" }}>|</span>
              <span style={{ color: i18n.language === "en" ? GREEN : GRAY }}>EN</span>
            </button>

            {/* Bouton recherche */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              title="Rechercher"
              style={{
                background: searchOpen ? "rgba(109,212,0,0.1)" : "none",
                border: `1px solid ${searchOpen ? GREEN : "rgba(109,212,0,0.3)"}`,
                borderRadius: "4px", cursor: "pointer",
                padding: "0.42rem 0.65rem", marginLeft: "0.4rem",
                display: "flex", alignItems: "center",
                color: searchOpen ? GREEN : GRAY,
                transition: "all 0.2s",
              }}
            >
              <SearchIcon />
            </button>
          </div>

          {/* Burger Mobile */}
          <div style={{ display: "none", alignItems: "center", gap: "0.6rem" }} className="nav-burger-wrap">
            {/* Search icon mobile */}
            <button
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: searchOpen ? GREEN : GRAY, padding: "4px", display: "flex",
              }}
            >
              <SearchIcon />
            </button>
            <button
              onClick={() => { setMenuOpen(!menuOpen); if (searchOpen) { setSearchOpen(false); setSearchQuery(""); } }}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px", padding: "4px" }}
            >
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  display: "block", width: "24px", height: "2px",
                  background: GREEN, transition: "all 0.28s ease", transformOrigin: "center",
                  ...(i === 0 && menuOpen ? { transform: "rotate(45deg) translate(5px, 7px)" } : {}),
                  ...(i === 1 && menuOpen ? { opacity: 0, transform: "scaleX(0)" } : {}),
                  ...(i === 2 && menuOpen ? { transform: "rotate(-45deg) translate(5px, -7px)" } : {}),
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div style={{
          maxHeight: menuOpen ? "520px" : "0",
          overflow: "hidden", transition: "max-height 0.32s ease",
          background: NAVY, borderTop: menuOpen ? `1px solid rgba(109,212,0,0.15)` : "none",
        }}>
          <div style={{ padding: "1rem 2rem" }}>
            {navLinks.map((link) => (
              <a
                key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", fontFamily: FONT_DISPLAY, fontWeight: 600,
                  fontSize: "1.1rem", letterSpacing: "0.07em", color: WHITE,
                  textDecoration: "none", padding: "0.75rem 0",
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                  textTransform: "uppercase",
                }}
              >
                {link.label}
              </a>
            ))}
            <div style={{ paddingTop: "1rem", display: "flex", gap: "0.5rem" }}>
              {["fr", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { i18n.changeLanguage(lang); setMenuOpen(false); }}
                  style={{
                    fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.9rem",
                    letterSpacing: "0.1em",
                    background: i18n.language === lang ? GREEN : "transparent",
                    color: i18n.language === lang ? NAVY : GRAY,
                    border: `1px solid ${i18n.language === lang ? GREEN : "rgba(255,255,255,0.15)"}`,
                    padding: "0.4rem 1rem", cursor: "pointer", textTransform: "uppercase",
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .nav-desktop { display: none !important; }
            .nav-burger-wrap { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* ── Panel de recherche ─────────────────────────────────────────────── */}
      {searchOpen && (
        <div style={{
          position: "fixed", top: "70px", left: 0, right: 0,
          background: `${NAVY}f8`, backdropFilter: "blur(16px)",
          borderBottom: `1px solid rgba(109,212,0,0.15)`,
          zIndex: 999, padding: "1.2rem 2rem 1.4rem",
        }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            {/* Input */}
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                color: GRAY_DIM, pointerEvents: "none", display: "flex",
              }}>
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("nav.search_placeholder")}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid rgba(109,212,0,0.25)`,
                  borderRadius: "8px",
                  padding: "0.75rem 1rem 0.75rem 2.8rem",
                  fontFamily: FONT_BODY, fontSize: "1rem",
                  color: WHITE, outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: GRAY_DIM, fontSize: "1.1rem", lineHeight: 1,
                  }}
                >×</button>
              )}
            </div>

            {/* Résultats */}
            {q.length >= 2 && (
              <div style={{ marginTop: "0.75rem" }}>
                {results.length === 0 ? (
                  <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.9rem", margin: "0.5rem 0" }}>
                    {i18n.language === "fr" ? "Aucun résultat." : "No results."}
                  </p>
                ) : (
                  results.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={closeSearch}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "6px",
                        textDecoration: "none",
                        transition: "background 0.15s",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,212,0,0.07)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{
                        fontFamily: FONT_DISPLAY, fontSize: "0.65rem", fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: GREEN, background: "rgba(109,212,0,0.1)",
                        border: "1px solid rgba(109,212,0,0.2)",
                        padding: "0.15rem 0.5rem", borderRadius: "4px",
                        flexShrink: 0, minWidth: "58px", textAlign: "center",
                      }}>
                        {item.cat}
                      </span>
                      <span style={{ flex: 1 }}>
                        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "0.9rem", color: WHITE, display: "block" }}>
                          {item.label}
                        </span>
                        {item.sub && (
                          <span style={{
                            fontFamily: FONT_BODY, fontSize: "0.75rem", color: GRAY_DIM,
                            display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            maxWidth: "480px",
                          }}>
                            {item.sub}
                          </span>
                        )}
                      </span>
                      <span style={{ color: GRAY_DIM, fontSize: "0.85rem" }}>→</span>
                    </a>
                  ))
                )}
              </div>
            )}

            {q.length < 2 && (
              <p style={{ fontFamily: FONT_BODY, color: GRAY_DIM, fontSize: "0.8rem", marginTop: "0.6rem" }}>
                {i18n.language === "fr" ? "Tapez au moins 2 caractères…" : "Type at least 2 characters…"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
