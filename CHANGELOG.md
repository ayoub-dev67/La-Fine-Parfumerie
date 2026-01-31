# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### À venir
- Implémentation complète de l'internationalisation (next-intl)
- Mode sombre
- Notifications push PWA
- Authentification biométrique

## [1.2.0] - 2024-01-30

### Ajouté
- **UX Premium**
  - Animations Framer Motion (page transitions, product reveals, cart slide-in)
  - Modal Quick View pour aperçu rapide des produits
  - Comparateur de produits (jusqu'à 4 produits side-by-side)
  - Galerie d'images avec zoom haute qualité
  - Chatbot FAQ avec catégories et recherche
  - Wishlist partageable par lien unique
  - Micro-interactions (hover, press, feedback visuel)
  - Skeletons de chargement
  - Toast notifications
  - États vides stylisés

- **Accessibilité (a11y)**
  - Skip link pour navigation clavier
  - Focus trap pour modals
  - Support lecteurs d'écran (ARIA)
  - Annonces live regions
  - Contraste couleurs WCAG AA
  - Hooks d'accessibilité réutilisables

- **Performance**
  - Configuration Lighthouse CI
  - Optimisation bundle (tree shaking)
  - Preconnect/DNS prefetch
  - Optimisation des fonts

- **Internationalisation**
  - Structure i18n préparée (next-intl)
  - Traductions françaises (défaut)
  - Traductions anglaises

- **Documentation**
  - Guide accessibilité (ACCESSIBILITY.md)
  - Guide Lighthouse (LIGHTHOUSE.md)
  - Guide i18n (I18N.md)
  - Guide UX (UX.md)
  - Documentation API complète

### Modifié
- ProductCard avec boutons Quick View et Compare
- Layout avec nouveaux providers (QuickView, Compare, Toast)
- Configuration ESLint avec règles a11y

### Corrigé
- Types Framer Motion (transitions, ease arrays)
- Import NextAuth v5 (auth au lieu de getServerSession)
- Régénération client Prisma après migration

## [1.1.0] - 2024-01-15

### Ajouté
- **Admin Dashboard**
  - Statistiques temps réel (CA, commandes, clients)
  - Graphiques Recharts
  - Gestion des commandes avec statuts
  - Gestion des clients VIP
  - Alertes stock
  - Import/Export CSV produits

- **E-commerce**
  - Codes promo avec validation
  - Historique des commandes
  - Système d'avis produits
  - Filtres avancés (marque, genre, catégorie, prix)
  - Tri des produits

- **Emails**
  - Templates React Email
  - Confirmation de commande
  - Notification d'expédition
  - Récupération mot de passe

### Modifié
- Amélioration de la recherche produits
- Optimisation des requêtes Prisma
- Pagination côté serveur

### Corrigé
- Webhook Stripe en production
- Gestion des stocks après commande
- Calcul TVA pour l'UE

## [1.0.0] - 2024-01-01

### Ajouté
- **Core**
  - Application Next.js 14 avec App Router
  - TypeScript strict mode
  - Tailwind CSS avec thème personnalisé
  - Prisma ORM avec PostgreSQL

- **Authentification**
  - NextAuth.js v5
  - Google OAuth
  - Authentification par credentials
  - Sessions sécurisées

- **E-commerce**
  - Catalogue produits
  - Fiches produits détaillées
  - Panier (localStorage)
  - Wishlist
  - Checkout Stripe
  - Confirmation de commande

- **SEO**
  - Sitemap dynamique
  - Robots.txt
  - Meta tags OpenGraph
  - Schema.org JSON-LD

- **PWA**
  - Manifest
  - Service Worker
  - Icônes multi-résolutions
  - Installation native

- **Sécurité**
  - Rate limiting
  - Validation Zod
  - Headers sécurisés
  - CSRF protection

### Notes de version

Cette release initiale inclut toutes les fonctionnalités core pour un e-commerce de parfumerie de luxe.

---

## Guide des versions

- **Major (X.0.0)** : Changements incompatibles avec les versions précédentes
- **Minor (0.X.0)** : Nouvelles fonctionnalités rétrocompatibles
- **Patch (0.0.X)** : Corrections de bugs rétrocompatibles

## Liens

- [Unreleased]: https://github.com/lafineparfumerie/perfume-shop/compare/v1.2.0...HEAD
- [1.2.0]: https://github.com/lafineparfumerie/perfume-shop/compare/v1.1.0...v1.2.0
- [1.1.0]: https://github.com/lafineparfumerie/perfume-shop/compare/v1.0.0...v1.1.0
- [1.0.0]: https://github.com/lafineparfumerie/perfume-shop/releases/tag/v1.0.0
