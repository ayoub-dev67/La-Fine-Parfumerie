/**
 * Google Analytics 4 - Configuration et Events
 * Documentation: https://developers.google.com/analytics/devguides/collection/ga4
 */

// Declare gtag on window
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Vérifie si GA est disponible
 */
const isGAAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID && !!window.gtag;
};

/**
 * Page view - appelé automatiquement par le composant Analytics
 */
export const pageview = (url: string): void => {
  if (!isGAAvailable()) return;

  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  });
};

/**
 * Event générique
 */
type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export const event = ({ action, category, label, value }: GtagEvent): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Types pour le e-commerce
 */
interface ProductItem {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  quantity?: number;
}

interface CartData {
  items: ProductItem[];
  total: number;
}

interface OrderData {
  id: string;
  total: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  promoCode?: string;
  discount?: number;
}

/**
 * Events E-commerce GA4
 */
export const ecommerceEvent = {
  /**
   * Vue d'un produit
   */
  viewItem: (product: ProductItem): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'view_item', {
      currency: 'EUR',
      value: product.price,
      items: [{
        item_id: String(product.id),
        item_name: product.name,
        item_brand: product.brand || 'La Fine Parfumerie',
        item_category: product.category || 'Parfum',
        price: product.price,
        quantity: 1,
      }],
    });
  },

  /**
   * Ajout au panier
   */
  addToCart: (product: ProductItem, quantity: number = 1): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'add_to_cart', {
      currency: 'EUR',
      value: product.price * quantity,
      items: [{
        item_id: String(product.id),
        item_name: product.name,
        item_brand: product.brand || 'La Fine Parfumerie',
        item_category: product.category || 'Parfum',
        price: product.price,
        quantity: quantity,
      }],
    });
  },

  /**
   * Suppression du panier
   */
  removeFromCart: (product: ProductItem, quantity: number = 1): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'remove_from_cart', {
      currency: 'EUR',
      value: product.price * quantity,
      items: [{
        item_id: String(product.id),
        item_name: product.name,
        price: product.price,
        quantity: quantity,
      }],
    });
  },

  /**
   * Vue du panier
   */
  viewCart: (cart: CartData): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'view_cart', {
      currency: 'EUR',
      value: cart.total,
      items: cart.items.map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        item_brand: item.brand || 'La Fine Parfumerie',
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  },

  /**
   * Début du checkout
   */
  beginCheckout: (cart: CartData): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'begin_checkout', {
      currency: 'EUR',
      value: cart.total,
      items: cart.items.map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  },

  /**
   * Achat confirmé
   */
  purchase: (order: OrderData): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'purchase', {
      transaction_id: order.id,
      value: order.total,
      currency: 'EUR',
      coupon: order.promoCode,
      items: order.items.map((item) => ({
        item_id: String(item.productId),
        item_name: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  },

  /**
   * Inscription utilisateur
   */
  signUp: (method: string = 'email'): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'sign_up', {
      method: method,
    });
  },

  /**
   * Connexion utilisateur
   */
  login: (method: string = 'email'): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'login', {
      method: method,
    });
  },

  /**
   * Recherche
   */
  search: (searchTerm: string): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  },

  /**
   * Ajout aux favoris
   */
  addToWishlist: (product: ProductItem): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'add_to_wishlist', {
      currency: 'EUR',
      value: product.price,
      items: [{
        item_id: String(product.id),
        item_name: product.name,
        price: product.price,
      }],
    });
  },
};
