# API Documentation

Documentation complète de l'API La Fine Parfumerie.

## Base URL

```
Production: https://lafineparfumerie.fr/api
Development: http://localhost:3000/api
```

## Authentification

L'API utilise NextAuth.js pour l'authentification. Les routes protégées nécessitent une session valide.

### Headers

```http
Cookie: next-auth.session-token=<token>
```

## Réponses

### Format standard

```json
{
  "success": true,
  "data": { ... }
}
```

### Erreurs

```json
{
  "success": false,
  "error": "Message d'erreur",
  "code": "ERROR_CODE"
}
```

### Codes HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Non trouvé |
| 429 | Trop de requêtes (rate limit) |
| 500 | Erreur serveur |

---

## Routes Publiques

### Health Check

Vérifie l'état de l'application.

```http
GET /api/health
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| detailed | boolean | Inclure les détails (DB, mémoire) |

**Réponse**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-30T12:00:00.000Z",
  "version": "1.2.0",
  "uptime": 3600,
  "checks": {
    "database": "ok",
    "memory": {
      "used": 150,
      "total": 512,
      "percentage": 29
    }
  }
}
```

---

### Recherche Produits

Recherche full-text dans les produits.

```http
GET /api/search?q={query}
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| q | string | Terme de recherche (min 2 caractères) |
| limit | number | Nombre de résultats (défaut: 10, max: 50) |

**Réponse**

```json
{
  "products": [
    {
      "id": "abc123",
      "name": "Xerjoff Alexandria II",
      "slug": "xerjoff-alexandria-ii",
      "price": 299.00,
      "image": "/images/products/xerjoff-alex-ii.jpg",
      "brand": "Xerjoff",
      "category": "Eau de Parfum"
    }
  ],
  "total": 5
}
```

---

### Produits

#### Liste des produits

```http
GET /api/products
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page (défaut: 1) |
| limit | number | Produits par page (défaut: 12) |
| category | string | Filtrer par catégorie |
| brand | string | Filtrer par marque |
| gender | string | Filtrer par genre (homme, femme, unisexe) |
| minPrice | number | Prix minimum |
| maxPrice | number | Prix maximum |
| sort | string | Tri (price_asc, price_desc, name, newest) |
| inStock | boolean | Uniquement en stock |

**Réponse**

```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 156,
    "totalPages": 13
  }
}
```

#### Détails d'un produit

```http
GET /api/products/{id}
```

**Réponse**

```json
{
  "id": "abc123",
  "name": "Xerjoff Alexandria II",
  "slug": "xerjoff-alexandria-ii",
  "description": "Description longue...",
  "price": 299.00,
  "originalPrice": 350.00,
  "discount": 15,
  "images": ["/image1.jpg", "/image2.jpg"],
  "brand": "Xerjoff",
  "category": "Eau de Parfum",
  "gender": "unisexe",
  "volume": "100ml",
  "concentration": "Extrait",
  "notes": {
    "top": ["Bergamote", "Citron"],
    "heart": ["Rose", "Jasmin"],
    "base": ["Musc", "Ambre"]
  },
  "stock": 5,
  "inStock": true,
  "featured": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Avis Produits

#### Lister les avis

```http
GET /api/products/{id}/reviews
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page |
| limit | number | Avis par page |
| sort | string | Tri (newest, oldest, rating_high, rating_low) |

**Réponse**

```json
{
  "reviews": [
    {
      "id": "rev123",
      "rating": 5,
      "title": "Excellent parfum",
      "comment": "Tenue exceptionnelle...",
      "author": "Jean D.",
      "verified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "helpful": 12
    }
  ],
  "stats": {
    "average": 4.5,
    "total": 28,
    "distribution": {
      "5": 18,
      "4": 6,
      "3": 2,
      "2": 1,
      "1": 1
    }
  }
}
```

#### Ajouter un avis

```http
POST /api/products/{id}/reviews
```

**Authentification requise**

**Body**

```json
{
  "rating": 5,
  "title": "Excellent parfum",
  "comment": "Tenue exceptionnelle, sillage modéré..."
}
```

---

### Checkout

#### Créer une session de paiement

```http
POST /api/checkout
```

**Body**

```json
{
  "items": [
    {
      "id": "prod123",
      "quantity": 2
    }
  ],
  "promoCode": "PROMO10",
  "shippingAddress": {
    "name": "Jean Dupont",
    "address": "123 Rue Example",
    "city": "Strasbourg",
    "postalCode": "67000",
    "country": "FR"
  }
}
```

**Réponse**

