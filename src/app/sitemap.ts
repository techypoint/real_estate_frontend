import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { projectSlug } from "@/lib/slug";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

/**
 * Every published project gets a sitemap entry.
 *
 * Filtered listing URLs are deliberately excluded — they are near-duplicates
 * that already carry a canonical back to /projects, and submitting them would
 * spend crawl budget on pages we do not want indexed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const refs = await api.publishedProjectRefs();
    return [
      ...base,
      ...refs.map((ref) => ({
        url: `${SITE_URL}/project/${projectSlug(ref.name, ref.registration_no)}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return base;
  }
}
