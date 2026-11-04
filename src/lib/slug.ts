/**
 * Project detail page URLs are "{name}-{registration no.}", all lower case —
 * descriptive for search/click-through, still uniquely resolvable because the
 * registration number is always the trailing segment.
 *
 * UP-RERA registration numbers come in two shapes in the scraped data
 * (real_estate_scripts): "UPRERAPRJ918" and, for 197 projects,
 * "UPRERAPRJ248777/03/2025". Both are upper case with no hyphen of their own,
 * so the URL form — lower case, "/" → "-" ("upreraprj248777-03-2025") — maps
 * back exactly. A "/" can't stay in the URL: it would split the path segment,
 * and encoded as %2F the backend's server rejects it.
 */

/**
 * Lowercase, ASCII, hyphen-separated. Exported because heading anchors in
 * rendered article bodies need exactly this (see lib/markdown.ts) and a second
 * near-identical implementation would eventually disagree with this one.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip diacritics (e.g. "é" -> "e") left behind by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "UPRERAPRJ248777/03/2025" → "upreraprj248777-03-2025". Also what the API accepts in a path. */
export function regToken(registrationNo: string): string {
  return registrationNo.toLowerCase().replace(/\//g, "-");
}

/** Build the canonical "/project/[slug]" segment for a project. */
export function projectSlug(name: string | undefined | null, registrationNo: string): string {
  const namePart = name ? slugify(name) : "";
  const reg = regToken(registrationNo);
  return namePart ? `${namePart}-${reg}` : reg;
}

/**
 * Recover the registration number from a "/project/[slug]" route segment, in
 * its stored form (upper case, with "/"). Any case is accepted, so the old
 * upper-case URLs still resolve and then redirect to the lower-case one.
 */
export function regFromSlug(slug: string): string {
  const m = slug.match(/(uprera[a-z]*\d+(?:-\d+-\d+)?)$/i);
  const token = m ? m[1] : slug.slice(slug.lastIndexOf("-") + 1);
  return token.toUpperCase().replace(/-/g, "/");
}
