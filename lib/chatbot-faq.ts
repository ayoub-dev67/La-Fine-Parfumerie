/**
 * Chatbot FAQ Data - Predefined questions and answers
 */

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  questions: FAQItem[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: 'livraison',
    name: 'Livraison',
    icon: '📦',
    questions: [
      {
        id: 'delai-livraison',
        question: 'Quels sont les délais de livraison ?',
        answer: 'Nos délais de livraison sont de 2-3 jours ouvrés pour la France métropolitaine. Pour les DOM-TOM et l\'international, comptez 5-10 jours ouvrés. La livraison express (24h) est disponible pour les commandes passées avant 14h.',
        keywords: ['livraison', 'délai', 'temps', 'jours', 'quand', 'recevoir', 'arrivée']
      },
      {
        id: 'frais-livraison',
        question: 'Quels sont les frais de livraison ?',
        answer: 'La livraison est offerte à partir de 75€ d\'achat. En dessous de ce montant, les frais sont de 5,90€ pour la livraison standard et 9,90€ pour la livraison express.',
        keywords: ['frais', 'gratuit', 'coût', 'prix', 'port', 'livraison', 'offert']
      },
      {
        id: 'suivi-commande',
        question: 'Comment suivre ma commande ?',
        answer: 'Dès l\'expédition de votre commande, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre votre commande dans votre espace client, section "Mes commandes".',
        keywords: ['suivi', 'suivre', 'commande', 'où', 'tracking', 'colis', 'expédition']
      }
    ]
  },
  {
    id: 'retours',
    name: 'Retours & Échanges',
    icon: '🔄',
    questions: [
      {
        id: 'politique-retour',
        question: 'Quelle est votre politique de retour ?',
        answer: 'Vous disposez de 30 jours après réception pour retourner votre article. Le produit doit être non ouvert et dans son emballage d\'origine. Les retours sont gratuits en France.',
        keywords: ['retour', 'retourner', 'rembourser', 'remboursement', 'renvoyer', 'délai']
      },
      {
        id: 'echanger',
        question: 'Puis-je échanger mon parfum ?',
        answer: 'Oui, l\'échange est possible sous 30 jours. Si le parfum est scellé et non ouvert, vous pouvez l\'échanger contre un autre produit. Contactez notre service client pour organiser l\'échange.',
        keywords: ['échanger', 'échange', 'changer', 'remplacer', 'autre']
      },
      {
        id: 'produit-defectueux',
        question: 'Que faire si mon produit est défectueux ?',
        answer: 'En cas de produit défectueux ou endommagé, contactez-nous immédiatement avec des photos. Nous procéderons au remplacement ou remboursement sans frais.',
        keywords: ['défectueux', 'cassé', 'endommagé', 'problème', 'abîmé', 'défaut']
      }
    ]
  },
  {
    id: 'paiement',
    name: 'Paiement',
    icon: '💳',
    questions: [
      {
        id: 'moyens-paiement',
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, et le paiement en 3x sans frais via Klarna à partir de 100€.',
        keywords: ['paiement', 'payer', 'carte', 'paypal', 'moyen', 'bancaire']
      },
      {
        id: 'paiement-securise',
        question: 'Le paiement est-il sécurisé ?',
        answer: 'Absolument ! Tous nos paiements sont sécurisés via Stripe avec cryptage SSL 256-bit. Nous ne stockons jamais vos données bancaires.',
        keywords: ['sécurisé', 'sécurité', 'sûr', 'protection', 'ssl', 'stripe']
      },
      {
        id: 'facture',
        question: 'Comment obtenir ma facture ?',
        answer: 'Votre facture est automatiquement envoyée par email après chaque commande. Vous pouvez également la télécharger depuis votre espace client dans "Mes commandes".',
        keywords: ['facture', 'reçu', 'justificatif', 'télécharger', 'imprimer']
      }
    ]
  },
  {
    id: 'produits',
    name: 'Produits',
    icon: '✨',
    questions: [
      {
        id: 'authenticite',
        question: 'Vos parfums sont-ils authentiques ?',
        answer: 'Oui, 100% de nos parfums sont authentiques et proviennent directement des maisons de parfumerie. Nous sommes revendeur agréé et garantissons l\'authenticité de chaque produit.',
        keywords: ['authentique', 'vrai', 'original', 'contrefaçon', 'faux', 'certifié']
      },
      {
        id: 'conservation',
        question: 'Comment conserver mon parfum ?',
        answer: 'Pour préserver votre parfum : gardez-le à l\'abri de la lumière directe et de la chaleur, dans un endroit sec et frais (15-20°C). Fermez bien le flacon après utilisation.',
        keywords: ['conserver', 'conservation', 'garder', 'stocker', 'durée', 'péremption']
      },
      {
        id: 'echantillons',
        question: 'Proposez-vous des échantillons ?',
        answer: 'Oui ! Nous offrons des échantillons gratuits à chaque commande. Vous pouvez aussi acheter notre coffret découverte avec 5 échantillons de 2ml pour 15€.',
        keywords: ['échantillon', 'sample', 'essai', 'tester', 'découvrir', 'coffret']
      },
      {
        id: 'difference-edp-edt',
        question: 'Quelle différence entre EDP et EDT ?',
        answer: 'L\'Eau de Parfum (EDP) contient 15-20% de concentré et tient 6-8h. L\'Eau de Toilette (EDT) contient 5-15% et tient 3-4h. L\'EDP est plus intense et durable.',
        keywords: ['edp', 'edt', 'différence', 'concentration', 'toilette', 'parfum', 'intense']
      }
    ]
  },
  {
    id: 'compte',
    name: 'Mon Compte',
    icon: '👤',
    questions: [
      {
        id: 'creer-compte',
        question: 'Comment créer un compte ?',
        answer: 'Cliquez sur "Mon Compte" en haut de page, puis "Créer un compte". Remplissez le formulaire avec votre email et un mot de passe. Vous pouvez aussi vous inscrire via Google ou Apple.',
        keywords: ['créer', 'compte', 'inscription', 'inscrire', 'nouveau', 'register']
      },
      {
        id: 'mot-de-passe-oublie',
        question: 'J\'ai oublié mon mot de passe',
        answer: 'Pas de panique ! Cliquez sur "Mot de passe oublié" sur la page de connexion. Entrez votre email et vous recevrez un lien pour créer un nouveau mot de passe.',
        keywords: ['oublié', 'mot de passe', 'password', 'réinitialiser', 'reset', 'perdu']
      },
      {
        id: 'fidelite',
        question: 'Comment fonctionne le programme fidélité ?',
        answer: 'Gagnez 1 point par euro dépensé. 100 points = 5€ de réduction. Les membres VIP (500€+ d\'achats annuels) bénéficient de -10% permanent et accès aux ventes privées.',
        keywords: ['fidélité', 'points', 'réduction', 'vip', 'avantages', 'cagnotte']
      }
    ]
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: '📞',
    questions: [
      {
        id: 'contacter',
        question: 'Comment vous contacter ?',
        answer: 'Email : contact@lafineparfumerie.com\nTéléphone : 01 23 45 67 89 (lun-ven 9h-18h)\nChat : disponible en bas de page\nNotre équipe répond sous 24h maximum.',
        keywords: ['contacter', 'contact', 'joindre', 'email', 'téléphone', 'parler']
      },
      {
        id: 'boutique',
        question: 'Avez-vous une boutique physique ?',
        answer: 'Oui, notre boutique est située au 15 rue du Faubourg Saint-Honoré, 75008 Paris. Ouverte du mardi au samedi de 10h à 19h. Venez découvrir notre collection !',
        keywords: ['boutique', 'magasin', 'physique', 'adresse', 'visiter', 'paris']
      }
    ]
  }
];

/**
 * Search FAQ for matching answers
 */
export function searchFAQ(query: string): FAQItem[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  const results: { item: FAQItem; score: number }[] = [];

  for (const category of faqCategories) {
    for (const item of category.questions) {
      let score = 0;

      // Check keywords match
      for (const keyword of item.keywords) {
        if (normalizedQuery.includes(keyword)) {
          score += 3;
        }
        for (const word of queryWords) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 1;
          }
        }
      }

      // Check question match
      const normalizedQuestion = item.question.toLowerCase();
      for (const word of queryWords) {
        if (normalizedQuestion.includes(word)) {
          score += 2;
        }
      }

      if (score > 0) {
        results.push({ item, score });
      }
    }
  }

  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.item);
}

/**
 * Get all FAQ items flattened
 */
export function getAllFAQItems(): FAQItem[] {
  return faqCategories.flatMap(cat => cat.questions);
}

/**
 * Get popular/suggested questions
 */
export function getPopularQuestions(): FAQItem[] {
  const popularIds = [
    'delai-livraison',
    'politique-retour',
    'moyens-paiement',
    'authenticite',
    'echantillons'
  ];

  return getAllFAQItems().filter(item => popularIds.includes(item.id));
}
