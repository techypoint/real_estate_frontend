import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { ProjectCard } from "@/components/ProjectCard";
import { withProjectViews } from "@/lib/projectView";
import { Pagination } from "@/components/Pagination";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";
import { SourceNote } from "@/components/SourceNote";

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
    description: `Find ${type || "real estate"} projects${district ? ` in ${district}` : ""} across Uttar Pradesh that fit what you're looking for — floor plans, pricing and amenities on AcreInfotech.`,
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
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const [result, districts] = await Promise.all([
    api.listProjects({ q, district, type, page, limit: LIMIT }),
    api.districts(),
  ]);

  const views = await withProjectViews(result.items);

  const makeHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (district) params.set("district", district);
    if (type) params.set("type", type);
    if (nextPage > 1) params.set("page", String(nextPage));
    const s = params.toString();
    return s ? `/projects?${s}` : "/projects";
  };

  const activeFilters = [
    district && { label: district, key: "district" },
    type && { label: type, key: "type" },
    q && { label: `“${q}”`, key: "q" },
  ].filter(Boolean) as { label: string; key: string }[];

  const clearHref = (key: string) => {
    const params = new URLSearchParams();
    if (q && key !== "q") params.set("q", q);
    if (district && key !== "district") params.set("district", district);
    if (type && key !== "type") params.set("type", type);
    const s = params.toString();
    return s ? `/projects?${s}` : "/projects";
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Projects</span>
          </div>
          <span className="eyebrow">Homes across Uttar Pradesh</span>
          <h1>{q ? <>Results for &ldquo;{q}&rdquo;</> : "Find a project that fits."}</h1>
          <p>
            {fmtNum(result.total)} project{result.total === 1 ? "" : "s"} with floor plans, pricing and
            amenities — filter by district and type, or search by name.
          </p>

          {/*
            One native GET form for search + filters. Submitting navigates to a
            new server-rendered URL, so every combination is linkable,
            shareable, crawlable, and works without JavaScript.
          */}
          <form className="hero-search" action="/projects" method="GET" role="search">
            <label className="hs-field hs-q">
              <span className="hs-label">Search</span>
              <span className="hs-input">
                <Icon name="search" className="icon icon-sm" />
                <input type="search" name="q" defaultValue={q} placeholder="Project, developer or locality" aria-label="Search projects" />
              </span>
            </label>
            <label className="hs-field">
              <span className="hs-label">District</span>
              <select name="district" defaultValue={district} aria-label="District">
                <option value="">All districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="hs-field">
              <span className="hs-label">Property type</span>
              <select name="type" defaultValue={type} aria-label="Property type">
                <option value="">All types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary hs-submit" type="submit">
              <Icon name="search" className="icon icon-sm" />
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="container listing-body">
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
            <div className="pgrid">
              {views.map((p, i) => (
                <ProjectCard key={p.reg} project={p} priority={i < 3} />
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

        <SourceNote />
      </div>

      <BottomNav />
    </>
  );
}
