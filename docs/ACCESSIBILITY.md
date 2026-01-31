# Accessibility Guide (a11y)

Ce guide documente les pratiques d'accessibilité implémentées dans La Fine Parfumerie.

## Standards Suivis

- **WCAG 2.1 Level AA** - Standard minimum requis
- **WCAG 2.1 Level AAA** - Objectif pour les éléments critiques

## Utilitaires Disponibles

### lib/accessibility.ts

```typescript
import {
  // Focus Management
  saveFocus,
  restoreFocus,
  trapFocus,
  getFocusableElements,

  // Keyboard Navigation
  handleArrowKeyNavigation,
  isActivationKey,
  onEscapeKey,

  // Screen Reader
  announce,
  announceRouteChange,
  announceLoading,
  announceError,
  announceSuccess,

  // Color Contrast
  getContrastRatio,
  meetsContrastAA,
  meetsContrastAAA,

  // Reduced Motion
  prefersReducedMotion,

  // ARIA Helpers
  generateAriaId,
  ariaDescribedBy,
} from '@/lib/accessibility';
```

### hooks/useAccessibility.ts

```typescript
import {
  useFocusTrap,      // Trap focus in modals
  useEscapeKey,      // Close on Escape
  useClickOutside,   // Close on outside click
  useAnnounce,       // Screen reader announcements
  useReducedMotion,  // Respect prefers-reduced-motion
  useAriaId,         // Generate unique IDs
  useRovingTabIndex, // Arrow key navigation in lists
  useSkipLink,       // Skip to main content
  useDialog,         // Modal accessibility
  useFormField,      // Form field a11y props
} from '@/hooks/useAccessibility';
```

## Implémentation par Composant

### Navigation (Navbar)

```tsx
<nav aria-label="Navigation principale">
  <a href="/cart" aria-label={`Panier (${cartCount} articles)`}>
    <ShoppingCartIcon aria-hidden="true" />
  </a>
</nav>
```

### Boutons d'Action

```tsx
<button
  aria-label="Aperçu rapide du produit"
  title="Aperçu rapide"
  onClick={openQuickView}
>
  <EyeIcon aria-hidden="true" />
</button>
```

### Modals/Dialogs

```tsx
function Modal({ isOpen, onClose, title, children }) {
  const { dialogRef, dialogProps } = useDialog(isOpen, onClose);

  return (
    <div
      {...dialogProps}
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="Fermer">×</button>
    </div>
  );
}
```

### Formulaires

```tsx
function FormField({ label, error, ...inputProps }) {
  const { fieldProps, labelProps, errorProps } = useFormField(!!error, error);

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <input {...fieldProps} {...inputProps} />
      {error && <span {...errorProps}>{error}</span>}
    </div>
  );
}
```

### Images

```tsx
// Image décorative
<Image src="/decoration.jpg" alt="" aria-hidden="true" />

// Image informative
<Image src="/product.jpg" alt="Parfum Xerjoff Alexandria II 100ml" />

// Image avec texte
<Image src="/banner.jpg" alt="Soldes d'été - Jusqu'à 50% de réduction" />
```

## Contraste des Couleurs

### Palette La Fine Parfumerie

| Couleur | Hex | Usage |
|---------|-----|-------|
| Or (or) | #c5a059 | Accent, liens |
| Crème (creme) | #f5f0e8 | Texte sur fond sombre |
| Noir (noir) | #0a0a0a | Fond principal |
| Beige | #e8e0d5 | Texte secondaire |

### Ratios de Contraste

| Combinaison | Ratio | WCAG AA | WCAG AAA |
|-------------|-------|---------|----------|
| Crème sur Noir | 15.8:1 | ✅ | ✅ |
| Or sur Noir | 8.2:1 | ✅ | ✅ |
| Beige sur Noir | 12.1:1 | ✅ | ✅ |
| Noir sur Or | 8.2:1 | ✅ | ✅ |

### Vérification

```typescript
import { meetsContrastAA, getContrastRatio } from '@/lib/accessibility';

// Vérifier le contraste
const ratio = getContrastRatio('#c5a059', '#0a0a0a');
console.log(`Ratio: ${ratio.toFixed(2)}:1`); // 8.2:1

// Vérifier conformité WCAG
const isAACompliant = meetsContrastAA('#c5a059', '#0a0a0a'); // true
```

## Navigation au Clavier

### Raccourcis Globaux

| Touche | Action |
|--------|--------|
| Tab | Élément suivant |
| Shift + Tab | Élément précédent |
| Enter / Space | Activer bouton |
| Escape | Fermer modal/menu |
| Flèches | Navigation dans listes |

### Skip Link

Le site inclut un lien "Aller au contenu principal" visible au focus.

```tsx
// components/SkipLink.tsx
<a href="#main-content" className="skip-link">
  Aller au contenu principal
</a>
```

### Focus Visible

Tous les éléments interactifs ont un indicateur de focus visible :

```css
:focus-visible {
  outline: 2px solid #c5a059;
  outline-offset: 2px;
}
```

## Lecteurs d'Écran

### Annonces Live Region

```typescript
import { announce } from '@/lib/accessibility';

// Annonce polite (non interruptive)
announce('Produit ajouté au panier');

// Annonce assertive (interruptive)
announce('Erreur de paiement', 'assertive');
```

### Régions ARIA

```tsx
<header role="banner">...</header>
<nav role="navigation" aria-label="Navigation principale">...</nav>
<main id="main-content" role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Contenu Dynamique

```tsx
// Pour les mises à jour dynamiques
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Pour le chatbot
<div aria-live="polite" aria-label="Messages du chat">
  {messages.map(msg => <ChatMessage key={msg.id} {...msg} />)}
</div>
```

## Test d'Accessibilité

### Outils Automatisés

1. **axe DevTools** (extension navigateur)
   ```bash
   # Installer l'extension Chrome/Firefox
   # Ouvrir DevTools > axe
   # Analyser la page
   ```

2. **Lighthouse**
   ```bash
   # Chrome DevTools > Lighthouse > Accessibility
   # Objectif: Score > 95
   ```

3. **eslint-plugin-jsx-a11y**
   ```bash
   npm run lint  # Vérifie les règles a11y
   ```

### Test Manuel avec NVDA (Windows)

1. Télécharger NVDA : https://www.nvaccess.org/download/
2. Installer et lancer NVDA
3. Raccourcis utiles :
   - `Insert + Down` : Lire tout
   - `Tab` : Naviguer les éléments interactifs
   - `H` : Naviguer les titres
   - `Insert + F7` : Liste des liens
   - `Insert + S` : Activer/désactiver la parole

### Test Manuel avec VoiceOver (Mac)

1. Activer : `Cmd + F5`
2. Raccourcis utiles :
   - `VO + A` : Lire tout
   - `Tab` : Naviguer les éléments interactifs
   - `VO + Cmd + H` : Naviguer les titres
   - `VO + U` : Rotor (navigation rapide)

### Checklist de Test

- [ ] Navigation au clavier complète (Tab, Shift+Tab)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Escape ferme les modals et menus
- [ ] Skip link fonctionne
- [ ] Lecteur d'écran annonce correctement
- [ ] Contrastes suffisants (≥ 4.5:1)
- [ ] Images avec alt text approprié
- [ ] Formulaires avec labels
- [ ] Erreurs annoncées clairement
- [ ] Animations respectent prefers-reduced-motion

## Reduced Motion

```tsx
import { useReducedMotion } from '@/hooks/useAccessibility';

function AnimatedComponent() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Ressources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
