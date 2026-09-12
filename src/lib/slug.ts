/**
 * Project detail page URLs are "{name}-{REGISTRATION_NO}" — descriptive for
 * search/click-through, still uniquely resolvable because the registration
 * number is always the trailing segment.
 *
 * Every UP-RERA registration number observed in the scraped data
 * (real_estate_scripts) is hyphen-free (`UPRERAPRJ` + digits, occasionally
 * with a stray "/" from a source-site scrape artifact) — so splitting a slug
 * on its *last* hyphen to recover the registration number is safe even for
 * that malformed minority.
 */

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip diacritics (e.g. "é" -> "e") left behind by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build the canonical "/project/[slug]" segment for a project. */
export function projectSlug(name: string | undefined | null, registrationNo: string): string {
  const namePart = name ? slugify(name) : "";
  return namePart ? `${namePart}-${registrationNo}` : registrationNo;
}

/** Recover the registration number from a "/project/[slug]" route segment. */
export function regFromSlug(slug: string): string {
  const idx = slug.lastIndexOf("-");
  return idx === -1 ? slug : slug.slice(idx + 1);
}
