# Documentation Admin Dashboard

Guide complet des fonctionnalités avancées du panneau d'administration.

## Table des matières

1. [Analytics & Dashboard](#analytics--dashboard)
2. [Export/Import CSV](#exportimport-csv)
3. [Gestion du Stock](#gestion-du-stock)
4. [Détection VIP](#détection-vip)
5. [Actions Groupées](#actions-groupées)
6. [API Reference](#api-reference)

---

## Analytics & Dashboard

### Vue d'ensemble

Le dashboard analytics offre une visualisation en temps réel des performances de la boutique.

### Graphiques disponibles

#### 1. Évolution des Ventes (`SalesChart`)
- **Type**: Graphique linéaire double axe
- **Données**: Chiffre d'affaires + nombre de commandes
- **Période**: Configurable (jour, semaine, mois)

```tsx
import { SalesChart } from '@/components/admin/SalesChart';

<SalesChart data={salesData} />
```

#### 2. Répartition par Statut (`OrdersChart`)
- **Type**: Barres horizontales
- **Données**: Commandes par statut (PAID, SHIPPED, DELIVERED, etc.)

#### 3. Top Produits (`TopProductsChart`)
- **Type**: Barres verticales
- **Données**: 10 meilleurs produits par CA

#### 4. Clients Nouveaux vs Récurrents (`CustomersChart`)
- **Type**: Camembert
- **Données**: Proportion nouveaux/récurrents

### Configuration

```typescript
// lib/redis.ts - Cache analytics
const ANALYTICS_CACHE_TTL = 300; // 5 minutes

// Invalidation automatique après création commande
await analyticsCache.invalidate('analytics:*');
```

### API Endpoint

```
GET /api/admin/analytics?period=week
```

**Paramètres:**
- `period`: `day` | `week` | `month` (défaut: `week`)

---

## Export/Import CSV

### Export

Trois types d'export disponibles via le bouton dropdown:

#### Produits (`/api/admin/export/products`)
Colonnes: id, name, brand, description, price, volume, category, subcategory, stock, notesTop, notesHeart, notesBase, isFeatured, isNew, isBestSeller, image, createdAt

#### Commandes (`/api/admin/export/orders`)
Colonnes: id, stripeSessionId, status, totalAmount, promoCode, discountAmount, customerName, customerEmail, itemsCount, items, trackingNumber, carrier, createdAt, paidAt, shippedAt, deliveredAt

#### Clients (`/api/admin/export/customers`)
Colonnes: id, name, email, role, totalSpent, orderCount, avgOrder, lastOrderDate, loyaltyPoints, loyaltyTier, createdAt

### Import Produits

Interface drag & drop avec validation:

```typescript
// Schéma de validation Zod
const productRowSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  volume: z.string().optional(),
  category: z.enum(['Signature', 'Niche', 'Femme', 'Homme', 'Coffret']),
  stock: z.coerce.number().int().min(0),
  image: z.string().url(),
  // ... autres champs optionnels
});
```

**Fonctionnalités:**
- Upload fichier CSV (séparateur: `;`)
- Template téléchargeable
- Prévisualisation avant import
- Création ou mise à jour automatique
- Rapport d'erreurs ligne par ligne

---

## Gestion du Stock

### Vue d'ensemble

Page dédiée à `/admin/stock` avec:
- Statistiques globales (total, valeur, santé)
- Alertes par niveau (rupture, critique, faible)
- Historique des mouvements

### Seuils configurables

```typescript
// lib/stock-management.ts
export const STOCK_CONFIG = {
  LOW_STOCK_THRESHOLD: 10,     // Alerte jaune
  CRITICAL_STOCK_THRESHOLD: 3, // Alerte orange
  OUT_OF_STOCK_THRESHOLD: 0,   // Alerte rouge
};
```

### Types de mouvements

| Type | Description | Exemple |
|------|-------------|---------|
| `SALE` | Vente (sortie) | -2 |
| `RETURN` | Retour client | +1 |
| `RESTOCK` | Réapprovisionnement | +50 |
| `ADJUSTMENT` | Ajustement inventaire | ±X |
| `DAMAGE` | Produit endommagé | -1 |
| `TRANSFER` | Transfert | ±X |

### Fonctions disponibles

```typescript
import {
  recordStockChange,
  adjustStock,
  recordSale,
  recordReturn,
  recordRestock,
  getStockHistory,
  getLowStockProducts,
  getStockStats,
} from '@/lib/stock-management';

// Exemple: Réapprovisionnement
await recordRestock({
  productId: 123,
  quantity: 50,
  reason: 'Livraison fournisseur',
  userId: session.user.id,
});
```

### API Endpoints

```
GET /api/admin/stock
  → stats, lowStock, recentMovements

PATCH /api/admin/stock
  Body: { productId, action: 'set'|'add', quantity, reason }

GET /api/admin/stock/history?productId=X&limit=50
```

---

## Détection VIP

### Système de scoring

Score VIP calculé automatiquement basé sur:
- Dépenses totales (0.1 point/€)
- Nombre de commandes (10 points/commande)
- Récence d'activité (bonus/malus)
- Tier fidélité (0-100 points)
- Avis déposés (5 points/avis)

### Segments

| Segment | Seuil dépenses | Emoji |
|---------|---------------|-------|
| Diamond | 5000€+ | 💎 |
| Platinum | 1500€+ | ⚪ |
| Gold | 500€+ | 🥇 |
| Silver | 200€+ | 🥈 |
| Bronze | >0€ | 🥉 |
| Prospect | 0€ | 👋 |

### Statuts d'activité

| Statut | Jours depuis dernière commande |
|--------|-------------------------------|
| Active | ≤30 jours |
| Engaged | 31-90 jours |
| At Risk | 91-180 jours |
| Dormant | >180 jours |
| New | Jamais commandé |

### API Endpoint

```
GET /api/admin/vip?view=all|top|at-risk
  &segment=gold
  &activity=active
  &sortBy=score|spent|orders|recency
```

---

## Actions Groupées

### Commandes

Actions disponibles via sélection multiple:
- **Marquer expédié**: Avec transporteur et n° suivi
- **Marquer livré**: Mise à jour statut
- **Annuler**: Changement statut CANCELLED

```typescript
// API
PATCH /api/admin/orders
Body: {
  orderIds: string[],
  action: 'markAsShipped' | 'markAsDelivered' | 'cancel',
  data?: { trackingNumber, carrier }
}
```

### Produits

Actions disponibles:
- **Badges**: Featured, New, Best Seller (on/off)
- **Catégorie**: Changement en masse
- **Prix**: Ajustement % ou montant fixe
- **Supprimer**: Avec vérification commandes liées

```typescript
// API
POST /api/admin/products/bulk
Body: {
  productIds: number[],
  action: 'setFeatured' | 'adjustPrice' | 'delete' | ...,
  data?: { category?, priceType?, priceValue? }
}
```

---

## API Reference

### Authentication

Toutes les routes `/api/admin/*` requièrent:
- Session NextAuth valide
- Rôle `ADMIN`

```typescript
const session = await auth();
if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
```

### Endpoints récapitulatif

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/admin/analytics` | GET | Données analytics |
| `/api/admin/export/products` | GET | Export CSV produits |
| `/api/admin/export/orders` | GET | Export CSV commandes |
| `/api/admin/export/customers` | GET | Export CSV clients |
| `/api/admin/import/products` | POST | Import CSV produits |
| `/api/admin/stock` | GET, PATCH | Gestion stock |
| `/api/admin/stock/history` | GET | Historique stock |
| `/api/admin/vip` | GET | Clients VIP |
| `/api/admin/products/bulk` | POST | Actions groupées produits |
| `/api/admin/orders` | PATCH | Actions groupées commandes |

### Codes de réponse

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Données invalides |
| 401 | Non autorisé |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## Structure des fichiers

```
app/
├── admin/
│   ├── page.tsx          # Dashboard principal
│   ├── analytics/        # Vue analytics détaillée
│   ├── orders/           # Gestion commandes
│   ├── products/         # Gestion produits
│   ├── stock/            # Gestion stock
│   ├── vip/              # Clients VIP
│   └── customers/        # Tous les clients

components/admin/
├── AnalyticsDashboard.tsx
├── SalesChart.tsx
├── OrdersChart.tsx
├── TopProductsChart.tsx
├── CustomersChart.tsx
├── ExportButton.tsx
├── ImportProducts.tsx
├── OrdersClient.tsx
├── ProductsClient.tsx
└── ...

lib/
├── stock-management.ts   # Logique gestion stock
├── vip-detection.ts      # Détection VIP
└── redis.ts              # Cache Redis
```

---

## Bonnes pratiques

1. **Cache**: Toutes les données analytics sont cachées 5 minutes
2. **Invalidation**: Le cache est invalidé après chaque modification
3. **Validation**: Utiliser Zod pour valider toutes les entrées
4. **Transactions**: Utiliser `prisma.$transaction` pour les opérations critiques
5. **Logs**: Logger toutes les erreurs avec contexte

---

*Documentation générée automatiquement - Dernière mise à jour: Janvier 2026*
