import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
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
        desc: "Vous recevez un devis précis en boutique ou par téléphone. Aucun frais caché. Vous acceptez librement avant toute intervention.",
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
        desc: "Plan de sauvegarde vers AWS S3 ou Backblaze B2. Rétention configurable, chiffrement AES-256, alertes en cas d'échec.",
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

// ─── English data ─────────────────────────────────────────────────────────────
const SERVICES_DB_EN: Record<string, ServiceData> = {
  cellulaires: {
    title: "Phone Repair",
    subtitle: "iPhone, Samsung, Huawei & more",
    tagline: "Your phone repaired in less than 2 hours with certified parts.",
    heroImg: "https://images.unsplash.com/photo-1697208386334-cdb57cd8ae75?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1746005718004-1f992c399428?auto=format&fit=crop&w=800&q=80",
    description:
      "Specialists in smartphone repair since 2024, we work on all brands and models. Whether it's a cracked screen, a failing battery or a damaged connector, our certified technicians use OEM quality parts to bring your device back to life.",
    stats: [
      { val: "< 2h", label: "Avg. turnaround" },
      { val: "98%", label: "Satisfaction" },
      { val: "30 days", label: "Parts warranty" },
      { val: "100+", label: "Models repaired" },
    ],
    features: [
      {
        title: "Screen Replacement",
        desc: "Original LCD or OLED panel, full touch calibration, brightness and responsiveness testing. Compatible with all iPhone, Samsung Galaxy and Android generations.",
      },
      {
        title: "Battery Replacement",
        desc: "Certified battery with professional calibration tool. Get back to 100% battery life from day one. Capacity test before and after the repair.",
      },
      {
        title: "Camera Repair",
        desc: "Front camera, rear camera, 4K video module. Complete optical diagnostic with test bench, module replacement if needed, precise alignment.",
      },
      {
        title: "Charging Port",
        desc: "USB-C, Lightning or micro-USB port — compressed air cleaning or full replacement depending on condition. Fast charge test and sync verification.",
      },
      {
        title: "Buttons & Speakers",
        desc: "Home button, power, volume, vibrator, speaker, earpiece, microphone — all internal components are diagnosable and replaceable.",
      },
      {
        title: "Data Recovery",
        desc: "Secure extraction of contacts, photos and documents even from a device that won't turn on. Transfer to your new phone or backup to USB drive.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Drop-off & Welcome",
        desc: "Bring your phone to our shop without an appointment. Our technicians inspect it visually and note your observations and symptoms.",
      },
      {
        num: "02",
        title: "Complete Diagnostic (30 min)",
        desc: "In-depth tests: screen, battery, cameras, connectors, network, speakers. Detailed report of all detected issues.",
      },
      {
        num: "03",
        title: "Quote & Agreement",
        desc: "You receive a precise quote in store or by phone. No hidden fees. You freely agree before any work begins.",
      },
      {
        num: "04",
        title: "Repair (1–2h)",
        desc: "Workshop repair with certified parts. Most common repairs are completed the same day, often in less than 2 hours.",
      },
      {
        num: "05",
        title: "Testing & Pickup",
        desc: "Complete quality testing protocol before handover. Your device comes back with a 30-day warranty on the replaced part.",
      },
    ],
    trustPoints: [
      "Certified & experienced technicians",
      "OEM or original quality parts",
      "Free diagnostic, no commitment",
      "30-day warranty on every replaced part",
    ],
  },

  ordinateurs: {
    title: "Computer Repair",
    subtitle: "PC, Mac, Ultrabooks & Workstations",
    tagline: "PC or Mac, we'll get your computer back up and running quickly.",
    heroImg: "https://images.unsplash.com/photo-1689236673934-66f8e9d9279b?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
    description:
      "Is your computer slow, won't start or showing errors? Our technicians diagnose and repair all types of PCs and Macs. We work on both hardware and software with professional tools and quality parts.",
    stats: [
      { val: "PC & Mac", label: "All platforms" },
      { val: "Data", label: "Secured" },
      { val: "40 days", label: "Warranty" },
    ],
    features: [
      {
        title: "SSD / HDD Replacement",
        desc: "Complete data migration to an ultra-fast SSD. Up to 10× speed improvement over a traditional hard drive. Compatible with Windows, macOS, Linux.",
      },
      {
        title: "RAM Upgrade",
        desc: "Adding or replacing memory modules to improve multitasking performance and accelerate your creative or professional applications.",
      },
      {
        title: "Cleaning & Disinfection",
        desc: "Removal of viruses, malware, adware, spyware. Next-generation antivirus installed and configured. System optimized for maximum speed.",
      },
      {
        title: "Laptop Screen Repair",
        desc: "LCD, IPS or OLED panel replacement for all laptop models. Hinge repair, keyboard and touchpad replacement.",
      },
      {
        title: "OS Reinstallation",
        desc: "Windows 10/11, macOS or Linux cleanly installed with all your drivers, essential software and recovery of your personal files.",
      },
      {
        title: "Data Recovery",
        desc: "Dead hard drive, corrupted SSD or accidental formatting. We recover photos, documents, emails and important files with a high success rate.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Device Drop-off",
        desc: "Bring your computer with its charger. We document its condition, your symptoms and list of important software.",
      },
      {
        num: "02",
        title: "Hardware & Software Diagnostic",
        desc: "CPU, RAM, GPU, storage, cooling, power supply, system testing. Precise identification of each issue with a full report.",
      },
      {
        num: "03",
        title: "Detailed Quote",
        desc: "List of required work with pricing and estimated timeframes. You freely choose what you want repaired.",
      },
      {
        num: "04",
        title: "Repair",
        desc: "Hardware or software intervention as needed. Quality parts, microelectronic soldering if required. 2-hour minimum burn test.",
      },
      {
        num: "05",
        title: "Testing & Delivery",
        desc: "Verification of all components under load. Handover with a complete service report and parts warranty.",
      },
    ],
    trustPoints: [
      "Certified PC & Mac technicians",
      "OEM or original quality parts",
      "Free diagnostic, no commitment",
      "40-day warranty on every replaced part",
    ],
  },

  informatique: {
    title: "IT Services",
    subtitle: "Individuals & Businesses",
    tagline: "Configuration, networking, security — we manage your IT environment.",
    heroImg: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    description:
      "From setting up a simple router to deploying a secure business network, our IT technicians cover all your needs. We work on-site or remotely for individuals and SMEs in the Montreal area.",
    stats: [
      { val: "On-site", label: "& remote" },
      { val: "WiFi & cable", label: "Networking" },
      { val: "WPA3", label: "Network security" },
      { val: "SME", label: "& individuals" },
    ],
    features: [
      {
        title: "OS Installation & Configuration",
        desc: "Windows 10/11 Pro, macOS, Linux — initial setup, user account, automatic updates, drivers and professional applications.",
      },
      {
        title: "Network & WiFi",
        desc: "Router, switch, NAS, WiFi access point, mesh network extension. WPA3-secured wired Cat6 and wireless network, captive portal.",
      },
      {
        title: "Antivirus & Security",
        desc: "Enterprise antivirus solution, firewall, DNS filtering, secure VPN. Infrastructure vulnerability audit and recommendation report.",
      },
      {
        title: "Automatic Backup",
        desc: "3-2-1 plan: 3 copies, 2 media types, 1 off-site. Cloud (AWS, Google, Azure) and local (NAS, external drive) backup with failure alerts.",
      },
      {
        title: "Remote Support",
        desc: "Secure access to your computer from our workshop to resolve most software issues without requiring an on-site visit.",
      },
      {
        title: "User Training",
        desc: "Training sessions tailored to your level: Microsoft 365 / Google Workspace, everyday cybersecurity, password management.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Initial Assessment",
        desc: "Phone call or on-site visit to understand your current needs and existing IT infrastructure.",
      },
      {
        num: "02",
        title: "Action Plan",
        desc: "Detailed technical proposal with recommended equipment, intervention timeframes and estimated budget, no commitment.",
      },
      {
        num: "03",
        title: "Implementation",
        desc: "On-site or remote installation depending on the nature of the work. Minimum disruption to your business operations.",
      },
      {
        num: "04",
        title: "Testing & Validation",
        desc: "Complete verification of each configured service. Security, network performance and multi-device connectivity tests.",
      },
      {
        num: "05",
        title: "Training & Follow-up",
        desc: "Training of your teams on new tools, documentation provided and 30-day follow-up included for every new installation.",
      },
    ],
    trustPoints: [
      "Certified IT technicians",
      "On-site or remote service",
      "Free assessment, no commitment",
      "30-day follow-up included after every installation",
    ],
  },

  web: {
    title: "Web Development",
    subtitle: "Showcase sites, E-commerce & Applications",
    tagline: "Your online presence, designed to convert and perform.",
    heroImg: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    description:
      "We design modern websites and applications tailored to your business needs. From Figma mockup to production deployment, our team handles your entire digital project with a results-driven and performance-oriented approach.",
    stats: [
      { val: "Mobile", label: "First design" },
      { val: "SEO", label: "Google optimized" },
      { val: "< 2s", label: "Load time" },
      { val: "HTTPS", label: "SSL secured" },
    ],
    features: [
      {
        title: "Showcase Site",
        desc: "Professional online presence with custom design, smooth animations, contact form, Google Maps and Analytics integration.",
      },
      {
        title: "E-commerce",
        desc: "Online store with shopping cart, secure payment (Stripe, PayPal), inventory management, product catalog and sales dashboard.",
      },
      {
        title: "Web Application",
        desc: "React/Next.js applications with Node.js backend. User authentication, database, REST API, cloud deployment on AWS or Vercel.",
      },
      {
        title: "Redesign & Migration",
        desc: "Modernization of your existing site, migration to a performant CMS (WordPress, Webflow) or React/Vue framework for better performance.",
      },
      {
        title: "SEO & Performance",
        desc: "Technical optimization for Google: Core Web Vitals, schema markup, XML sitemap, robots.txt, Google Search Console and Google My Business.",
      },
      {
        title: "Monthly Maintenance",
        desc: "Security updates, automatic backups, 24/7 monitoring, bug fixes and small feature additions every month.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Brief & Strategy",
        desc: "Analysis of your objectives, target audience and competitors. Definition of page structure and priority features.",
      },
      {
        num: "02",
        title: "Figma Mockup",
        desc: "High-fidelity interactive mockup design of all pages. You validate the visual appearance before any development begins.",
      },
      {
        num: "03",
        title: "Development",
        desc: "Clean, responsive (mobile-first), accessible and optimized code. Cross-browser and multi-device testing at every stage of development.",
      },
      {
        num: "04",
        title: "Content & SEO",
        desc: "Integration of your text and images, on-page SEO optimization, Google Analytics, Google Tag Manager and tracking tools setup.",
      },
      {
        num: "05",
        title: "Launch & Follow-up",
        desc: "Deployment on high-performance hosting, DNS, SSL and CDN configuration. Performance monitoring and adjustments included for the first month.",
      },
    ],
    trustPoints: [
      "Experienced React & Node.js developers",
      "Figma mockup validated before any development",
      "Free quote, no commitment",
      "30-day post-delivery support included",
    ],
  },

  cloud: {
    title: "Cloud Solutions",
    subtitle: "Migration, storage & synchronization",
    tagline: "Your data available everywhere, securely, at any time.",
    heroImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    description:
      "The cloud is no longer reserved for large corporations. We help SMEs and freelancers migrate to modern cloud solutions: Google Workspace, Microsoft 365, secure storage and multi-device synchronization, configured and maintained by our experts.",
    stats: [
      { val: "99.9%", label: "Availability" },
      { val: "Encrypted", label: "End-to-end" },
      { val: "Multi", label: "Platform" },
      { val: "24/7", label: "Monitoring" },
    ],
    features: [
      {
        title: "Cloud Migration",
        desc: "Secure transfer of your files, emails and applications to Google Workspace, Microsoft 365 or a hybrid solution, with no data loss.",
      },
      {
        title: "Google Workspace",
        desc: "Professional Gmail setup with your domain, shared Drive, Meet, collaborative Docs/Sheets. Team training included.",
      },
      {
        title: "Microsoft 365",
        desc: "Exchange, OneDrive, SharePoint, Teams — complete setup with license management, security policies and Entra ID (Azure AD).",
      },
      {
        title: "NAS & Local Storage",
        desc: "Synology or QNAP NAS solution to keep control of your data in-house with secure remote access via VPN or QuickConnect.",
      },
      {
        title: "Automated Backup",
        desc: "Backup plan to AWS S3 or Backblaze B2. Configurable retention, AES-256 encryption, failure alerts.",
      },
      {
        title: "Device Synchronization",
        desc: "Access your files from PC, Mac, smartphone and tablet. Real-time collaboration between distributed team members.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Current State Audit",
        desc: "Complete inventory of your data, current applications and work habits. Identification of priorities and risks.",
      },
      {
        num: "02",
        title: "Solution Selection",
        desc: "Recommendation of the cloud solution suited to your needs and budget. Live demonstration and options comparison.",
      },
      {
        num: "03",
        title: "Secure Migration",
        desc: "Data transfer with integrity verification at every step. Zero data loss guaranteed, progressive migration if needed.",
      },
      {
        num: "04",
        title: "Configuration & Security",
        desc: "User access configuration, two-factor authentication (2FA), sharing policies and sensitive data encryption.",
      },
      {
        num: "05",
        title: "Training & Support",
        desc: "Hands-on training for your staff, documentation provided and 30-day post-migration support included in the service.",
      },
    ],
    trustPoints: [
      "Google Workspace & Microsoft 365 experts",
      "Zero data loss migration, guaranteed",
      "Free cloud audit, no commitment",
      "30-day post-migration support included",
    ],
  },

  entretien: {
    title: "Maintenance Contracts",
    subtitle: "Preventive maintenance for businesses",
    tagline: "A dedicated IT partner so you can focus on your business.",
    heroImg: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    sideImg: "https://images.unsplash.com/photo-1556741533-411cf82e4e2d?auto=format&fit=crop&w=800&q=80",
    description:
      "Outsourcing your IT allows you to reduce costs and access complete expertise without hiring. Our maintenance contracts are designed for SMEs that want reliable, secure and up-to-date IT infrastructure, with a dedicated point of contact.",
    stats: [
      { val: "< 4h", label: "Response time" },
      { val: "Monthly", label: "IT report" },
      { val: "Preventive", label: "Maintenance" },
      { val: "Flexible", label: "No long commitment" },
    ],
    features: [
      {
        title: "Preventive Maintenance",
        desc: "Regular system checks, scheduled security updates, workstation and server cleaning to prevent breakdowns.",
      },
      {
        title: "Priority Support",
        desc: "Direct line dedicated to your business. Guaranteed response time under 4 hours. On-site or remote service depending on the urgency.",
      },
      {
        title: "Monthly Security Audit",
        desc: "Network security analysis, penetration testing, monthly report with prioritized recommendations and concrete action plan.",
      },
      {
        title: "License Management",
        desc: "Tracking of all your software licenses, renewal alerts, cost optimization and legal compliance for your IT fleet.",
      },
      {
        title: "Backup & Recovery Plan",
        desc: "Business continuity plan (BCP) regularly tested. Verified automatic backups, restoration procedure tested every quarter.",
      },
      {
        title: "Monthly Report",
        desc: "Complete dashboard of your IT infrastructure status: incidents handled, maintenance performed, recommendations and projected budget.",
      },
    ],
    process: [
      {
        num: "01",
        title: "Free Initial Audit",
        desc: "Complete inventory of your IT fleet. Identification of weak points, security risks and intervention priorities.",
      },
      {
        num: "02",
        title: "Contract Proposal",
        desc: "Personalized offer based on your team size, industry and specific needs. Flexible monthly commitment, no surprises.",
      },
      {
        num: "03",
        title: "Onboarding",
        desc: "Taking over your infrastructure, complete fleet documentation, setting up monitoring and alert tools.",
      },
      {
        num: "04",
        title: "Ongoing Maintenance",
        desc: "Scheduled interventions (nights or weekends to minimize disruptions), proactive updates and weekly checks.",
      },
      {
        num: "05",
        title: "Monthly Meeting",
        desc: "Monthly check-in with your dedicated contact. IT report review, priorities for the coming month, budget and strategic recommendations.",
      },
    ],
    trustPoints: [
      "IT technician dedicated to your business",
      "Guaranteed response time < 4 hours",
      "Free initial audit, no commitment",
      "Flexible monthly contract, no long-term commitment",
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
  const { t, i18n } = useTranslation();
  const [hovCta, setHovCta] = useState(false);
  const [hovContact, setHovContact] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  const db = i18n.language === "en" ? SERVICES_DB_EN : SERVICES_DB;
  const svc = slug ? db[slug] : null;

  if (!svc) {
    return (
      <div style={{ background: NAVY, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <style>{`body { margin:0; background: ${NAVY}; } *, *::before, *::after { box-sizing: border-box; }`}</style>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1.5rem", padding: "2rem" }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "5rem", color: GREEN, lineHeight: 1 }}>404</span>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "2rem", color: WHITE, margin: 0 }}>{t("serviceDetail.not_found")}</h1>
          <a href="/#services" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1rem", color: GREEN, textDecoration: "none", letterSpacing: "0.07em" }}>
            {t("serviceDetail.back")}
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
        {t("serviceDetail.back")}
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
            {t("serviceDetail.back")}
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
                {t("serviceDetail.about")}
              </span>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 900,
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                color: WHITE, textTransform: "uppercase",
                letterSpacing: "0.02em", margin: "0.6rem 0 1.5rem", lineHeight: 1.1,
              }}>
                {t("serviceDetail.expert_in")} {svc.title}
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
                {t("serviceDetail.what_covers")}
              </span>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 900,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: WHITE, textTransform: "uppercase",
                letterSpacing: "0.02em", margin: "0.6rem 0 1rem",
              }}>
                {t("serviceDetail.prestations")}
              </h2>
              <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
                {t("serviceDetail.prestations_sub")}
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
                {t("serviceDetail.how_works")}
              </span>
              <h2 style={{
                fontFamily: FONT_DISPLAY, fontWeight: 900,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: WHITE, textTransform: "uppercase",
                letterSpacing: "0.02em", margin: "0.6rem 0 1rem",
              }}>
                {t("serviceDetail.process")}
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
                      {t("serviceDetail.step")} {step.num}
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
              {t("serviceDetail.ready")}
            </span>
            <h2 style={{
              fontFamily: FONT_DISPLAY, fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: WHITE, textTransform: "uppercase",
              margin: "0.6rem 0 1rem", letterSpacing: "0.02em",
            }}>
              {t("serviceDetail.book")}
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: GRAY, fontSize: "1rem", marginBottom: "2.5rem" }}>
              {t("serviceDetail.cta_sub")}
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
                {t("serviceDetail.book_now")}
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
                {t("serviceDetail.contact_us")}
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
            {t("serviceDetail.explore")}
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
            {t("serviceDetail.all_services_title")}
          </p>
          <p style={{ color: GRAY, fontFamily: FONT_BODY, fontSize: "0.95rem", marginBottom: "2rem" }}>
            {t("serviceDetail.all_services_sub")}
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
              {t("serviceDetail.all_services_btn")}
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
              {t("serviceDetail.rdv_btn")}
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
}
