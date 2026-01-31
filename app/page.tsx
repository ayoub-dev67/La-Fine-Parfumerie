import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts, getSignatureProducts, getBestSellers } from "@/lib/products";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import FeaturesSection from "@/components/FeaturesSection";
import CollectionShowcase from "@/components/CollectionShowcase";

export const metadata: Metadata = {
  title: "Accueil | La Fine Parfumerie - Strasbourg",
  description:
    "La Fine Parfumerie à Strasbourg. Collection exclusive de parfums niche et de luxe : Xerjoff, Lattafa, Carolina Herrera. Livraison France gratuite dès 100€.",
  openGraph: {
    title: "La Fine Parfumerie | Strasbourg - Parfums de Luxe & Niche",
    description:
      "Collection exclusive de parfums niche et de luxe à Strasbourg. Xerjoff, Lattafa, Carolina Herrera.",
    url: "/",
  },
};

export const revalidate = 3600; // Revalidate every hour

// Skeleton pour section produits
function ProductsSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4 animate-pulse">
          <div className="aspect-square bg-gray-800 rounded-lg" />
          <div className="h-4 bg-gray-800 rounded" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

// Composant async pour Collection Signature
async function SignatureCollection() {
  const signatureProducts = await getSignatureProducts(4);

  return (
    <CollectionShowcase
      title="Signature Royale"
      subtitle="Notre collection exclusive"
      description="Des créations uniques, sélectionnées pour leur caractère exceptionnel et leur sillage inoubliable."
      products={signatureProducts}
      ctaLink="/products?category=Signature"
      ctaText="Découvrir la collection"
    />
  );
}

// Composant async pour Produits en vedette
async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <section className="py-24 bg-noir">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-or text-xs font-sans tracking-[0.3em] uppercase">
            Sélection
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-creme mt-4 mb-6">
            Coups de Coeur
          </h2>
          <div className="w-16 h-px bg-or mx-auto" />
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/products"
            className="btn-luxury-outline"
          >
            Voir toute la collection
          </Link>
        </div>
      </div>
    </section>
  );
}

// Composant async pour Best-Sellers
async function BestSellersSection() {
  const bestSellers = await getBestSellers(4);

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-noir">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-or text-xs font-sans tracking-[0.3em] uppercase">
            Les plus demandés
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-creme mt-4 mb-6">
            Best-Sellers
          </h2>
          <div className="w-16 h-px bg-or mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {bestSellers.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-noir">
      {/* Hero Section - Full screen with parallax */}
      <HeroSection />

      {/* Collection Signature Royale avec Suspense */}
      <Suspense
        fallback={
          <div className="py-24">
            <div className="max-w-7xl mx-auto px-4">
              <ProductsSectionSkeleton />
            </div>
          </div>
        }
      >
        <SignatureCollection />
      </Suspense>

      {/* Produits en vedette avec Suspense */}
      <Suspense
        fallback={
          <section className="py-24 bg-noir">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <div className="h-4 w-24 bg-gray-800 animate-pulse rounded mx-auto mb-4" />
                <div className="h-12 w-48 bg-gray-800 animate-pulse rounded mx-auto mb-6" />
              </div>
              <ProductsSectionSkeleton />
            </div>
          </section>
        }
      >
        <FeaturedProductsSection />
      </Suspense>

      {/* Brand banner */}
      <section className="py-20 bg-noir-100 border-y border-or/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
            {["Xerjoff", "Lattafa", "Carolina Herrera", "Maison Alhambra", "Armaf"].map((brand) => (
              <span
                key={brand}
                className="text-creme/50 font-serif text-xl md:text-2xl tracking-wider"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers avec Suspense */}
      <Suspense
        fallback={
          <section className="py-24 bg-noir">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <div className="h-4 w-32 bg-gray-800 animate-pulse rounded mx-auto mb-4" />
                <div className="h-12 w-48 bg-gray-800 animate-pulse rounded mx-auto mb-6" />
              </div>
              <ProductsSectionSkeleton />
            </div>
          </section>
        }
      >
        <BestSellersSection />
      </Suspense>

      {/* Features / Pourquoi nous choisir */}
      <FeaturesSection />

      {/* Newsletter / Contact CTA */}
      <section className="py-24 bg-noir-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-or/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-or/5 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-or text-xs font-sans tracking-[0.3em] uppercase">
            Restez informé
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-creme mt-4 mb-6">
            Rejoignez notre cercle
          </h2>
          <p className="text-creme/60 mb-10 max-w-xl mx-auto">
            Recevez en avant-première nos nouvelles créations, offres exclusives
            et conseils de nos experts parfumeurs.
          </p>

          {/* Newsletter form */}
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="input-luxury flex-1 text-center sm:text-left"
            />
            <button type="submit" className="btn-luxury whitespace-nowrap">
              S&apos;inscrire
            </button>
          </form>

          <p className="text-creme/30 text-xs mt-6">
            En vous inscrivant, vous acceptez de recevoir nos communications.
            Désabonnement possible à tout moment.
          </p>
        </div>
      </section>

      {/* Store info */}
      <section className="py-20 bg-noir border-t border-or/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-4 border border-or/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-or" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-creme mb-2">Notre Boutique</h3>
              <p className="text-creme/50 text-sm">
                12 Rue des Parfumeurs<br />
                67000 Strasbourg, France
              </p>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 border border-or/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-or" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-creme mb-2">Horaires</h3>
              <p className="text-creme/50 text-sm">
                Mar - Sam : 10h - 19h<br />
                Dimanche : Sur RDV
              </p>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 border border-or/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-or" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-creme mb-2">Contact</h3>
              <p className="text-creme/50 text-sm">
                contact@lafineparfumerie.fr<br />
                +33 3 88 00 00 00
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
