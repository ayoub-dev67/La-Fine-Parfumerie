# Contributing to La Fine Parfumerie

Merci de votre intérêt pour contribuer à La Fine Parfumerie ! Ce document fournit les guidelines pour contribuer au projet.

## Table des matières

- [Code de Conduite](#code-de-conduite)
- [Prérequis](#prérequis)
- [Configuration Développement](#configuration-développement)
- [Workflow Git](#workflow-git)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Revue de Code](#revue-de-code)

## Code de Conduite

Ce projet adhère à un code de conduite respectueux. En participant, vous êtes tenu de respecter ce code.

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres contributeurs

## Prérequis

- Node.js 18.x ou supérieur
- npm 9.x ou supérieur
- Git
- PostgreSQL (ou compte Neon.tech)
- VS Code (recommandé)

### Extensions VS Code recommandées

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma"
  ]
}
```

## Configuration Développement

1. **Fork le repository**

```bash
# Via GitHub UI, cliquer sur "Fork"
```

2. **Cloner votre fork**

```bash
git clone https://github.com/VOTRE_USERNAME/perfume-shop.git
cd perfume-shop
```

3. **Ajouter l'upstream**

```bash
git remote add upstream https://github.com/lafineparfumerie/perfume-shop.git
```

4. **Installer les dépendances**

```bash
npm install
```

5. **Configurer l'environnement**

```bash
cp .env.example .env.local
# Éditer .env.local avec vos valeurs
```

6. **Setup la base de données**

```bash
npx prisma db push
npx prisma db seed
```

7. **Lancer le serveur de développement**

```bash
npm run dev
```

## Workflow Git

### Branches

- `main` - Branche de production, toujours stable
- `develop` - Branche de développement
- `feature/*` - Nouvelles fonctionnalités
- `fix/*` - Corrections de bugs
- `hotfix/*` - Corrections urgentes en production

### Créer une nouvelle feature

```bash
# Synchroniser avec upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Créer la branche feature
git checkout -b feature/ma-fonctionnalite

# Travailler sur la feature...

# Commiter les changements
git add .
git commit -m "feat: ajout de ma fonctionnalité"

# Pousser la branche
git push origin feature/ma-fonctionnalite
```

### Synchroniser votre fork

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Standards de Code

### TypeScript

- Utiliser TypeScript strict mode
- Typer explicitement les props des composants
- Éviter `any`, utiliser `unknown` si nécessaire
- Utiliser les interfaces pour les objets

```typescript
// Bon
interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

// Éviter
const ProductCard = (props: any) => { ... }
```

### React

- Utiliser les composants fonctionnels
- Utiliser les hooks React de manière appropriée
- Garder les composants petits et focalisés
- Extraire la logique dans des hooks personnalisés

```tsx
// Bon
function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button onClick={() => addToCart(product)}>
        Ajouter au panier
      </button>
    </div>
  );
}

// Éviter
class ProductCard extends React.Component { ... }
```

### Tailwind CSS

- Utiliser les classes utilitaires Tailwind
- Éviter le CSS personnalisé sauf si nécessaire
- Utiliser les variants de thème (`text-or`, `bg-noir`, etc.)
- Grouper les classes logiquement

```tsx
// Bon
<button className="px-4 py-2 bg-or text-noir rounded-lg hover:bg-or/90 transition-colors">
  Acheter
</button>

// Éviter inline styles
<button style={{ padding: '8px 16px', backgroundColor: '#c5a059' }}>
```

### Accessibilité

- Suivre WCAG 2.1 Level AA
- Utiliser les attributs ARIA appropriés
- Assurer la navigation clavier
- Tester avec un lecteur d'écran

```tsx
// Bon
<button
  aria-label="Ajouter au panier"
  onClick={handleAdd}
>
  <ShoppingCartIcon aria-hidden="true" />
</button>

// Éviter
<div onClick={handleClick}>Cliquez</div>
```

Voir [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) pour plus de détails.

### Imports

Ordre des imports :
1. Modules React
2. Modules Next.js
3. Bibliothèques tierces
4. Composants locaux
5. Hooks
6. Utilitaires/lib
7. Types
8. Styles

```typescript
// React
import { useState, useEffect } from 'react';

// Next.js
import Image from 'next/image';
import Link from 'next/link';

// Bibliothèques tierces
import { motion } from 'framer-motion';

// Composants locaux
import { ProductCard } from '@/components/ProductCard';

// Hooks
import { useCart } from '@/lib/CartContext';

// Utilitaires
import { formatPrice } from '@/lib/utils';

// Types
import type { Product } from '@/types';
```

## Tests

### Lancer les tests

```bash
# Tous les tests
npm run test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

### Écrire des tests

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Parfum',
    price: 99.00,
    // ...
  };

  it('affiche le nom du produit', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Parfum')).toBeInTheDocument();
  });

  it('appelle onAddToCart au clic', () => {
    const onAdd = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAdd} />);

    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
    expect(onAdd).toHaveBeenCalledWith(mockProduct);
  });
});
```

### Couverture minimum

- Composants : 80%
- Utilitaires : 90%
- API Routes : 80%

## Commits

### Format des commits

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

### Types de commits

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactoring de code |
| `perf` | Amélioration de performance |
| `test` | Ajout/modification de tests |
| `chore` | Maintenance |
| `ci` | CI/CD |

### Exemples

```bash
# Nouvelle fonctionnalité
git commit -m "feat(cart): ajout du code promo"

# Correction de bug
git commit -m "fix(checkout): correction du calcul TVA"

# Documentation
git commit -m "docs(readme): mise à jour des instructions d'installation"

# Refactoring
git commit -m "refactor(auth): simplification de la logique de session"
```

## Pull Requests

### Avant de soumettre

1. **Rebaser sur develop**

```bash
git fetch upstream
git rebase upstream/develop
```

2. **Vérifier le lint**

```bash
npm run lint
```

3. **Lancer les tests**

```bash
npm run test
```

4. **Vérifier le build**

```bash
npm run build
```

### Template de PR

```markdown
## Description

Description claire des changements.

## Type de changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist

- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une self-review
- [ ] J'ai commenté le code si nécessaire
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de warnings
- [ ] J'ai ajouté des tests
- [ ] Les tests existants passent
- [ ] L'accessibilité a été vérifiée

## Screenshots (si applicable)

## Notes pour les reviewers
```

## Revue de Code

### Pour les reviewers

- Être constructif et respectueux
- Expliquer le "pourquoi" des suggestions
- Approuver si les changements sont bons
- Utiliser les suggestions GitHub pour les petits changements

### Labels de review

- `approved` - PR approuvée
- `changes-requested` - Modifications requises
- `needs-discussion` - Discussion nécessaire

## Questions ?

Si vous avez des questions, n'hésitez pas à :

1. Ouvrir une issue GitHub
2. Contacter l'équipe via le canal approprié

Merci de contribuer à La Fine Parfumerie !
