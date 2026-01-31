# Monitoring & Analytics - La Fine Parfumerie

Guide complet pour le monitoring en production.

## Table des Matières

1. [Sentry (Error Tracking)](#sentry-error-tracking)
2. [Google Analytics 4](#google-analytics-4)
3. [Health Checks](#health-checks)
4. [Métriques Clés](#métriques-clés)
5. [Alertes Recommandées](#alertes-recommandées)

---

## Sentry (Error Tracking)

### Configuration

Les fichiers de configuration Sentry :
- `sentry.client.config.ts` - Configuration client (browser)
- `sentry.server.config.ts` - Configuration serveur (Node.js)
- `sentry.edge.config.ts` - Configuration edge runtime

### Variables d'Environnement

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Dashboard

URL: `https://sentry.io/organizations/[org]/projects/[project]/`

### Features Activées

| Feature | Description |
|---------|-------------|
| Error Tracking | Capture automatique des erreurs |
| Session Replay | Replay des sessions avec erreurs |
| Performance | Tracing des requêtes |
| Tunnel | Contourne les bloqueurs de pub |

### Sample Rates (Production)

- **Traces**: 20% des requêtes
- **Session Replay**: 10% des sessions normales
- **Error Replay**: 100% des sessions avec erreurs

### Usage dans le Code

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture manuelle d'une erreur
Sentry.captureException(error, {
  tags: {
    section: 'checkout',
    user_action: 'payment',
  },
  extra: {
    orderId: order.id,
    amount: order.total,
  },
});

// Capture d'un message
Sentry.captureMessage('Paiement échoué', 'warning');

// Ajouter du contexte utilisateur
Sentry.setUser({
  id: user.id,
  email: user.email,
});
```

### Erreurs Ignorées

Les erreurs suivantes sont automatiquement ignorées :
- `Network request failed`
- `Failed to fetch`
- `ResizeObserver loop`
- Erreurs de navigation Next.js (`NEXT_NOT_FOUND`, `NEXT_REDIRECT`)

---

## Google Analytics 4

### Configuration

Variable d'environnement :
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Dashboard

URL: `https://analytics.google.com/`

### Events E-commerce Trackés

| Event | Déclencheur | Données |
|-------|-------------|---------|
| `view_item` | Vue page produit | Produit, prix |
| `add_to_cart` | Clic "Ajouter au panier" | Produit, quantité, prix |
| `remove_from_cart` | Suppression du panier | Produit, quantité |
| `view_cart` | Ouverture du panier | Items, total |
| `begin_checkout` | Début du checkout | Panier complet |
| `purchase` | Achat confirmé | Commande, items, total |
| `sign_up` | Inscription | Méthode |
| `login` | Connexion | Méthode |
| `search` | Recherche | Terme |
| `add_to_wishlist` | Ajout aux favoris | Produit |

### Usage dans le Code

```typescript
import { ecommerceEvent } from '@/lib/gtag';

// Vue produit
ecommerceEvent.viewItem({
  id: product.id,
  name: product.name,
  brand: product.brand,
  category: product.category,
  price: product.price,
});

// Ajout au panier
ecommerceEvent.addToCart(product, quantity);

// Achat
ecommerceEvent.purchase({
  id: order.id,
  total: order.total,
  items: order.items,
  promoCode: order.promoCode,
});
```

### Rapports Importants

1. **E-commerce → Performances produits**
   - Produits les plus vus
   - Produits les plus achetés
   - Taux de conversion par produit

2. **E-commerce → Performances achats**
   - Revenu total
   - Panier moyen
   - Transactions

3. **Engagement → Entonnoir checkout**
   - Taux d'abandon à chaque étape
   - Points de friction

4. **Acquisition → Sources de trafic**
   - Canaux performants
   - ROI campagnes

---

## Health Checks

### Endpoints

| Endpoint | Usage |
|----------|-------|
| `GET /api/health` | Check basique (load balancer) |
| `GET /api/health?detailed=true` | Check détaillé (monitoring) |
| `HEAD /api/health` | Ping rapide |

### Réponse Basique

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400
}
```

### Réponse Détaillée

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400,
  "checks": {
    "database": {
      "status": "ok",
      "latency": 15
    },
    "stripe": {
      "status": "ok",
      "latency": 245
    },
    "memory": {
      "used": 128,
      "total": 512,
      "percentage": 25,
      "unit": "MB"
    }
  }
}
```

### Statuts Possibles

| Statut | Code HTTP | Signification |
|--------|-----------|---------------|
| `healthy` | 200 | Tout fonctionne |
| `degraded` | 200 | Partiellement fonctionnel |
| `unhealthy` | 503 | Service down |

### Configuration UptimeRobot (Gratuit)

1. Créer un compte sur [uptimerobot.com](https://uptimerobot.com)
2. Ajouter un monitor HTTP(s)
3. URL: `https://votre-domaine.com/api/health`
4. Intervalle: 5 minutes
5. Alertes: Email + SMS

---

## Métriques Clés

### Performance Web (Core Web Vitals)

| Métrique | Objectif | Description |
|----------|----------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTFB | < 600ms | Time To First Byte |

### Métriques Business

| Métrique | KPI |
|----------|-----|
| Taux de conversion | Visiteurs → Acheteurs |
| Panier moyen | Revenu / Transactions |
| Taux d'abandon | Paniers abandonnés / Paniers créés |
| Taux de rebond | Sessions 1 page / Total sessions |

### Métriques Techniques

| Métrique | Seuil Alerte |
|----------|--------------|
| Taux d'erreur | > 1% |
| Latence API | > 1000ms |
| Usage mémoire | > 85% |
| DB latence | > 100ms |

---

## Alertes Recommandées

### Critiques (Notification Immédiate)

- ❌ `/api/checkout` retourne 5xx
- ❌ `/api/webhook` retourne erreur
- ❌ Database inaccessible
- ❌ Taux d'erreur > 5% sur 5 min

### Importantes (< 1 heure)

- ⚠️ Taux d'erreur > 2% sur 15 min
- ⚠️ Latence moyenne > 2s
- ⚠️ Mémoire > 80%
- ⚠️ Stripe API timeout

### Informatives (< 24 heures)

- ℹ️ Pic de trafic inhabituel (+50%)
- ℹ️ Nouveau type d'erreur détecté
- ℹ️ Performance dégradée ponctuelle

---

## Configuration Vercel

### Variables d'Environnement à Ajouter

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx  # Pour les source maps

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Intégrations Vercel Recommandées

1. **Vercel Analytics** (inclus)
   - Web Vitals automatiques
   - Dashboard intégré

2. **Vercel Speed Insights** (inclus)
   - Données de performance réelles
   - Comparaison par page

---

## Checklist Production

- [ ] Sentry DSN configuré
- [ ] GA4 Measurement ID configuré
- [ ] UptimeRobot ou équivalent actif
- [ ] Alertes email configurées
- [ ] Tester `/api/health?detailed=true`
- [ ] Vérifier les events GA4 dans DebugView
- [ ] Confirmer la réception des erreurs dans Sentry

---

*Dernière mise à jour : Janvier 2026*
