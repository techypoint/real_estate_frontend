import { api } from "./api";
import { fmtMonth, fmtStatus } from "./format";
import { projectSlug } from "./slug";
import type { MediaRef, Project, ProjectSummary } from "./types";

/**
 * The buyer-facing facts a card or spotlight needs, flattened out of the
 * summary + (optional) brochure content. One place decides "which photo is
 * the cover" and "how configurations read", so the homepage, the listing and
 * the spotlight never disagree.
 */
export type ProjectView = {
  reg: string;
  href: string;
  name: string;
  developer?: string;
  location?: string;
  type?: string;
  status?: string;
  tagline?: string;
  cover?: MediaRef;
  gallery: MediaRef[];
  configurations?: string;
  startingPrice?: string;
  possession?: string;
  highlights: string[];
  brochureUrl?: string;
  brochureFile?: string;
};

export function toProjectView(summary: ProjectSummary, project?: Project): ProjectView {
  const c = project?.content;
  const name = c?.marketing?.display_name || summary.project_name || summary.registration_no;
  const gallery = [...(c?.gallery ?? [])].filter((g) => g.url).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const bhk = [...new Set((c?.unit_types ?? []).map((u) => u.bhk))].sort((a, b) => a - b);

  return {
    reg: summary.registration_no,
    href: `/project/${encodeURIComponent(projectSlug(name, summary.registration_no))}`,
    name,
    // Promoter names are sometimes stored twice, ";"-joined, in two casings.
    developer: summary.promoter_name?.split(";")[0].trim() || undefined,
    location: [c?.marketing?.locality, c?.marketing?.city ?? summary.district].filter(Boolean).join(", ") || undefined,
    type: summary.project_category || summary.project_type,
    status: fmtStatus(c?.marketing?.status) || undefined,
    tagline: c?.marketing?.tagline,
    cover: gallery[0],
    gallery,
    configurations: bhk.length ? `${bhk.join(", ")} BHK` : undefined,
    startingPrice: c?.pricing?.starting_price?.display,
    possession: fmtMonth(c?.marketing?.possession_on) || undefined,
    highlights: c?.marketing?.highlights ?? [],
    brochureUrl: project?.brochure?.url,
    brochureFile: project?.brochure?.file_name,
  };
}

/**
 * Listing summaries carry no photography, so each card's brochure content is
 * fetched alongside. These are the same cached, tag-revalidated requests the
 * detail page makes, so after the first render they cost nothing; a failed
 * fetch degrades that one card to text-only rather than failing the page.
 */
export async function withProjectViews(items: ProjectSummary[]): Promise<ProjectView[]> {
  const full = await Promise.all(items.map((i) => api.getProject(i.registration_no).catch(() => undefined)));
  return items.map((i, n) => toProjectView(i, full[n]));
}
