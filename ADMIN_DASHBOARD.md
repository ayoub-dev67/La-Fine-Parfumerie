# Dashboard Administrateur - La Fine Parfumerie

## Vue d'ensemble

Dashboard d'administration complet pour La Fine Parfumerie avec gestion des produits, commandes, clients et paramètres. Design luxe noir/or (#c5a059) cohérent avec le site.

---

## Architecture

### Protection des routes

**Middleware** ([middleware.ts](middleware.ts))
- Protection automatique de toutes les routes `/admin/*`
- Vérification du rôle ADMIN
- Redirection vers `/auth/signin` si non autorisé

**Layout Admin** ([app/admin/layout.tsx](app/admin/layout.tsx:1))
- Double vérification (middleware + layout)
- Sidebar fixe sur toutes les pages admin
- Container centralisé pour le contenu

---

## Composants

### 1. Sidebar ([components/admin/Sidebar.tsx](components/admin/Sidebar.tsx:1))

**Caractéristiques:**
- Navigation fixe à gauche (w-64)
- Logo et informations admin
- Menu avec 5 sections:
  - 📊 Dashboard
  - 🛍️ Produits
  - 📦 Commandes
  - 👥 Clients
  - ⚙️ Paramètres
- État actif avec surlignage doré
- Boutons "Voir le site" et "Déconnexion"

**Navigation:**
```typescript
const isActive = (href: string) => {
  if (href === '/admin') return pathname === '/admin';
  return pathname.startsWith(href);
};
```

### 2. StatsCard ([components/admin/StatsCard.tsx](components/admin/StatsCard.tsx:1))

**Props:**
- `title`: Titre de la statistique
- `value`: Valeur (string | number)
- `icon`: Emoji d'icône
- `trend?`: Tendance optionnelle
- `alert?`: Mode alerte (bordure rouge)

**Utilisation:**
```tsx
<StatsCard
  title="Commandes totales"
  value={totalOrders}
  icon="📦"
  trend="+12% vs mois dernier"
/>
```

### 3. ProductForm ([components/admin/ProductForm.tsx](components/admin/ProductForm.tsx:1))

**Composant réutilisable pour créer/éditer un produit**

**Props:**
- `product?`: Données du produit (mode edit)
- `mode`: 'create' | 'edit'

**Champs:**
- Nom, marque, description
- Prix, catégorie, volume
- Stock, URL image

**Validation:**
- Tous les champs requis
- Prix positif
- Stock >= 0
- URL valide pour l'image

### 4. ShipOrderForm ([components/admin/ShipOrderForm.tsx](components/admin/ShipOrderForm.tsx:1))

**Formulaire d'expédition de commande**

**Champs:**
- Transporteur (Colissimo, Chronopost, DHL, UPS, FedEx, Mondial Relay)
- Numéro de suivi

**Action:**
- Appelle `POST /api/admin/orders/{id}/ship`
- Envoie email de confirmation au client
- Rafraîchit la page automatiquement

### 5. DeleteProductButton ([components/admin/DeleteProductButton.tsx](components/admin/DeleteProductButton.tsx:1))

**Bouton de suppression avec confirmation**

**Fonctionnement:**
1. Clic sur "🗑️ Supprimer"
2. Affiche "✅ Confirmer" et "❌ Annuler"
3. Confirmation → Appelle `DELETE /api/admin/products/{id}`
4. Rafraîchit la liste des produits

---

## Pages

### 1. Dashboard Overview ([app/admin/page.tsx](app/admin/page.tsx:1))

**Statistiques affichées:**
- 📦 Commandes totales (PAID)
- 💰 Chiffre d'affaires (PAID + SHIPPED)
- 🎯 Commandes aujourd'hui
- ⚠️ Stock faible (<5 unités) avec alerte

**Actions rapides:**
- ➕ Ajouter un produit
- 📋 Gérer les commandes
- 🛍️ Gérer les produits

**Commandes récentes:**
- 10 dernières commandes (PAID/SHIPPED)
- Lien vers détail de chaque commande
- Affichage: n° commande, client, date, montant, statut

