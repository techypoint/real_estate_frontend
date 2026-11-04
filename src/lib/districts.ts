import { api } from "./api";
import { slugify } from "./slug";
import type { AreaSummary } from "./types";

/**
 * District and area page URLs.
 *
 * Districts are named exactly as UP-RERA names them ("Gautam Buddha Nagar")
 * everywhere on the site — URL, breadcrumb, filters — and the list grows as
 * real_estate_scripts imports new districts, so slugs are derived, never
 * hard-coded, and a new district gets its page with no code change.
 *
 * Buyer-facing places inside a district (Noida, Yamuna Expressway, Jewar…)
 * are areas, from the areas master list (real_estate_scripts/data/areas.json,
 * served by GET /api/areas). An area slug is unique only within its district,
 * so area URLs nest under the district: /district/gautam-buddha-nagar/noida.
 */
export const districtSlug = (district: string) => slugify(district);

export const districtHref = (district: string) => `/district/${districtSlug(district)}`;

export const areaHref = (district: string, areaSlug: string) => `${districtHref(district)}/${areaSlug}`;

/**
 * The district a /district/[slug] URL names, or undefined. The districts list
 * comes from the API, which applies the site's visibility rule, so a district
 * resolves as soon as its first project goes live and an empty one 404s.
 */
export async function resolveDistrict(slug: string): Promise<string | undefined> {
  const districts = await api.districts();
  return districts.find((d) => districtSlug(d) === slug);
}

/** Areas that have at least one visible project — the only ones with a page. */
export const liveAreas = (areas: AreaSummary[], district?: string) =>
  areas.filter((a) => a.projectCount > 0 && (!district || a.district === district));
