// Données par défaut, embarquées dans le déploiement.
// Elles servent tant que le back-office n'a rien enregistré, et de filet de sécurité.
module.exports = {
  "avis": {
    "note": "5,0",
    "nombre": "76",
    "lien": "https://www.google.com/maps?cid=11204861903856342504",
    "aVerifier": false,
    "temoignages": [
      {
        "auteur": "Cécile B.",
        "texte": "Anaïs et Lionel sont très réactifs. L'organisation est fluide, la communication au top. Nous les recommandons."
      },
      {
        "auteur": "Guillaume G.",
        "texte": "1ère fois que je tente la livraison directement à l'aéroport, et c'était vraiment top. Moins de stress."
      },
      {
        "auteur": "Sébastien F.",
        "texte": "Couple de loueurs très disponible dès la réservation. Livraison rapide en 5 minutes en sortant de l'aéroport."
      },
      {
        "auteur": "Thibault B.",
        "texte": "Excellent service avec livraison et retour à l'aéroport, communication simple et efficace."
      },
      {
        "auteur": "Ryan",
        "texte": "Couple très sympathique et ouvert par rapport aux demandes spéciales. Voiture en excellente état. Je recommande !"
      },
      {
        "auteur": "Ma Nu",
        "texte": "Véhicule mis à disposition à l'heure à l'aéroport. Communication fluide. Je recommande vivement."
      }
    ]
  },
  "prixDepart": "18",
  "vehicules": [
    {
      "id": "fiat-panda",
      "nom": "Fiat Panda",
      "sousTitre": "Citadine · la plus économique de la flotte",
      "prix": "22",
      "categories": [
        "citadine"
      ],
      "chips": [
        "Citadine",
        "Km illimité",
        "Assurance incluse"
      ],
      "photo": "assets/vehicules/fiat-panda.jpg",
      "badge": "",
      "vedette": true,
      "visible": true
    },
    {
      "id": "dacia-sandero",
      "nom": "Dacia Sandero",
      "sousTitre": "Essence ou diesel · le meilleur rapport confort / budget",
      "prix": "24",
      "categories": [
        "citadine"
      ],
      "chips": [
        "Essence ou diesel",
        "Km illimité",
        "Assurance incluse"
      ],
      "photo": "assets/vehicules/dacia-sandero.webp",
      "badge": "",
      "vedette": true,
      "visible": true
    },
    {
      "id": "peugeot-208",
      "nom": "Peugeot 208",
      "sousTitre": "Modèles 2023 / 2024 · 75 ou 100 ch",
      "prix": "27",
      "categories": [
        "citadine"
      ],
      "chips": [
        "75 ou 100 ch",
        "Km illimité",
        "Assurance incluse"
      ],
      "photo": "assets/vehicules/peugeot-208.jpg",
      "badge": "",
      "vedette": true,
      "visible": true
    },
    {
      "id": "dacia-duster",
      "nom": "Dacia Duster",
      "sousTitre": "SUV surélevé · modèle 2023 · idéal pour le Nord de l'île",
      "prix": "33",
      "categories": [
        "suv"
      ],
      "chips": [
        "SUV",
        "Modèle 2023",
        "Km illimité"
      ],
      "photo": "assets/vehicules/dacia-duster.png",
      "badge": "Le plus demandé",
      "vedette": true,
      "visible": true
    },
    {
      "id": "peugeot-2008",
      "nom": "Peugeot 2008",
      "sousTitre": "SUV compact · modèle 2023",
      "prix": "35",
      "categories": [
        "suv"
      ],
      "chips": [
        "SUV",
        "Modèle 2023",
        "Km illimité"
      ],
      "photo": "assets/vehicules/peugeot-2008.jpg",
      "badge": "",
      "vedette": false,
      "visible": true
    },
    {
      "id": "sandero-stepway",
      "nom": "Dacia Sandero Stepway",
      "sousTitre": "Boîte automatique · modèle 2023",
      "prix": "35",
      "categories": [
        "citadine",
        "auto"
      ],
      "chips": [
        "Automatique",
        "Modèle 2023",
        "Km illimité"
      ],
      "photo": "assets/vehicules/sandero-stepway.jpg",
      "badge": "Boîte auto",
      "badgeLagon": true,
      "vedette": true,
      "visible": true
    },
    {
      "id": "dacia-jogger",
      "nom": "Dacia Jogger",
      "sousTitre": "Grand format familial · modèle 2023",
      "prix": "42",
      "categories": [
        "familiale"
      ],
      "chips": [
        "Familiale",
        "Modèle 2023",
        "Km illimité"
      ],
      "photo": "assets/vehicules/dacia-jogger.webp",
      "badge": "",
      "vedette": true,
      "visible": true
    },
    {
      "id": "dacia-lodgy",
      "nom": "Dacia Lodgy 7 places",
      "sousTitre": "Diesel · pour les grandes tablées et les gros bagages",
      "prix": "",
      "categories": [
        "familiale"
      ],
      "chips": [
        "7 places",
        "Diesel",
        "Km illimité"
      ],
      "photo": "assets/vehicules/dacia-lodgy.jpg",
      "badge": "",
      "vedette": false,
      "visible": true
    },
    {
      "id": "partner-tepee",
      "nom": "Partner Tepee",
      "sousTitre": "Diesel · volume de chargement généreux",
      "prix": "",
      "categories": [
        "familiale"
      ],
      "chips": [
        "Familiale",
        "Diesel",
        "Km illimité"
      ],
      "photo": "assets/vehicules/partner-tepee.jpeg",
      "badge": "",
      "vedette": false,
      "visible": true
    },
    {
      "id": "dacia-stepway",
      "nom": "Dacia Stepway",
      "sousTitre": "Disponible en boîte manuelle ou automatique",
      "prix": "",
      "categories": [
        "citadine",
        "auto"
      ],
      "chips": [
        "Manuelle ou auto",
        "Km illimité"
      ],
      "photo": "assets/vehicules/dacia-stepway.jpeg",
      "badge": "",
      "vedette": false,
      "visible": true
    }
  ],
  "logements": [
    {
      "id": "t3-pointe-du-bout",
      "nom": "T3 Pointe du Bout",
      "type": "Logement entier · Appartement",
      "photo": "assets/logements/t3-pointe-du-bout.jpeg",
      "resume": "Appartement entier · 2 chambres · vue marina",
      "paragraphes": [
        "Situé au deuxième et dernier étage d'une petite copropriété, l'appartement se compose d'une pièce de vie lumineuse et climatisée, de <strong>deux chambres spacieuses</strong> et d'une petite terrasse au calme avec vue sur la marina. Idéalement placé, tout se fait à pied."
      ],
      "note": "Départ : ménage à faire, poubelles sorties et draps enlevés. Forfait ménage à 50 € réglable sur place si vous préférez ne pas vous en occuper.",
      "equipements": [
        "2 chambres",
        "Vue marina",
        "Climatisation",
        "Wifi",
        "Lave-linge",
        "Cuisine équipée",
        "Lit parapluie",
        "Chaise haute",
        "Parking gratuit",
        "Accès plage"
      ],
      "chipsAccueil": [
        "Climatisé",
        "Terrasse"
      ],
      "visible": true
    },
    {
      "id": "carayou-spa",
      "nom": "Carayou & Spa",
      "type": "Studio · Complexe hôtelier",
      "photo": "assets/logements/carayou-spa.jpg",
      "resume": "Studio rénové dans un complexe hôtelier",
      "paragraphes": [
        "Un studio récemment rénové, avec un couchage 160×200 et un 90×200, une commode avec espace petit-déjeuner, une télévision, un WC séparé, une salle d'eau avec grande douche et une kitchenette sur la terrasse avec espace repas.",
        "Vous avez accès à <strong>tout l'hôtel</strong> : ses jardins, ses deux piscines avec transats, sa plage privée et ses animations. En supplément, vous pouvez profiter de la formule all inclusive, d'un repas ou d'un verre au bar, du catamaran de l'hôtel, du club nautique ou du jet ski."
      ],
      "note": "",
      "equipements": [
        "2 piscines",
        "Plage privée",
        "Front de mer",
        "Climatisation",
        "Wifi",
        "Coffre-fort",
        "Kitchenette",
        "Lit bébé sur demande",
        "Ménage possible",
        "Longs séjours acceptés"
      ],
      "chipsAccueil": [
        "2 piscines",
        "Plage privée"
      ],
      "visible": true
    },
    {
      "id": "ti-paradis",
      "nom": "Ti Paradis",
      "type": "Résidence de tourisme 3★",
      "photo": "assets/logements/ti-paradis.jpg",
      "resume": "Résidence 3★ · terrasse vue Marina · 3 personnes",
      "paragraphes": [
        "Idéalement situé sur la plage des Trois-Îlets, dans un complexe hôtelier trois étoiles, l'appartement dispose d'une <strong>terrasse bien exposée avec vue sur la Marina</strong>, en rez-de-chaussée. Décor moderne, jusqu'à trois personnes.",
        "L'équipement comprend la climatisation, un fer à repasser, une machine à café Dolce Gusto, une bouilloire, une grande télévision, une machine à laver et une kitchenette entièrement aménagée sur la terrasse. Salle de douche privative et WC séparé.",
        "Côté complexe : deux piscines, plage privée, wifi gratuit partout, et de nombreuses activités — baby-foot, ping-pong, pétanque, beach-volley, tennis, basketball, initiation à la danse, gym douce, canoës-kayaks et excursions."
      ],
      "note": "",
      "equipements": [
        "Jusqu'à 3 personnes",
        "Plain-pied",
        "Vue marina",
        "2 piscines",
        "Plage privée",
        "Climatisation",
        "Wifi gratuit",
        "Machine à laver",
        "Kitchenette"
      ],
      "chipsAccueil": [
        "Plain-pied",
        "Wifi gratuit"
      ],
      "visible": true
    },
    {
      "id": "ti-carayou",
      "nom": "Ti Carayou",
      "type": "Studio · Résidence de tourisme",
      "photo": "assets/logements/ti-carayou.jpg",
      "resume": "Studio confortable · vue sur la marina",
      "paragraphes": [
        "Un studio confortable avec une bonne literie 160×200 cm, la climatisation et un brasseur d'air, et une <strong>vue incroyable sur la marina</strong>. Vacances paisibles garanties.",
        "Vous vous rafraîchissez gratuitement dans les deux piscines de l'hôtel et profitez de la plage avec transats au sein du complexe. Nombreuses activités, animations gratuites, club enfants, et possibilité de restauration sur place en formule all inclusive."
      ],
      "note": "",
      "equipements": [
        "Vue marina",
        "Clim + brasseur d'air",
        "2 piscines",
        "Accès plage",
        "Club enfants",
        "Entrée privée",
        "Parking gratuit",
        "Wifi",
        "Espace repas extérieur"
      ],
      "chipsAccueil": [
        "Clim + brasseur",
        "Accès hôtel"
      ],
      "visible": true
    }
  ]
};
