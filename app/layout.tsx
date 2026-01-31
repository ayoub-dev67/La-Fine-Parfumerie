import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import { QuickViewProvider } from "@/lib/QuickViewContext";
import { CompareProvider } from "@/lib/CompareContext";
import Providers from "@/components/Providers";
import { ProductQuickView } from "@/components/ProductQuickView";
import { CompareBar } from "@/components/CompareBar";
import { Chatbot } from "@/components/Chatbot";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";
import SkipLink from "@/components/SkipLink";
import Analytics from "@/components/Analytics";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
});

// Viewport configuration pour mobile
export const viewport: Viewport = {
  themeColor: "#c5a059",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://lafineparfumerie.fr"),
  title: {
    default: "La Fine Parfumerie | Strasbourg - Parfums de Luxe & Niche",
    template: "%s | La Fine Parfumerie",
  },
  description:
    "La Fine Parfumerie à Strasbourg. Collection exclusive de parfums niche et de luxe : Xerjoff, Lattafa, Carolina Herrera. Livraison France gratuite dès 100€.",
  keywords: [
    "parfum luxe strasbourg",
    "parfumerie niche",
    "xerjoff",
    "lattafa",
    "parfum femme luxe",
    "parfum homme luxe",
    "parfumerie strasbourg",
    "eau de parfum niche",
    "coffret parfum luxe",
  ],
  authors: [{ name: "La Fine Parfumerie" }],
  creator: "La Fine Parfumerie",
  publisher: "La Fine Parfumerie",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "La Fine Parfumerie",
    title: "La Fine Parfumerie | Strasbourg - Parfums de Luxe & Niche",
    description:
      "Collection exclusive de parfums niche et de luxe à Strasbourg. Xerjoff, Lattafa, Carolina Herrera. Livraison France gratuite dès 100€.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "La Fine Parfumerie - Parfums de Luxe à Strasbourg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Fine Parfumerie | Strasbourg - Parfums de Luxe & Niche",
    description:
      "Collection exclusive de parfums niche et de luxe à Strasbourg.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "votre-code-google-search-console",
  },
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },
  category: "shopping",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#c5a059" },
    ],
  },
};

// JSON-LD Organisation Schema
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "La Fine Parfumerie",
  description: "Parfumerie de luxe à Strasbourg - Parfums niche et prestige",
  url: "https://lafineparfumerie.fr",
  logo: "https://lafineparfumerie.fr/logo.png",
  image: "https://lafineparfumerie.fr/og-image.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Strasbourg",
    addressLocality: "Strasbourg",
    postalCode: "67000",
    addressCountry: "FR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.5734,
    longitude: 7.7521,
  },
  priceRange: "€€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card, Visa, Mastercard",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/lafineparfumerie",
    "https://www.facebook.com/lafineparfumerie",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Preconnect pour performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                    cookie_flags: 'SameSite=None;Secure',
                  });
                `,
              }}
            />
          </>
        )}

        {/* JSON-LD Organisation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${playfair.variable} ${montserrat.variable} font-sans`}>
        <SkipLink />
        <Providers>
          <CartProvider>
            <WishlistProvider>
              <QuickViewProvider>
                <CompareProvider>
                  <Analytics />
                  <Navbar />
                  <main id="main-content" className="min-h-screen" role="main">{children}</main>
                  <Footer />
                  <ProductQuickView />
                  <CompareBar />
                  <Chatbot />
                  <ToastProvider />
                  <PWARegister />
                </CompareProvider>
              </QuickViewProvider>
            </WishlistProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
