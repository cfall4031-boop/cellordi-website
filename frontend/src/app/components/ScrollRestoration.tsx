import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

// Mémorise les positions de scroll par clé d'historique
const positions: Record<string, number> = {};

/**
 * Composant invisible — restaure la position de scroll intelligemment :
 * - Nouvelle page (avant) → scroll vers le haut
 * - Retour arrière (Back) → restaure la position exacte
 */
export function ScrollRestoration() {
  const { key, hash } = useLocation();
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    // Sauvegarder la position de la page qu'on quitte
    if (prevKey.current) {
      positions[prevKey.current] = window.scrollY;
    }

    if (hash) {
      // Laisser le navigateur scroller vers l'ancre (#rendezvous, #services, etc.)
      const id = hash.slice(1);
      const attempt = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          // Élément pas encore rendu (ex: navigation SPA) — réessayer
          requestAnimationFrame(attempt);
        }
      };
      requestAnimationFrame(attempt);
    } else {
      // Restaurer la position ou aller en haut
      const saved = positions[key];
      if (saved !== undefined) {
        requestAnimationFrame(() => window.scrollTo(0, saved));
      } else {
        window.scrollTo(0, 0);
      }
    }

    prevKey.current = key;
  }, [key]);

  return null;
}
