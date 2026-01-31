# ✅ BRIQUE 7 — ORDERS + STRIPE WEBHOOK (NIVEAU PRO)

## 🎯 Objectif
Implémenter un système de gestion des commandes avec webhooks Stripe pour suivre le statut des paiements de manière professionnelle.

## 📦 Fonctionnalités implémentées

### 1. Système de gestion des commandes
- ✅ Création automatique d'une commande au statut "pending" lors du checkout
- ✅ Mise à jour du statut via webhook Stripe (pending → paid)
- ✅ Génération d'ID de commande unique (format: ORDER-timestamp-random)
- ✅ Stockage temporaire en mémoire (prêt pour migration DB)

### 2. Webhooks Stripe
- ✅ Endpoint sécurisé avec vérification de signature
- ✅ Gestion de `checkout.session.completed` (statut → paid)
- ✅ Gestion de `checkout.session.expired` (statut → cancelled)
- ✅ Gestion de `payment_intent.payment_failed` (statut → failed)
- ✅ Logging complet pour le debugging

### 3. Page de confirmation enrichie
- ✅ Affichage du numéro de commande
- ✅ Badge de statut (Payé/En attente) avec couleur
- ✅ Montant total
- ✅ Date de création et date de paiement
- ✅ Récupération des infos via API
- ✅ Pas de boucle React infinie

## 📁 Fichiers créés

### `types/index.ts`
Types TypeScript pour les commandes :
```typescript
export type OrderStatus = "pending" | "paid" | "cancelled" | "failed";

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  stripeSessionId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  customerEmail?: string;
}
```

### `lib/orders.ts`
Service de gestion des commandes avec store in-memory :
- `generateOrderId()` : Génère un ID unique
- `createOrder()` : Crée une commande "pending"
- `getOrderBySessionId()` : Récupère par session Stripe
- `getOrderById()` : Récupère par ID de commande
- `updateOrderStatus()` : Met à jour le statut + logs
- `getAllOrders()` : Debug (liste toutes les commandes)
- `resetOrdersStore()` : Helper pour les tests

### `app/api/webhook/route.ts`
Endpoint webhook Stripe avec :
- Vérification de signature cryptographique
- Gestion des événements checkout
- Mise à jour automatique du statut des commandes
- Logging détaillé

### `app/api/orders/[sessionId]/route.ts`
API pour récupérer une commande par session ID :
- GET `/api/orders/[sessionId]`
- Retourne les détails de la commande
- Gestion des erreurs 404/500

### `WEBHOOK_SETUP.md`
Documentation complète :
- Installation de Stripe CLI
- Configuration step-by-step
- Instructions de test
- Debugging des erreurs courantes
- Notes de sécurité pour la production

## 📝 Fichiers modifiés

### `.env.example`
Ajout de la variable `STRIPE_WEBHOOK_SECRET` :
```env
# Clé de signature pour les webhooks Stripe (commence par whsec_)
# Obtenue via Stripe CLI : stripe listen --forward-to localhost:3001/api/webhook
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
```

### `app/api/checkout/route.ts`
Création d'une commande "pending" avant redirection Stripe :
```typescript
// Calcul du montant total côté serveur
const totalAmount = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity, 0
);

// Création de la session Stripe
const session = await stripe.checkout.sessions.create({...});

// Création de la commande pending
const orderItems = cartItems.map((item) => ({
  productId: item.id,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
}));
const order = createOrder(session.id, orderItems, totalAmount);

// Retour URL + orderId
return NextResponse.json({
  url: session.url,
  orderId: order.id,
});
```

### `app/success/page.tsx`
Affichage enrichi des informations de commande :
- Récupération des données via fetch `/api/orders/[sessionId]`
- Badge de statut avec couleur (vert pour "paid")
- Affichage du numéro de commande, montant, dates
- Gestion du loading state
- useEffect optimisé (pas de boucle infinie)

## 🧪 Instructions de test

### Test complet du flux

1. **Démarrer le serveur**
   ```bash
   npm run dev
   ```

2. **Configurer Stripe CLI** (dans un autre terminal)
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook
   ```

3. **Copier le webhook secret** dans `.env.local`
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

4. **Redémarrer le serveur Next.js** (important !)

5. **Passer une commande**
   - Aller sur `http://localhost:3001`
   - Ajouter des produits au panier
   - Cliquer sur "Passer la commande"

