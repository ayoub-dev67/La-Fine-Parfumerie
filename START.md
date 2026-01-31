# GUIDE DE DÉMARRAGE - La Fine Parfumerie

## Commandes de Nettoyage et Relance

### Windows (PowerShell)

```powershell
# 1. Arrêter le serveur en cours (Ctrl+C dans le terminal)

# 2. Supprimer le cache Next.js
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Supprimer le cache node_modules (optionnel, si problèmes persistants)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 4. Réinstaller les dépendances (si étape 3 effectuée)
npm install

# 5. Générer le client Prisma
npx prisma generate

# 6. Appliquer les migrations (si base de données vide)
npx prisma db push

# 7. Seeder la base de données (optionnel)
npx prisma db seed

# 8. Lancer le serveur de développement
npm run dev
```

### Commande Rapide (One-liner)

```powershell
# Nettoyage rapide et relance
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue; npx prisma generate; npm run dev
```

---

## Vérification Post-Démarrage

### 1. Accéder au site
Ouvrir : http://localhost:3001

### 2. Tester la navigation
- [ ] Cliquer sur "Collection" dans la navbar
- [ ] Cliquer sur un produit
- [ ] Ajouter au panier
- [ ] Aller au checkout

### 3. Tester le paiement (mode test)
- Utiliser la carte : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : `123`
- Après paiement : vérifier que la page `/success` s'affiche correctement

### 4. Tester les liens sur /success
- [ ] "Continuer mes achats" → doit aller vers `/products`
- [ ] "Voir mes commandes" → doit aller vers `/orders`
- [ ] "Retour à l'accueil" → doit aller vers `/`

---

## Variables d'Environnement Requises

Vérifier que `.env.local` contient :

```env
# Base de données
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# URL de base
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

---

## Ports et URLs

| Service | URL | Port |
|---------|-----|------|
| Next.js | http://localhost:3001 | 3001 |
| Stripe CLI (webhook) | localhost:3001/api/webhook | 3001 |

---

## Résolution de Problèmes Courants

### "Module not found"
```powershell
npm install
```

### "Prisma client not generated"
```powershell
npx prisma generate
```

### "Database does not exist"
```powershell
npx prisma db push
```

### "Port 3001 already in use"
```powershell
# Trouver le processus
netstat -ano | findstr :3001

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

### "Erreur après paiement"
1. Vérifier que Stripe CLI est lancé : `stripe listen --forward-to localhost:3001/api/webhook`
2. Vérifier la variable `STRIPE_WEBHOOK_SECRET`

---

## Structure du Projet

```
perfume-shop/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Accueil
│   ├── products/          # Catalogue
│   ├── checkout/          # Checkout
│   ├── success/           # Confirmation paiement
│   ├── auth/              # Authentification
│   └── admin/             # Administration
├── components/            # Composants React
├── lib/                   # Utilitaires (auth, prisma, etc.)
├── prisma/               # Schéma et migrations
└── public/               # Assets statiques
```

---

## Commandes Utiles

```powershell
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Vérifier les types
npx tsc --noEmit

# Ouvrir Prisma Studio
npx prisma studio

# Lancer Stripe CLI
stripe listen --forward-to localhost:3001/api/webhook
```
