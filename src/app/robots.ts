import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Search-result and filtered permutations are near-duplicates of
        // /projects and would burn crawl budget. AI crawlers are intentionally
        // NOT blocked: project pages are server-rendered with JSON-LD, which is
        // exactly what we want them reading.
        disallow: ["/api/", "/projects?"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
