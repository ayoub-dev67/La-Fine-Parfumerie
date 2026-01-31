import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/link AVANT d'importer le composant
jest.mock('next/link', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }, ref: React.Ref<HTMLAnchorElement>) => {
      return React.createElement('a', { href, ref, ...props }, children);
    }),
  };
});

// Mock next/image
jest.mock('next/image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
      return React.createElement('img', { src, alt, ...props });
    },
  };
});

import ProductCard from '@/components/ProductCard';

// Mock du contexte Cart
const mockAddToCart = jest.fn();
jest.mock('@/lib/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    items: [],
    getTotalItems: () => 0,
  }),
}));

// Mock du contexte Wishlist
jest.mock('@/lib/WishlistContext', () => ({
  useWishlist: () => ({
    items: [],
    count: 0,
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: () => false,
  }),
}));

// Mock WishlistButton composant
jest.mock('@/components/WishlistButton', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

const mockProduct = {
  id: 1,
  name: 'Parfum Test',
  brand: 'Marque Test',
  description: 'Description test',
  price: 99.99,
  image: '/test-image.jpg',
  category: 'Niche',
  stock: 10,
  volume: '100ml',
  notesTop: 'Bergamote, Citron',
  notesHeart: 'Rose, Jasmin',
  notesBase: 'Musc, Bois',
  isNew: true,
  isBestSeller: false,
  isFeatured: false,
  createdAt: new Date(),
};

describe('ProductCard', () => {
  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  it('affiche le nom du produit', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Parfum Test')).toBeInTheDocument();
  });

  it('affiche la marque du produit', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Marque Test')).toBeInTheDocument();
  });

  it('affiche le prix formaté', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/99.99/)).toBeInTheDocument();
  });

  it('affiche le badge Nouveau pour les nouveaux produits', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
  });

  it('affiche "En stock" quand stock > 5', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('En stock')).toBeInTheDocument();
  });

  it('affiche le stock restant quand stock <= 5', () => {
    const lowStockProduct = { ...mockProduct, stock: 3 };
    render(<ProductCard product={lowStockProduct} />);
    expect(screen.getByText('3 restants')).toBeInTheDocument();
  });

  it('affiche "Épuisé" quand stock = 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByText('Épuisé')).toBeInTheDocument();
  });

  it('le bouton ajouter au panier est désactivé si stock = 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);
    const button = screen.getByRole('button', { name: /rupture de stock/i });
    expect(button).toBeDisabled();
  });

  it('a un lien vers la page produit', () => {
    render(<ProductCard product={mockProduct} />);
    const links = screen.getAllByRole('link');
    const productLink = links.find(link => link.getAttribute('href') === '/products/1');
    expect(productLink).toBeInTheDocument();
  });

  it('affiche le volume du produit', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('100ml')).toBeInTheDocument();
  });

  it('affiche les notes de tête', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Bergamote, Citron')).toBeInTheDocument();
  });

  it('affiche le badge Best-seller', () => {
    const bestSellerProduct = { ...mockProduct, isNew: false, isBestSeller: true };
    render(<ProductCard product={bestSellerProduct} />);
    expect(screen.getByText('Best-seller')).toBeInTheDocument();
  });

  it('affiche le badge Coup de coeur', () => {
    const featuredProduct = { ...mockProduct, isNew: false, isFeatured: true };
    render(<ProductCard product={featuredProduct} />);
    expect(screen.getByText('Coup de coeur')).toBeInTheDocument();
  });

  it('a un alt text descriptif pour l\'image', () => {
    render(<ProductCard product={mockProduct} />);
    const img = screen.getByAltText('Parfum Test - Marque Test 100ml');
    expect(img).toBeInTheDocument();
  });
});
