# Configuration des Webhooks Stripe - BRIQUE 7

Ce guide explique comment configurer et tester les webhooks Stripe en local avec Stripe CLI.

## 📋 Prérequis

- Node.js installé
- Compte Stripe (mode TEST)
- Stripe CLI installé

## 🔧 Installation de Stripe CLI

### Windows
```bash
# Télécharger depuis : https://github.com/stripe/stripe-cli/releases
# Ou via Scoop :
scoop install stripe
```

### macOS
```bash
brew install stripe/stripe-cli/stripe
```

### Linux
```bash
# Télécharger depuis : https://github.com/stripe/stripe-cli/releases
```

## 🚀 Configuration

### Étape 1 : Authentification Stripe CLI

```bash
stripe login
```

Cela ouvrira votre navigateur pour autoriser l'accès à votre compte Stripe.

### Étape 2 : Démarrer le serveur Next.js

Dans un terminal, lancez votre application :

```bash
npm run dev
```

L'application doit tourner sur `http://localhost:3001` (vérifiez votre `.env.local`).

### Étape 3 : Lancer le listener de webhooks

Dans un **nouveau terminal**, lancez :

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

Vous verrez un message similaire à :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Étape 4 : Copier le webhook secret

Copiez le `whsec_...` affiché et ajoutez-le à votre fichier `.env.local` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important :** Redémarrez votre serveur Next.js après avoir ajouté cette variable.

## ✅ Test du flux complet

### 1. Créer une commande

1. Allez sur `http://localhost:3001`
2. Ajoutez des produits au panier
3. Cliquez sur "Passer la commande"
4. Vous serez redirigé vers Stripe Checkout

### 2. Simuler un paiement réussi

Sur la page Stripe Checkout (mode TEST), utilisez :
- **Numéro de carte :** `4242 4242 4242 4242`
- **Date d'expiration :** N'importe quelle date future (ex: 12/34)
- **CVC :** N'importe quel 3 chiffres (ex: 123)
- **Email :** N'importe quel email valide

Cliquez sur "Payer".

### 3. Vérifier le webhook

Dans le terminal où Stripe CLI tourne, vous verrez :
```
[200] POST http://localhost:3001/api/webhook [evt_xxxxx]
  checkout.session.completed
```

Dans les logs de votre serveur Next.js, vous verrez :
```
✅ Webhook reçu: checkout.session.completed
✅ Commande ORDER-xxxxx mise à jour: paid
```

### 4. Vérifier la page de confirmation

Vous serez redirigé vers `/success?session_id=cs_test_xxx` qui affichera :
- ✅ Le numéro de commande (ORDER-xxxxx)
- ✅ Le statut "Payé" (badge vert)
- ✅ Le montant total
- ✅ La date de création
- ✅ La date de paiement

## 🧪 Test des autres événements

### Tester une session expirée

```bash
stripe trigger checkout.session.expired
```

### Tester un échec de paiement

Sur Stripe Checkout, utilisez la carte de test :
- **Numéro de carte :** `4000 0000 0000 0002` (carte déclinée)

## 🔍 Debugging

### Voir tous les webhooks reçus

Dans le terminal Stripe CLI, tous les événements sont affichés en temps réel.

### Logs serveur

Vérifiez les logs de votre serveur Next.js pour voir :
- Les commandes créées au checkout
- Les webhooks reçus
- Les mises à jour de statut

### Vérifier l'état des commandes

Vous pouvez ajouter temporairement cet endpoint pour debug :

```typescript
// app/api/orders/debug/route.ts
import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/orders";

export async function GET() {
  const orders = getAllOrders();
  return NextResponse.json({ orders });
}
```

Puis accédez à `http://localhost:3001/api/orders/debug`

## 📦 Flux de données complet

```
1. Utilisateur clique sur "Passer la commande"
   ↓
2. POST /api/checkout
   - Crée une session Stripe
   - Crée une commande avec status="pending"
   - Retourne l'URL Stripe + l'orderId
   ↓
3. Utilisateur remplit le formulaire Stripe
   ↓
4. Paiement validé par Stripe
   ↓
5. Stripe envoie webhook → POST /api/webhook
   - Vérifie la signature
   - Met à jour la commande: status="paid", paidAt=now
   ↓
6. Redirection vers /success?session_id=xxx
   ↓
7. GET /api/orders/[sessionId]
   - Récupère les infos de la commande
   - Affiche le statut, numéro, montant, etc.
```

## 🚨 Erreurs courantes

### `Error: No signatures found matching the expected signature`
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correctement défini dans `.env.local`
- Redémarrez le serveur Next.js après modification du `.env.local`

### `Commande introuvable` sur /success
- Vérifiez que le webhook a bien été reçu (logs Stripe CLI)
- Vérifiez que la commande a été créée au checkout (logs serveur)

### Le webhook ne se déclenche pas
- Vérifiez que Stripe CLI est bien en train d'écouter
- Vérifiez que le forward-to pointe sur le bon port (3001)

## 🔐 Sécurité

⚠️ **Important pour la production :**

1. En production, n'utilisez PAS Stripe CLI
2. Configurez un webhook endpoint dans le Dashboard Stripe :
   - URL : `https://votre-domaine.com/api/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.expired`
3. Récupérez le `webhook secret` depuis le Dashboard Stripe
4. Ajoutez-le à vos variables d'environnement de production

## 📝 Notes

- Les commandes sont stockées en mémoire (redémarrer le serveur = perte des données)
- Pour la production, remplacer par une vraie base de données (PostgreSQL, MongoDB, etc.)
- Le panier est vidé automatiquement après un paiement réussi (via sessionStorage)

## 🎯 Prochaines étapes (après BRIQUE 7)

- [ ] Remplacer le store in-memory par une vraie DB
- [ ] Ajouter un système d'authentification utilisateur
- [ ] Créer une page "Mes commandes"
- [ ] Envoyer des emails de confirmation
- [ ] Ajouter un tableau de bord admin
