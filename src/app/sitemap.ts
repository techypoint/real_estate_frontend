import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { projectSlug } from "@/lib/slug";
import { areaHref, districtHref, liveAreas } from "@/lib/districts";

const SITE_URL = process.env.SITE_URL ?? "https://acreinfotech.com";

/**
 * Every visible project, district, area and builder page gets a sitemap
 * entry — the API applies the site's visibility rule, so hidden projects (and
 * districts/areas/builders with nothing visible) never reach the sitemap.
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
    { url: `${SITE_URL}/districts`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/builders`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const [projectUrls, blogUrls, districtUrls, areaUrls, builderUrls] = await Promise.all([
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
    api
      .districts()
      .then((ds) => ds.map((d) => ({ url: `${SITE_URL}${districtHref(d)}`, changeFrequency: "daily" as const, priority: 0.8 })))
      .catch(() => [] as MetadataRoute.Sitemap),
    api
      .areas()
      .then((as) =>
        liveAreas(as).map((a) => ({
          url: `${SITE_URL}${areaHref(a.district, a.slug)}`,
          changeFrequency: "daily" as const,
          priority: 0.8,
        })),
      )
      .catch(() => [] as MetadataRoute.Sitemap),
    api
      .builders()
      .then((bs) => bs.map((b) => ({ url: `${SITE_URL}/builder/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })))
      .catch(() => [] as MetadataRoute.Sitemap),
  ]);

  return [...base, ...districtUrls, ...areaUrls, ...builderUrls, ...projectUrls, ...blogUrls];
}
