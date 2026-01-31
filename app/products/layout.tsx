import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Produits - Catalogue de Parfums de Luxe",
  description:
    "Parcourez notre catalogue complet de parfums de luxe pour homme et femme. Découvrez nos fragrances exclusives classées par catégorie. Livraison gratuite dès 50€.",
  openGraph: {
    title: "Catalogue Parfums de Luxe | Perfume Shop",
    description:
      "Parcourez notre catalogue complet de parfums de luxe pour homme et femme. Découvrez nos fragrances exclusives.",
    url: "/products",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
