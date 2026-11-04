import { notFound } from "next/navigation";
import { api, type ListParams } from "@/lib/api";
import { withProjectViews } from "@/lib/projectView";
import { ProjectCard } from "./ProjectCard";
import { Pagination } from "./Pagination";
import { Icon } from "./IconSprite";

export const LISTING_LIMIT = 24;

/**
 * Card grid + pagination for one filtered slice of the catalogue — the
 * district, area and builder pages. Same cards and the same visibility rule
 * as /projects (the Java listing endpoint applies it), just a fixed filter.
 *
 * A page number past the end 404s instead of rendering an empty "No
 * projects" page with a 200 — Google treats those as soft 404s.
 */
export async function ProjectListing({
  filter,
  page,
  basePath,
}: {
  filter: Pick<ListParams, "district" | "area" | "builder">;
  page: number;
  basePath: string;
}) {
  const result = await api.listProjects({ ...filter, page, limit: LISTING_LIMIT });
  if (page > 1 && page > result.pages) notFound();
  const views = await withProjectViews(result.items);

  if (!result.items.length) {
    return (
      <div className="empty-state">
        <Icon name="inbox" />
        No projects to show here yet.
      </div>
    );
  }

  return (
    <>
      <div className="pgrid">
        {views.map((p, i) => (
          <ProjectCard key={p.reg} project={p} priority={i < 3} />
        ))}
      </div>
      <Pagination page={result.page} pages={result.pages} makeHref={(n) => pageHref(basePath, n)} />
    </>
  );
}

/**
 * A listing page's URL — also its canonical. Each page of a paginated list is
 * its own canonical: page 2 lists different projects than page 1, and
 * pointing it at page 1 tells Google to ignore those. Page 1 is the bare
 * path, never "?page=1".
 */
export const pageHref = (basePath: string, page: number) => (page > 1 ? `${basePath}?page=${page}` : basePath);

export function pageNum(sp: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  return Math.max(1, Math.floor(Number(raw)) || 1);
}
