import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import { SessionProvider } from "next-auth/react";

// Mock next/navigation
const mockPush = jest.fn();
let mockPathname = "/";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react avec controle sur la session
const mockSession = {
  user: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    image: null,
  },
  expires: "2099-01-01",
};

let mockUseSession = () => ({
  data: null as typeof mockSession | null,
  status: "unauthenticated" as "authenticated" | "unauthenticated" | "loading",
});

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Wrapper avec providers
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={null}>
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  </SessionProvider>
);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock window.scrollY
Object.defineProperty(window, "scrollY", { value: 0, writable: true });

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockPathname = "/";
    mockUseSession = () => ({
      data: null,
      status: "unauthenticated",
    });
  });

  describe("Affichage de base", () => {
    it("affiche le logo La Fine Parfumerie", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      expect(screen.getByText("La Fine")).toBeInTheDocument();
      expect(screen.getByText("Parfumerie")).toBeInTheDocument();
    });

    it("affiche les liens de navigation", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      expect(screen.getByText("Accueil")).toBeInTheDocument();
      expect(screen.getByText("Collection")).toBeInTheDocument();
      expect(screen.getByText("Signature Royale")).toBeInTheDocument();
      expect(screen.getByText("Niche")).toBeInTheDocument();
    });

    it("affiche le bouton panier", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      expect(screen.getByText("Panier")).toBeInTheDocument();
    });

    it("a le role navigation avec aria-label", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const nav = screen.getByRole("navigation", {
        name: "Navigation principale",
      });
      expect(nav).toBeInTheDocument();
    });
  });

  describe("Utilisateur non connecte", () => {
    it("affiche le lien de connexion", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      expect(screen.getByText("Connexion")).toBeInTheDocument();
    });

    it("le lien de connexion pointe vers /auth/signin", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const signInLink = screen.getByText("Connexion").closest("a");
      expect(signInLink).toHaveAttribute("href", "/auth/signin");
    });
  });

  describe("Utilisateur connecte", () => {
    beforeEach(() => {
      mockUseSession = () => ({
        data: mockSession,
        status: "authenticated",
      });
    });

    it("affiche l'avatar ou l'initiale de l'utilisateur", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      // L'initiale de "John Doe" devrait etre "J"
      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("affiche le menu utilisateur au clic", async () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const userButton = screen.getByLabelText("Menu utilisateur");
      fireEvent.click(userButton);

      await waitFor(() => {
        expect(screen.getByText("Mes favoris")).toBeInTheDocument();
        expect(screen.getByText("Mes commandes")).toBeInTheDocument();
        expect(screen.getByText("Mon compte")).toBeInTheDocument();
        expect(screen.getByText("Déconnexion")).toBeInTheDocument();
      });
    });

    it("affiche l'email de l'utilisateur dans le menu", async () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const userButton = screen.getByLabelText("Menu utilisateur");
      fireEvent.click(userButton);

      await waitFor(() => {
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });
    });
  });

  describe("Panier", () => {
    it("affiche le badge quand il y a des articles", () => {
      const cartItems = [
        { id: 1, name: "Test", price: 100, quantity: 2, image: "/test.jpg" },
      ];
      localStorageMock.setItem("perfume-shop-cart", JSON.stringify(cartItems));

      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      // Le nombre total d'articles (2) devrait s'afficher
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("ouvre le panier au clic", async () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const cartButton = screen.getByRole("button", { name: /panier/i });
      fireEvent.click(cartButton);

      await waitFor(() => {
        expect(screen.getByText("Votre Panier")).toBeInTheDocument();
      });
    });

    it("a un aria-label descriptif pour le bouton panier", () => {
      const cartItems = [
        { id: 1, name: "Test", price: 100, quantity: 3, image: "/test.jpg" },
      ];
      localStorageMock.setItem("perfume-shop-cart", JSON.stringify(cartItems));

      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const cartButton = screen.getByLabelText("Panier, 3 articles");
      expect(cartButton).toBeInTheDocument();
    });
  });

  describe("Favoris", () => {
    it("affiche le lien vers les favoris", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const wishlistLink = screen.getByLabelText("Mes favoris");
      expect(wishlistLink).toBeInTheDocument();
      expect(wishlistLink).toHaveAttribute("href", "/wishlist");
    });
  });

  describe("Menu mobile", () => {
    it("affiche le bouton menu mobile", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const menuButton = screen.getByLabelText("Ouvrir le menu");
      expect(menuButton).toBeInTheDocument();
    });

    it("ouvre le menu mobile au clic", async () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const menuButton = screen.getByLabelText("Ouvrir le menu");
      fireEvent.click(menuButton);

      await waitFor(() => {
        // Le menu mobile contient "La Fine Parfumerie"
        expect(screen.getByText("Strasbourg, France")).toBeInTheDocument();
      });
    });

    it("change l'aria-label quand le menu est ouvert", async () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const menuButton = screen.getByLabelText("Ouvrir le menu");
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByLabelText("Fermer le menu")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation active", () => {
    it("met en surbrillance le lien actif", () => {
      mockPathname = "/products";

      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      const collectionLink = screen.getByText("Collection");
      expect(collectionLink).toHaveClass("text-or");
    });
  });

  describe("Accessibilite", () => {
    it("la navigation a un role navigation", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("tous les boutons ont des labels accessibles", () => {
      render(
        <AllProviders>
          <Navbar />
        </AllProviders>
      );

      expect(screen.getByLabelText("Mes favoris")).toBeInTheDocument();
      expect(screen.getByLabelText("Ouvrir le menu")).toBeInTheDocument();
    });
  });
});
