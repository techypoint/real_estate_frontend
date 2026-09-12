import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchForm } from "@/components/SearchForm";
import { Pagination } from "@/components/Pagination";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";

const TYPES = ["Residential", "Commercial", "Mixed", "Plotting"];
const LIMIT = 24;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const q = first(sp.q);
  const district = first(sp.district);
  const type = first(sp.type);

  const parts = [type, district && `in ${district}`].filter(Boolean).join(" ");
  const title = q ? `Search: ${q}` : parts ? `${parts} projects` : "Browse Projects";

  return {
    title,
    description: `Find ${type || "real estate"} projects${district ? ` in ${district}` : ""} that fit what you're looking for — checked against their official RERA record, on AcreInfotech.`,
    // Filtered and paginated permutations are near-duplicates; point them at the
    // clean listing so ranking signals consolidate on one canonical URL.
    alternates: { canonical: "/projects" },
    robots: q || Number(first(sp.page)) > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q);
  const district = first(sp.district);
  const type = first(sp.type);
  const hasDetail = first(sp.hasDetail) === "true";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const [result, districts] = await Promise.all([
    api.listProjects({ q, district, type, hasDetail, page, limit: LIMIT }),
    api.districts(),
  ]);

  const makeHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (district) params.set("district", district);
    if (type) params.set("type", type);
    if (hasDetail) params.set("hasDetail", "true");
    if (nextPage > 1) params.set("page", String(nextPage));
    const s = params.toString();
    return s ? `/projects?${s}` : "/projects";
  };

  const activeFilters = [
    district && { label: district, key: "district" },
    type && { label: type, key: "type" },
    hasDetail && { label: "Full detail only", key: "hasDetail" },
    q && { label: `“${q}”`, key: "q" },
  ].filter(Boolean) as { label: string; key: string }[];

  const clearHref = (key: string) => {
    const params = new URLSearchParams();
    if (q && key !== "q") params.set("q", q);
    if (district && key !== "district") params.set("district", district);
    if (type && key !== "type") params.set("type", type);
    if (hasDetail && key !== "hasDetail") params.set("hasDetail", "true");
    const s = params.toString();
    return s ? `/projects?${s}` : "/projects";
  };

  return (
    <>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <span>Projects</span>
        </div>

        <SearchForm defaultQuery={q} />

        {/*
          Filters are a native GET form. Submitting navigates to a new
          server-rendered URL, so every filter combination is linkable,
          shareable, crawlable, and works without JavaScript.
        */}
        <form className="filter-bar" action="/projects" method="GET">
          {q && <input type="hidden" name="q" value={q} />}
          <div className="field">
            <label htmlFor="district">District</label>
            <select id="district" name="district" defaultValue={district}>
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Project type</label>
            <select id="type" name="type" defaultValue={type}>
              <option value="">All types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="hasDetail">Detail</label>
            <select id="hasDetail" name="hasDetail" defaultValue={hasDetail ? "true" : ""}>
              <option value="">All projects</option>
              <option value="true">Full detail captured</option>
            </select>
          </div>
          <button className="btn btn-primary filter-apply" type="submit">
            Apply
          </button>
        </form>

        <div className="section-title">
          <h2>{q ? `Results for “${q}”` : "Browse Projects"}</h2>
          <span className="count">
            {fmtNum(result.total)} project{result.total === 1 ? "" : "s"}
          </span>
        </div>

        {activeFilters.length > 0 && (
          <div className="active-filters">
            {activeFilters.map((f) => (
              <Link key={f.key} className="filter-chip" href={clearHref(f.key)}>
                {f.label}
                <Icon name="x" className="icon" />
              </Link>
            ))}
          </div>
        )}

        {result.items.length ? (
          <>
            <div className="grid">
              {result.items.map((p) => (
                <ProjectCard key={p.registration_no} project={p} />
              ))}
            </div>
            <Pagination page={result.page} pages={result.pages} makeHref={makeHref} />
          </>
        ) : (
          <div className="empty-state">
            <Icon name="inbox" />
            No projects match these filters.
            <div style={{ marginTop: "var(--sp-4)" }}>
              <Link className="btn btn-outline" href="/projects">
                Clear filters
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </>
  );
}
