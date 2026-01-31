"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

// Types
interface WishlistProduct {
  id: number;
  name: string;
  brand: string | null;
  price: number;
  image: string;
  volume: string | null;
  category: string;
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
}

interface WishlistItem {
  id: string;
  productId: number;
  createdAt: string;
  product: WishlistProduct;
}

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<boolean>;
  syncWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Cle localStorage pour les favoris non connectes
const LOCAL_STORAGE_KEY = "perfume-shop-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [localWishlist, setLocalWishlist] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les favoris locaux au demarrage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setLocalWishlist(JSON.parse(stored));
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    }
  }, []);

  // Sauvegarder les favoris locaux
  useEffect(() => {
    if (typeof window !== "undefined" && !session?.user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localWishlist));
    }
  }, [localWishlist, session?.user]);

  // Charger les favoris depuis l'API si connecte
  const fetchWishlist = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Erreur chargement wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  // Sync wishlist quand l'utilisateur se connecte
  const syncWishlist = useCallback(async () => {
    if (!session?.user || localWishlist.length === 0) return;

    // Migrer les favoris locaux vers la BDD
    for (const productId of localWishlist) {
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } catch (error) {
        console.error("Erreur sync wishlist:", error);
      }
    }

    // Vider les favoris locaux apres migration
    setLocalWishlist([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    // Recharger depuis la BDD
    await fetchWishlist();
  }, [session?.user, localWishlist, fetchWishlist]);

  // Charger les favoris au changement de session
  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist();
      // Sync les favoris locaux vers la BDD
      if (localWishlist.length > 0) {
        syncWishlist();
      }
    } else if (status === "unauthenticated") {
      setItems([]);
      setIsLoading(false);
    }
  }, [status, fetchWishlist, syncWishlist, localWishlist.length]);

  // Verifier si un produit est dans les favoris
  const isInWishlist = useCallback(
    (productId: number): boolean => {
      if (session?.user) {
        return items.some((item) => item.productId === productId);
      }
      return localWishlist.includes(productId);
    },
    [session?.user, items, localWishlist]
  );

  // Ajouter aux favoris
  const addToWishlist = useCallback(
    async (productId: number): Promise<boolean> => {
      if (session?.user) {
        try {
          const response = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });

          if (response.ok) {
            await fetchWishlist();
            return true;
          }
        } catch (error) {
          console.error("Erreur ajout wishlist:", error);
        }
        return false;
      } else {
        // Mode non connecte - localStorage
        if (!localWishlist.includes(productId)) {
          setLocalWishlist((prev) => [...prev, productId]);
        }
        return true;
      }
    },
    [session?.user, localWishlist, fetchWishlist]
  );

  // Retirer des favoris
  const removeFromWishlist = useCallback(
    async (productId: number): Promise<boolean> => {
      if (session?.user) {
        try {
          const response = await fetch(`/api/wishlist?productId=${productId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            setItems((prev) => prev.filter((item) => item.productId !== productId));
            return true;
          }
        } catch (error) {
          console.error("Erreur suppression wishlist:", error);
        }
        return false;
      } else {
        // Mode non connecte - localStorage
        setLocalWishlist((prev) => prev.filter((id) => id !== productId));
        return true;
      }
    },
    [session?.user]
  );

  // Toggle favori
  const toggleWishlist = useCallback(
    async (productId: number): Promise<boolean> => {
      if (isInWishlist(productId)) {
        return removeFromWishlist(productId);
      } else {
        return addToWishlist(productId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  // Calculer le nombre de favoris
  const count = session?.user ? items.length : localWishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        count,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        syncWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
