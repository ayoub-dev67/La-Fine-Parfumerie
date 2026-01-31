# Checklist de Déploiement - La Fine Parfumerie

Guide complet de vérification avant le déploiement en production.

---

## 1. Variables d'Environnement

### Base de données
- [ ] `DATABASE_URL` - PostgreSQL Neon (production)
  ```
  postgresql://user:pass@host/db?sslmode=require
  ```

### Authentification
- [ ] `NEXTAUTH_URL` - URL de production (ex: https://lafineparfumerie.fr)
- [ ] `AUTH_URL` - Même URL que NEXTAUTH_URL
- [ ] `NEXTAUTH_SECRET` - Secret généré (min 32 caractères)
  ```bash
  openssl rand -base64 32
  ```
- [ ] `AUTH_SECRET` - Même valeur que NEXTAUTH_SECRET

### Google OAuth
- [ ] `GOOGLE_CLIENT_ID` - ID client Google Cloud
- [ ] `GOOGLE_CLIENT_SECRET` - Secret client Google Cloud

### Stripe (MODE LIVE)
- [ ] `STRIPE_SECRET_KEY` - Clé secrète LIVE (`sk_live_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clé publique LIVE (`pk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Secret webhook production (`whsec_...`)

### Email
- [ ] `RESEND_API_KEY` - Clé API Resend (`re_...`)

### Monitoring
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - DSN Sentry
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` - ID Google Analytics (`G-...`)

### Push Notifications
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Clé publique VAPID
- [ ] `VAPID_PRIVATE_KEY` - Clé privée VAPID

### Cache (optionnel)
- [ ] `UPSTASH_REDIS_REST_URL` - URL Redis Upstash
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Token Redis Upstash

### Application
- [ ] `NEXT_PUBLIC_BASE_URL` - URL de production

---

## 2. Configuration des Services

### Google OAuth
- [ ] Accéder à [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Projet > APIs & Services > Credentials
- [ ] Ajouter URI autorisés :
  - `https://lafineparfumerie.fr`
  - `https://lafineparfumerie.fr/api/auth/callback/google`
- [ ] Vérifier que le domaine est vérifié dans "Domain verification"

### Stripe
- [ ] Accéder à [Stripe Dashboard](https://dashboard.stripe.com/)
- [ ] **Basculer en mode LIVE** (bouton en haut à droite)
- [ ] Récupérer les clés LIVE dans Developers > API keys
- [ ] Configurer le webhook de production :
  - URL : `https://lafineparfumerie.fr/api/webhook`
  - Événements à écouter :
    - `checkout.session.completed`
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
- [ ] Récupérer le nouveau `STRIPE_WEBHOOK_SECRET`

### Neon (PostgreSQL)
- [ ] Accéder à [Neon Console](https://console.neon.tech/)
- [ ] Vérifier que la base de données est active
- [ ] Copier la connection string (avec pooler)
- [ ] S'assurer que SSL est activé (`?sslmode=require`)

### Upstash Redis (optionnel)
- [ ] Créer un compte sur [Upstash](https://upstash.com/)
- [ ] Créer une base Redis
- [ ] Copier `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

### Resend (Email)
- [ ] Accéder à [Resend Dashboard](https://resend.com/)
- [ ] Optionnel : Vérifier un domaine personnalisé
- [ ] Copier la clé API

### Sentry (Monitoring)
- [ ] Créer un projet sur [Sentry](https://sentry.io/)
- [ ] Copier le DSN du projet
- [ ] Configurer les alertes

### Google Analytics
- [ ] Créer une propriété GA4 dans [Google Analytics](https://analytics.google.com/)
- [ ] Copier le Measurement ID (`G-XXXXXXXXXX`)

---

## 3. Vérification du Code

### Tests
```bash
# Lancer tous les tests
npm run test

# Vérifier la couverture
npm run test:coverage
```
- [ ] Tous les tests passent
- [ ] Couverture acceptable (> 70%)

### Build
```bash
# Build de production
npm run build
```
- [ ] Build réussit sans erreurs
- [ ] Aucune erreur TypeScript

### Linting
```bash
# Vérifier le linting
npm run lint
```
- [ ] Aucune erreur ESLint
- [ ] Warnings accessibilité acceptables

### Sécurité
```bash
# Audit des dépendances
npm audit
```
- [ ] Aucune vulnérabilité critique
- [ ] Vulnérabilités hautes corrigées ou acceptées

### Git
- [ ] `.env.local` est dans `.gitignore`
- [ ] Aucun secret dans le code source
- [ ] Toutes les modifications committées
- [ ] Branche `main` à jour

---

## 4. Base de Données

### Migrations
```bash
# Appliquer les migrations en production
npx prisma db push
```
- [ ] Schéma synchronisé avec la base de production

### Données
- [ ] Backup des données existantes (si migration)
- [ ] Données de seed appliquées si nécessaire :
```bash
npx prisma db seed
```

### Vérification
```bash
# Ouvrir Prisma Studio pour vérifier
npx prisma studio
```
- [ ] Tables créées correctement
- [ ] Relations intactes
- [ ] Données de test supprimées

---

## 5. Tests Manuels (sur localhost)

### Parcours Client
- [ ] Page d'accueil charge correctement
- [ ] Navigation fonctionne
- [ ] Catalogue produits s'affiche
- [ ] Filtres fonctionnent
- [ ] Recherche fonctionne
- [ ] Fiche produit complète
- [ ] Ajout au panier
- [ ] Quick View fonctionne
- [ ] Comparateur fonctionne

### Authentification
- [ ] Inscription par email
- [ ] Connexion par email
- [ ] Connexion Google OAuth
- [ ] Déconnexion
- [ ] Mot de passe oublié

### Checkout
- [ ] Panier fonctionne
- [ ] Code promo fonctionne
- [ ] Redirection vers Stripe
- [ ] Paiement test réussit (carte 4242...)
- [ ] Page de confirmation affichée
- [ ] Commande créée en base

### Compte Utilisateur
- [ ] Page profil accessible
- [ ] Historique des commandes
- [ ] Wishlist fonctionne
- [ ] Partage wishlist fonctionne

### Admin
- [ ] Dashboard accessible (rôle ADMIN requis)
- [ ] Statistiques affichées
- [ ] Gestion produits
- [ ] Gestion commandes
- [ ] Gestion clients

### Fonctionnalités UX
- [ ] Animations fluides
- [ ] Chatbot fonctionne
- [ ] Skeletons de chargement
- [ ] Toast notifications
- [ ] États vides stylisés

### Accessibilité
- [ ] Navigation clavier (Tab)
- [ ] Skip link visible au focus
- [ ] Contrastes suffisants
- [ ] Lecteur d'écran (test basique)

### Responsive
- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## 6. Documentation

- [ ] `README.md` - À jour et complet
- [ ] `CONTRIBUTING.md` - Guidelines de contribution
- [ ] `CHANGELOG.md` - Version actuelle documentée
- [ ] `SECURITY.md` - Politique de sécurité
- [ ] `TROUBLESHOOTING.md` - Problèmes courants
- [ ] `docs/API.md` - Documentation API
- [ ] `docs/ACCESSIBILITY.md` - Guide accessibilité
- [ ] `docs/LIGHTHOUSE.md` - Guide performance
- [ ] `docs/I18N.md` - Guide internationalisation

---

## 7. Déploiement Vercel

### Configuration Vercel
1. Connecter le repo GitHub
2. Configurer le projet :
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Variables d'environnement Vercel
Ajouter TOUTES les variables dans Project Settings > Environment Variables :

```
DATABASE_URL=...
NEXTAUTH_URL=https://lafineparfumerie.fr
AUTH_URL=https://lafineparfumerie.fr
NEXTAUTH_SECRET=...
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=...
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_BASE_URL=https://lafineparfumerie.fr
```

### Domaine
- [ ] Domaine configuré dans Vercel
- [ ] SSL automatique activé
- [ ] DNS configuré (A record ou CNAME)

---

## 8. Post-Déploiement

### Vérifications immédiates
- [ ] Site accessible sur le domaine
- [ ] SSL fonctionne (cadenas vert)
- [ ] Page d'accueil charge
- [ ] Connexion Google fonctionne
- [ ] Paiement Stripe fonctionne (test réel)

### Monitoring
- [ ] Sentry reçoit les erreurs
- [ ] Google Analytics tracking
- [ ] Vérifier les logs Vercel

### SEO
- [ ] Soumettre sitemap à Google Search Console
- [ ] Vérifier robots.txt accessible
- [ ] Vérifier meta tags (Open Graph)

---

## Commandes Utiles

```bash
# Build local
npm run build

# Tester le build
npm run start

# Vérifier les types
npx tsc --noEmit

# Lighthouse audit
npm run lighthouse

# Prisma sync
npx prisma db push

# Prisma generate
npx prisma generate

# Voir les logs Vercel
vercel logs
```

---

## Contacts d'urgence

| Service | Contact |
|---------|---------|
| Stripe | support@stripe.com |
| Neon | support@neon.tech |
| Vercel | support@vercel.com |
| Resend | support@resend.com |

---

## Rollback

En cas de problème :

1. **Vercel** : Redéployer une version précédente depuis le dashboard
2. **Base de données** : Restaurer depuis le backup Neon
3. **Stripe** : Désactiver temporairement les webhooks

---

**Prêt pour le déploiement quand toutes les cases sont cochées !**

Date de vérification : _______________
Vérifié par : _______________
