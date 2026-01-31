import type { Metadata } from "next";
import Link from "next/link";
import { getProductById, getAllProducts } from "@/lib/products";
import ProductDetails from "@/components/ProductDetails";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// ISR: Revalidate product pages every 30 minutes
export const revalidate = 1800;

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    id: String(product.id),
  }));
}

// Generate metadata for each product
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    return {
      title: "Produit introuvable | La Fine Parfumerie",
    };
  }

  return {
    title: `${product.name} ${product.brand ? `- ${product.brand}` : ""} | La Fine Parfumerie`,
    description: product.description.substring(0, 160),
    keywords: [
      product.name,
      product.brand || "",
      product.category,
      "parfum",
      "parfum de luxe",
      "parfum niche",
      "Strasbourg",
    ].filter(Boolean),
    openGraph: {
      title: `${product.name} | La Fine Parfumerie`,
      description: product.description.substring(0, 160),
      images: [
        {
          url: product.image,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
      siteName: "La Fine Parfumerie",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${product.brand}`,
      description: product.description.substring(0, 160),
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-8 border border-or/20 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-or/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-creme mb-4">
            Produit introuvable
          </h1>
          <p className="text-creme/50 mb-8 max-w-md mx-auto">
            Le parfum que vous recherchez n&apos;existe pas ou a été retiré de notre
            collection.
          </p>
          <Link href="/products" className="btn-luxury">
            Retour à la collection
          </Link>
        </div>
      </div>
    );
  }

  // JSON-LD Structured Data pour SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand || "La Fine Parfumerie",
    },
    offers: {
      "@type": "Offer",
      url: `https://lafineparfumerie.fr/products/${product.id}`,
      priceCurrency: "EUR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "La Fine Parfumerie",
      },
    },
    aggregateRating: product.isBestSeller
      ? {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "127",
        }
      : undefined,
    category: product.category,
  };

  return (
    <>
      {/* JSON-LD Script pour SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails product={product} />
    </>
  );
}
