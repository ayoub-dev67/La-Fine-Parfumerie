import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lafineparfumerie.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/checkout",
          "/success",
          "/cancel",
          "/login",
          "/register",
          "/orders",
          "/wishlist",
          "/cart",
          "/_next/",
          "/test-*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/checkout", "/success", "/cancel"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/uploads/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
