import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL ?? "https://esp32-atlas.changyuansex.workers.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private surfaces must never be indexed.
        disallow: ["/admin", "/api/", "/collections"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