6. **Payer avec une carte de test**
   - Numéro : `4242 4242 4242 4242`
   - Expiration : `12/34`
   - CVC : `123`

7. **Vérifier les logs**
   - Terminal Stripe CLI : `[200] POST checkout.session.completed`
   - Terminal Next.js : `✅ Commande ORDER-xxx mise à jour: paid`

8. **Vérifier la page /success**
   - Numéro de commande affiché
   - Badge "Payé" (vert)
   - Montant correct
   - Date de paiement affichée

### Vérification du flow de données

```bash
# Optionnel : créer un endpoint debug pour voir toutes les commandes
# Ajouter dans app/api/orders/debug/route.ts :
import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/orders";

export async function GET() {
  const orders = getAllOrders();
  return NextResponse.json({ orders });
}
```

Puis accéder à : `http://localhost:3001/api/orders/debug`

## 🔄 Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│  1. Utilisateur clique "Passer la commande"                 │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  2. POST /api/checkout                                       │
│     - Crée session Stripe                                    │
│     - Crée commande status="pending" dans ordersStore       │
│     - Retourne {url, orderId}                               │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Redirection vers Stripe Checkout                         │
│     - Utilisateur remplit les infos de paiement             │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Paiement validé par Stripe                              │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Stripe envoie webhook → POST /api/webhook               │
│     - Vérifie signature cryptographique                     │
│     - updateOrderStatus(sessionId, "paid")                  │
│     - Enregistre paidAt = now                               │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Redirection vers /success?session_id=cs_test_xxx        │
│     - Vide le panier (sessionStorage)                       │
│     - Fetch GET /api/orders/[sessionId]                     │
│     - Affiche détails commande                              │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ Points importants

### Store in-memory (temporaire)
- Les commandes sont stockées dans un tableau en mémoire
- **Redémarrer le serveur = perte des données**
- ✅ Architecture prête pour migration vers DB (PostgreSQL, MongoDB, etc.)

### Sécurité
- ✅ Signature webhook vérifiée (protection contre les fausses requêtes)
- ✅ Calcul du montant côté serveur (pas de manipulation client)
- ✅ Variables sensibles dans `.env.local` (pas commitées)

### Performance
- ✅ useEffect optimisé sur /success (pas de boucle infinie)
- ✅ sessionStorage utilisé pour éviter double clear du panier
- ✅ Suspense boundary pour useSearchParams

## 🚀 Production Ready

Pour déployer en production :

1. **Remplacer le store in-memory**
   ```typescript
   // Exemple avec Prisma + PostgreSQL
   const order = await prisma.order.create({
     data: {
       id: generateOrderId(),
       stripeSessionId,
       totalAmount,
       status: "pending",
       items: {
         create: orderItems,
       },
     },
   });
   ```

2. **Configurer le webhook dans Stripe Dashboard**
   - Aller sur https://dashboard.stripe.com/webhooks
   - Ajouter endpoint : `https://votre-domaine.com/api/webhook`
   - Sélectionner événements : `checkout.session.completed`, `checkout.session.expired`
   - Copier le webhook secret dans vos variables d'env de production

3. **Variables d'environnement production**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx (depuis Dashboard)
   NEXT_PUBLIC_BASE_URL=https://votre-domaine.com
   ```

## 📊 Résumé des statuts

| Statut      | Quand ?                              | Couleur  |
|-------------|--------------------------------------|----------|
| `pending`   | Création au checkout                 | Jaune    |
| `paid`      | Webhook `checkout.session.completed` | Vert     |
| `cancelled` | Webhook `checkout.session.expired`   | Gris     |
| `failed`    | Webhook `payment_intent.failed`      | Rouge    |

## ✨ Améliorations futures possibles

- [ ] Ajouter un système d'authentification (NextAuth.js)
- [ ] Créer une page "Mes commandes" pour les utilisateurs
- [ ] Envoyer des emails de confirmation (Resend, SendGrid)
- [ ] Ajouter un tableau de bord admin pour voir toutes les commandes
- [ ] Implémenter une vraie base de données
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Gérer les remboursements via webhook `charge.refunded`

---

## 🎉 BRIQUE 7 TERMINÉE !

Le système de commandes et webhooks Stripe est entièrement fonctionnel.

**Prêt pour les tests !**

Consultez [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) pour les instructions détaillées de configuration.
