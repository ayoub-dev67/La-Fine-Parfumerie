export interface Product {
  id: number;
  name: string;
  brand: string | null;
  description: string;
  price: number;
  volume: string | null;
  image: string;
  category: string;
  subcategory: string | null;
  stock: number;
  // Notes olfactives
  notesTop: string | null;
  notesHeart: string | null;
  notesBase: string | null;
  // Badges
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

export type ProductCategory = "Signature" | "Niche" | "Femme" | "Homme" | "Coffret";

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// Types pour les commandes
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "failed";

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  stripeSessionId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  customerEmail?: string;
}

// Types pour les avis
export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  productId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userReview?: Review | null;
}
