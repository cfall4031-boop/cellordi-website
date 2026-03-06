import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FadeUp } from "./FadeUp";
import {
  NAVY, NAVY_MID, NAVY_LIGHT, GREEN, GREEN_GLOW,
  WHITE, GRAY, GRAY_DIM, FONT_DISPLAY, FONT_BODY, btn,
} from "../tokens";
import "../../styles/fonts.css";

// ─── Types ───────────────────────────────────────────────────────────────────
type ServiceData = {
  title: string;
  subtitle: string;
  tagline: string;
  heroImg: string;
  sideImg: string;
  description: string;
  stats: { val: string; label: string }[];
  features: { title: string; desc: string }[];
  process: { num: string; title: string; desc: string }[];
  trustPoints: string[];
};

// ─── Data ────────────────────────────────────────────────────────────────────
const SERVICES_DB: Record<string, ServiceData> = {
  cellulaires: {
    title: "Réparation Cellulaires",
    subtitle: "iPhone, Samsung, Huawei & plus",
    tagline: "Votre téléphone réparé en moins de 2 heures avec des pièces certifiées.",
    heroImg: "https://images.unsplash.com/photo-1697208386334-cdb57cd8ae75?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1746005718004-1f992c399428?auto=format&fit=crop&w=800&q=80",
    description:
      "Spécialistes en réparation de téléphones intelligents depuis 2024, nous intervenons sur toutes les marques et tous les modèles. Que ce soit un écran fissuré, une batterie défaillante ou un connecteur endommagé, nos techniciens certifiés utilisent des pièces de qualité OEM pour redonner vie à votre appareil.",
    stats: [
      { val: "< 2h", label: "Délai moyen" },
      { val: "98%", label: "Satisfaction" },
      { val: "30 jours", label: "Garantie pièces" },
      { val: "100+", label: "Modèles réparés" },
    ],
    features: [
      {
        title: "Remplacement d'écran",
        desc: "Dalle LCD ou OLED d'origine, calibration tactile complète, test de luminosité et de réactivité. Compatible toutes générations iPhone, Samsung Galaxy et Android.",
      },
      {
        title: "Remplacement de batterie",
        desc: "Batterie certifiée avec outil de calibration professionnel. Retrouvez 100 % d'autonomie dès le premier jour. Test de capacité avant et après l'intervention.",
      },
      {
        title: "Réparation de caméra",
        desc: "Caméra frontale, arrière, module vidéo 4K. Diagnostic optique complet avec banc de test, remplacement du module si nécessaire, alignement précis.",
      },
      {
        title: "Connecteur de charge",
        desc: "Port USB-C, Lightning ou micro-USB — nettoyage par air comprimé ou remplacement complet selon l'état. Test de charge rapide et vérification de la synchronisation.",
      },
      {
        title: "Boutons & haut-parleurs",
        desc: "Bouton home, power, volume, vibreur, haut-parleur, écouteur, microphone — tous les composants internes sont diagnostiquables et remplaçables.",
      },
      {
        title: "Récupération de données",
        desc: "Extraction sécurisée des contacts, photos et documents même sur un appareil qui ne démarre plus. Transfert vers votre nouveau téléphone ou sauvegarde sur clé USB.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Dépôt & Accueil",
        desc: "Amenez votre téléphone en boutique sans rendez-vous. Nos techniciens l'inspectent visuellement et notent vos observations et symptômes.",
      },
      {
        num: "02",
        title: "Diagnostic Complet (30 min)",
        desc: "Tests approfondis : écran, batterie, caméras, connecteurs, réseau, haut-parleurs. Rapport détaillé de tous les problèmes détectés.",
      },
      {
        num: "03",
        title: "Devis & Accord",
        desc: "Vous recevez un devis précis par SMS ou en boutique. Aucun frais caché. Vous acceptez librement avant toute intervention.",
      },
      {
        num: "04",
        title: "Réparation (1–2h)",
        desc: "Intervention en atelier avec pièces certifiées. La majorité des réparations courantes est complétée le jour même, souvent en moins de 2 heures.",
      },
      {
        num: "05",
        title: "Tests & Récupération",
        desc: "Protocole de tests qualité complet avant remise. Votre appareil repart avec une garantie de 30 jours sur la pièce remplacée.",
      },
    ],
    trustPoints: [
      "Techniciens certifiés & expérimentés",
      "Pièces de qualité OEM ou d'origine",
      "Diagnostic gratuit, sans engagement",
      "Garantie 30 jours sur chaque pièce remplacée",
    ],
  },

  ordinateurs: {
    title: "Réparation Ordinateurs",
    subtitle: "PC, Mac, Ultrabooks & Workstations",
    tagline: "PC ou Mac, on remet votre ordinateur sur pied rapidement.",
    heroImg: "https://images.unsplash.com/photo-1689236673934-66f8e9d9279b?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
    description:
      "Votre ordinateur rame, ne démarre plus ou affiche des erreurs ? Nos techniciens diagnostiquent et réparent tous types de PC et Mac. Nous intervenons sur le matériel (hardware) comme sur le logiciel (software) avec des outils professionnels et des pièces de qualité.",
    stats: [
      { val: "PC & Mac", label: "Toutes plateformes" },
      { val: "Données", label: "Sécurisées" },
      { val: "40 jours", label: "Garantie" },
    ],
    features: [
      {
        title: "Remplacement SSD / HDD",
        desc: "Migration complète de vos données vers un SSD ultra-rapide. Gain de vitesse jusqu'à 10× par rapport à un disque dur classique. Compatible Windows, macOS, Linux.",
      },
      {
        title: "Augmentation de RAM",
        desc: "Ajout ou remplacement de barrettes mémoire pour fluidifier le multitâche et accélérer vos applications créatives ou professionnelles.",
      },
      {
        title: "Nettoyage & Désinfection",
        desc: "Suppression de virus, malwares, adwares, spywares. Antivirus de nouvelle génération installé et configuré. Système optimisé pour une vitesse maximale.",
      },
      {
        title: "Réparation écran laptop",
        desc: "Remplacement de dalles LCD, IPS ou OLED pour tous modèles de portables. Réparation de charnières, remplacement de clavier et de pavé tactile.",
      },
      {
        title: "Réinstallation OS",
        desc: "Windows 10/11, macOS ou Linux installé proprement avec tous vos pilotes, logiciels de base et récupération de vos fichiers personnels.",
      },
      {
        title: "Récupération de données",
        desc: "Disque dur mort, SSD corrompu ou formatage accidentel. Nous récupérons photos, documents, emails et fichiers importants avec un taux de succès élevé.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Dépôt de l'appareil",
        desc: "Apportez votre ordinateur avec son chargeur. Nous documentons son état, vos symptômes et la liste des logiciels importants.",
      },
      {
        num: "02",
        title: "Diagnostic matériel & logiciel",
        desc: "Test CPU, RAM, GPU, stockage, ventilation, alimentation, système. Identification précise de chaque problème avec rapport complet.",
      },
      {
        num: "03",
        title: "Devis détaillé",
        desc: "Liste des interventions nécessaires avec prix et délais estimés. Vous choisissez librement ce que vous souhaitez faire réparer.",
      },
      {
        num: "04",
        title: "Réparation",
        desc: "Intervention matérielle ou logicielle selon les besoins. Pièces de qualité, soudure microélectronique si requis. Burn test 2h minimum.",
      },
      {
        num: "05",
        title: "Tests & Livraison",
        desc: "Vérification de tous les composants sous charge. Remise avec rapport d'intervention complet et garantie sur les pièces.",
      },
    ],
    trustPoints: [
      "Techniciens certifiés PC & Mac",
      "Pièces de qualité OEM ou d'origine",
      "Diagnostic gratuit, sans engagement",
      "Garantie 40 jours sur chaque pièce remplacée",
    ],
  },

  informatique: {
    title: "Services Informatiques",
    subtitle: "Particuliers & Entreprises",
    tagline: "Configuration, réseau, sécurité — on prend en charge votre environnement IT.",
    heroImg: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    description:
      "De la configuration d'un simple routeur à la mise en place d'un réseau d'entreprise sécurisé, nos techniciens informatiques couvrent tous vos besoins. Nous intervenons sur site ou à distance pour les particuliers et les PME de la région de Montréal.",
    stats: [
      { val: "Sur site", label: "& à distance" },
      { val: "WiFi & câble", label: "Réseau" },
      { val: "WPA3", label: "Sécurité réseau" },
      { val: "PME", label: "& particuliers" },
    ],
    features: [
      {
        title: "Installation & Configuration OS",
        desc: "Windows 10/11 Pro, macOS, Linux — configuration initiale, compte utilisateur, mises à jour automatiques, pilotes et applications professionnelles.",
      },
      {
        title: "Réseau & WiFi",
        desc: "Configuration routeur, switch, NAS, point d'accès WiFi, extension de réseau mesh. Réseau câblé Cat6 et sans fil sécurisé WPA3, portail captif.",
      },
      {
        title: "Antivirus & Sécurité",
        desc: "Solution antivirus entreprise, pare-feu, filtrage DNS, VPN sécurisé. Audit de vulnérabilité de votre infrastructure et rapport de recommandations.",
      },
      {
        title: "Sauvegarde automatique",
        desc: "Plan 3-2-1 : 3 copies, 2 supports, 1 hors-site. Sauvegarde cloud (AWS, Google, Azure) et locale (NAS, disque externe) avec alertes d'échec.",
      },
      {
        title: "Support à distance",
        desc: "Accès sécurisé à votre ordinateur depuis notre atelier pour résoudre la majorité des problèmes logiciels sans nécessiter de déplacement.",
      },
      {
        title: "Formation utilisateur",
        desc: "Sessions de formation adaptées à votre niveau : utilisation Microsoft 365 / Google Workspace, cybersécurité au quotidien, gestion des mots de passe.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Évaluation initiale",
        desc: "Appel téléphonique ou visite sur site pour comprendre vos besoins actuels et votre infrastructure informatique existante.",
      },
      {
        num: "02",
        title: "Plan d'action",
        desc: "Proposition technique détaillée avec le matériel recommandé, les délais d'intervention et le budget estimatif, sans engagement.",
      },
      {
        num: "03",
        title: "Mise en œuvre",
        desc: "Installation sur site ou à distance selon la nature de l'intervention. Minimum d'interruption pour votre activité professionnelle.",
      },
      {
        num: "04",
        title: "Tests & Validation",
        desc: "Vérification complète de chaque service configuré. Tests de sécurité, de performance réseau et de connectivité multi-appareils.",
      },
      {
        num: "05",
        title: "Formation & Suivi",
        desc: "Formation de vos équipes sur les nouveaux outils, documentation remise et suivi 30 jours inclus pour toute nouvelle installation.",
      },
    ],
    trustPoints: [
      "Techniciens informatiques certifiés",
      "Intervention sur site ou à distance",
      "Évaluation gratuite, sans engagement",
      "Suivi 30 jours inclus après chaque installation",
    ],
  },

  web: {
    title: "Développement Web",
    subtitle: "Sites vitrine, E-commerce & Applications",
    tagline: "Votre présence en ligne, conçue pour convertir et performer.",
    heroImg: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    description:
      "Nous concevons des sites web et applications modernes adaptés aux besoins de votre entreprise. De la maquette Figma au déploiement en production, notre équipe gère l'intégralité de votre projet digital avec une approche orientée résultats et performance.",
    stats: [
      { val: "Mobile", label: "First design" },
      { val: "SEO", label: "Optimisé Google" },
      { val: "< 2s", label: "Temps chargement" },
      { val: "HTTPS", label: "Sécurisé SSL" },
    ],
    features: [
      {
        title: "Site vitrine",
        desc: "Présence en ligne professionnelle avec design sur mesure, animations fluides, formulaire de contact, intégration Google Maps et Analytics.",
      },
      {
        title: "E-commerce",
        desc: "Boutique en ligne avec panier, paiement sécurisé (Stripe, PayPal), gestion des stocks, catalogue produits et tableau de bord des ventes.",
      },
      {
        title: "Application web",
        desc: "Applications React/Next.js avec backend Node.js. Authentification utilisateur, base de données, API REST, déploiement cloud AWS ou Vercel.",
      },
      {
        title: "Refonte & Migration",
        desc: "Modernisation de votre site existant, migration vers un CMS performant (WordPress, Webflow) ou framework React/Vue pour une meilleure performance.",
      },
      {
        title: "SEO & Performance",
        desc: "Optimisation technique pour Google : Core Web Vitals, schema markup, sitemap XML, robots.txt, Google Search Console et Google My Business.",
      },
      {
        title: "Maintenance mensuelle",
        desc: "Mises à jour de sécurité, sauvegardes automatiques, monitoring 24/7, corrections de bugs et ajout de petites fonctionnalités chaque mois.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Brief & Stratégie",
        desc: "Analyse de vos objectifs, votre audience cible et vos concurrents. Définition de la structure des pages et des fonctionnalités prioritaires.",
      },
      {
        num: "02",
        title: "Maquette Figma",
        desc: "Design de toutes les pages en maquette interactive haute fidélité. Vous validez l'apparence visuelle avant le moindre développement.",
      },
      {
        num: "03",
        title: "Développement",
        desc: "Code propre, responsive (mobile-first), accessible et optimisé. Tests cross-browser et multi-appareils à chaque étape du développement.",
      },
      {
        num: "04",
        title: "Contenu & SEO",
        desc: "Intégration de vos textes et images, optimisation SEO on-page, configuration de Google Analytics, Google Tag Manager et outils de suivi.",
      },
      {
        num: "05",
        title: "Mise en ligne & Suivi",
        desc: "Déploiement sur hébergeur performant, configuration DNS, SSL et CDN. Suivi de performance et ajustements le premier mois inclus.",
      },
    ],
    trustPoints: [
      "Développeurs React & Node.js expérimentés",
      "Maquette Figma validée avant tout développement",
      "Devis gratuit, sans engagement",
      "Support 30 jours post-livraison inclus",
    ],
  },

  cloud: {
    title: "Solutions Cloud",
    subtitle: "Migration, stockage & synchronisation",
    tagline: "Vos données disponibles partout, en sécurité, à tout moment.",
    heroImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    description:
      "Le cloud n'est plus réservé aux grandes entreprises. Nous accompagnons les PME et indépendants dans leur migration vers des solutions cloud modernes : Google Workspace, Microsoft 365, stockage sécurisé et synchronisation multi-appareils, configurés et maintenus par nos experts.",
    stats: [
      { val: "99,9%", label: "Disponibilité" },
      { val: "Chiffré", label: "End-to-end" },
      { val: "Multi", label: "Plateformes" },
      { val: "24/7", label: "Monitoring" },
    ],
    features: [
      {
        title: "Migration vers le cloud",
        desc: "Transfert sécurisé de vos fichiers, emails et applications vers Google Workspace, Microsoft 365 ou solution hybride, sans perte de données.",
      },
      {
        title: "Google Workspace",
        desc: "Configuration Gmail professionnel avec votre domaine, Drive partagé, Meet, Docs/Sheets collaboratifs. Formation des équipes incluse.",
      },
      {
        title: "Microsoft 365",
        desc: "Exchange, OneDrive, SharePoint, Teams — mise en place complète avec gestion des licences, politiques de sécurité et Entra ID (Azure AD).",
      },
      {
        title: "NAS & stockage local",
        desc: "Solution NAS Synology ou QNAP pour garder le contrôle de vos données en interne avec accès distant sécurisé via VPN ou QuickConnect.",
      },
      {
        title: "Sauvegarde automatisée",
        desc: "Plan de sauvegarde vers AWS S3 ou Backblaze B2. Rétention configurable, chiffrement AES-256, alertes en cas d'échec par email/SMS.",
      },
      {
        title: "Synchronisation appareils",
        desc: "Accès à vos fichiers depuis PC, Mac, smartphone et tablette. Collaboration en temps réel entre membres d'une équipe distribuée.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Audit de l'existant",
        desc: "Inventaire complet de vos données, applications actuelles et habitudes de travail. Identification des priorités et des risques.",
      },
      {
        num: "02",
        title: "Choix de la solution",
        desc: "Recommandation de la solution cloud adaptée à vos besoins et votre budget. Démonstration en live et comparatif des options.",
      },
      {
        num: "03",
        title: "Migration sécurisée",
        desc: "Transfert de vos données avec vérification d'intégrité à chaque étape. Zéro perte de données garantie, migration progressive si nécessaire.",
      },
      {
        num: "04",
        title: "Configuration & Sécurité",
        desc: "Paramétrage des accès utilisateurs, authentification à deux facteurs (2FA), politiques de partage et chiffrement des données sensibles.",
      },
      {
        num: "05",
        title: "Formation & Support",
        desc: "Formation pratique de vos collaborateurs, documentation remise et support 30 jours post-migration inclus dans le service.",
      },
    ],
    trustPoints: [
      "Experts Google Workspace & Microsoft 365",
      "Migration zéro perte de données, garantie",
      "Audit cloud gratuit, sans engagement",
      "Support 30 jours post-migration inclus",
    ],
  },

  entretien: {
    title: "Contrats d'Entretien",
    subtitle: "Maintenance préventive pour entreprises",
    tagline: "Un partenaire IT dédié pour vous concentrer sur votre business.",
    heroImg: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1556741533-411cf82e4e2d?auto=format&fit=crop&w=800&q=80",
    description:
      "Externaliser votre informatique vous permet de réduire vos coûts et d'accéder à une expertise complète sans embaucher. Nos contrats d'entretien sont conçus pour les PME qui veulent une infrastructure IT fiable, sécurisée et maintenue à jour, avec un interlocuteur dédié.",
    stats: [
      { val: "< 4h", label: "Temps de réponse" },
      { val: "Mensuel", label: "Rapport IT" },
      { val: "Préventif", label: "Maintenance" },
      { val: "Flexible", label: "Sans engagement long" },
    ],
    features: [
      {
        title: "Maintenance préventive",
        desc: "Vérifications régulières de vos systèmes, mises à jour de sécurité planifiées, nettoyage des postes de travail et serveurs pour éviter les pannes.",
      },
      {
        title: "Support prioritaire",
        desc: "Ligne directe dédiée à votre entreprise. Temps de réponse garanti inférieur à 4 heures. Intervention sur site ou à distance selon la nature de l'urgence.",
      },
      {
        title: "Audit de sécurité mensuel",
        desc: "Analyse de la sécurité de votre réseau, test d'intrusion, rapport mensuel avec recommandations priorisées et plan d'action concret.",
      },
      {
        title: "Gestion des licences",
        desc: "Suivi de toutes vos licences logicielles, alertes de renouvellement, optimisation des coûts et conformité légale pour votre parc informatique.",
      },
      {
        title: "Sauvegarde & Plan de reprise",
        desc: "Plan de reprise d'activité (PRA) testé régulièrement. Sauvegarde automatique vérifiée, procédure de restauration testée chaque trimestre.",
      },
      {
        title: "Rapport mensuel",
        desc: "Tableau de bord complet de l'état de votre infrastructure IT : incidents traités, maintenances effectuées, recommandations et budget prévisionnel.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Audit initial gratuit",
        desc: "Inventaire complet de votre parc informatique. Identification des points faibles, des risques de sécurité et des priorités d'intervention.",
      },
      {
        num: "02",
        title: "Proposition de contrat",
        desc: "Offre personnalisée selon la taille de votre équipe, votre secteur et vos besoins spécifiques. Engagement mensuel flexible, sans surprise.",
      },
      {
        num: "03",
        title: "Onboarding",
        desc: "Prise en main de votre infrastructure, documentation complète de votre parc, mise en place des outils de monitoring et d'alertes.",
      },
      {
        num: "04",
        title: "Maintenance continue",
        desc: "Interventions planifiées (nuits ou week-ends pour minimiser les interruptions), mises à jour proactives et vérifications hebdomadaires.",
      },
      {
        num: "05",
        title: "Réunion mensuelle",
        desc: "Point mensuel avec votre interlocuteur dédié. Revue du rapport IT, priorités du mois à venir, budget et recommandations stratégiques.",
      },
    ],
    trustPoints: [
      "Technicien informatique dédié à votre entreprise",
      "Temps de réponse garanti < 4 heures",
      "Audit initial gratuit, sans engagement",
      "Contrat mensuel flexible, sans engagement long terme",
    ],
  },
};

