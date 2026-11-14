/**
 * Helpers that keep generated titles and descriptions inside what Google shows
 * in results (about 60 and 155 characters), so the part that matters isn't
 * cut off. The root layout appends " — AcreInfotech" to every title; the
 * budget below accounts for it.
 */
const TITLE_SUFFIX_LENGTH = " — AcreInfotech".length;
const TITLE_MAX = 60;

/** Cut at a word boundary, with an ellipsis if anything was dropped. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:—-]+$/, "")}…`;
}

/**
 * `base` always stays; each extra is appended (comma-separated) only while the
 * whole title, including the site suffix, still fits.
 */
export function fitTitle(base: string, extras: Array<string | undefined | null> = []): string {
  let title = base;
  for (const extra of extras) {
    if (!extra) continue;
    const next = `${title}, ${extra}`;
    if (next.length + TITLE_SUFFIX_LENGTH > TITLE_MAX) break;
    title = next;
  }
  return title;
}

export function fitDescription(text: string, max = 155): string {
  return clip(text.replace(/\s+/g, " ").trim(), max);
}
