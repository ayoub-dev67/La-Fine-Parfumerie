# Fonctionnalités Avancées - La Fine Parfumerie

Documentation des fonctionnalités premium de l'application.

## Table des matières

1. [Programme de Fidélité](#programme-de-fidélité)
2. [Notifications Push PWA](#notifications-push-pwa)
3. [Recherche Avancée](#recherche-avancée)
4. [Système de Parrainage](#système-de-parrainage)
5. [Recommandations Produits](#recommandations-produits)

---

## Programme de Fidélité

### Configuration

Les points sont gagnés automatiquement sur chaque achat.

### Règles de Points

| Action | Points |
|--------|--------|
| Achat | 1€ = 10 points |
| Parrainage | +500 points |
| Avis produit | +50 points |
| Anniversaire | +200 points |

### Utilisation des Points

- **100 points = 1€** de réduction
- Minimum : 1000 points (10€)
- Multiples de 100 uniquement

### Tiers et Avantages

| Tier | Points requis | Réduction permanente |
|------|---------------|---------------------|
| 🥉 Bronze | 0 | 0% |
| 🥈 Argent | 5 000 | 5% |
| 🥇 Or | 15 000 | 10% |
| 💎 Platine | 50 000 | 15% |

### API Endpoints

```http
# Obtenir le solde
GET /api/loyalty/balance
Authorization: Bearer {token}

# Utiliser des points
POST /api/loyalty/redeem
Content-Type: application/json
{
  "points": 1000
}
```

### Fichiers

- `lib/loyalty.ts` - Logique métier
- `app/api/loyalty/balance/route.ts` - API solde
- `app/api/loyalty/redeem/route.ts` - API utilisation
- `components/LoyaltyCard.tsx` - Composant UI
- `app/account/loyalty/page.tsx` - Page compte

---

## Notifications Push PWA

### Configuration

Générer les clés VAPID :

```bash
npx web-push generate-vapid-keys
```

Variables d'environnement :

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BXXx...
VAPID_PRIVATE_KEY=xxx...
```

### Événements Notifiés

| Événement | Notification |
|-----------|-------------|
| Commande expédiée | 📦 Votre commande est en route |
| Commande livrée | ✅ Commande livrée, laissez un avis ! |
| Retour en stock | 🎉 {Produit} est disponible |
| Promotion | 💝 Offre exclusive ! |
| Nouveau tier | 🎊 Vous êtes maintenant {Tier} |

### Utilisation

```typescript
import { sendPushNotification, NOTIFICATION_TEMPLATES } from '@/lib/push-notifications';

// Notification personnalisée
await sendPushNotification(userId, {
  title: 'Titre',
  body: 'Message',
  url: '/destination',
});

// Template prédéfini
const notification = NOTIFICATION_TEMPLATES.ORDER_SHIPPED(orderId, trackingNumber);
await sendPushNotification(userId, notification);

// Broadcast à tous
await sendBroadcastNotification({
  title: 'Ventes Flash !',
  body: 'Jusqu\'à -50% pendant 24h',
  url: '/promos',
});
```

### API Endpoints

```http
# S'abonner aux notifications
POST /api/push/subscribe
Content-Type: application/json
{subscription}

# Vérifier l'abonnement
GET /api/push/subscribe

# Se désabonner
DELETE /api/push/subscribe
```

### Fichiers

- `lib/push-notifications.ts` - Logique et templates
- `app/api/push/subscribe/route.ts` - API subscription
- `components/PushNotificationPrompt.tsx` - Prompt UI
- `public/sw.js` - Service Worker (handlers push)

---

## Recherche Avancée

### Filtres Disponibles

| Paramètre | Type | Description |
|-----------|------|-------------|
| `q` | string | Texte de recherche |
| `category` | string | Catégorie produit |
| `brand` | string | Marque |
| `minPrice` | number | Prix minimum |
| `maxPrice` | number | Prix maximum |
| `inStock` | boolean | En stock uniquement |
| `sortBy` | string | Ordre de tri |

### Options de Tri

- `relevance` - Pertinence (défaut)
- `price_asc` - Prix croissant
- `price_desc` - Prix décroissant
- `newest` - Nouveautés
- `bestseller` - Meilleures ventes
- `name_asc` - Nom A-Z
- `name_desc` - Nom Z-A

### API Endpoint

```http
GET /api/search?q=aventus&category=Homme&minPrice=50&maxPrice=300&inStock=true&sortBy=price_asc
```

### Exemple de Réponse

```json
{
  "suggestions": ["Creed", "Homme"],
  "products": [
    {
      "id": 1,
      "name": "Aventus",
      "brand": "Creed",
      "price": 295,
      "category": "Homme",
      "stock": 5,
      "isBestSeller": true
    }
  ],
  "total": 1
}
```

### Fichiers

- `app/api/search/route.ts` - API recherche
- `components/AdvancedSearch.tsx` - Composant filtres

---

## Système de Parrainage

### Fonctionnement

1. **Parrain** partage son code unique
2. **Filleul** s'inscrit avec le code → reçoit 10€
3. **Filleul** passe sa première commande (min. 50€)
4. **Parrain** reçoit 10€ + 500 points fidélité

### Configuration

```typescript
// lib/referral.ts
export const REFERRAL_CONFIG = {
  REWARD_AMOUNT: 10,      // 10€ de réduction
  MIN_ORDER_AMOUNT: 50,   // Commande minimum
  REFERRAL_POINTS: 500,   // Points bonus parrain
};
```

### API Endpoints

```http
# Obtenir son code de parrainage
GET /api/referral/code
Authorization: Bearer {token}

# Appliquer un code de parrainage
POST /api/referral/apply
Content-Type: application/json
{
  "code": "A1B2C3D4"
}
```

### Statuts de Parrainage

| Statut | Description |
|--------|-------------|
| `PENDING` | En attente de première commande |
| `COMPLETED` | Parrainage validé |
| `EXPIRED` | Expiré (non utilisé) |

### Fichiers

- `lib/referral.ts` - Logique métier
- `app/api/referral/code/route.ts` - API code
- `app/api/referral/apply/route.ts` - API application
- `components/ReferralCard.tsx` - Composant UI
- `app/account/referral/page.tsx` - Page parrainage

---

## Recommandations Produits

### Algorithme

```
SI utilisateur non connecté:
  → Retourner bestsellers

SI utilisateur connecté MAIS pas d'historique:
  → Retourner nouveautés

SI utilisateur avec historique:
  → Analyser catégories/marques achetées
  → Recommander produits similaires non achetés
  → Compléter avec bestsellers si nécessaire
```

### Types de Recommandations

| Type | Description | Utilisation |
|------|-------------|-------------|
| `personal` | Recommandations personnalisées | Homepage, compte |
| `similar` | Produits similaires | Page produit |
| `fbt` | Achetés ensemble | Page produit |

### API Endpoints

```http
# Recommandations personnalisées
GET /api/recommendations
GET /api/recommendations?limit=8

# Produits similaires
GET /api/recommendations?productId=123&type=similar

# Fréquemment achetés ensemble
GET /api/recommendations?productId=123&type=fbt
```

### Composants

```tsx
import {
  RecommendedProducts,
  SimilarProducts,
  FrequentlyBoughtTogether,
} from '@/components/RecommendedProducts';

// Homepage
<RecommendedProducts />

// Page produit
<SimilarProducts productId={123} />
<FrequentlyBoughtTogether productId={123} />
```

### Fichiers

- `lib/recommendations.ts` - Algorithme
- `app/api/recommendations/route.ts` - API
- `components/RecommendedProducts.tsx` - Composants UI

---

## Schéma Base de Données

### Nouveaux Modèles

```prisma
model LoyaltyPoints {
  id        String   @id @default(cuid())
  userId    String   @unique
  points    Int      @default(0)
  tier      LoyaltyTier @default(BRONZE)
  history   PointsHistory[]
}

model PointsHistory {
  id        String   @id @default(cuid())
  loyaltyId String
  amount    Int
  reason    PointsReason
  orderId   String?
}

model PushSubscription {
  id           String @id @default(cuid())
  userId       String
  subscription String @db.Text
}

model Referral {
  id          String   @id @default(cuid())
  referrerId  String
  refereeId   String?  @unique
  code        String   @unique
  status      ReferralStatus @default(PENDING)
  reward      Float    @default(10)
}
```

---

## Intégration

### Webhook Stripe

Ajouter dans `app/api/webhook/route.ts` :

```typescript
// Après paiement réussi
if (event.type === 'payment_intent.succeeded') {
  // Ajouter points fidélité
  if (order.userId) {
    const points = calculatePointsFromPurchase(order.totalAmount);
    await addPoints(order.userId, points, 'PURCHASE', order.id);
  }

  // Valider parrainage
  await completeReferral(order.userId, order.totalAmount);
}

// Commande expédiée
if (order.status === 'SHIPPED' && order.userId) {
  await sendPushNotification(
    order.userId,
    NOTIFICATION_TEMPLATES.ORDER_SHIPPED(order.id, order.trackingNumber)
  );
}
```

### Layout Global

Ajouter dans `app/layout.tsx` :

```tsx
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';

// Dans le body
<PushNotificationPrompt />
```

---

## Checklist Déploiement

- [ ] Variables VAPID configurées
- [ ] Migrations Prisma appliquées
- [ ] Service Worker mis à jour
- [ ] Pages compte accessibles
- [ ] Webhook Stripe mis à jour
- [ ] Tests de bout en bout

---

## Ressources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
