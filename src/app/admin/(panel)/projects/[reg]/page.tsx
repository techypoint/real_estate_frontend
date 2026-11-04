import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { adminFetch, AdminApiError, type AdminProject } from "@/lib/adminApi";
import { AdminFlash, Back, currentPath } from "@/components/admin/AdminFlash";
import { StepPill, nextStep } from "@/components/admin/Steps";
import { AuditList } from "@/components/admin/AuditList";
import { projectSlug, regToken } from "@/lib/slug";
import { setProjectArea, setProjectPublished } from "../../../actions";

type Params = Promise<{ reg: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function load(reg: string) {
  try {
    return await adminFetch<AdminProject>(`/projects/${encodeURIComponent(reg)}`);
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { reg } = await params;
  return { title: reg.toUpperCase() };
}

export default async function AdminProjectPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ reg }, sp] = await Promise.all([params, searchParams]);
  const data = await load(reg);
  const { project: p, content } = data;
  const back = currentPath(`/admin/projects/${regToken(p.registration_no)}`, sp);
  const publicHref = `/project/${projectSlug(content?.display_name || p.project_name, p.registration_no)}`;

  const state = {
    has_detail: p.has_detail,
    hasBrochure: !!p.brochure?.has_file,
    hasArea: !!p.area,
    hasContent: !!content,
    published: !!content?.published,
    live: data.visible,
  };
  const currentArea = data.areas.find((a) => a.slug === p.area);

  return (
    <>
      <div className="breadcrumb">
        <Link href="/admin">Projects</Link> / <span>{p.registration_no}</span>
      </div>
      <header className="adm-head">
        <h1>{content?.display_name || p.project_name || p.registration_no}</h1>
        <p>
          {p.registration_no} · {p.district}
          {data.builder && <> · {data.builder.name}</>}
        </p>
        <div className="adm-steps">
          <StepPill done={data.visible} label={data.visible ? "Live on the site" : "Not live"} strong />
          {data.visible && (
            <Link className="text-link" href={publicHref} target="_blank">
              View page
            </Link>
          )}
        </div>
        <p className="adm-next">{nextStep(state)}</p>
      </header>
      <AdminFlash sp={sp} />

      <ol className="adm-checklist">
        <li>
          <h2><StepPill done={p.has_detail} label="RERA detail" /></h2>
          <p>
            {p.has_detail ? `Captured — ${p.documents} documents.` : "Not captured yet. Open this project's detail pages on up-rera.in with the browser extension."}
          </p>
        </li>

        <li>
          <h2><StepPill done={state.hasBrochure} label="Brochure" /></h2>
          {p.brochure?.has_file ? (
            <p>
              {p.brochure.file_name}
              {p.brochure.confidence && <> · match {p.brochure.confidence}</>}
              {p.brochure.source_url && (
                <>
                  {" · "}
                  <a className="text-link" href={p.brochure.source_url} target="_blank" rel="noopener noreferrer">source</a>
                </>
              )}
            </p>
          ) : (
            <p>
              {p.brochure_status ? `Search result: ${p.brochure_status.replace(/_/g, " ")}.` : "Not searched yet."} Required to go live. Finding and
              uploading brochures from here comes in phase 2.
            </p>
          )}
        </li>

        <li>
          <h2><StepPill done={state.hasArea} label="Area" /></h2>
          {data.areas.length ? (
            <form action={setProjectArea} className="adm-inline-form">
              <Back to={back} />
              <input type="hidden" name="reg" value={p.registration_no} />
              <div className="field">
                <label htmlFor="area">
                  Area in {p.district}
                  {!p.area && data.suggestion && <> — suggested from the address: {data.suggestion.name}</>}
                </label>
                <select id="area" name="area" defaultValue={p.area ?? data.suggestion?.slug ?? ""}>
                  <option value="">— none —</option>
                  {data.areas.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name}
                      {a.slug === data.suggestion?.slug ? " (suggested)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Save area</button>
            </form>
          ) : (
            <p>
              {p.district} has no areas yet — <Link className="text-link" href="/admin/areas">add them on the Areas page</Link>.
            </p>
          )}
          {p.area && !currentArea && <p className="adm-warn">Saved area &ldquo;{p.area}&rdquo; is no longer in the area list.</p>}
          <p className="adm-hint">Address on RERA: {p.project_address || "—"} · Tehsil: {p.tehsil || "—"}</p>
        </li>

        <li>
          <h2><StepPill done={state.hasContent && state.published} label="Brochure content" /></h2>
          {!content ? (
            <p>No content yet — generating it from the brochure comes in phase 2.</p>
          ) : content.published ? (
            <>
              <p>Published{content.updatedAt && <> · updated {new Date(content.updatedAt).toLocaleDateString("en-IN")}</>}.</p>
              <details className="adm-confirm">
                <summary>Unpublish…</summary>
                <form action={setProjectPublished}>
                  <Back to={back} />
                  <input type="hidden" name="reg" value={p.registration_no} />
                  <input type="hidden" name="published" value="false" />
                  <p>The page keeps its RERA sections but loses the brochure sections (photos, floor plans, prices).</p>
                  <button className="btn btn-outline" type="submit">Yes, unpublish</button>
                </form>
              </details>
            </>
          ) : (
            <form action={setProjectPublished} className="adm-inline-form">
              <Back to={back} />
              <input type="hidden" name="reg" value={p.registration_no} />
              <input type="hidden" name="published" value="true" />
              <p>Draft — check it, then publish.</p>
              <button className="btn btn-primary" type="submit">Publish content</button>
            </form>
          )}
        </li>
      </ol>

      <section className="adm-section">
        <h2>Facts</h2>
        <dl className="adm-facts">
          <dt>Promoter</dt><dd>{p.promoter_name || "—"}</dd>
          <dt>Builder page</dt><dd>{data.builder ? `${data.builder.name} (/builder/${data.builder.slug})` : "—"}</dd>
          <dt>Type</dt><dd>{p.project_type || "—"}</dd>
          <dt>Declared completion</dt><dd>{p.declared_completion_date || "—"}</dd>
        </dl>
      </section>

      <section className="adm-section">
        <h2>History</h2>
        <AuditList entries={data.history} />
      </section>
    </>
  );
}