**Optimisation:**
```typescript
const [totalOrders, totalRevenue, todayOrders, lowStockProducts, recentOrders] =
  await Promise.all([...]);
```

### 2. Produits - Liste ([app/admin/products/page.tsx](app/admin/products/page.tsx:1))

**Fonctionnalités:**
- ➕ Bouton "Ajouter un produit"
- 🔍 Recherche par nom ou marque
- 🏷️ Filtre par catégorie
- Tableau avec: image, nom/marque/volume, catégorie, prix, stock
- Stock avec code couleur:
  - Rouge: <5 unités
  - Jaune: 5-9 unités
  - Vert: >=10 unités
- Actions: ✏️ Éditer, 🗑️ Supprimer

**Recherche:**
```typescript
where: {
  ...(searchParams.search && {
    OR: [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { brand: { contains: searchParams.search, mode: 'insensitive' } },
    ],
  }),
  ...(searchParams.category && { category: searchParams.category }),
}
```

### 3. Produits - Nouveau ([app/admin/products/new/page.tsx](app/admin/products/new/page.tsx:1))

**Contenu:**
- Header avec lien retour
- Composant `<ProductForm mode="create" />`
- Soumission → `POST /api/admin/products`
- Redirection vers liste après succès

### 4. Produits - Éditer ([app/admin/products/[id]/edit/page.tsx](app/admin/products/[id]/edit/page.tsx:1))

**Contenu:**
- Récupère le produit depuis Prisma
- Affiche nom du produit dans le header
- Composant `<ProductForm mode="edit" product={...} />`
- Soumission → `PUT /api/admin/products/{id}`
- Redirection vers liste après succès

### 5. Commandes - Liste ([app/admin/orders/page.tsx](app/admin/orders/page.tsx:1))

**Stats rapides:**
- Total commandes
- En attente (PENDING)
- Payées (PAID)
- Expédiées (SHIPPED)

**Filtres:**
- 🔍 Recherche par ID, email, nom
- Filtre par statut

**Tableau:**
- N° commande (8 premiers caractères)
- Client (nom + email)
- Date
- Nombre d'articles
- Montant
- Statut avec badge coloré
- Actions: 👁️ Détails

### 6. Commandes - Détail ([app/admin/orders/[id]/page.tsx](app/admin/orders/[id]/page.tsx:1))

**Colonne principale:**
- Articles commandés avec images
- Prix unitaire et total par article
- Total de la commande

**Informations d'expédition (si expédiée):**
- Transporteur
- Numéro de suivi
- Date d'expédition

**Colonne latérale:**
- Informations client (nom, email)
- Adresse de livraison complète
- Formulaire d'expédition (si PAID et non expédiée)

**Conditions d'affichage:**
```typescript
const canShip = order.status === 'PAID' && !order.shippedAt;
```

### 7. Clients - Liste ([app/admin/customers/page.tsx](app/admin/customers/page.tsx:1))

**Stats:**
- Total clients
- Clients avec commandes
- Nombre d'admins

**Tableau:**
- Avatar/initiale
- Nom
- Email
- Rôle (👑 Admin / 👤 Client)
- Nombre de commandes
- Total dépensé
- Date d'inscription

**Calcul du total dépensé:**
```typescript
const usersWithStats = users.map((user) => ({
  ...user,
  totalSpent: user.orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  ),
}));
```

### 8. Paramètres ([app/admin/settings/page.tsx](app/admin/settings/page.tsx:1))

**Sections:**

**Informations générales:**
- Nom de la boutique
- Email de contact
- Téléphone

**Livraison:**
- Frais de livraison standard
- Seuil livraison gratuite
- Délai de livraison estimé

**Paiement:**
- Statut Stripe (✅ Activé)
- Clé publique (masquée)

**Emails transactionnels:**
- Statut Resend (✅ Activé)
- Toggle confirmation de commande
- Toggle notification d'expédition
- Toggle email de bienvenue

**SEO & Analytics:**
- Google Analytics ID
- Meta description par défaut

**Note:** Page actuellement en lecture seule

---

## API Routes

### 1. Produits - Liste & Création ([app/api/admin/products/route.ts](app/api/admin/products/route.ts:1))

#### GET `/api/admin/products`

