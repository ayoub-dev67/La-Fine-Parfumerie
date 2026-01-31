import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts, getCategories, getBrands } from "@/lib/products";
import ProductFilters from "@/components/ProductFilters";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collection | La Fine Parfumerie",
  description:
    "Découvrez notre collection complète de parfums niche et de luxe. Xerjoff, Lattafa, Carolina Herrera et plus encore. Filtrez par catégorie, marque et prix.",
  openGraph: {
    title: "Collection | La Fine Parfumerie",
    description:
      "Collection complète de parfums niche et de luxe à Strasbourg.",
    url: "/products",
  },
};

export const revalidate = 3600; // Revalidate every hour

// Loading skeleton
function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-noir py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-4 w-24 bg-or/20 mx-auto mb-4 animate-pulse" />
          <div className="h-12 w-64 bg-creme/10 mx-auto mb-6 animate-pulse" />
          <div className="w-16 h-px bg-or/20 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block">
            <div className="bg-noir-50 border border-or/10 p-6 h-96 animate-pulse" />
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-noir-50 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");

  const [{ products, total, totalPages, hasMore }, categories, brands] =
    await Promise.all([
      getProducts({
        page,
        limit: 20,
        category: searchParams.category,
        search: searchParams.search,
        sortBy: searchParams.sort as any,
      }),
      getCategories(),
      getBrands(),
    ]);

  // Construire les params pour la pagination
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    return `/products?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-noir py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-or text-sm uppercase tracking-widest mb-4">
            Collection
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-creme mb-6">
            Nos Parfums
          </h1>
          <div className="w-16 h-px bg-or mx-auto" />
        </div>

        {/* Nombre de résultats */}
        <div className="mb-6 text-center">
          <p className="text-gray-400 text-sm">
            {total} produit{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres et produits */}
        <ProductFilters
          products={products}
          categories={categories}
          brands={brands}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-6">
            {/* Numéros de pages */}
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="px-4 py-2 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors"
                >
                  ← Précédent
                </Link>
              )}

              <div className="flex items-center gap-2">
                {/* Première page */}
                {page > 3 && (
                  <>
                    <Link
                      href={buildPageUrl(1)}
                      className="px-4 py-2 bg-black border border-[#c5a059]/20 text-white rounded-lg hover:border-[#c5a059]/50 transition-colors"
                    >
                      1
                    </Link>
                    {page > 4 && (
                      <span className="text-gray-500 px-2">...</span>
                    )}
                  </>
                )}

                {/* Pages autour de la page actuelle */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) => p === page || p === page - 1 || p === page + 1
                  )
                  .map((p) => (
                    <Link
                      key={p}
                      href={buildPageUrl(p)}
                      className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                        p === page
                          ? "bg-[#c5a059] text-black"
                          : "bg-black border border-[#c5a059]/20 text-white hover:border-[#c5a059]/50"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}

                {/* Dernière page */}
                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && (
                      <span className="text-gray-500 px-2">...</span>
                    )}
                    <Link
                      href={buildPageUrl(totalPages)}
                      className="px-4 py-2 bg-black border border-[#c5a059]/20 text-white rounded-lg hover:border-[#c5a059]/50 transition-colors"
                    >
                      {totalPages}
                    </Link>
                  </>
                )}
              </div>

              {hasMore && (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="px-4 py-2 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors"
                >
                  Suivant →
                </Link>
              )}
            </div>

            {/* Info pagination */}
            <p className="text-gray-400 text-sm">
              Page {page} sur {totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
  };
}) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
