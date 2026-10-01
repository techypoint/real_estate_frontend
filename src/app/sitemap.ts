import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { projectSlug } from "@/lib/slug";

const SITE_URL = process.env.SITE_URL ?? "https://acreinfotech.com";

/**
 * Every published project gets a sitemap entry.
 *
 * Filtered listing URLs are deliberately excluded — they are near-duplicates
 * that already carry a canonical back to /projects, and submitting them would
 * spend crawl budget on pages we do not want indexed.
 */
/** Sitemap-building sweep isn't a user-facing page, so pull full 100-item pages regardless of the site's listing page size. */
const SITEMAP_PAGE_LIMIT = 100;
const MAX_SITEMAP_BLOGS = 1000;

async function allBlogUrls(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  for (let page = 1; urls.length < MAX_SITEMAP_BLOGS; page++) {
    const result = await api.listBlogs({ page, limit: SITEMAP_PAGE_LIMIT });
    urls.push(
      ...result.items.map((b) => ({
        url: `${SITE_URL}/blog/${b.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        lastModified: b.publishedAt ? new Date(b.publishedAt) : undefined,
      })),
    );
    if (page >= result.pages) break;
  }
  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.7 },
  ];

  const [projectUrls, blogUrls] = await Promise.all([
    api
      .publishedProjectRefs()
      .then((refs) =>
        refs.map((ref) => ({
          url: `${SITE_URL}/project/${projectSlug(ref.name, ref.registration_no)}`,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
      )
      .catch(() => [] as MetadataRoute.Sitemap),
    allBlogUrls().catch(() => [] as MetadataRoute.Sitemap),
  ]);

  return [...base, ...projectUrls, ...blogUrls];
}