**Réponse:**
```json
{
  "success": true,
  "products": [...]
}
```

#### POST `/api/admin/products`

**Body:**
```json
{
  "name": "Aventus",
  "brand": "Creed",
  "description": "...",
  "price": 295.00,
  "category": "Signature",
  "volume": "100ml",
  "stock": 15,
  "image": "https://..."
}
```

**Validation Zod:**
- name: min 1 caractère
- brand: min 1 caractère
- description: min 1 caractère
- price: nombre positif
- category: enum valide
- volume: min 1 caractère
- stock: entier >= 0
- image: URL valide

**Réponse:**
```json
{
  "success": true,
  "product": {...}
}
```

### 2. Produits - Individuel ([app/api/admin/products/[id]/route.ts](app/api/admin/products/[id]/route.ts:1))

#### GET `/api/admin/products/{id}`

**Réponse:**
```json
{
  "success": true,
  "product": {...}
}
```

#### PUT `/api/admin/products/{id}`

**Body:** Même structure que POST

**Validation:**
- Vérifie existence du produit
- Applique validation Zod
- Met à jour le produit

#### DELETE `/api/admin/products/{id}`

**Sécurité:**
```typescript
const ordersCount = await prisma.orderItem.count({
  where: { productId: params.id },
});

if (ordersCount > 0) {
  return NextResponse.json({
    success: false,
    error: 'Impossible de supprimer ce produit car il est lié à des commandes',
  });
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Produit supprimé avec succès"
}
```

### 3. Commandes - Expédition ([app/api/admin/orders/[id]/ship/route.ts](app/api/admin/orders/[id]/ship/route.ts:1))

*Déjà créé lors de la mission emails*

#### POST `/api/admin/orders/{id}/ship`

**Body:**
```json
{
  "trackingNumber": "1234567890",
  "carrier": "Colissimo"
}
```

**Actions:**
1. Vérifie que l'utilisateur est ADMIN
2. Valide les données avec Zod
3. Vérifie que la commande existe et est PAID
4. Met à jour:
   - `status: 'SHIPPED'`
   - `trackingNumber`
   - `carrier`
   - `shippedAt: new Date()`
5. Envoie email de confirmation avec tracking

---

## Routes et URLs

### Pages admin

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard overview |
| `/admin/products` | Liste des produits |
| `/admin/products/new` | Nouveau produit |
| `/admin/products/{id}/edit` | Éditer produit |
| `/admin/orders` | Liste des commandes |
| `/admin/orders/{id}` | Détail commande |
| `/admin/customers` | Liste des clients |
| `/admin/settings` | Paramètres |

### API Routes

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/admin/products` | GET | Liste produits |
| `/api/admin/products` | POST | Créer produit |
| `/api/admin/products/{id}` | GET | Récupérer produit |
| `/api/admin/products/{id}` | PUT | Modifier produit |
| `/api/admin/products/{id}` | DELETE | Supprimer produit |
| `/api/admin/orders/{id}/ship` | POST | Expédier commande |

---

## Sécurité

### Protection multi-couches

1. **Middleware** ([middleware.ts](middleware.ts))
   - Première ligne de défense
   - Vérifie session et rôle
   - Bloque l'accès avant même d'atteindre la page

2. **Layout Admin** ([app/admin/layout.tsx](app/admin/layout.tsx:1))
   - Double vérification
   - Protection côté serveur
   - Redirection si non autorisé

3. **API Routes**
   - Vérification sur chaque endpoint
   - `auth()` + contrôle du rôle
   - Réponse 401 si non autorisé

### Exemple de vérification API

```typescript
const session = await auth();

if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { success: false, error: 'Non autorisé' },
    { status: 401 }
  );
}
```

---

## Design System

### Couleurs

- **Fond principal:** `#0a0a0a`
- **Cartes:** `#000000` (noir pur)
- **Or principal:** `#c5a059`
- **Or hover:** `#d4b068`
- **Bordures:** `#c5a059/20` (or avec 20% opacité)
- **Texte principal:** `#ffffff`
- **Texte secondaire:** `#9ca3af` (gray-400)

### Statuts