// ─── Checkmark icon ───────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <polyline points="2 7 5.5 10.5 12 3" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFeature = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <polyline points="20 6 9 17 4 12" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [hovCta, setHovCta] = useState(false);
  const [hovContact, setHovContact] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  const svc = slug ? SERVICES_DB[slug] : null;

  if (!svc) {
    return (
      <div style={{ background: NAVY, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <style>{`body { margin:0; background: ${NAVY}; } *, *::before, *::after { box-sizing: border-box; }`}</style>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1.5rem", padding: "2rem" }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "5rem", color: GREEN, lineHeight: 1 }}>404</span>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "2rem", color: WHITE, margin: 0 }}>Service introuvable</h1>
          <a href="/#services" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1rem", color: GREEN, textDecoration: "none", letterSpacing: "0.07em" }}>
            ← Voir tous nos services
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <motion.div
      style={{ overflowX: "hidden" }}
      initial={{ opacity: 0, scale: 0.97, y: 36 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -24 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: ${NAVY}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${NAVY}; }
        ::-webkit-scrollbar-thumb { background: rgba(109,212,0,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(109,212,0,0.6); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 12px rgba(109,212,0,0.3); } 50% { box-shadow: 0 0 28px rgba(109,212,0,0.6); } }
        section[id] { scroll-margin-top: 70px; }
        input:focus, textarea:focus, select:focus { border-color: rgba(109,212,0,0.5) !important; box-shadow: 0 0 0 2px rgba(109,212,0,0.1); }
        ::selection { background: rgba(109,212,0,0.25); color: #fff; }
        @media (max-width: 900px) { .svc-overview-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) {
          .svc-stats-bar { flex-direction: column !important; }
          .svc-stats-bar > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
          .svc-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Navbar />

      {/* ── Bouton retour flottant ──────────────────────────────────────────── */}
      <a
        href="/#services"
        style={{
          position: "fixed",
          top: "82px",
          left: "20px",
          zIndex: 999,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.45rem 1.05rem",
          background: "rgba(11, 28, 53, 0.88)",
          backdropFilter: "blur(12px)",
          border: `1.5px solid ${GREEN}`,
          borderRadius: "999px",
          color: GREEN,
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: "0.78rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textDecoration: "none",
          boxShadow: "0 0 18px rgba(109,212,0,0.22), 0 2px 12px rgba(0,0,0,0.35)",
          transition: "all 0.22s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = GREEN;
          el.style.color = "#0b1c35";
          el.style.boxShadow = "0 0 28px rgba(109,212,0,0.55)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = "rgba(11, 28, 53, 0.88)";
          el.style.color = GREEN;
          el.style.boxShadow = "0 0 18px rgba(109,212,0,0.22), 0 2px 12px rgba(0,0,0,0.35)";
        }}
      >
        ← Tous les services
      </a>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          height: "65vh",
          minHeight: "420px",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <img
          src={svc.heroImg}
          alt={svc.title}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center", zIndex: 0,
          }}
        />
        {/* Bottom-to-top gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to top, ${NAVY} 0%, ${NAVY}cc 35%, ${NAVY}66 70%, transparent 100%)`,
          zIndex: 1, pointerEvents: "none",
        }} />
        {/* Left gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to right, ${NAVY}ee 0%, ${NAVY}88 45%, transparent 75%)`,
          zIndex: 1, pointerEvents: "none",
        }} />
        {/* Grain */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(-52deg, rgba(109,212,0,0.016) 0px, rgba(109,212,0,0.016) 1px, transparent 1px, transparent 64px)`,
          zIndex: 2, pointerEvents: "none",
        }} />
        {/* Accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "30%", height: "2px", background: `linear-gradient(90deg, ${GREEN}aa, transparent)`, zIndex: 3 }} />

        {/* Content */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 4rem", width: "100%", position: "relative", zIndex: 3 }}>
          {/* Back link */}
          <a
            href="/#services"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontFamily: FONT_BODY, fontSize: "0.88rem", color: GRAY,
              textDecoration: "none", marginBottom: "1.8rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
            onMouseLeave={(e) => (e.currentTarget.style.color = GRAY)}
          >
            ← Tous les services
          </a>

          <span style={{
            fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem",
            color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase",
            display: "block", marginBottom: "0.6rem",
          }}>
            {svc.subtitle}
          </span>

          <h1 style={{
            fontFamily: FONT_DISPLAY, fontWeight: 900,
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            color: WHITE, textTransform: "uppercase",
            letterSpacing: "0.01em", margin: "0 0 1rem", lineHeight: 1.0,
          }}>
            {svc.title}
          </h1>

          <p style={{ fontFamily: FONT_BODY, fontSize: "1.05rem", color: GRAY, maxWidth: "520px", margin: 0, lineHeight: 1.6 }}>
            {svc.tagline}
          </p>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div style={{
        background: NAVY_MID,
        borderTop: `1px solid rgba(109,212,0,0.15)`,
        borderBottom: `1px solid rgba(109,212,0,0.15)`,
      }}>
        <div
          className="svc-stats-bar"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", display: "flex", flexWrap: "wrap" }}
        >
          {svc.stats.map((stat, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 140px", padding: "1.5rem 1rem", textAlign: "center",
                borderRight: i < svc.stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.8rem", color: GREEN, lineHeight: 1 }}>
                {stat.val}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: GRAY, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.3rem" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Overview ───────────────────────────────────────────────────────── */}
      <section style={{ background: NAVY, padding: "7rem 2rem" }}>
        <div
          className="svc-overview-grid"
          style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}
        >
          <FadeUp>
            <div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                À propos du service
              </span>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 900,
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                color: WHITE, textTransform: "uppercase",
                letterSpacing: "0.02em", margin: "0.6rem 0 1.5rem", lineHeight: 1.1,
              }}>
                Experts en {svc.title}
              </h2>
              <p style={{ fontFamily: FONT_BODY, fontSize: "1rem", color: GRAY, lineHeight: 1.8, marginBottom: "2rem" }}>
                {svc.description}
              </p>
              {svc.trustPoints.map((pt) => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.65rem" }}>
                  <span style={{
                    width: "22px", height: "22px", flexShrink: 0,
                    background: `rgba(109,212,0,0.12)`,
                    border: `1px solid ${GREEN}55`,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <IconCheck />
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: "#d4d4e8" }}>{pt}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <div style={{ position: "relative" }}>
              <img
                src={svc.sideImg}
                alt={svc.title}
                style={{ width: "100%", height: "440px", objectFit: "cover", display: "block" }}
              />
              {/* Green border overlay */}
              <div style={{ position: "absolute", inset: 0, border: `1px solid rgba(109,212,0,0.22)`, pointerEvents: "none" }} />
              {/* Bottom accent */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: "20%", height: "3px", background: `linear-gradient(90deg, ${GREEN}, transparent)` }} />
              {/* Top-right accent */}
              <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "2px", background: `linear-gradient(270deg, ${GREEN}66, transparent)` }} />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────────────────── */}
      <section style={{ background: NAVY_MID, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Ce qu'on couvre
              </span>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 900,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: WHITE, textTransform: "uppercase",
                letterSpacing: "0.02em", margin: "0.6rem 0 1rem",
              }}>
                Nos Prestations
              </h2>
              <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
                Chaque service est réalisé par nos techniciens avec soin, transparence et rapidité.
              </p>
            </div>
          </FadeUp>

          <div
            className="svc-features-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.2rem" }}
          >
            {svc.features.map((feat, i) => (
              <FadeUp key={feat.title} delay={i * 0.07}>
                <div style={{
                  background: NAVY_LIGHT,
                  border: "1px solid rgba(109,212,0,0.1)",
                  padding: "1.8rem",
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{
                      width: "42px", height: "42px", flexShrink: 0,
                      background: `rgba(109,212,0,0.1)`,
                      border: `1px solid rgba(109,212,0,0.3)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    }}>
                      <IconFeature />
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: FONT_DISPLAY, fontWeight: 700,
                        fontSize: "1.05rem", color: WHITE,
                        margin: "0 0 0.5rem", letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}>
                        {feat.title}
                      </h3>
                      <p style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: GRAY, lineHeight: 1.7, margin: 0 }}>
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ────────────────────────────────────────────────────────── */}
      <section style={{ background: NAVY, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Comment ça marche
              </span>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 900,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: WHITE, textTransform: "uppercase",
                letterSpacing: "0.02em", margin: "0.6rem 0 1rem",
              }}>
                Notre Processus
              </h2>
            </div>
          </FadeUp>

          <div>
            {svc.process.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.08}>
                <div style={{
                  display: "flex", gap: "2rem",
                  padding: "2rem 0",
                  borderBottom: i < svc.process.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  alignItems: "flex-start",
                }}>
                  {/* Step indicator */}
                  <div style={{ flexShrink: 0, width: "56px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: "52px", height: "52px",
                      background: `rgba(109,212,0,0.08)`,
                      border: `2px solid ${GREEN}55`,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      animation: "glowPulse 3s ease-in-out infinite",
                      animationDelay: `${i * 0.4}s`,
                    }}>
                      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.15rem", color: GREEN }}>
                        {i + 1}
                      </span>
                    </div>
                    {i < svc.process.length - 1 && (
                      <div style={{ width: "2px", flex: 1, minHeight: "24px", marginTop: "8px", background: `linear-gradient(to bottom, ${GREEN}44, transparent)` }} />
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, paddingTop: "0.8rem" }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.75rem", color: GREEN, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      Étape {step.num}
                    </div>
                    <h3 style={{
                      fontFamily: FONT_DISPLAY, fontWeight: 700,
                      fontSize: "1.25rem", color: WHITE,
                      margin: "0 0 0.6rem", textTransform: "uppercase", letterSpacing: "0.03em",
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: GRAY, lineHeight: 1.75, margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{
        background: NAVY_MID,
        padding: "6rem 2rem",
        borderTop: `1px solid rgba(109,212,0,0.12)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "300px",
          background: "radial-gradient(ellipse, rgba(109,212,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(30px)",
        }} />

        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <FadeUp>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.82rem", color: GREEN, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Prêt à commencer ?
            </span>
            <h2 style={{
              fontFamily: FONT_DISPLAY, fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: WHITE, textTransform: "uppercase",
              margin: "0.6rem 0 1rem", letterSpacing: "0.02em",
            }}>
              Prenez Rendez-vous
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", marginBottom: "2.5rem" }}>
              Diagnostic gratuit · Devis transparent · Intervention rapide
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="/#rendezvous"
                style={{
                  ...btn(hovCta ? GREEN_GLOW : GREEN, NAVY),
                  boxShadow: hovCta ? `0 0 28px rgba(109,212,0,0.5)` : `0 0 14px rgba(109,212,0,0.25)`,
                }}
                onMouseEnter={() => setHovCta(true)}
                onMouseLeave={() => setHovCta(false)}
              >
                Réserver maintenant
              </a>
              <a
                href="/#contact"
                style={{
                  ...btn("transparent", hovContact ? GREEN : WHITE),
                  border: `1px solid ${hovContact ? GREEN : "rgba(255,255,255,0.2)"}`,
                }}
                onMouseEnter={() => setHovContact(true)}
                onMouseLeave={() => setHovContact(false)}
              >
                Nous contacter
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Retour aux services ─────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, rgba(109,212,0,0.07) 0%, ${NAVY} 60%)`,
        borderTop: `2px solid ${GREEN}`,
        padding: "4.5rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* glow déco */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px", height: "200px",
          background: "radial-gradient(ellipse, rgba(109,212,0,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            display: "block",
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: "0.75rem",
            color: GREEN,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: "0.7rem",
          }}>
            Explorer d'autres services
          </span>
          <p style={{
            color: WHITE,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            margin: "0 0 0.5rem",
          }}>
            Tous nos services de réparation
          </p>
          <p style={{ color: GRAY, fontFamily: FONT_BODY, fontSize: "0.95rem", marginBottom: "2rem" }}>
            Cellulaires · Ordinateurs · Informatique · Web · Cloud · Entretien TI
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/#services"
              style={{
                ...btn(GREEN, NAVY),
                textDecoration: "none",
                padding: "0.85rem 2.2rem",
                fontSize: "0.95rem",
                boxShadow: "0 0 22px rgba(109,212,0,0.38)",
              }}
            >
              ← Tous les services
            </a>
            <a
              href="/#rendezvous"
              style={{
                ...btn("transparent", GREEN),
                border: `1px solid ${GREEN}`,
                textDecoration: "none",
                padding: "0.85rem 2.2rem",
                fontSize: "0.95rem",
              }}
            >
              Prendre rendez-vous
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
}
