// ── Articles du Blog — Réparation CeLL&Ordi ───────────────────

export type ArticleSection = {
  titre: string;
  texte: string;
  liste?: string[];
};

export type Article = {
  slug: string;
  tag: string;
  tagColor?: string;
  date: string;
  readTime: string;
  img: string;
  title: string;
  desc: string;
  intro: string;
  sections: ArticleSection[];
  conclusion: string;
};

export const ARTICLES: Article[] = [
  // ── ARTICLE 1 ──────────────────────────────────────────────
  {
    slug: "batterie-iphone-signes",
    tag: "Réparation",
    date: "20 fév. 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1603539947678-cd3954ed515d?w=800&q=80",
    title: "5 signes que la batterie de votre iPhone doit être remplacée",
    desc: "Redémarrages inattendus, autonomie qui chute, téléphone qui chauffe… votre batterie vous envoie des signaux. Apprenez à les reconnaître.",
    intro: "La batterie de votre iPhone est comme un muscle : avec le temps et les cycles de charge, elle perd de sa vigueur. Apple indique qu'une batterie lithium-ion conserve environ 80 % de sa capacité originale après 500 cycles de charge complets. Mais concrètement, comment savoir si la vôtre est à bout ? Voici les 5 signaux d'alarme à surveiller — et ce que vous pouvez faire.",
    sections: [
      {
        titre: "1. L'autonomie a drastiquement chuté",
        texte: "Si votre téléphone tenait facilement une journée complète et qu'il ne passe plus le dîner sans être branché, c'est le signe le plus évident d'une batterie vieillissante. Une batterie dégradée ne stocke tout simplement plus autant d'énergie qu'avant, même si elle affiche 100 % au départ.",
        liste: [
          "Votre iPhone était à 80 % le matin et passe à 20 % en début d'après-midi sans usage intensif",
          "Vous devez le recharger 2 à 3 fois par jour alors qu'avant une seule suffisait",
          "L'indicateur de batterie descend trop vite les premières heures"
        ]
      },
      {
        titre: "2. Des redémarrages inattendus à batterie non nulle",
        texte: "C'est l'un des symptômes les plus frustrants : votre iPhone s'éteint brusquement alors qu'il affichait encore 15 %, 20 % ou même 30 %. Ce phénomène survient quand la batterie ne peut plus fournir le pic de courant nécessaire lors d'une tâche intensive (ouverture d'une application lourde, photo en rafale, appel vidéo). La cellule est trop faible pour maintenir l'alimentation, et l'iPhone coupe tout pour se protéger.",
      },
      {
        titre: "3. Le téléphone chauffe anormalement",
        texte: "Une légère chaleur lors de la charge ou d'un usage intensif est normale. En revanche, si votre iPhone chauffe fortement pendant une simple conversation téléphonique ou lors de la navigation, la batterie travaille en surconsommation pour compenser sa dégradation. La chaleur excessive accélère elle-même la détérioration — c'est un cercle vicieux.",
      },
      {
        titre: "4. La batterie gonfle",
        texte: "C'est le signe le plus sérieux et celui qui nécessite une action immédiate. Si vous remarquez que l'écran de votre iPhone commence à se décoller légèrement, que le dos bombe ou que le téléphone ne repose plus à plat sur une surface, la batterie gonfle. Ce gonflement est causé par des gaz produits lors de la dégradation chimique de la cellule lithium. Une batterie gonflée peut, dans des cas extrêmes, causer un incendie.",
        liste: [
          "N'utilisez plus l'appareil et ne le chargez pas",
          "Apportez-le rapidement à un technicien spécialisé",
          "Ne percez jamais une batterie gonflée vous-même"
        ]
      },
      {
        titre: "5. L'indicateur de santé affiche moins de 80 %",
        texte: "Apple offre un outil intégré pour vérifier l'état de votre batterie. Allez dans Réglages → Batterie → État de la batterie et performances. Si la capacité maximale affichée est inférieure à 80 %, Apple recommande officiellement un remplacement. En dessous de 75 %, les performances de l'appareil sont activement bridées pour éviter les redémarrages inattendus.",
      },
      {
        titre: "Faut-il remplacer soi-même ou chez un professionnel ?",
        texte: "Des kits de remplacement DIY existent sur le marché, mais nous les déconseillons fortement pour plusieurs raisons. Les batteries de remplacement de mauvaise qualité peuvent présenter des risques d'incendie, l'ouverture de l'appareil sans outils adaptés endommage souvent l'écran, et une manipulation incorrecte peut invalider votre garantie. Chez Réparation CeLL&Ordi, nous utilisons exclusivement des batteries de qualité supérieure, et le remplacement est réalisé par un technicien certifié en moins de 30 minutes.",
      }
    ],
    conclusion: "Ne laissez pas une batterie défaillante gâcher votre expérience quotidienne. Si vous reconnaissez deux ou plusieurs de ces signes, il est temps d'agir. Prenez rendez-vous chez nous — la plupart des remplacements de batterie sont réalisés le jour même.",
  },

  // ── ARTICLE 2 ──────────────────────────────────────────────
  {
    slug: "hdd-vers-ssd-guide",
    tag: "Ordinateurs",
    date: "15 fév. 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1597225244516-7b4128ac3c7f?w=800&q=80",
    title: "Passer de HDD à SSD : tout ce que vous devez savoir",
    desc: "Votre ordinateur démarre en 2 minutes ? Un SSD change tout. Découvrez pourquoi cette mise à niveau est la meilleure chose que vous puissiez faire pour votre PC.",
    intro: "Si votre ordinateur met une éternité à démarrer, que les applications s'ouvrent lentement ou que vous entendez un léger cliquetis au démarrage, vous avez probablement un disque dur mécanique (HDD). Remplacer ce dernier par un SSD (Solid State Drive) est, à ce jour, la mise à niveau la plus rentable que vous puissiez faire sur un PC — peu importe son âge.",
    sections: [
      {
        titre: "HDD vs SSD : quelle est la vraie différence ?",
        texte: "Un HDD (Hard Disk Drive) est un disque mécanique avec des plateaux qui tournent physiquement et une tête de lecture qui se déplace pour accéder aux données — exactement comme un vieux tourne-disque. Un SSD (Solid State Drive) n'a aucune pièce mobile : les données sont stockées sur des puces mémoire flash, comme une grande clé USB. Résultat : le SSD est infiniment plus rapide, plus silencieux, résistant aux chocs, et consomme moins d'énergie.",
        liste: [
          "Temps de démarrage Windows : HDD = 90–120 secondes / SSD = 10–15 secondes",
          "Ouverture de Chrome : HDD = 5–8 secondes / SSD = 1–2 secondes",
          "Copie d'un fichier de 10 Go : HDD = 5 minutes / SSD NVMe = 30 secondes"
        ]
      },
      {
        titre: "Les types de SSD : SATA vs NVMe",
        texte: "Il existe deux grandes familles de SSD selon l'interface utilisée :",
        liste: [
          "SSD SATA (2.5 pouces) : remplace directement un HDD standard, compatible avec la grande majorité des ordinateurs portables et de bureau. Vitesse de 500–550 Mo/s. Idéal pour redonner vie à un vieux PC.",
          "SSD NVMe (M.2) : se branche directement sur la carte mère, atteignant 3 000 à 7 000 Mo/s. La solution premium pour les PC récents avec slot M.2.",
          "SSD M.2 SATA : format M.2 mais protocole SATA. Moins rapide que NVMe mais compact. Bien vérifier la compatibilité de votre carte mère avant d'acheter."
        ]
      },
      {
        titre: "Quelle capacité choisir ?",
        texte: "Pour un usage bureautique et web, un SSD de 500 Go est largement suffisant et représente le meilleur rapport qualité-prix. Si vous stockez des photos, des vidéos ou des jeux, optez pour 1 To. Évitez les SSD de 120–250 Go : ils seront vite saturés, et un SSD plein à plus de 80 % perd en performance.",
      },
      {
        titre: "Le clonage de disque : transférer Windows sans réinstaller",
        texte: "La bonne nouvelle : vous n'avez pas besoin de réinstaller Windows pour profiter de votre nouveau SSD. Il est possible de cloner intégralement votre disque actuel vers le SSD — Windows, vos programmes, vos fichiers, tout est transféré. Chez Réparation CeLL&Ordi, nous utilisons des outils professionnels pour réaliser ce clonage sans perte de données. Votre PC redémarre avec son SSD flambant neuf, exactement comme vous l'avez laissé, mais 10 fois plus vite.",
      },
      {
        titre: "Les marques fiables",
        texte: "Toutes les marques ne se valent pas en matière de SSD. Nous recommandons, par ordre de préférence :",
        liste: [
          "Samsung (870 EVO pour SATA, 970/990 Pro pour NVMe) — fiabilité exceptionnelle",
          "Western Digital (WD Blue/Black) — excellent rapport qualité-prix",
          "Crucial (MX500) — idéal pour les budgets serrés",
          "Kingston (A400) — très répandu, bon pour les usages bureautiques"
        ]
      }
    ],
    conclusion: "Le remplacement HDD → SSD donne littéralement une seconde vie à un ordinateur de 5 à 10 ans. C'est souvent bien moins coûteux qu'un nouvel appareil, avec un résultat bluffant. Apportez votre ordinateur chez nous — nous évaluons votre configuration gratuitement et réalisons la mise à niveau avec clonage inclus.",
  },

  // ── ARTICLE 3 ──────────────────────────────────────────────
  {
    slug: "cybersecurite-smartphone-2026",
    tag: "Sécurité",
    date: "10 fév. 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
    title: "Cybersécurité : 7 réflexes pour protéger votre smartphone en 2026",
    desc: "Vos photos, vos mots de passe, votre banque… tout est dans votre téléphone. Voici comment le protéger efficacement contre les menaces modernes.",
    intro: "En 2026, le smartphone est devenu le coffre-fort numérique de notre vie quotidienne. Comptes bancaires, courriels professionnels, photos personnelles, accès à la maison intelligente… Si quelqu'un y accède, les conséquences peuvent être désastreuses. Pourtant, la majorité des gens négligent quelques réflexes de base qui feraient toute la différence. Voici les 7 mesures essentielles que nous recommandons à tous nos clients.",
    sections: [
      {
        titre: "1. Maintenez toujours votre système à jour",
        texte: "Les mises à jour iOS et Android ne servent pas uniquement à ajouter des fonctionnalités — elles corrigent avant tout des failles de sécurité découvertes par les chercheurs ou, pire, exploitées par des hackers. Une faille non corrigée est une porte grande ouverte. Activez les mises à jour automatiques dans vos réglages et ne les ignorez jamais. Cela vaut aussi pour vos applications.",
      },
      {
        titre: "2. Utilisez un gestionnaire de mots de passe",
        texte: "Le mot de passe « 123456 » était le plus utilisé dans le monde en 2025. Réutiliser le même mot de passe sur plusieurs sites est tout aussi dangereux : si un service est compromis, tous vos comptes tombent. Un gestionnaire de mots de passe (Bitwarden, 1Password, ou le trousseau Apple/Google) génère et retient des mots de passe uniques et complexes pour chaque site. Vous n'avez à retenir qu'un seul mot de passe maître.",
        liste: [
          "Bitwarden : gratuit, open source, recommandé",
          "1Password : excellent pour les familles",
          "Trousseau iCloud (Apple) / Google Password Manager : intégré, pratique"
        ]
      },
      {
        titre: "3. Activez l'authentification à deux facteurs (2FA)",
        texte: "Le 2FA ajoute une deuxième vérification lors de la connexion à un compte : après votre mot de passe, on vous demande un code temporaire envoyé par SMS ou généré par une application comme Google Authenticator. Même si un hacker obtient votre mot de passe, il ne peut pas accéder à votre compte sans ce second code. Activez-le absolument sur : votre courriel, votre banque, vos réseaux sociaux et tout service sensible.",
      },
      {
        titre: "4. Méfiez-vous des réseaux Wi-Fi publics",
        texte: "Le Wi-Fi gratuit au café, à l'aéroport ou à l'hôtel est une aubaine pour les hackers. Ces réseaux sont souvent non chiffrés et permettent à n'importe qui sur le même réseau d'intercepter votre trafic. Évitez de consulter votre banque ou vos courriels sur ces réseaux. Si vous devez absolument utiliser un Wi-Fi public, activez un VPN (Virtual Private Network) qui chiffre votre connexion.",
      },
      {
        titre: "5. Faites attention aux applications que vous installez",
        texte: "Même sur l'App Store ou le Play Store, des applications malveillantes passent parfois entre les mailles du filet. Posez-vous ces questions avant d'installer :",
        liste: [
          "Cette application a-t-elle beaucoup d'avis vérifiés et une bonne note ?",
          "Le développeur est-il connu et de confiance ?",
          "Pourquoi une application de lampe de poche demande-t-elle l'accès à vos contacts ?",
          "Ai-je vraiment besoin de cette application ?"
        ]
      },
      {
        titre: "6. Sauvegardez régulièrement vos données",
        texte: "Une sauvegarde régulière ne protège pas contre le piratage, mais elle vous sauve en cas de vol, de perte ou de panne. Activez iCloud (iPhone) ou Google One (Android) pour une sauvegarde automatique quotidienne. Nous recommandons également une sauvegarde physique mensuelle sur un ordinateur ou un disque externe.",
      },
      {
        titre: "7. Verrouillez votre téléphone correctement",
        texte: "Un code PIN à 4 chiffres, c'est bien. Mais un code à 6 chiffres ou un mot de passe alphanumérique, c'est bien mieux. Évitez le déverrouillage par schéma (pattern) qui laisse des traces graisseuses sur l'écran et peut être deviné facilement. Face ID et Touch ID sont excellents en complément, mais désactivez-les si vous franchissez une frontière ou êtes dans une situation à risque — la police peut légalement vous contraindre à déverrouiller avec votre visage ou votre doigt, pas avec un code.",
      }
    ],
    conclusion: "La sécurité numérique n'est pas réservée aux experts : ces 7 réflexes sont accessibles à tous et peuvent vous épargner des situations très difficiles. Si vous avez des doutes sur la sécurité de votre appareil ou pensez avoir été victime d'un piratage, venez nous voir — nous offrons un diagnostic complet.",
  },

  // ── ARTICLE 4 ──────────────────────────────────────────────
  {
    slug: "bonnes-habitudes-telephone",
    tag: "Conseils",
    date: "5 fév. 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    title: "10 habitudes pour doubler la durée de vie de votre téléphone",
    desc: "Pas besoin de changer de téléphone tous les 2 ans. Ces habitudes simples et gratuites allongent significativement la vie de votre appareil.",
    intro: "Un téléphone haut de gamme coûte entre 800 $ et 1 500 $. C'est un investissement important, et pourtant la plupart des gens n'en prennent pas vraiment soin. Quelques habitudes simples — dont la majorité ne coûtent absolument rien — peuvent facilement doubler la durée de vie de votre appareil. Voici celles que nous observons chez les clients dont les téléphones restent en excellent état après 4 ou 5 ans.",
    sections: [
      {
        titre: "1. Ne déchargez jamais complètement votre batterie",
        texte: "Les batteries lithium-ion modernes souffrent des cycles complets de 0 % à 100 %. La plage idéale est entre 20 % et 80 %. En pratique : rechargez avant d'atteindre 20 %, débranchez aux alentours de 80–90 %. Votre batterie vivra beaucoup plus longtemps. Si vous êtes en déplacement et devez charger à 100 %, c'est sans danger occasionnellement — c'est la répétition quotidienne qui use la cellule.",
      },
      {
        titre: "2. Évitez la chaleur excessive",
        texte: "La chaleur est l'ennemi numéro 1 de la batterie et des composants électroniques. Ne laissez jamais votre téléphone :",
        liste: [
          "Dans votre voiture par temps chaud (même à l'ombre, l'habitacle monte à 60–70°C)",
          "En plein soleil directement sur une surface sombre",
          "Sous votre oreiller ou dans vos draps pendant la nuit",
          "À côté d'une source de chaleur (radiateur, four, etc.)"
        ]
      },
      {
        titre: "3. Protégez-le physiquement",
        texte: "Une bonne coque et un verre trempé de qualité coûtent entre 20 $ et 40 $, contre 200 $ à 500 $ pour remplacer un écran fissuré. C'est le meilleur investissement que vous puissiez faire pour votre téléphone. Choisissez une coque avec des coins renforcés (les coins absorbent l'impact lors d'une chute) et un verre trempé d'une marque reconnue.",
      },
      {
        titre: "4. Nettoyez régulièrement les ports",
        texte: "Le port de charge de votre téléphone accumule au fil du temps de la poussière, de la peluche de poche et des résidus. Cette accumulation empêche une connexion correcte du câble de charge et peut même causer des courts-circuits. Une fois par mois, nettoyez délicatement le port avec une cure-dent en plastique ou une petite brosse douce (surtout pas d'air comprimé à haute pression ni d'objets métalliques).",
      },
      {
        titre: "5. Faites vos mises à jour",
        texte: "Nous l'avons mentionné pour la sécurité, mais c'est aussi vrai pour les performances. Les mises à jour du système d'exploitation optimisent régulièrement la gestion de la batterie, la consommation mémoire et la performance globale. Un iPhone sous iOS 18 tourne mieux qu'un iPhone sous iOS 15, même sur le même matériel.",
      },
      {
        titre: "6. Supprimez les applications inutilisées",
        texte: "De nombreuses applications tournent en arrière-plan même quand vous ne les utilisez pas, consommant de la batterie, de la mémoire vive et des données mobiles. Faites régulièrement le ménage : si vous n'avez pas ouvert une application depuis 3 mois, désinstallez-la. Votre téléphone respire mieux.",
      },
      {
        titre: "7. Redémarrez votre téléphone une fois par semaine",
        texte: "Un redémarrage hebdomadaire efface la mémoire cache, ferme les processus bloqués et réinitialise les connexions réseau. C'est une opération toute simple qui maintient votre téléphone fluide et réactif. Faites-le le dimanche soir avant de dormir.",
      },
      {
        titre: "8. Gérez intelligemment la luminosité",
        texte: "L'écran est le composant qui consomme le plus d'énergie. Activez la luminosité automatique et évitez de maintenir l'écran à 100 % en permanence. En intérieur, 40–50 % est largement suffisant. Cela préserve la batterie et prolonge aussi la durée de vie de l'écran OLED (qui peut brûler si affiché trop longtemps au maximum).",
      },
      {
        titre: "9. Utilisez le câble officiel ou des câbles certifiés",
        texte: "Les câbles à 3 $ sur Amazon peuvent endommager la batterie ou même court-circuiter votre téléphone. Utilisez toujours le câble fourni par le fabricant ou un câble certifié MFi (pour iPhone) ou certifié USB-IF (pour Android). La qualité du câble et du chargeur a un impact direct sur la santé de votre batterie.",
      },
      {
        titre: "10. Ne chargez pas toute la nuit systématiquement",
        texte: "Les iPhone récents ont une fonction « Charge optimisée » qui gère cela automatiquement, mais les anciens modèles et de nombreux Android chargent jusqu'à 100 % et y restent branchés toute la nuit. Rester à 100 % de charge pendant plusieurs heures stresse la batterie. Si possible, programmez votre réveil pour débrancher le téléphone à 80 %, ou utilisez une prise programmable.",
      }
    ],
    conclusion: "Ces 10 habitudes ne demandent aucun achat et très peu de discipline. Adoptées dès aujourd'hui, elles peuvent facilement vous permettre de garder votre téléphone en excellent état pendant 4 à 5 ans. Si malgré tout vous ressentez un problème de batterie ou de performance, venez nous voir — nous offrons un diagnostic gratuit.",
  },

  // ── ARTICLE 5 ──────────────────────────────────────────────
  {
    slug: "ordinateur-qui-ralentit",
    tag: "Ordinateurs",
    date: "28 jan. 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80",
    title: "Pourquoi votre PC ralentit et comment y remédier",
    desc: "Votre ordinateur qui était rapide il y a 3 ans est devenu une vraie corvée ? Ce n'est pas une fatalité. Voici les vraies causes et les vraies solutions.",
    intro: "C'est l'une des plaintes les plus fréquentes que nous entendons : « mon ordinateur était parfait à l'achat, mais maintenant il est trop lent ». La bonne nouvelle, c'est que dans la grande majorité des cas, la cause est identifiable et corrigeable — souvent sans remplacer l'appareil. Voici les coupables les plus fréquents et ce que vous pouvez faire.",
    sections: [
      {
        titre: "1. Trop de programmes qui démarrent avec Windows",
        texte: "À chaque installation d'un logiciel, celui-ci s'ajoute souvent au démarrage de Windows. Résultat : après 2 ou 3 ans, une dizaine de programmes se lancent simultanément à l'allumage, saturant la mémoire et le processeur avant même que vous ayez commencé à travailler. Solution simple : ouvrez le Gestionnaire des tâches (Ctrl + Maj + Échap), allez dans l'onglet « Démarrage », et désactivez tout ce qui n'est pas indispensable (Spotify, OneDrive, Teams, Discord, etc.).",
      },
      {
        titre: "2. Le disque dur est plein (ou presque)",
        texte: "Windows a besoin d'espace libre sur le disque pour fonctionner correctement — au moins 15–20 % de la capacité totale. Un disque HDD à 95 % de sa capacité est jusqu'à 3 fois plus lent qu'un disque à 60 %. Nettoyez les téléchargements, les fichiers temporaires et les anciennes sauvegardes. L'outil intégré « Nettoyage de disque » (cherchez-le dans le menu Démarrer) peut libérer plusieurs gigaoctets facilement.",
        liste: [
          "Supprimez les programmes inutilisés depuis Paramètres → Applications",
          "Videz la corbeille et les dossiers Téléchargements",
          "Déplacez les photos et vidéos vers un disque externe ou le cloud",
          "Utilisez « Sens du stockage » dans Windows 11 pour l'automatiser"
        ]
      },
      {
        titre: "3. Virus, malwares et logiciels espions",
        texte: "Un virus ou un malware tourne en arrière-plan et consomme vos ressources à votre insu — parfois pour miner de la cryptomonnaie, parfois pour envoyer du spam, parfois simplement pour vous espionner. Si votre CPU ou RAM est utilisé à 80–100 % alors que vous ne faites rien de particulier, c'est suspect. Windows Defender (intégré et gratuit) est généralement suffisant. Pour un nettoyage en profondeur, Malwarebytes reste la référence.",
      },
      {
        titre: "4. La RAM est insuffisante",
        texte: "Windows 10/11 nécessite idéalement 8 Go de RAM pour un usage confortable. Si votre PC a 4 Go ou moins et que vous avez plusieurs onglets ouverts dans Chrome, les pages se rechargeront constamment car la mémoire vive est saturée. L'ajout de RAM est souvent l'une des upgrades les moins chères et les plus efficaces. Sur un PC fixe, c'est simple. Sur un portable, c'est parfois soudé — un technicien peut vous le confirmer.",
      },
      {
        titre: "5. La ventilation est obstruée",
        texte: "Après 2 à 3 ans d'utilisation, la poussière s'accumule dans les ventilateurs et les dissipateurs thermiques. Votre processeur chauffe davantage, le PC active sa protection thermique et réduit ses performances automatiquement pour éviter la surchauffe. Un nettoyage professionnel des composants internes fait souvent des miracles. Chez Réparation CeLL&Ordi, nous proposons un service de nettoyage complet avec renouvellement de la pâte thermique.",
      },
      {
        titre: "6. Le disque dur mécanique (HDD) est en fin de vie",
        texte: "Les HDD ont une durée de vie de 3 à 5 ans en moyenne. Un disque vieillissant accède aux données de plus en plus lentement et peut même développer des secteurs défectueux. Si vous entendez des cliquetis ou des bruits inhabituels, sauvegardez immédiatement vos données — la panne complète peut survenir à tout moment. Remplacer ce HDD par un SSD est la solution la plus radicale et la plus efficace.",
      },
      {
        titre: "Quand appeler un professionnel ?",
        texte: "Certaines situations nécessitent l'intervention d'un technicien :",
        liste: [
          "Votre PC affiche un écran bleu (BSOD) régulièrement",
          "Il ne démarre plus ou plante au démarrage",
          "Vous entendez des bruits mécaniques inhabituels (claquements, grattements)",
          "Vous avez essayé les solutions ci-dessus sans amélioration",
          "Vous voulez un diagnostic complet et fiable"
        ]
      }
    ],
    conclusion: "Un ordinateur lent, c'est rarement une fatalité. Avant d'investir dans un nouvel appareil, laissez nos techniciens identifier la vraie cause. Un diagnostic gratuit chez Réparation CeLL&Ordi vous permettra de savoir exactement ce qui se passe — et souvent, la solution coûte bien moins cher qu'un remplacement.",
  },

  // ── ARTICLE 6 ──────────────────────────────────────────────
  {
    slug: "wifi-bluetooth-donnees-mobiles",
    tag: "Conseils",
    date: "20 jan. 2026",
    readTime: "3 min",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    title: "Wi-Fi, données mobiles et Bluetooth : comment bien les gérer",
    desc: "Activer le Bluetooth en permanence, oublier de passer en Wi-Fi, se connecter à n'importe quel réseau… ces petites habitudes coûtent de la batterie et des risques.",
    intro: "Trois technologies sont présentes sur presque tous les smartphones modernes : le Wi-Fi, les données mobiles et le Bluetooth. On les active souvent sans y penser et on ne les gère que quand la batterie faiblit ou que la facture téléphonique surprend. Voici comment tirer le meilleur de ces trois fonctionnalités tout en protégeant votre appareil.",
    sections: [
      {
        titre: "Wi-Fi vs données mobiles : priorisez le Wi-Fi",
        texte: "Le Wi-Fi consomme généralement moins de batterie que les données mobiles (surtout en LTE/4G ou 5G), et la plupart des forfaits mobiles ont une limite de données. Configurez votre téléphone pour qu'il préfère automatiquement le Wi-Fi quand il est disponible — c'est le comportement par défaut sur iOS et Android, mais vérifiez dans vos paramètres réseau que cette priorité est bien respectée.",
        liste: [
          "Activez le Wi-Fi dès que vous êtes à la maison, au bureau ou chez des amis",
          "Vérifiez régulièrement votre consommation de données mobiles dans Réglages",
          "Limitez la synchronisation automatique (photos, mises à jour) aux réseaux Wi-Fi uniquement"
        ]
      },
      {
        titre: "Le Wi-Fi public : pratique mais risqué",
        texte: "Nous l'avons mentionné dans notre article sur la cybersécurité, mais ça mérite d'être répété : les réseaux Wi-Fi publics (café, aéroport, hôtel) sont non sécurisés. Quelqu'un sur le même réseau peut intercepter vos données non chiffrées. Règle simple : utilisez le Wi-Fi public uniquement pour des activités neutres (regarder YouTube, chercher une adresse). Pour tout ce qui est sensible (banque, courriel professionnel, connexions), utilisez vos données mobiles ou un VPN.",
      },
      {
        titre: "Nettoyez vos réseaux Wi-Fi sauvegardés",
        texte: "Chaque fois que vous vous connectez à un nouveau Wi-Fi, votre téléphone le mémorise et tentera de s'y reconnecter automatiquement si vous repassez à portée. Au fil des années, vous accumulez des dizaines de réseaux : Wi-Fi d'hôtels, de restaurants, d'amis que vous n'avez pas revus depuis 3 ans. Certains de ces réseaux peuvent avoir changé de propriétaire. Faites le ménage tous les 6 mois dans Réglages → Wi-Fi → Gérer les réseaux.",
      },
      {
        titre: "Bluetooth : désactivez-le quand vous n'en avez pas besoin",
        texte: "Le Bluetooth actif en permanence présente deux inconvénients souvent ignorés. D'abord, la batterie : même si la consommation est faible, sur un appareil avec une batterie dégradée, ça compte. Ensuite, la sécurité : certaines attaques (BlueSnarfing, BlueBugging) exploitent le Bluetooth activé pour accéder à votre appareil à votre insu, sans action de votre part. Si vous n'utilisez pas d'écouteurs Bluetooth, d'enceinte ou de montre connectée, désactivez le Bluetooth.",
      },
      {
        titre: "Mode avion : le secret des voyageurs malins",
        texte: "Quand vous êtes dans un endroit sans réseau (métro, sous-sol, zone rurale), votre téléphone cherche frénétiquement un signal et consomme beaucoup de batterie en vain. Activez le mode avion dans ces situations — et réactivez uniquement le Wi-Fi si vous êtes connecté à un réseau. Vous pouvez aussi utiliser le mode avion la nuit si vous n'attendez pas d'appels importants : aucun signal à chercher, batterie préservée, et vous dormez mieux sans ondes.",
      },
      {
        titre: "La 5G : gare à la batterie",
        texte: "La 5G est rapide, mais elle consomme significativement plus de batterie que la 4G LTE. Si vous n'avez pas constamment besoin de télécharger de gros fichiers ou de diffuser de la vidéo 4K, considérez de limiter votre réseau à LTE (4G) dans vos paramètres. Cette simple modification peut prolonger votre autonomie de 20 à 30 % sur certains appareils.",
      }
    ],
    conclusion: "Ces ajustements simples dans vos habitudes quotidiennes peuvent faire une vraie différence sur l'autonomie de votre téléphone, votre facture de données et votre sécurité numérique. Si vous avez des questions sur la configuration optimale de votre appareil, notre équipe est disponible en boutique ou par téléphone.",
  },
];

// Helper : trouver un article par son slug
export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

// Helper : articles similaires (même tag, sauf l'article courant)
export function getRelated(slug: string, count = 2): Article[] {
  const current = getArticle(slug);
  if (!current) return [];
  return ARTICLES.filter(a => a.slug !== slug && a.tag === current.tag).slice(0, count)
    .concat(ARTICLES.filter(a => a.slug !== slug && a.tag !== current.tag))
    .slice(0, count);
}