**Commandes:**
- 🟡 PENDING: `bg-yellow-500/20 text-yellow-400`
- 🔵 PAID: `bg-blue-500/20 text-blue-400`
- 🟢 SHIPPED: `bg-green-500/20 text-green-400`

**Stock:**
- 🔴 <5: `bg-red-500/20 text-red-400`
- 🟡 5-9: `bg-yellow-500/20 text-yellow-400`
- 🟢 >=10: `bg-green-500/20 text-green-400`

### Composants UI

**Input:**
```tsx
className="px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white
focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
```

**Bouton principal:**
```tsx
className="px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg
hover:bg-[#d4b068] transition-colors shadow-lg shadow-[#c5a059]/20"
```

**Bouton secondaire:**
```tsx
className="px-6 py-3 bg-[#c5a059]/20 text-[#c5a059] rounded-lg
hover:bg-[#c5a059]/30 transition-colors"
```

---

## Tests et Déploiement

### Accès admin

1. Créer un compte utilisateur
2. Modifier le rôle en base de données:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'votre@email.com';
   ```
3. Se connecter
4. Accéder à `/admin`

### Tests à effectuer

**Produits:**
- ✅ Créer un produit
- ✅ Modifier un produit
- ✅ Supprimer un produit (sans commandes liées)
- ✅ Recherche et filtres
- ❌ Tentative de suppression avec commandes (doit échouer)

**Commandes:**
- ✅ Voir liste des commandes
- ✅ Filtrer par statut
- ✅ Voir détail d'une commande
- ✅ Marquer comme expédiée (PAID → SHIPPED)
- ✅ Vérifier envoi d'email de tracking

**Clients:**
- ✅ Voir liste des clients
- ✅ Recherche par nom/email
- ✅ Vérifier calcul du total dépensé

**Sécurité:**
- ❌ Accès `/admin` sans connexion (doit rediriger)
- ❌ Accès `/admin` avec compte USER (doit rediriger)
- ❌ Appel API sans auth (doit retourner 401)

---

## Améliorations futures

### Fonctionnalités

- [ ] Graphiques de ventes (Chart.js)
- [ ] Export CSV des commandes
- [ ] Gestion des codes promo
- [ ] Upload d'images (pas juste URL)
- [ ] Modification de stock en masse
- [ ] Filtres avancés (plages de dates, prix)
- [ ] Pagination pour grandes listes
- [ ] Recherche en temps réel (debounce)

### Paramètres

- [ ] Formulaire fonctionnel pour settings
- [ ] Sauvegarde des paramètres en DB
- [ ] Configuration emails (templates)
- [ ] Gestion des transporteurs personnalisés

### UX

- [ ] Notifications toast (react-hot-toast)
- [ ] Modals de confirmation (au lieu d'alertes)
- [ ] Loading skeletons
- [ ] Animations de transition
- [ ] Mode sombre/clair (actuellement que sombre)

### Performance

- [ ] Server actions au lieu d'API routes
- [ ] Optimisation des images (next/image)
- [ ] Pagination côté serveur
- [ ] Cache avec React Query
- [ ] Préchargement des données (prefetch)

---

## Fichiers créés

### Composants (5 fichiers)
- `components/admin/Sidebar.tsx`
- `components/admin/StatsCard.tsx`
- `components/admin/ProductForm.tsx`
- `components/admin/ShipOrderForm.tsx`
- `components/admin/DeleteProductButton.tsx`

### Pages (9 fichiers)
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/products/page.tsx`
- `app/admin/products/new/page.tsx`
- `app/admin/products/[id]/edit/page.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/orders/[id]/page.tsx`
- `app/admin/customers/page.tsx`
- `app/admin/settings/page.tsx`

### API Routes (2 fichiers)
- `app/api/admin/products/route.ts`
- `app/api/admin/products/[id]/route.ts`

### Documentation (1 fichier)
- `ADMIN_DASHBOARD.md` (ce fichier)

---

## Support

Pour toute question ou bug, consultez:
- [middleware.ts](middleware.ts) pour la protection des routes
- [app/admin/layout.tsx](app/admin/layout.tsx:1) pour le layout
- Ce fichier pour la documentation complète

**Bon développement! 🚀**