```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

---

### Webhook Stripe

```http
POST /api/webhook
```

**Headers**

```http
Stripe-Signature: <signature>
```

Gère les événements Stripe :
- `checkout.session.completed` - Commande créée
- `payment_intent.succeeded` - Paiement confirmé
- `payment_intent.payment_failed` - Paiement échoué

---

### Codes Promo

#### Valider un code

```http
POST /api/promo/validate
```

**Body**

```json
{
  "code": "PROMO10",
  "cartTotal": 150.00
}
```

**Réponse**

```json
{
  "valid": true,
  "discount": {
    "type": "percentage",
    "value": 10,
    "amount": 15.00
  },
  "message": "Code appliqué : -10%"
}
```

---

## Routes Authentifiées

### Wishlist

#### Obtenir la wishlist

```http
GET /api/wishlist
```

**Réponse**

```json
{
  "items": [
    {
      "id": "prod123",
      "addedAt": "2024-01-15T10:00:00.000Z",
      "product": {
        "id": "prod123",
        "name": "Xerjoff Alexandria II",
        "price": 299.00,
        "image": "/image.jpg",
        "inStock": true
      }
    }
  ],
  "total": 3
}
```

#### Ajouter à la wishlist

```http
POST /api/wishlist
```

**Body**

```json
{
  "productId": "prod123"
}
```

#### Supprimer de la wishlist

```http
DELETE /api/wishlist/{productId}
```

---

### Wishlist Partageable

#### Créer un lien de partage

```http
POST /api/wishlist/share
```

**Réponse**

```json
{
  "shareId": "abc123xyz",
  "shareUrl": "https://lafineparfumerie.fr/wishlist/abc123xyz",
  "expiresAt": null
}
```

#### Obtenir le statut de partage

```http
GET /api/wishlist/share
```

**Réponse**

```json
{
  "isPublic": true,
  "shareId": "abc123xyz",
  "shareUrl": "https://lafineparfumerie.fr/wishlist/abc123xyz"
}
```

#### Supprimer le partage

```http
DELETE /api/wishlist/share
```

---

### Wishlist Publique

```http
GET /api/wishlist/public/{shareId}
```

**Réponse**

```json
{
  "owner": {
    "name": "Jean D."
  },
  "items": [...],
  "total": 5
}
```

---

### Commandes

#### Détails d'une commande

```http
GET /api/orders/{sessionId}
```

**Réponse**

```json
{
  "id": "order123",
  "status": "processing",
  "items": [...],
  "total": 299.00,
  "shipping": {
    "address": {...},
    "method": "standard",
    "trackingNumber": null
  },
  "createdAt": "2024-01-20T14:30:00.000Z"
}
```

#### Historique des commandes

```http
GET /api/orders
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page |
| limit | number | Commandes par page |
| status | string | Filtrer par statut |

---

## Routes Admin

Toutes les routes `/api/admin/*` nécessitent un rôle ADMIN.

### Statistiques Dashboard

```http
GET /api/admin/stats
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| period | string | Période (day, week, month, year) |

**Réponse**

```json
{
  "revenue": {
    "total": 15420.00,
    "change": 12.5
  },
  "orders": {
    "total": 48,
    "change": 8.3
  },
  "customers": {
    "total": 156,
    "new": 12
  },
  "averageOrderValue": 321.25,
  "topProducts": [...],
  "revenueByDay": [...]
}
```

### Gestion Commandes

#### Liste des commandes

```http
GET /api/admin/orders
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page |
| status | string | Filtrer par statut |
| search | string | Recherche (email, nom, ID) |
| dateFrom | string | Date début (ISO) |
| dateTo | string | Date fin (ISO) |

#### Modifier une commande

```http
PATCH /api/admin/orders/{id}
```

**Body**

```json
{
  "status": "shipped",
  "trackingNumber": "LA123456789FR"
}
```

### Gestion Clients

```http
GET /api/admin/customers
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page |
| vip | boolean | Uniquement VIP |
| search | string | Recherche |
| sort | string | Tri (orders, spent, name) |

### Alertes Stock

```http
GET /api/admin/stock
```

**Query Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| threshold | number | Seuil d'alerte (défaut: 10) |

**Réponse**

```json
{
  "alerts": [
    {
      "product": {...},
      "stock": 2,
      "threshold": 10,
      "severity": "critical"
    }
  ]
}
```

### Export/Import Produits

#### Export CSV

```http
GET /api/admin/products/export
```

**Réponse** : Fichier CSV

#### Import CSV

```http
POST /api/admin/products/import
```

**Body** : `multipart/form-data` avec fichier CSV

---

## Rate Limiting

L'API implémente un rate limiting pour prévenir les abus.

| Route | Limite |
|-------|--------|
| `/api/search` | 30 req/min |
| `/api/checkout` | 10 req/min |
| `/api/promo/validate` | 20 req/min |
| Routes admin | 100 req/min |

### Headers de réponse

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1706616000
```

### Réponse 429

```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Webhooks

### Stripe Webhook

Le webhook Stripe reçoit les événements de paiement.

**Configuration**

1. Créer un endpoint dans Stripe Dashboard
2. URL : `https://votre-site.com/api/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

4. Récupérer le `STRIPE_WEBHOOK_SECRET`

---

## Exemples cURL

### Recherche

```bash
curl -X GET "https://lafineparfumerie.fr/api/search?q=xerjoff&limit=5"
```

### Checkout

```bash
curl -X POST "https://lafineparfumerie.fr/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "prod123", "quantity": 1}]
  }'
```

### Avec authentification

```bash
curl -X GET "https://lafineparfumerie.fr/api/wishlist" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## SDK / Client

Exemple d'utilisation avec fetch :

```typescript
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL + '/api';

export async function searchProducts(query: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getWishlist() {
  const res = await fetch(`${API_BASE}/wishlist`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  return res.json();
}

export async function createCheckout(items: CartItem[], promoCode?: string) {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, promoCode }),
  });
  if (!res.ok) throw new Error('Checkout failed');
  return res.json();
}
```
