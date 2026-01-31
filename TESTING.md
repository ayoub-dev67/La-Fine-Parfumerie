# Guide de Tests - La Fine Parfumerie

Ce document décrit la stratégie de tests automatisés et manuels pour le projet.

## Table des Matières

1. [Tests Automatisés](#tests-automatisés)
2. [Tests Unitaires (Jest)](#tests-unitaires-jest)
3. [Tests E2E (Playwright)](#tests-e2e-playwright)
4. [Couverture de Code](#couverture-de-code)
5. [Tests Manuels d'Authentification](#tests-manuels-dauthentification)

---

## Tests Automatisés

### Stack de Tests

| Type | Outil | Objectif |
|------|-------|----------|
| Unitaires | Jest + Testing Library | Composants et fonctions |
| Intégration | Jest | API Routes |
| E2E | Playwright | Parcours utilisateur |

### Structure des Tests

```
perfume-shop/
├── __tests__/
│   ├── components/        # Tests de composants React
│   │   ├── Cart.test.tsx
│   │   ├── Navbar.test.tsx
│   │   └── ProductCard.test.tsx
│   ├── api/               # Tests des API Routes
│   │   ├── checkout.test.ts
│   │   ├── webhook.test.ts
│   │   └── promo-validate.test.ts
│   └── lib/               # Tests des utilitaires
│       └── rate-limit.test.ts
├── e2e/                   # Tests E2E Playwright
│   ├── checkout.spec.ts
│   └── auth.spec.ts
├── jest.config.js
├── jest.setup.js
└── playwright.config.ts
```

---

## Tests Unitaires (Jest)

### Exécuter les tests

```bash
# Tous les tests
npm run test

# Mode watch (développement)
npm run test:watch

# Avec couverture
npm run test:coverage

# Un fichier spécifique
npm run test -- Cart.test.tsx
```

### Tests de composants

- **Cart.test.tsx** : Panier (ajout, suppression, calcul total)
- **Navbar.test.tsx** : Navigation, dropdown, auth
- **ProductCard.test.tsx** : Affichage produit, badges, stock

### Tests d'API

- **checkout.test.ts** : Création session Stripe, validation, rate limiting
- **webhook.test.ts** : Webhooks Stripe, signature, gestion erreurs
- **promo-validate.test.ts** : Validation codes promo

### Tests utilitaires

- **rate-limit.test.ts** : Rate limiting, LRU cache

---

## Tests E2E (Playwright)

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Exécuter les tests E2E

```bash
# Tous les tests
npx playwright test

# Mode UI (interactif)
npx playwright test --ui

# Un navigateur spécifique
npx playwright test --project=chromium

# Voir le rapport
npx playwright show-report
```

### Tests disponibles

- **checkout.spec.ts** : Parcours d'achat complet
- **auth.spec.ts** : Authentification et protection des routes

---

## Couverture de Code

```bash
npm run test:coverage
```

### Objectifs

| Métrique | Objectif |
|----------|----------|
| Statements | 60% |
| Branches | 60% |
| Functions | 60% |
| Lines | 60% |

---

# Tests Manuels d'Authentification

## Prérequis

Avant de commencer les tests, assurez-vous que :

1. **Docker est lancé** avec PostgreSQL :
   ```powershell
   docker-compose up -d
   ```

2. **Les dépendances sont installées** :
   ```powershell
   npm install
   ```

3. **Prisma est synchronisé** :
   ```powershell
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Le serveur de développement est lancé** :
   ```powershell
   npm run dev
   ```

---

## 1. Test Google OAuth

### URL de test
```
http://localhost:3000/auth/signin
```

### Étapes
1. Ouvrir http://localhost:3000/auth/signin
2. Cliquer sur **"Continuer avec Google"**
3. Sélectionner votre compte Google
4. Vérifier la redirection vers la page d'accueil
5. Vérifier l'avatar/initiale dans la Navbar
6. Cliquer sur l'avatar pour voir le menu dropdown

### Vérifications
- [ ] Bouton Google visible et cliquable
- [ ] Redirection vers Google OAuth
- [ ] Retour sur le site après authentification
- [ ] Avatar affiché dans la Navbar
- [ ] Menu dropdown avec nom et email
- [ ] Déconnexion fonctionnelle

### Debug
Si erreur "redirect_uri_mismatch" :
1. Aller sur https://console.cloud.google.com
2. APIs & Services → Credentials
3. Cliquer sur votre OAuth Client ID
4. Ajouter cette URI dans "Authorized redirect URIs" :
   ```
   http://localhost:3000/api/auth/callback/google
   ```

---

## 2. Test Inscription Email/Password

### URL de test
```
http://localhost:3000/auth/signup
```

### Étapes
1. Ouvrir http://localhost:3000/auth/signup
2. Remplir le formulaire :
   - Nom : `Test User`
   - Email : `test@example.com`
   - Mot de passe : `TestPassword123`
   - Confirmer : `TestPassword123`
3. Cliquer sur **"Créer mon compte"**
4. Vérifier la connexion automatique

### Vérifications
- [ ] Validation en temps réel des champs
- [ ] Message d'erreur si mot de passe trop faible
- [ ] Message d'erreur si emails ne correspondent pas
- [ ] Création du compte réussie
- [ ] Connexion automatique après inscription
- [ ] Redirection vers l'accueil

### Validation du mot de passe
Le mot de passe doit contenir :
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre

---

## 3. Test Connexion Email/Password

### URL de test
```
http://localhost:3000/auth/signin
```

### Étapes
1. Ouvrir http://localhost:3000/auth/signin
2. Remplir avec les credentials créés :
   - Email : `test@example.com`
   - Mot de passe : `TestPassword123`
3. Cliquer sur **"Se connecter"**

### Vérifications
- [ ] Champs email/password visibles
- [ ] Lien "Mot de passe oublié" présent
- [ ] Connexion réussie
- [ ] Message d'erreur si credentials incorrects

---

## 4. Test Mot de Passe Oublié

### URL de test
```
http://localhost:3000/auth/forgot-password
```

### Étapes
1. Ouvrir http://localhost:3000/auth/forgot-password
2. Entrer un email existant : `test@example.com`
3. Cliquer sur **"Envoyer le lien"**
4. Vérifier le message de confirmation
5. **En développement** : Regarder la console du serveur pour le lien de reset

### Vérifications
- [ ] Formulaire email visible
- [ ] Message de succès affiché
- [ ] Lien de reset dans la console (dev mode)

### Note développement
En mode dev, le lien de reset s'affiche dans la console :
```
🔐 Lien de réinitialisation pour test@example.com:
   http://localhost:3000/auth/reset-password/abc123...
```

---

## 5. Test Protection des Routes

### Routes protégées (nécessitent connexion)

| Route | Comportement attendu |
|-------|---------------------|
| `/checkout` | Redirection vers `/auth/signin` |
| `/orders` | Redirection vers `/auth/signin` |
| `/account` | Redirection vers `/auth/signin` |

### Test
1. **Se déconnecter** (ou ouvrir une fenêtre incognito)
2. Tenter d'accéder à http://localhost:3000/checkout
3. Vérifier la redirection vers la page de connexion
4. Se connecter
5. Vérifier le retour automatique vers `/checkout`

### Vérifications
- [ ] Redirection vers signin si non connecté
- [ ] Callback URL préservée
- [ ] Retour vers la page demandée après connexion

---

## 6. Test Flow Complet d'Achat

### Scénario
1. Ouvrir http://localhost:3000
2. Ajouter un produit au panier
3. Cliquer sur "Commander"
4. **Si non connecté** : Redirection vers connexion
5. Se connecter (Google ou Email)
6. Retour au checkout
7. Finaliser la commande

### Vérifications
- [ ] Panier conservé après connexion
- [ ] Email pré-rempli dans Stripe
- [ ] Commande créée avec userId

---

## 7. Test Navbar (Desktop & Mobile)

### Desktop
1. **Non connecté** : Bouton "Connexion" visible
2. **Connecté** : Avatar + chevron visible
3. Cliquer sur l'avatar → Menu dropdown
4. Vérifier les liens : "Mes commandes", "Mon compte"
5. Tester "Déconnexion"

### Mobile
1. Ouvrir en mode mobile (F12 → Device toolbar)
2. Cliquer sur le menu hamburger
3. Vérifier les liens d'authentification
4. Tester connexion/déconnexion

---

## 8. Commandes utiles

### Lancer le projet
```powershell
# Démarrer PostgreSQL
docker-compose up -d

# Lancer le serveur
npm run dev
```

### Réinitialiser la base de données
```powershell
npx prisma migrate reset
npx prisma db seed
```

### Voir les utilisateurs créés
```powershell
npx prisma studio
```
Puis ouvrir http://localhost:5555 et naviguer vers la table `users`

### Générer un nouveau NEXTAUTH_SECRET
```powershell
openssl rand -base64 32
```

---

## 9. URLs de Test Rapide

| Page | URL |
|------|-----|
| Accueil | http://localhost:3000 |
| Connexion | http://localhost:3000/auth/signin |
| Inscription | http://localhost:3000/auth/signup |
| Mot de passe oublié | http://localhost:3000/auth/forgot-password |
| Produits | http://localhost:3000/products |
| Checkout (protégé) | http://localhost:3000/checkout |
| Commandes (protégé) | http://localhost:3000/orders |

---

## 10. Résolution des problèmes courants

### Erreur "GOOGLE_CLIENT_ID is not defined"
Vérifier que `.env.local` contient :
```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### Erreur "redirect_uri_mismatch"
Ajouter cette URI dans Google Cloud Console :
```
http://localhost:3000/api/auth/callback/google
```

### Erreur Prisma "EPERM"
Fermer VS Code, puis exécuter :
```powershell
npx prisma generate
```

### Session non persistée
Vérifier que `NEXTAUTH_SECRET` est défini dans `.env.local`

### Erreur 401 sur /api/checkout
L'utilisateur doit être connecté pour passer commande.
