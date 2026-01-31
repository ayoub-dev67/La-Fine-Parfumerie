# UX Premium - Guide des Fonctionnalités

Ce document décrit toutes les fonctionnalités UX premium implémentées dans La Fine Parfumerie.

## Table des Matières

1. [Animations Framer Motion](#1-animations-framer-motion)
2. [Quick View Modal](#2-quick-view-modal)
3. [Product Comparator](#3-product-comparator)
4. [Image Zoom & Gallery](#4-image-zoom--gallery)
5. [Chatbot FAQ](#5-chatbot-faq)
6. [Shareable Wishlist](#6-shareable-wishlist)
7. [Micro-interactions](#7-micro-interactions)

---

## 1. Animations Framer Motion

### Fichiers
- `components/animations/PageTransition.tsx`
- `components/animations/ProductReveal.tsx`
- `components/animations/CartSlideIn.tsx`
- `components/animations/SuccessConfetti.tsx`
- `components/animations/index.ts`

### Composants Disponibles

#### PageTransition
Transition de page avec fade et slide.

```tsx
import { PageTransition } from '@/components/animations';

<PageTransition>
  {children}
</PageTransition>
```

#### FadeIn / SlideUp / ScaleIn
Animations d'entrée simples.

```tsx
import { FadeIn, SlideUp, ScaleIn } from '@/components/animations';

<FadeIn delay={0.2}>
  <h1>Titre</h1>
</FadeIn>

<SlideUp delay={0.3}>
  <p>Contenu</p>
</SlideUp>
```

#### ProductGrid / ProductGridItem
Animation staggered pour les grilles de produits.

```tsx
import { ProductGrid, ProductGridItem } from '@/components/animations';

<ProductGrid className="grid grid-cols-4 gap-4">
  {products.map(product => (
    <ProductGridItem key={product.id}>
      <ProductCard product={product} />
    </ProductGridItem>
  ))}
</ProductGrid>
```

#### HoverCard / GlowOnHover
Effets de survol élégants.

```tsx
import { HoverCard, GlowOnHover } from '@/components/animations';

<HoverCard>
  <div className="card">Contenu</div>
</HoverCard>

<GlowOnHover>
  <button>Action</button>
</GlowOnHover>
```

#### CartSlideIn / SlideInFromLeft / SlideInFromBottom
Animations de slide pour les panneaux latéraux.

```tsx
import { CartSlideIn } from '@/components/animations';

<CartSlideIn isOpen={isCartOpen}>
  <CartContent />
</CartSlideIn>
```

#### SuccessConfetti / Celebration / FireworksBurst
Effets de célébration avec confettis.

```tsx
import { SuccessConfetti, useConfetti } from '@/components/animations';

// Utilisation avec composant
<SuccessConfetti trigger={orderSuccess} />

// Utilisation avec hook
const { fireConfetti, fireFireworks } = useConfetti();
fireConfetti(); // Lance les confettis
```

---

## 2. Quick View Modal

### Fichiers
- `lib/QuickViewContext.tsx`
- `components/ProductQuickView.tsx`

### Utilisation

Le contexte doit être ajouté dans le layout principal :

```tsx
// app/layout.tsx
import { QuickViewProvider } from '@/lib/QuickViewContext';
import { ProductQuickView } from '@/components/ProductQuickView';

<QuickViewProvider>
  {children}
  <ProductQuickView />
</QuickViewProvider>
```

### API du Contexte

```tsx
import { useQuickView } from '@/lib/QuickViewContext';

const { openQuickView, closeQuickView, isOpen, product } = useQuickView();

// Ouvrir le modal
openQuickView(product);

// Fermer le modal
closeQuickView();
```

### Fonctionnalités
- Image du produit avec zoom
- Informations complètes (nom, marque, prix, description)
- Notes olfactives (tête, cœur, fond)
- Sélecteur de quantité
- Ajout au panier
- Stock indicator
- Navigation vers la page produit complète

---

## 3. Product Comparator

### Fichiers
- `lib/CompareContext.tsx`
- `components/CompareBar.tsx`
- `app/compare/page.tsx`

### Configuration

Ajouter le provider et la barre dans le layout :

```tsx
// app/layout.tsx
import { CompareProvider } from '@/lib/CompareContext';
import { CompareBar } from '@/components/CompareBar';

<CompareProvider>
  {children}
  <CompareBar />
</CompareProvider>
```

### API du Contexte

```tsx
import { useCompare, MAX_COMPARE_ITEMS } from '@/lib/CompareContext';

const {
  compareProducts,     // Produits dans la comparaison (max 4)
  addToCompare,        // Ajouter un produit
  removeFromCompare,   // Retirer un produit
  clearCompare,        // Vider la comparaison
  isInCompare,         // Vérifier si un produit est dans la comparaison
  canAddMore           // Peut-on ajouter plus de produits ?
} = useCompare();
```

### Fonctionnalités
- Maximum 4 produits
- Barre sticky en bas de l'écran
- Persistance localStorage
- Page de comparaison avec tableau complet
- URL partageable (`/compare?ids=1,2,3,4`)
- Comparaison des notes olfactives, prix, rating, stock

---

## 4. Image Zoom & Gallery

### Fichiers
- `components/ImageGallery.tsx`

### Utilisation

```tsx
import { ImageGallery, SimpleZoom } from '@/components/ImageGallery';

// Galerie complète
<ImageGallery
  images={['/img1.jpg', '/img2.jpg', '/img3.jpg']}
  productName="Nom du produit"
/>

// Zoom simple sur une image
<SimpleZoom
  src="/image.jpg"
  alt="Description"
/>
```

### Fonctionnalités
- Navigation par flèches et clavier
- Miniatures cliquables
- Zoom au clic (react-medium-image-zoom)
- Mode plein écran
- Compteur d'images
- Indicateur de zoom

---

## 5. Chatbot FAQ

### Fichiers
- `lib/chatbot-faq.ts` - Données FAQ
- `components/Chatbot.tsx` - Composant chatbot

### Configuration

Ajouter le chatbot dans le layout :

```tsx
// app/layout.tsx
import { Chatbot } from '@/components/Chatbot';

<body>
  {children}
  <Chatbot />
</body>
```

### Catégories FAQ
- Livraison (délais, frais, suivi)
- Retours & Échanges
- Paiement
- Produits (authenticité, conservation, échantillons)
- Mon Compte
- Contact

### Personnalisation FAQ

```tsx
// lib/chatbot-faq.ts
export const faqCategories: FAQCategory[] = [
  {
    id: 'category-id',
    name: 'Nom de la catégorie',
    icon: '📦',
    questions: [
      {
        id: 'question-id',
        question: 'Question complète ?',
        answer: 'Réponse détaillée.',
        keywords: ['mot', 'clé', 'recherche']
      }
    ]
  }
];
```

### API de Recherche

```tsx
import { searchFAQ, getPopularQuestions, getAllFAQItems } from '@/lib/chatbot-faq';

// Rechercher des réponses
const results = searchFAQ('délai livraison');

// Questions populaires
const popular = getPopularQuestions();
```

---

## 6. Shareable Wishlist

### Fichiers
- `prisma/schema.prisma` - Champs wishlistShareId, wishlistPublic
- `app/api/wishlist/share/route.ts` - API de partage
- `app/api/wishlist/public/[shareId]/route.ts` - API publique
- `app/wishlist/[shareId]/page.tsx` - Page publique
- `components/WishlistShareManager.tsx` - Gestion du partage

### Schéma Prisma

```prisma
model User {
  // ...
  wishlistShareId   String?   @unique
  wishlistPublic    Boolean   @default(false)
}
```

### API Endpoints

#### POST /api/wishlist/share
Générer ou toggle le lien de partage.

```tsx
// Générer un nouveau lien
await fetch('/api/wishlist/share', {
  method: 'POST',
  body: JSON.stringify({ action: 'generate' })
});

// Toggle visibilité
await fetch('/api/wishlist/share', {
  method: 'POST',
  body: JSON.stringify({ action: 'toggle' })
});
```

#### GET /api/wishlist/share
Obtenir le statut de partage actuel.

#### DELETE /api/wishlist/share
Supprimer le lien de partage.

#### GET /api/wishlist/public/[shareId]
Obtenir une wishlist publique.

### Composant de Gestion

```tsx
import { WishlistShareManager } from '@/components/WishlistShareManager';

// Dans la page profil/wishlist
<WishlistShareManager />
```

---

## 7. Micro-interactions

### Fichiers
- `components/ui/Skeleton.tsx` - Squelettes de chargement
- `components/ui/Toast.tsx` - Notifications toast
- `components/ui/EmptyState.tsx` - États vides
- `components/ui/index.ts` - Exports

### Skeletons

```tsx
import {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  CartItemSkeleton,
  OrderSummarySkeleton,
  ReviewSkeleton,
  ProfileHeaderSkeleton
} from '@/components/ui';

// Skeleton de base
<Skeleton className="h-4 w-32" />

// Grille de produits en chargement
{loading ? (
  <ProductGridSkeleton count={8} />
) : (
  <ProductGrid>{/* ... */}</ProductGrid>
)}
```

### Toast Notifications

Configuration du provider :

```tsx
// app/layout.tsx
import { ToastProvider } from '@/components/ui/Toast';

<body>
  {children}
  <ToastProvider />
</body>
```

Utilisation :

```tsx
import { toast, toastWithUndo } from '@/components/ui/Toast';

// Toasts basiques
toast.success('Opération réussie');
toast.error('Une erreur est survenue');
toast.info('Information importante');
toast.loading('Chargement...');

// Toasts spécifiques
toast.cartAdded('Parfum XYZ');
toast.wishlistAdded('Parfum XYZ');
toast.wishlistRemoved('Parfum XYZ');
toast.compareAdded('Parfum XYZ');
toast.compareLimitReached();
toast.copied('Lien');
toast.orderPlaced();

// Toast avec promesse
await toast.promise(
  fetchData(),
  {
    loading: 'Chargement...',
    success: 'Données chargées',
    error: 'Erreur de chargement'
  }
);

// Toast avec action d'annulation
toastWithUndo(
  'Produit retiré',
  () => undoRemove(),
  5000 // durée
);
```

### Empty States

```tsx
import {
  EmptyState,
  EmptyCart,
  EmptyWishlist,
  EmptyOrders,
  EmptySearchResults,
  EmptyReviews,
  EmptyCompare,
  ErrorState,
  NoAccessState
} from '@/components/ui';

// États vides pré-configurés
{cart.length === 0 && <EmptyCart />}
{wishlist.length === 0 && <EmptyWishlist />}
{orders.length === 0 && <EmptyOrders />}
{results.length === 0 && <EmptySearchResults query={searchQuery} />}

// État vide personnalisé
<EmptyState
  icon={<CustomIcon />}
  title="Titre personnalisé"
  description="Description explicative"
  action={{
    label: "Action",
    href: "/page" // ou onClick: () => {}
  }}
/>

// État d'erreur avec retry
<ErrorState
  title="Erreur de chargement"
  description="Impossible de charger les données"
  onRetry={() => refetch()}
/>
```

---

## Packages Utilisés

| Package | Version | Usage |
|---------|---------|-------|
| framer-motion | ^11.x | Animations |
| canvas-confetti | ^1.x | Effets confetti |
| react-medium-image-zoom | ^5.x | Zoom images |
| react-hot-toast | ^2.x | Notifications |
| nanoid | ^5.x | Génération d'IDs |

## Installation

```bash
npm install framer-motion canvas-confetti react-medium-image-zoom react-hot-toast nanoid
npm install -D @types/canvas-confetti
```

## Configuration Recommandée

### Layout Principal

```tsx
// app/layout.tsx
import { QuickViewProvider } from '@/lib/QuickViewContext';
import { CompareProvider } from '@/lib/CompareContext';
import { ProductQuickView } from '@/components/ProductQuickView';
import { CompareBar } from '@/components/CompareBar';
import { Chatbot } from '@/components/Chatbot';
import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QuickViewProvider>
          <CompareProvider>
            {children}
            <ProductQuickView />
            <CompareBar />
            <Chatbot />
            <ToastProvider />
          </CompareProvider>
        </QuickViewProvider>
      </body>
    </html>
  );
}
```

---

## Bonnes Pratiques

### Performance
- Les animations utilisent `will-change` automatiquement via Framer Motion
- Les skeletons utilisent CSS pour le shimmer effect
- Le chatbot charge les FAQ au premier clic seulement
- Les images utilisent lazy loading par défaut

### Accessibilité
- Tous les modaux sont focusables et fermables avec Escape
- Les boutons ont des `aria-label` appropriés
- Les états vides ont des descriptions claires
- La navigation clavier est supportée dans la galerie

### Mobile
- Le chatbot est responsive (largeur adaptée)
- La barre de comparaison scrolle horizontalement
- Les toasts sont positionnés pour ne pas gêner
- Les modaux utilisent des tailles adaptées
