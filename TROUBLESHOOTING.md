# Troubleshooting Guide

Guide de résolution des problèmes courants pour La Fine Parfumerie.

## Table des matières

- [Installation](#installation)
- [Base de données](#base-de-données)
- [Authentification](#authentification)
- [Paiement Stripe](#paiement-stripe)
- [Build et Déploiement](#build-et-déploiement)
- [Performance](#performance)
- [Erreurs courantes](#erreurs-courantes)

---

## Installation

### `npm install` échoue

**Symptôme** : Erreurs lors de l'installation des dépendances.

**Solutions** :

1. Vérifier la version de Node.js :
```bash
node --version
# Doit être >= 18.x
```

2. Nettoyer le cache npm :
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

3. Utiliser npm au lieu de yarn/pnpm (recommandé pour ce projet)

### Erreur "Cannot find module"

**Symptôme** : `Error: Cannot find module '@/lib/xxx'`

**Solutions** :

1. Vérifier que `tsconfig.json` contient les paths corrects :
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. Redémarrer le serveur de développement

---

## Base de données

### Erreur de connexion Prisma

**Symptôme** : `Error: Can't reach database server`

**Solutions** :

1. Vérifier `DATABASE_URL` dans `.env.local` :
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

2. Pour Neon.tech, s'assurer que l'IP est autorisée (ou utiliser le pooler)

3. Tester la connexion :
```bash
npx prisma db pull
```

### "Table does not exist"

**Symptôme** : `The table 'public.Product' does not exist`

**Solution** :

```bash
# Pousser le schema
npx prisma db push

# Ou migrer
npx prisma migrate deploy
```

### Prisma Client outdated

**Symptôme** : `@prisma/client did not initialize yet`

**Solution** :

```bash
npx prisma generate
```

### Données de seed manquantes

**Symptôme** : Pas de produits/données après installation

**Solution** :

```bash
npx prisma db seed
```

---

## Authentification

### "NEXTAUTH_SECRET is not set"

**Symptôme** : Erreur au démarrage concernant le secret

**Solution** :

Ajouter dans `.env.local` :
```env
NEXTAUTH_SECRET="votre-secret-de-32-caracteres-minimum"
```

Générer un secret :
```bash
openssl rand -base64 32
```

### Google OAuth "redirect_uri_mismatch"

**Symptôme** : Erreur OAuth avec Google

**Solutions** :

1. Vérifier dans Google Cloud Console que les URIs autorisés incluent :
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://votre-site.com/api/auth/callback/google` (prod)

2. S'assurer que `NEXTAUTH_URL` correspond :
```env
NEXTAUTH_URL="http://localhost:3000"
```

### Session non persistante

**Symptôme** : L'utilisateur est déconnecté après refresh

**Solutions** :

1. Vérifier les cookies dans DevTools (Application > Cookies)
2. S'assurer que `NEXTAUTH_URL` est correct
3. Vérifier que les cookies ne sont pas bloqués

### "Error: No provider configured"

**Symptôme** : Pas de providers de connexion

**Solution** :

Vérifier `lib/auth.ts` contient les providers et les variables d'env :
```env
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"
```

---

## Paiement Stripe

### "Invalid API Key"

**Symptôme** : Erreur Stripe "Invalid API Key provided"

**Solutions** :

1. Vérifier les clés dans `.env.local` :
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
```

2. S'assurer d'utiliser les clés test en dev, live en prod

### Webhook non reçu

**Symptôme** : Les webhooks Stripe n'arrivent pas

**Solutions** :

1. **En développement**, utiliser Stripe CLI :
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

2. Copier le webhook secret :
```env
STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

3. **En production**, vérifier l'URL du webhook dans Stripe Dashboard

### "Webhook signature verification failed"

**Symptôme** : Erreur de signature du webhook

**Solutions** :

1. Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
2. S'assurer que le body de la requête n'est pas modifié
3. Vérifier que `raw` body est utilisé (pas JSON parsé)

### Paiement échoué

**Symptôme** : Le paiement est refusé

**Solutions** :

1. Utiliser les cartes de test Stripe :
   - Succès : `4242 4242 4242 4242`
   - Refusé : `4000 0000 0000 0002`

2. Vérifier les logs dans Stripe Dashboard > Developers > Logs

---

## Build et Déploiement

### Build échoue avec "Type error"

**Symptôme** : `npm run build` échoue avec erreurs TypeScript

**Solutions** :

1. Vérifier les types :
```bash
npm run type-check
```

2. Corriger les erreurs indiquées

3. Si les erreurs viennent des dépendances, essayer :
```bash
npm update
```

### "Module not found" en production

**Symptôme** : Erreurs de module après déploiement

**Solutions** :

1. S'assurer que toutes les deps sont en `dependencies` (pas `devDependencies`)

2. Vérifier que le build local fonctionne :
```bash
npm run build
npm run start
```

### Images non affichées en production

**Symptôme** : Images 404 ou non chargées

**Solutions** :

1. Vérifier `next.config.js` pour les domaines autorisés :
```js
images: {
  remotePatterns: [
    { hostname: 'images.unsplash.com' },
    { hostname: 'votre-cdn.com' },
  ],
}
```

2. S'assurer que les images sont dans `public/`

### Vercel deployment failed

**Symptôme** : Déploiement échoue sur Vercel

**Solutions** :

1. Vérifier les logs de build dans Vercel Dashboard

2. S'assurer que toutes les variables d'environnement sont configurées

3. Vérifier que `DATABASE_URL` est accessible depuis Vercel (pas localhost)

---

## Performance

### Page lente au chargement

**Symptôme** : Temps de chargement > 3s

**Solutions** :

1. Vérifier les Core Web Vitals :
```bash
npm run lighthouse
```

2. Optimiser les images avec `next/image`

3. Utiliser le lazy loading :
```tsx
const Component = dynamic(() => import('./Component'), { ssr: false });
```

4. Vérifier le bundle size :
```bash
npm run analyze
```

### "Memory limit exceeded"

**Symptôme** : Erreur de mémoire pendant le build

**Solutions** :

1. Augmenter la mémoire Node :
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

2. Sur Vercel, utiliser une fonction plus grande ou l'edge runtime

### Trop de requêtes API

**Symptôme** : Rate limiting ou latence API

**Solutions** :

1. Implémenter le caching :
```tsx
// Dans les API routes
export const revalidate = 3600; // 1 heure
```

2. Utiliser SWR ou React Query côté client

---

## Erreurs courantes

### "hydration mismatch"

**Symptôme** : Erreur React de désynchronisation SSR/client

**Solutions** :

1. S'assurer que les composants client sont marqués `'use client'`

2. Éviter d'utiliser `Date`, `Math.random()` sans `useEffect`

3. Utiliser `suppressHydrationWarning` si nécessaire :
```tsx
<time suppressHydrationWarning>{new Date().toLocaleDateString()}</time>
```

### "Cannot read property of undefined"

**Symptôme** : Erreur JS de propriété non définie

**Solutions** :

1. Utiliser l'optional chaining :
```typescript
const name = user?.profile?.name;
```

2. Vérifier le loading state :
```tsx
if (loading) return <Skeleton />;
if (!data) return <EmptyState />;
return <Content data={data} />;
```

### CORS errors

**Symptôme** : Erreurs CORS dans la console

**Solutions** :

1. Pour les API internes, pas besoin de CORS (même origine)

2. Pour les API externes, configurer les headers :
```typescript
// Dans next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://votre-site.com' },
      ],
    },
  ];
}
```

### "fs module not found"

**Symptôme** : Erreur d'import fs côté client

**Solution** :

Ne pas importer `fs`, `path`, etc. dans les composants client. Utiliser uniquement dans :
- API routes
- `getStaticProps` / `getServerSideProps`
- Server Components (sans `'use client'`)

---

## Debug Tips

### Activer les logs Prisma

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Logger les erreurs NextAuth

```typescript
// lib/auth.ts
export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ...
};
```

### Inspecter le bundle

```bash
ANALYZE=true npm run build
```

### Tester les API routes

```bash
# Avec curl
curl http://localhost:3000/api/health

# Avec httpie
http GET localhost:3000/api/products
```

---

## Besoin d'aide ?

1. Consulter la documentation :
   - [docs/API.md](docs/API.md)
   - [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)
   - [docs/LIGHTHOUSE.md](docs/LIGHTHOUSE.md)

2. Ouvrir une issue sur GitHub avec :
   - Description du problème
   - Étapes pour reproduire
   - Messages d'erreur complets
   - Environnement (OS, Node version, etc.)
