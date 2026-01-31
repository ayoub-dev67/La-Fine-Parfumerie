# La Fine Parfumerie

[![Build Status](https://github.com/lafineparfumerie/perfume-shop/workflows/CI/badge.svg)](https://github.com/lafineparfumerie/perfume-shop/actions)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)

Application e-commerce moderne pour une parfumerie de luxe, construite avec Next.js 14.

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Base de données** | PostgreSQL (Neon.tech) |
| **Auth** | NextAuth.js v5 (Google OAuth, Credentials) |
| **Paiement** | Stripe Checkout |
| **Email** | React Email + Resend |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **i18n** | next-intl (préparé) |

## Fonctionnalités

### Client
- Catalogue produits avec filtres avancés et recherche
- Fiches produits détaillées (notes olfactives, stock, galerie zoom)
- Panier persistant (localStorage)
- Liste de favoris partageable (wishlist)
- Comparateur de produits (jusqu'à 4)
- Aperçu rapide (Quick View)
- Paiement sécurisé Stripe
- Suivi des commandes
- Avis et notes produits
- Chatbot FAQ intégré
- PWA (installation, notifications)

### Admin (`/admin`)
- Dashboard analytics (CA, conversions, top produits)
- Gestion produits (CRUD, import/export CSV)
- Gestion commandes (statuts, expédition)
- Gestion clients (VIP, statistiques)
- Gestion stock (alertes, historique)
- Codes promo

### UX Premium
- Animations Framer Motion (page transitions, product reveals)
- Modal Quick View avec galerie
- Comparateur de produits side-by-side
- Zoom d'image haute qualité
- Wishlist partageable par lien
- Micro-interactions et feedback visuel
- Loading states et skeletons

### Accessibilité (WCAG 2.1 AA)
- Navigation clavier complète
- Support lecteurs d'écran
- Contraste couleurs conforme
- Skip links et focus visible
- Annonces ARIA pour contenu dynamique

## Installation Rapide

### Prérequis
- Node.js 18.x ou supérieur
- npm 9.x ou supérieur
- PostgreSQL (ou compte Neon.tech)

### Installation

```bash
# 1. Cloner et installer
git clone <repo>
cd perfume-shop
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# 3. Setup base de données
npx prisma db push
npx prisma db seed

# 4. Générer les icônes PWA
npm run generate:icons

# 5. Lancer
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Configuration

### Variables d'environnement

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-32-chars-minimum"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Email (Resend)
RESEND_API_KEY="re_xxx"

# Analytics (optionnel)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Guides détaillés

| Guide | Description |
|-------|-------------|
| [SETUP_NEON.md](SETUP_NEON.md) | Configuration PostgreSQL Neon.tech |
| [STRIPE_SETUP.md](STRIPE_SETUP.md) | Configuration Stripe (paiement, webhooks) |
| [README_ICONS.md](README_ICONS.md) | Génération icônes PWA |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Guide accessibilité (a11y) |
| [docs/LIGHTHOUSE.md](docs/LIGHTHOUSE.md) | Optimisation performance |
| [docs/I18N.md](docs/I18N.md) | Internationalisation |
| [docs/UX.md](docs/UX.md) | Fonctionnalités UX |
| [docs/API.md](docs/API.md) | Documentation API complète |
| [docs/ADMIN.md](docs/ADMIN.md) | Guide administration |

## Scripts NPM

```bash
# Développement
npm run dev              # Serveur dev (port 3000)

# Production
npm run build            # Build production
npm run start            # Serveur production

# Tests
npm run test             # Lancer les tests
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Couverture de code

# Qualité de code
npm run lint             # ESLint (inclut a11y)
npm run type-check       # TypeScript check

# Base de données
npm run db:push          # Push schema Prisma
npm run db:seed          # Seed données initiales
npm run db:studio        # Interface Prisma Studio

# Performance
npm run lighthouse       # Audit Lighthouse
npm run analyze          # Bundle analyzer

# Utilitaires
npm run generate:icons   # Générer icônes PWA
```

## Structure du Projet

```
perfume-shop/
├── app/
│   ├── admin/              # Dashboard admin
│   ├── api/                # API Routes
│   ├── auth/               # Pages authentification
│   ├── products/           # Pages produits
│   ├── checkout/           # Page paiement
│   ├── orders/             # Historique commandes
│   ├── wishlist/           # Page favoris
│   ├── compare/            # Comparateur produits
│   ├── layout.tsx          # Layout principal
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # Page 404
│   ├── sitemap.ts          # Sitemap dynamique
│   ├── robots.ts           # Robots.txt
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── admin/              # Composants admin
│   ├── animations/         # Animations Framer Motion
│   ├── ui/                 # Composants UI (Toast, Skeleton, etc.)
│   ├── ProductCard.tsx     # Carte produit
│   ├── ProductQuickView.tsx # Modal aperçu rapide
│   ├── ImageGallery.tsx    # Galerie avec zoom
│   ├── CompareBar.tsx      # Barre comparateur
│   ├── Chatbot.tsx         # Chatbot FAQ
│   ├── Navbar.tsx          # Navigation
│   ├── Cart.tsx            # Panier
│   ├── SkipLink.tsx        # Skip link a11y
│   └── ...
├── lib/
│   ├── prisma.ts           # Client Prisma
│   ├── auth.ts             # Config NextAuth
│   ├── stripe.ts           # Config Stripe
│   ├── rate-limit.ts       # Rate limiting
│   ├── validations.ts      # Schémas Zod
│   ├── accessibility.ts    # Utilitaires a11y
│   ├── chatbot-faq.ts      # FAQ chatbot
│   └── ...
├── hooks/
│   ├── useAccessibility.ts # Hooks a11y
│   └── ...
├── i18n/
│   ├── config.ts           # Config i18n
│   └── locales/            # Traductions (fr, en)
├── prisma/
│   ├── schema.prisma       # Schéma BDD
│   └── seed.ts             # Données initiales
├── __tests__/              # Tests Jest
├── public/
│   ├── icons/              # Icônes PWA
│   └── sw.js               # Service Worker
└── types/
    └── index.ts            # Types TypeScript
```

## API Routes

Voir [docs/API.md](docs/API.md) pour la documentation complète.

### Routes Principales

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/search?q=xxx` | Recherche produits |
| POST | `/api/checkout` | Créer session Stripe |
| POST | `/api/webhook` | Webhook Stripe |
| GET/POST | `/api/wishlist` | Gérer favoris |
| POST | `/api/wishlist/share` | Partager wishlist |
| GET | `/api/products/[id]/reviews` | Avis produit |
| POST | `/api/promo/validate` | Valider code promo |

## Sécurité

### Mesures implémentées

- **Rate Limiting** : Protection contre les abus API
- **Validation Zod** : Validation stricte de toutes les entrées
- **Headers sécurisés** : CSP, HSTS, X-Frame-Options, etc.
- **CSRF** : Protection via NextAuth
- **Sanitization** : Nettoyage des inputs utilisateur
- **Auth** : Sessions sécurisées, tokens JWT

### Headers de sécurité (next.config.js)

```
X-DNS-Prefetch-Control: on
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Tests

```bash
# Lancer tous les tests
npm run test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

### Structure des tests

```
__tests__/
├── components/
│   └── ProductCard.test.tsx
├── api/
│   └── (tests API routes)
└── lib/
    └── (tests utilitaires)
```

## Performance

### Objectifs Lighthouse

| Métrique | Target | Minimum |
|----------|--------|---------|
| Performance | 95+ | 90 |
| Accessibility | 100 | 95 |
| Best Practices | 95+ | 90 |
| SEO | 100 | 95 |

### Optimisations

- Images Next.js avec WebP/AVIF
- Lazy loading automatique
- Code splitting et dynamic imports
- Font optimization (next/font)
- Prefetch des liens critiques

Voir [docs/LIGHTHOUSE.md](docs/LIGHTHOUSE.md) pour plus de détails.

## Déploiement Production

### Vercel (recommandé)

```bash
# 1. Push sur GitHub
git push origin main

# 2. Connecter à Vercel
# - Importer le repo GitHub
# - Configurer les variables d'environnement
# - Déployer
```

### Checklist pré-déploiement

- [ ] Toutes les variables d'environnement configurées
- [ ] `NEXTAUTH_URL` pointant vers le domaine prod
- [ ] `NEXT_PUBLIC_BASE_URL` mis à jour
- [ ] Webhook Stripe configuré pour l'URL de prod
- [ ] Base de données PostgreSQL accessible
- [ ] Domaine vérifié dans Google Cloud (OAuth)
- [ ] Tests passent (`npm run test`)
- [ ] Build réussit (`npm run build`)
- [ ] Lighthouse scores acceptables

## Monitoring

### Health Check

```bash
# Check basique
curl https://votre-site.com/api/health

# Check détaillé (DB, mémoire)
curl https://votre-site.com/api/health?detailed=true
```

## Troubleshooting

Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md) pour les problèmes courants.

## Contributing

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines de contribution.

## Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique des versions.

## Cartes de test Stripe

| Scénario | Numéro de carte |
|----------|-----------------|
| Paiement réussi | `4242 4242 4242 4242` |
| Paiement refusé | `4000 0000 0000 0002` |
| Auth requise | `4000 0025 0000 3155` |

Expiration : date future quelconque, CVC : 3 chiffres

## Licence

Propriétaire - La Fine Parfumerie
