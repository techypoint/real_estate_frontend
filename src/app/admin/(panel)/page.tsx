import Link from "next/link";
import type { Metadata } from "next";
import { adminFetch, type Pipeline, type PipelineRow } from "@/lib/adminApi";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { StepPill, nextStep } from "@/components/admin/Steps";
import { ProjectSearch } from "@/components/admin/ProjectSearch";
import { Pagination } from "@/components/Pagination";
import { Icon } from "@/components/IconSprite";
import { regToken } from "@/lib/slug";

export const metadata: Metadata = { title: "Projects" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const STAGES: { key: string; label: string; total: keyof Pipeline["totals"] }[] = [
  { key: "", label: "All", total: "all" },
  { key: "live", label: "Live", total: "live" },
  { key: "needs-brochure", label: "Needs brochure", total: "needsBrochure" },
  { key: "needs-area", label: "Needs area", total: "needsArea" },
  { key: "needs-content", label: "Needs content", total: "needsContent" },
  { key: "draft", label: "Content not published", total: "draft" },
];

/**
 * The pipeline board — every project and where it stands on each publishing
 * step, replacing "run the scripts, then check whether it went live".
 */
export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const scope = first(sp.scope) || "detail";
  const district = first(sp.district);
  const q = first(sp.q);
  const stage = first(sp.stage);
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const params = new URLSearchParams();
  if (scope !== "detail") params.set("scope", scope);
  if (district) params.set("district", district);
  if (q) params.set("q", q);
  const base = params.toString();
  const href = (over: Record<string, string>) => {
    const p = new URLSearchParams(base);
    for (const [k, v] of Object.entries(over)) (v ? p.set(k, v) : p.delete(k));
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  const data = await adminFetch<Pipeline>(`/pipeline?${new URLSearchParams({ scope, district, q, stage, page: String(page) })}`);

  return (
    <>
      <header className="adm-head">
        <h1>Projects</h1>
        <p>Every project and the next step to get it live. A project shows on the site once it has RERA detail and a brochure.</p>
      </header>
      <AdminFlash sp={sp} />

      <form className="adm-filters" action="/admin" method="GET">
        <div className="field">
          <label htmlFor="f-q">Search</label>
          <ProjectSearch key={q} defaultValue={q} />
        </div>
        <div className="field">
          <label htmlFor="f-district">District</label>
          <select id="f-district" name="district" defaultValue={district}>
            <option value="">All districts</option>
            {data.districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-scope">Show</label>
          <select id="f-scope" name="scope" defaultValue={scope}>
            <option value="detail">With RERA detail captured</option>
            <option value="all">All projects (incl. list-only)</option>
          </select>
        </div>
        {stage && <input type="hidden" name="stage" value={stage} />}
        <button className="btn btn-primary" type="submit">Apply</button>
      </form>

      <nav className="adm-stages" aria-label="Filter by step">
        {STAGES.map((s) => (
          <Link
            key={s.key}
            href={href({ stage: s.key, page: "" })}
            className={`filter-chip${stage === s.key ? " is-active" : ""}`}
            aria-current={stage === s.key ? "page" : undefined}
          >
            {s.label} ({data.totals[s.total] ?? 0})
          </Link>
        ))}
      </nav>

      {data.items.length ? (
        <ul className="adm-rows">
          {data.items.map((row) => (
            <ProjectRow key={row.registration_no} row={row} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <Icon name="inbox" />
          No projects match.
        </div>
      )}

      <Pagination page={data.page} pages={data.pages} makeHref={(n) => href({ stage, page: n > 1 ? String(n) : "" })} />
    </>
  );
}

function ProjectRow({ row }: { row: PipelineRow }) {
  return (
    <li className="adm-row">
      <Link className="adm-row-main" href={`/admin/projects/${regToken(row.registration_no)}`}>
        <span className="adm-row-name">{row.project_name || row.registration_no}</span>
        <span className="adm-row-meta">
          {row.registration_no} · {row.district}
        </span>
      </Link>
      <div className="adm-steps">
        <StepPill done={!!row.has_detail} label="Detail" />
        <StepPill done={row.documents > 0} label={`Docs ${row.documents}`} />
        <StepPill done={row.hasBrochure} label={row.hasBrochure ? "Brochure" : `Brochure: ${row.brochure_status ?? "not searched"}`} />
        <StepPill done={row.hasArea} label={row.hasArea ? `Area: ${row.area}` : "No area"} />
        <StepPill done={row.hasContent && row.published} label={!row.hasContent ? "No content" : row.published ? "Content" : "Content: draft"} />
        <StepPill done={row.live} label={row.live ? "Live" : "Not live"} strong />
      </div>
      <div className="adm-row-next">{nextStep(row)}</div>
    </li>
  );
}
