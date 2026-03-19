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
  // ── ARTICLE 7 ──────────────────────────────────────────────
  {
    slug: "ecran-samsung-sallume-plus",
    tag: "Réparation",
    date: "18 mars 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    title: "Pourquoi l'écran de mon Samsung ne s'allume plus ?",
    desc: "Écran Samsung noir, téléphone qui ne répond plus ? Avant de paniquer, voici les vraies causes et les solutions à essayer soi-même — et quand appeler un technicien.",
    intro: "Vous appuyez sur le bouton d'alimentation de votre Samsung Galaxy et… rien. Écran noir, aucun son, aucune vibration. Ou pire : le téléphone vibre et semble actif, mais l'écran reste éteint. C'est l'une des pannes les plus fréquentes que nous voyons à notre atelier. La bonne nouvelle : dans une majorité des cas, ce n'est pas une panne définitive. Voici comment diagnostiquer la situation et ce que vous pouvez faire.",
    sections: [
      {
        titre: "1. Vérifier la batterie avant tout",
        texte: "La cause la plus commune est simplement une batterie à plat ou une charge défaillante. Même si votre Samsung était chargé, un câble endommagé ou un chargeur incompatible peut empêcher la charge réelle.",
        liste: [
          "Branchez le téléphone avec le câble et chargeur d'origine pendant 15 minutes",
          "Observez : un voyant rouge ou une icône de batterie apparaît-il ?",
          "Essayez un autre câble USB-C ou un autre chargeur compatible",
          "Nettoyez délicatement le port de charge avec une cure-dent — la poussière bloque souvent la connexion"
        ]
      },
      {
        titre: "2. Forcer un redémarrage matériel",
        texte: "Quand le système Android se bloque complètement, l'écran peut rester noir même si la batterie est chargée. Un redémarrage forcé contourne le problème logiciel sans effacer vos données.",
        liste: [
          "Samsung Galaxy récent : maintenez le bouton Volume Bas + Alimentation pendant 10 secondes",
          "Anciens modèles avec batterie amovible : retirez la batterie, attendez 30 secondes, replacez-la",
          "Répétez l'opération 2 à 3 fois si le téléphone ne répond pas immédiatement"
        ]
      },
      {
        titre: "3. L'écran est peut-être allumé mais invisible",
        texte: "Dans certains cas, le système fonctionne mais la dalle d'affichage est défaillante ou le rétroéclairage est mort. Pour vérifier :",
        liste: [
          "Dans une pièce sombre, pointez une lampe de poche directement sur l'écran",
          "Si vous voyez une image très sombre ou des contours, c'est le rétroéclairage (backlight) qui est défaillant",
          "Vous pouvez aussi écouter si le téléphone joue un son lors d'un appel entrant — s'il sonne, l'écran est la pièce défaillante"
        ]
      },
      {
        titre: "4. Une chute ou choc récent",
        texte: "Si le téléphone a subi une chute, même sans fissure visible, le connecteur de l'écran peut s'être débranché de la carte mère. C'est un phénomène courant sur les Galaxy A et S series. La nappe de connexion entre l'écran et la carte mère est fragile et peut se déconnecter sans laisser de trace extérieure. Cette réparation nécessite l'ouverture du téléphone par un technicien.",
      },
      {
        titre: "5. Surchauffe ou contact avec l'eau",
        texte: "L'eau et la chaleur excessive endommagent les circuits de l'écran. Si votre Samsung a été exposé à de l'humidité (même brièvement), les composants de l'affichage peuvent court-circuiter.",
        liste: [
          "N'essayez pas de charger un téléphone mouillé — vous risquez un court-circuit définitif",
          "Laissez-le sécher 24h à l'air libre dans du riz ou avec des sachets de gel de silice",
          "Apportez-le ensuite à un technicien pour un nettoyage de circuit interne"
        ]
      },
      {
        titre: "6. Quand la réparation professionnelle est indispensable",
        texte: "Si aucune des étapes précédentes ne résout le problème, la panne est matérielle et nécessite une intervention technique :",
        liste: [
          "Remplacement de la dalle d'affichage OLED ou LCD",
          "Réparation du connecteur de charge",
          "Nettoyage et séchage de la carte mère après contact avec l'eau",
          "Remplacement de la batterie défaillante"
        ]
      }
    ],
    conclusion: "Un écran Samsung qui ne s'allume plus n'est pas forcément signe de la mort de votre appareil. Avant d'en acheter un nouveau, venez chez Réparation CeLL&Ordi pour un diagnostic gratuit. Nous identifions la cause en quelques minutes et vous donnons un devis transparent. La plupart des remplacements d'écran Galaxy sont réalisés le jour même.",
  },

  // ── ARTICLE 8 ──────────────────────────────────────────────
  {
    slug: "iphone-ne-charge-plus",
    tag: "Réparation",
    date: "17 mars 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80",
    title: "iPhone qui ne charge plus : causes et solutions",
    desc: "Votre iPhone ne se charge plus ou charge très lentement ? Avant de remplacer le câble ou le téléphone, essayez ces étapes. La solution est souvent plus simple qu'on ne croit.",
    intro: "C'est l'un des problèmes les plus signalés avec l'iPhone : le câble Lightning ou USB-C est branché, mais la charge ne démarre pas — ou elle s'arrête au bout de quelques minutes. Ce problème peut avoir plusieurs origines très différentes, du plus simple (un port encrassé) au plus sérieux (un composant électronique défaillant). Voici comment identifier et résoudre le problème étape par étape.",
    sections: [
      {
        titre: "Étape 1 : Nettoyez le port Lightning / USB-C",
        texte: "C'est la cause numéro 1 des problèmes de charge sur iPhone. Le port accumule de la poussière, de la peluche de poche et des débris au fil des mois. Cette accumulation empêche le connecteur de faire un contact électrique correct.",
        liste: [
          "Éteignez l'iPhone avant de nettoyer",
          "Utilisez un cure-dent en plastique (pas métallique) pour déloger délicatement les débris",
          "Une petite brosse douce (type brosse à dents neuve) peut aider",
          "N'utilisez jamais d'air comprimé à haute pression ni d'objet métallique"
        ]
      },
      {
        titre: "Étape 2 : Testez avec un autre câble et un autre chargeur",
        texte: "Un câble de charge a une durée de vie limitée. Les pliures répétées près du connecteur endommagent les fils internes — même si l'extérieur semble intact. Testez avec un câble certifié MFi (Made for iPhone) d'un autre appareil. Évitez les câbles génériques à moins de 5 $ : ils peuvent endommager la batterie et ne sont pas reconnus par iOS.",
      },
      {
        titre: "Étape 3 : Redémarrez l'iPhone",
        texte: "iOS gère la charge via un contrôleur logiciel. Un bug ou un blocage de ce contrôleur peut empêcher la charge de démarrer même si tout est correctement branché. Un simple redémarrage suffit souvent à corriger cela. Sur iPhone X et plus récent : Volume haut → Volume bas → maintenez le bouton latéral jusqu'à l'apparition du logo Apple.",
      },
      {
        titre: "Étape 4 : Vérifiez l'état de la batterie",
        texte: "Une batterie très dégradée peut refuser de se charger ou indiquer 100 % alors qu'elle est vide. Allez dans Réglages → Batterie → État de la batterie. Si la capacité maximale est inférieure à 80 %, la batterie est en fin de vie et doit être remplacée. Chez CeLL&Ordi, nous réalisons ce remplacement en moins de 30 minutes avec des batteries de qualité supérieure.",
      },
      {
        titre: "Étape 5 : Le connecteur de charge est peut-être endommagé",
        texte: "Si le câble entre avec trop de facilité, si le téléphone doit être tenu dans un certain angle pour charger, ou si le connecteur a été exposé à l'eau, le port de charge est physiquement endommagé. C'est une réparation courante qui nécessite le remplacement du port de charge par un technicien.",
        liste: [
          "Port qui se décharge en utilisant le câble (mauvais contact)",
          "Câble qui tient seul sans être maintenu (port déformé)",
          "Présence de corrosion visible dans le port (blanc ou vert)"
        ]
      }
    ],
    conclusion: "Un iPhone qui ne charge plus est rarement une perte totale. Dans 80 % des cas, le problème vient du port de charge ou de la batterie — deux réparations rapides et abordables. Apportez votre iPhone chez Réparation CeLL&Ordi pour un diagnostic gratuit. Nous identifions la cause en quelques minutes et réalisons la réparation le jour même dans la majorité des cas.",
  },

  // ── ARTICLE 9 ──────────────────────────────────────────────
  {
    slug: "telephone-tombe-eau",
    tag: "Réparation",
    date: "15 mars 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    title: "Mon téléphone est tombé dans l'eau : que faire dans les 60 premières minutes ?",
    desc: "Les 60 premières minutes après une chute dans l'eau sont décisives. Voici exactement quoi faire — et quoi ne pas faire — pour maximiser les chances de sauver votre téléphone.",
    intro: "Votre téléphone vient de tomber dans l'évier, les toilettes ou la piscine. La panique s'installe. Mais sachez-le : les 60 premières minutes sont décisives. Ce que vous faites (ou ne faites pas) dans cette fenêtre de temps peut faire toute la différence entre un téléphone récupérable et un téléphone irréparable. Voici le protocole exact à suivre, étape par étape.",
    sections: [
      {
        titre: "1. Sortez-le immédiatement et éteignez-le",
        texte: "Chaque seconde supplémentaire dans l'eau aggrave les dégâts. Sortez le téléphone le plus vite possible et éteignez-le immédiatement. Ne vérifiez pas s'il fonctionne encore — l'alimentation électrique avec de l'eau présente risque de court-circuiter les composants définitivement.",
        liste: [
          "Maintenez le bouton d'alimentation jusqu'à l'extinction complète",
          "Si l'écran ne répond plus, maintenez volume bas + alimentation (Android) ou le bouton latéral (iPhone récent)",
          "Retirez la coque de protection si vous en avez une — elle peut retenir l'eau contre le téléphone"
        ]
      },
      {
        titre: "2. Ce qu'il ne faut surtout pas faire",
        texte: "Beaucoup de réflexes spontanés aggravent les dégâts en réalité :",
        liste: [
          "Ne branchez pas le chargeur — l'électricité dans un appareil mouillé cause des courts-circuits immédiats",
          "N'appuyez pas sur les boutons — cela pousse l'eau plus profondément dans l'appareil",
          "N'utilisez pas un sèche-cheveux à chaud — la chaleur endommage la colle, l'écran OLED et la batterie",
          "N'agitez pas le téléphone — vous déplacez l'eau vers des zones qui n'en ont pas encore",
          "N'attendez pas pour agir — chaque minute compte"
        ]
      },
      {
        titre: "3. Séchez l'extérieur délicatement",
        texte: "Avec un chiffon doux ou des mouchoirs en papier, épongez délicatement toutes les surfaces extérieures. Inclinez doucement le téléphone pour laisser s'écouler l'eau visible des ports (charge, haut-parleur, micro) sans agiter.",
      },
      {
        titre: "4. La méthode du gel de silice (bien supérieure au riz)",
        texte: "Le mythe du riz est tenace, mais le gel de silice est de 3 à 4 fois plus efficace pour absorber l'humidité. Ces petits sachets blancs ou orange se trouvent dans les boîtes de chaussures, les sacs neufs ou en pharmacie. Placez le téléphone dans un contenant hermétique avec 5 à 10 sachets de gel de silice pendant minimum 24 à 48 heures. Ne le rallumez pas avant ce délai.",
      },
      {
        titre: "5. Quand rallumer (et pourquoi attendre 48h)",
        texte: "L'humidité invisible reste dans l'appareil bien après que l'eau visible a disparu. Rallumer trop tôt, même après 24h, peut causer des courts-circuits sur des circuits encore humides. Attendez 48h minimum dans le gel de silice avant de tenter un rallumage. Si le téléphone redémarre normalement, surveillez les jours suivants : des symptômes d'oxydation peuvent apparaître tardivement (caméra embuée, batterie qui se vide vite, micro défaillant).",
      },
      {
        titre: "6. Apportez-le à un technicien le plus tôt possible",
        texte: "Même si votre téléphone semble fonctionner après séchage, l'eau laisse des résidus minéraux qui causent de la corrosion au fil des jours et des semaines. Un nettoyage professionnel de la carte mère à l'alcool isopropylique (90 % ou plus) élimine ces résidus avant qu'ils causent des dégâts permanents. Plus vous attendez, plus la corrosion progresse.",
        liste: [
          "Nettoyage ultrasonique de la carte mère",
          "Remplacement des composants oxydés",
          "Test complet de toutes les fonctionnalités",
          "Diagnostic de la batterie (l'eau la dégrade rapidement)"
        ]
      }
    ],
    conclusion: "La vitesse d'action est votre meilleure alliée. Si vous avez respecté ces étapes, les chances de récupérer votre téléphone sont bonnes. N'attendez pas pour consulter un professionnel, même si l'appareil semble fonctionner — la corrosion interne peut mettre plusieurs jours avant de causer des symptômes visibles. Chez Réparation CeLL&Ordi, nous proposons un service de nettoyage après dégât d'eau avec diagnostic complet.",
  },

  // ── ARTICLE 10 ──────────────────────────────────────────────
  {
    slug: "ecran-fissure-telephone",
    tag: "Réparation",
    date: "12 mars 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
    title: "Écran fissuré : réparer ou remplacer son téléphone ?",
    desc: "Écran fissuré mais téléphone qui fonctionne encore ? On vous explique quand réparer vaut la peine — et quand il vaut mieux changer d'appareil.",
    intro: "Ça arrive à tout le monde : un moment d'inattention, une chute, et l'écran de votre téléphone se retrouve fissuré. La première réaction est souvent de se demander : est-ce que ça vaut la peine de le faire réparer ? Ou mieux vaut-il investir dans un nouvel appareil ? La réponse dépend de plusieurs facteurs — et on vous aide à faire le bon choix.",
    sections: [
      {
        titre: "Évaluer les dégâts : fissure superficielle ou écran cassé ?",
        texte: "Toutes les fissures ne sont pas égales. Il existe plusieurs niveaux de dommage à l'écran :",
        liste: [
          "Verre de protection fissuré seulement : la dalle OLED/LCD fonctionne parfaitement, seul le verre externe est touché. Réparation simple et économique.",
          "Dalle LCD/OLED endommagée : taches noires, lignes, zones mortes ou couleurs anormales. L'écran complet doit être remplacé.",
          "Écran tactile qui ne répond plus : un choc peut déconnecter la nappe tactile même sans fissure visible.",
          "Boîtier plié ou déformé : les chutes violentes peuvent tordre le châssis et compliquer la réparation."
        ]
      },
      {
        titre: "Le coût de la réparation vs l'achat d'un nouvel appareil",
        texte: "La règle générale : si le coût de réparation dépasse 50 % de la valeur actuelle du téléphone, il vaut mieux envisager un remplacement. Pour un iPhone 14 valant 700 $ d'occasion, une réparation d'écran à 200 $ est clairement justifiée. Pour un vieux Samsung A20 valant 80 $, une réparation à 120 $ ne l'est pas.",
        liste: [
          "Demandez toujours un devis gratuit avant de décider",
          "Comparez le prix de réparation avec la valeur marchande actuelle de l'appareil",
          "Tenez compte de l'âge : un appareil de moins de 3 ans mérite presque toujours d'être réparé",
          "Vérifiez si vous avez une assurance appareil ou une garantie constructeur encore valide"
        ]
      },
      {
        titre: "Les risques de laisser l'écran fissuré",
        texte: "Un écran fissuré n'est pas qu'un problème esthétique. Il présente des risques réels :",
        liste: [
          "Les éclats de verre peuvent blesser les doigts",
          "L'humidité s'infiltre par les fissures et endommage les composants internes",
          "Les fissures s'étendent : une petite fissure devient souvent une grande en quelques semaines",
          "Le tactile peut progressivement cesser de fonctionner dans les zones fissurées"
        ]
      },
      {
        titre: "Réparer soi-même : une mauvaise idée",
        texte: "Des kits de réparation DIY existent en ligne, mais nous les déconseillons fortement. L'ouverture d'un smartphone moderne requiert des outils spécialisés, une station de chaleur précise pour décoller l'écran, et de l'expérience pour ne pas endommager la nappe de l'écran, la batterie ou d'autres composants fragiles. Une mauvaise manipulation peut transformer une réparation simple en panne totale.",
      },
      {
        titre: "Ce qui est inclus dans une réparation d'écran professionnelle",
        texte: "Chez un technicien qualifié, le remplacement d'écran comprend généralement :",
        liste: [
          "Dépose sécurisée de l'ancien écran avec station de chaleur calibrée",
          "Remplacement par une dalle de qualité égale ou supérieure à l'originale",
          "Recolle avec adhésif adapté pour garantir l'étanchéité",
          "Test complet : tactile, luminosité, Face ID / capteur d'empreinte, caméra frontale",
          "Garantie sur la pièce et la main d'œuvre"
        ]
      }
    ],
    conclusion: "Dans la grande majorité des cas, réparer un écran fissuré est la décision économique et écologique la plus sensée. Ne laissez pas les fissures s'aggraver — plus vous attendez, plus le risque de dommages secondaires augmente. Apportez votre téléphone chez Réparation CeLL&Ordi pour un devis gratuit. Nous réparons tous les modèles iPhone, Samsung, Huawei et plus, avec des pièces de qualité et une garantie.",
  },

  // ── ARTICLE 11 ──────────────────────────────────────────────
  {
    slug: "samsung-redemarrage-intempestif",
    tag: "Réparation",
    date: "10 mars 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    title: "Samsung qui redémarre tout seul : les vraies causes et solutions",
    desc: "Votre Samsung Galaxy redémarre sans raison, au milieu d'une conversation ou en jouant ? Ce guide vous explique pourquoi et comment y remédier.",
    intro: "Votre Samsung Galaxy se redémarre spontanément — parfois plusieurs fois par jour — sans que vous ayez rien fait. C'est une panne frustrante qui peut avoir des origines très différentes : une batterie défaillante, un problème logiciel, une surchauffe, ou une application mal programmée. Voici comment identifier la cause et y remédier.",
    sections: [
      {
        titre: "Cause 1 : La batterie est en fin de vie",
        texte: "C'est la cause la plus fréquente des redémarrages intempestifs sur Samsung. Une batterie vieillissante ne peut plus fournir les pics de courant nécessaires lors d'un usage intensif (jeu, appel vidéo, photo). Le téléphone coupe l'alimentation pour se protéger et redémarre automatiquement. Ce phénomène s'aggrave par temps froid.",
        liste: [
          "Allez dans Paramètres → Batterie et protection de l'appareil → Diagnostic de la batterie",
          "Si la capacité est inférieure à 80 %, un remplacement est recommandé",
          "Les redémarrages surviennent surtout à 15–30 % de batterie ? C'est un signal classique de batterie défaillante"
        ]
      },
      {
        titre: "Cause 2 : Une application défaillante",
        texte: "Une application mal codée ou corrompue peut provoquer des plantages système qui déclenchent un redémarrage. Pour identifier le coupable, démarrez le téléphone en mode sans échec (Safe Mode) : maintenez le bouton d'alimentation, appuyez longuement sur « Éteindre » jusqu'à l'option Safe Mode. Si les redémarrages cessent, une application tierce est responsable.",
        liste: [
          "Identifiez les applications installées récemment avant l'apparition du problème",
          "Désinstallez-les une par une en commençant par la plus récente",
          "Effacez le cache des applications : Paramètres → Applications → (app) → Stockage → Vider le cache"
        ]
      },
      {
        titre: "Cause 3 : Le système Android est corrompu",
        texte: "Une mise à jour d'Android mal installée, une corruption de la partition système ou un stockage interne défaillant peuvent causer des redémarrages aléatoires. La solution est souvent une réinitialisation complète (factory reset). Sauvegardez absolument vos données avant via Samsung Cloud ou Google One.",
      },
      {
        titre: "Cause 4 : Surchauffe",
        texte: "Samsung intègre un système de protection thermique : si le processeur atteint une température critique, le téléphone s'éteint et redémarre pour refroidir. Si vos redémarrages surviennent lors d'usages intensifs (jeu, GPS longue durée, streaming 4K), la surchauffe est probablement en cause.",
        liste: [
          "Retirez la coque pendant les usages intensifs — elle peut piéger la chaleur",
          "Évitez d'utiliser le téléphone en plein soleil ou dans un véhicule chaud",
          "Vérifiez que les ventilations ne sont pas obstruées (pour les téléphones gaming)"
        ]
      },
      {
        titre: "Cause 5 : Un problème matériel (carte mère ou connecteur)",
        texte: "Si aucune des causes précédentes ne semble responsable, le problème peut être matériel : un condensateur défaillant sur la carte mère, une soudure qui s'est décrochée suite à une chute, ou un connecteur de batterie mal positionné. Cette cause nécessite une inspection par un technicien avec matériel de diagnostic.",
      }
    ],
    conclusion: "Un Samsung qui redémarre tout seul est rarement condamné. Dans la plupart des cas, le problème vient de la batterie ou d'une application — deux problèmes facilement réparables. Si les solutions logicielles n'ont rien changé, apportez votre appareil chez Réparation CeLL&Ordi pour un diagnostic gratuit. Nous identifions la cause précise et vous proposons une solution transparente.",
  },

  // ── ARTICLE 12 ──────────────────────────────────────────────
  {
    slug: "mot-de-passe-windows-oublie",
    tag: "Ordinateurs",
    date: "8 mars 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80",
    title: "J'ai oublié mon mot de passe Windows : comment accéder à mon PC ?",
    desc: "Vous êtes bloqué devant l'écran de connexion Windows ? Pas de panique. Il existe plusieurs méthodes pour récupérer l'accès à votre PC — sans perdre vos fichiers.",
    intro: "Vous avez oublié le mot de passe de votre compte Windows. Ou pire, vous venez de récupérer un ordinateur dont vous ne connaissez pas le mot de passe. Dans les deux cas, inutile de paniquer — et surtout inutile de réinstaller Windows en perdant toutes vos données. Selon votre situation (compte local ou compte Microsoft), les solutions diffèrent. On vous explique tout.",
    sections: [
      {
        titre: "Cas 1 : Compte Microsoft (le plus simple à résoudre)",
        texte: "Si vous vous connectez à Windows avec une adresse courriel Microsoft (Outlook, Hotmail, Live), la récupération du mot de passe se fait entièrement en ligne — même depuis un autre appareil.",
        liste: [
          "Depuis un téléphone ou un autre ordinateur, allez sur account.live.com/password/reset",
          "Entrez votre adresse courriel Microsoft",
          "Choisissez la méthode de vérification : courriel de récupération, SMS, ou code d'authentification",
          "Une fois le mot de passe réinitialisé, connectez-vous sur votre PC avec le nouveau"
        ]
      },
      {
        titre: "Cas 2 : Compte local Windows 10 avec questions de sécurité",
        texte: "Sur Windows 10, lors de la création d'un compte local, Windows propose des questions de sécurité. Si vous les avez configurées, la récupération est simple :",
        liste: [
          "Sur l'écran de connexion, cliquez sur « J'ai oublié mon code PIN » ou entrez un mauvais mot de passe",
          "L'option « Réinitialiser le mot de passe » apparaît sous le champ",
          "Répondez correctement aux 3 questions de sécurité",
          "Créez un nouveau mot de passe"
        ]
      },
      {
        titre: "Cas 3 : Compte local sans questions de sécurité (Windows 10/11)",
        texte: "C'est la situation la plus délicate. Si vous avez un compte local sans questions de sécurité et que vous n'avez pas de disque de réinitialisation, les options disponibles sont :",
        liste: [
          "Utiliser l'environnement de récupération Windows (WinRE) pour accéder à une invite de commande avec droits administrateur",
          "Démarrer sur une clé USB Windows pour accéder au système de fichiers",
          "Sur certaines configurations, utiliser l'outil de réinitialisation du compte Administrateur intégré"
        ]
      },
      {
        titre: "Cas 4 : PC d'entreprise ou compte de domaine",
        texte: "Si votre ordinateur fait partie d'un réseau d'entreprise (domaine Active Directory), seul l'administrateur réseau peut réinitialiser le mot de passe. Il n'existe pas de contournement simple et légal pour ce type de compte — c'est une mesure de sécurité intentionnelle.",
      },
      {
        titre: "Ce qu'un technicien peut faire que vous ne pouvez pas",
        texte: "Les méthodes de récupération avancées nécessitent des outils spécialisés et une bonne connaissance du système Windows. Un technicien peut :",
        liste: [
          "Récupérer l'accès au compte local sans perte de données",
          "Créer un nouveau compte administrateur pour accéder aux fichiers de l'ancien compte",
          "Extraire et sauvegarder vos données si la réinstallation est inévitable",
          "Sécuriser le nouveau compte pour éviter que la situation se reproduise (gestionnaire de mots de passe, compte Microsoft lié)"
        ]
      },
      {
        titre: "Comment éviter le problème à l'avenir",
        texte: "La meilleure solution est préventive :",
        liste: [
          "Utilisez un compte Microsoft — la récupération en ligne est toujours possible",
          "Configurez un PIN court en complément du mot de passe — plus facile à retenir",
          "Notez votre mot de passe dans un gestionnaire sécurisé (Bitwarden, 1Password)",
          "Créez un disque de réinitialisation via le Panneau de configuration → Compte d'utilisateur"
        ]
      }
    ],
    conclusion: "Un mot de passe Windows oublié est un problème courant et généralement récupérable sans perte de données. Si vous êtes bloqué et que les méthodes en ligne ne s'appliquent pas à votre situation, nos techniciens chez Réparation CeLL&Ordi peuvent récupérer l'accès à votre PC et sauvegarder vos données importantes. Prenez rendez-vous ou passez directement en boutique.",
  },

  // ── ARTICLE 13 ──────────────────────────────────────────────
  {
    slug: "ordinateur-surchauffe",
    tag: "Ordinateurs",
    date: "5 mars 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
    title: "Ordinateur qui surchauffe : causes, dangers et solutions",
    desc: "Ventilateur qui tourne à plein régime, PC chaud au toucher, plantages aléatoires… Votre ordinateur surchauffe. Voici pourquoi — et comment y remédier avant qu'il soit trop tard.",
    intro: "Un ordinateur qui surchauffe n'est pas un simple inconfort — c'est une menace réelle pour vos composants. Les processeurs et cartes graphiques modernes peuvent fonctionner jusqu'à 95–100°C en pointe, mais une exposition prolongée à ces températures réduit drastiquement leur durée de vie et peut causer des pannes permanentes. Voici comment diagnostiquer et résoudre la surchauffe.",
    sections: [
      {
        titre: "Comment savoir si votre PC surchauffe vraiment",
        texte: "Quelques symptômes caractéristiques :",
        liste: [
          "Le ventilateur tourne fort et bruyamment même pour des tâches légères",
          "Le PC s'éteint brusquement pendant un jeu ou une tâche intensive",
          "L'ordinateur est très chaud au toucher (dessous du portable, grilles de ventilation)",
          "Les performances baissent progressivement (throttling thermique)",
          "Des lignes apparaissent sur l'écran ou l'image se dégrade (carte graphique trop chaude)"
        ]
      },
      {
        titre: "Cause 1 : Poussière dans le système de refroidissement",
        texte: "C'est la cause numéro 1. Après 2 à 3 ans d'utilisation, les ventilateurs et radiateurs accumulent une couche de poussière qui bloque complètement le flux d'air. Un PC dont les radiateurs sont obstrués par la poussière peut voir sa température CPU augmenter de 20 à 30°C. Sur un ordinateur portable, c'est encore plus critique car le système de refroidissement est plus compact.",
        liste: [
          "Nettoyage régulier : tous les 12 à 18 mois pour un bureau, tous les 6 à 12 mois pour un portable",
          "Utilisez de l'air comprimé en courtes rafales (jamais en continu — vous pouvez emballer les ventilateurs)",
          "Bloquez les ventilateurs avec un crayon pendant le soufflage pour éviter de les endommager",
          "Pour un nettoyage en profondeur, l'ouverture de l'appareil est nécessaire"
        ]
      },
      {
        titre: "Cause 2 : Pâte thermique séchée",
        texte: "La pâte thermique est un composé qui assure le transfert de chaleur entre le processeur et son radiateur. Avec le temps (généralement 3 à 5 ans), elle sèche et se fissure, devenant un isolant au lieu d'un conducteur. Renouveler la pâte thermique peut faire baisser la température du CPU de 10 à 20°C. C'est une opération délicate qui requiert d'ouvrir l'ordinateur et de retirer le système de refroidissement.",
      },
      {
        titre: "Cause 3 : Ventilation du local insuffisante",
        texte: "L'environnement de l'ordinateur compte autant que l'appareil lui-même :",
        liste: [
          "Ne placez jamais un portable sur un lit, un coussin ou une surface molle qui obstruent les grilles",
          "Laissez au moins 10 cm d'espace autour d'un ordinateur de bureau",
          "En été, une pièce chaude (30°C+) rend le refroidissement beaucoup plus difficile",
          "Un support surélevé pour portable améliore significativement la circulation d'air"
        ]
      },
      {
        titre: "Cause 4 : Composants sous-dimensionnés ou défaillants",
        texte: "Si l'alimentation électrique (PSU) est trop juste pour les composants du PC, elle chauffe excessivement. Un ventilateur CPU ou GPU défaillant (qui tourne moins vite ou s'arrête) ne refroidit plus correctement. Ces problèmes nécessitent un diagnostic matériel.",
      },
      {
        titre: "Ce que vous pouvez faire maintenant (logiciel)",
        texte: "En attendant une intervention technique, quelques mesures logicielles peuvent limiter la surchauffe :",
        liste: [
          "Installez HWMonitor (gratuit) pour surveiller les températures en temps réel",
          "Dans les paramètres d'alimentation Windows, choisissez « Économie d'énergie » temporairement",
          "Fermez les applications inutiles qui chargent le processeur",
          "Sur les portables gaming, activez un mode de performance réduite ou « silencieux » dans le logiciel constructeur"
        ]
      }
    ],
    conclusion: "La surchauffe est l'une des principales causes de mort prématurée des composants électroniques. Un nettoyage préventif régulier coûte peu et peut prolonger la vie de votre ordinateur de plusieurs années. Si votre PC montre des signes de surchauffe, ne tardez pas — plus vous attendez, plus le risque de dommages permanents augmente. Chez Réparation CeLL&Ordi, nous proposons un service complet de nettoyage, renouvellement de pâte thermique et diagnostic thermique.",
  },

  // ── ARTICLE 14 ──────────────────────────────────────────────
  {
    slug: "recuperer-donnees-telephone-casse",
    tag: "Conseils",
    date: "1 mars 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1614433952470-f9ceee0cf5b0?w=800&q=80",
    title: "Récupérer les données d'un téléphone cassé ou mort : est-ce possible ?",
    desc: "Téléphone tombé en panne, écran noir ou cassé, téléphone mort sans sauvegarde… Vos photos et contacts sont-ils perdus à jamais ? Pas forcément. Voici vos options.",
    intro: "Votre téléphone est mort, cassé ou ne s'allume plus — et vous réalisez que vous n'avez pas fait de sauvegarde récente. Photos de famille, contacts, messages importants, documents professionnels… La panique est compréhensible. Mais avant de conclure que tout est perdu, sachez que la récupération de données est souvent possible, même sur un appareil qui ne fonctionne plus. Voici vos options selon votre situation.",
    sections: [
      {
        titre: "Étape 1 : Vérifier les sauvegardes cloud automatiques",
        texte: "Beaucoup de gens ont des sauvegardes actives sans le savoir. C'est la première chose à vérifier depuis un autre appareil ou un navigateur web :",
        liste: [
          "iPhone : iCloud.com → vos photos, contacts, messages et notes peuvent être accessibles directement",
          "Android/Samsung : Google Photos (photos.google.com) pour les photos, et Google Contacts pour les contacts",
          "Samsung Cloud : si vous utilisez un Galaxy, Samsung Cloud sauvegarde parfois automatiquement",
          "Google Drive : vérifiez si une sauvegarde Android complète y est présente (Paramètres Google sur votre nouveau téléphone)"
        ]
      },
      {
        titre: "Cas A : L'écran est cassé mais le téléphone s'allume",
        texte: "Si le téléphone est actif (vous entendez des sons, il vibre, il répond aux appels) mais l'écran est inutilisable, plusieurs solutions existent :",
        liste: [
          "Branchez le téléphone à un écran externe via USB-C avec mode HDMI (si supporté) ou via un adaptateur",
          "Sur certains Samsung, la fonction « Lien avec Windows » ou « DeX » permet de contrôler le téléphone depuis un PC",
          "Un technicien peut temporairement connecter un écran de remplacement pour accéder aux données sans les effacer"
        ]
      },
      {
        titre: "Cas B : Le téléphone ne s'allume plus mais la mémoire est intacte",
        texte: "Si la carte mère ou la batterie est défaillante mais que la mémoire de stockage (eMMC ou UFS) est saine, les données sont techniquement toujours là. Un technicien qualifié peut :",
        liste: [
          "Remplacer la batterie pour tenter un rallumage et accéder aux données",
          "Identifier si le problème vient de la carte mère et tenter une réparation ciblée",
          "Dans les cas extrêmes, dessouder la puce de stockage et la lire sur un équipement spécialisé (récupération avancée)"
        ]
      },
      {
        titre: "Cas C : Contact avec l'eau ou dégât thermique",
        texte: "La corrosion due à l'eau peut endommager progressivement les soudures de la puce de stockage. Plus vous intervenez rapidement, meilleures sont les chances. Un nettoyage professionnel de la carte mère peut parfois suffire à restaurer le fonctionnement et permettre une sauvegarde des données.",
      },
      {
        titre: "Ce qui est irrécupérable",
        texte: "Il existe des situations où la récupération de données est impossible même pour un professionnel :",
        liste: [
          "Puce de stockage physiquement détruite (brûlée, fracturée)",
          "Chiffrement Android ou iOS avec clé perdue — si le téléphone ne se déverrouille pas, les données chiffrées ne peuvent pas être lues",
          "Dommages électriques graves (foudre, court-circuit intense) qui détruisent la puce"
        ]
      },
      {
        titre: "La leçon à retenir : sauvegardez maintenant",
        texte: "La meilleure récupération de données, c'est celle qu'on n'a jamais à faire. Activez dès aujourd'hui :",
        liste: [
          "iCloud (iPhone) : Réglages → votre nom → iCloud → Sauvegarde iCloud → Activer",
          "Google One (Android) : Paramètres → Google → Sauvegarde → Activer la sauvegarde",
          "Google Photos : pour vos photos uniquement, en qualité originale ou compressée",
          "Fréquence recommandée : quotidienne automatique en Wi-Fi"
        ]
      }
    ],
    conclusion: "Avant de conclure que vos données sont perdues à jamais, consultez un professionnel. Dans une majorité de cas, même un téléphone qui semble mort peut livrer ses données entre les mains d'un technicien expérimenté. Chez Réparation CeLL&Ordi, nous proposons un service de récupération de données avec diagnostic préalable gratuit. Et si votre téléphone fonctionne encore aujourd'hui — c'est le moment parfait pour faire votre première sauvegarde.",
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
