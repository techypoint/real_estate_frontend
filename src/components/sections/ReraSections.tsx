import { fmtBytes } from "@/lib/format";
import type { Project, ProjectDocument } from "@/lib/types";
import type { RenderedSection } from "./registry";

/**
 * The UP-RERA compliance record. All Server Components — pure data rendering.
 *
 * Section grouping follows the design brief: 7 sections rather than 11, with the
 * three bank accounts and the four land/legal blocks merged into labelled
 * sub-blocks. Everything is expanded; no accordions (see SKILL.md 2a).
 */

type Row = Record<string, string>;

/**
 * Wide RERA tables (up to 13 columns) render as card-per-row below `md` and a
 * real grid table at `md`+, from one set of markup — `data-label` drives the
 * mobile `::before` labels, which are suppressed at the breakpoint.
 */
function PTable({ rows, titleFields = [] }: { rows?: Row[]; titleFields?: string[] }) {
  if (!rows?.length) return null;
  const cols = Object.keys(rows[0]);

  return (
    <div className="ptable-wrap" style={{ ["--ptable-cols" as string]: `repeat(${cols.length}, minmax(110px,1fr))` }}>
      <div className="ptable-head">
        {cols.map((c) => (
          <div key={c}>{c}</div>
        ))}
      </div>
      <div className="ptable-body">
        {rows.map((r, i) => {
          const title = titleFields.map((f) => r[f]).filter((v) => v && v !== "undefined").join(" — ");
          return (
            <div className="ptable-row" key={i}>
              {title && <div className="ptable-title">{title}</div>}
              {cols.map((c) => (
                <div className="cell" data-label={c} key={c}>
                  <span className="cell-value">{r[c]}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KvRow({ k, v, icon }: { k: string; v?: string; icon?: string }) {
  if (!v) return null;
  return (
    <div className="row">
      <span className="k">
        {icon && (
          <svg className="icon icon-sm" aria-hidden="true">
            <use href={`#icon-${icon}`} />
          </svg>
        )}
        {k}
      </span>
      <span className="v">{v}</span>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="subsection">
      <h4 className="subhead">{title}</h4>
      {children}
    </div>
  );
}

function AccountBlock({ rows }: { rows?: Row[] }) {
  if (!rows?.length) return null;
  const valueKey = Object.keys(rows[0]).find((k) => k !== "Account Details") ?? "";
  return (
    <div className="kv-list">
      {rows.map((r, i) => (
        <div className="row" key={i}>
          <span className="k">{r["Account Details"]}</span>
          <span className="v">{r[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

function Documents({ docs }: { docs?: ProjectDocument[] }) {
  if (!docs?.length) {
    return (
      <div className="empty-state" style={{ padding: 20 }}>
        <svg className="icon" aria-hidden="true">
          <use href="#icon-inbox" />
        </svg>
        No documents captured.
      </div>
    );
  }
  return (
    <div className="doc-list">
      {docs.map((d, i) => (
        <div className="doc-item" key={d.url ?? i}>
          <span className="doc-icon">
            <svg className="icon" aria-hidden="true">
              <use href="#icon-file" />
            </svg>
          </span>
          <div className="doc-info">
            <div className="doc-name">{d.document_name || d.file_name}</div>
            <div className="doc-sub">
              {[d.file_name, d.size ? fmtBytes(d.size) : "", d.uploaded_date].filter(Boolean).join(" · ")}
            </div>
          </div>
          {d.url ? (
            <span className="doc-actions">
              <a href={d.url} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </span>
          ) : (
            <span className="badge">Unavailable</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Builds the RERA half of the section list, same shape as the content half. */
export function buildReraSections(p: Project): RenderedSection[] {
  const d = p.detail ?? {};
  const promoter = p.promoter ?? {};
  const sections: RenderedSection[] = [];

  sections.push({
    id: "sec-documents",
    title: "Documents",
    count: p.documents?.length ?? 0,
    node: <Documents docs={p.documents} />,
  });

  if (d.plan_details?.length) {
    sections.push({
      id: "sec-units",
      title: "Unit / Plan Inventory",
      count: d.plan_details.length,
      node: <PTable rows={d.plan_details} titleFields={["Block No", "Flat/ Apartment/ Shop/Plot type"]} />,
    });
  }

  sections.push({
    id: "sec-promoter",
    title: "Promoter",
    node: (
      <>
        <div className="kv-list">
          <KvRow k="Name" v={promoter.name} />
          <KvRow k="Type" v={promoter.applicant_type} />
          <KvRow k="Mobile" v={promoter.mobile} icon="phone" />
          <KvRow k="Email" v={promoter.email} icon="mail" />
          <KvRow k="Address" v={promoter.address} />
          <KvRow k="Total Projects" v={promoter.total_projects} />
          <KvRow k="Total Complaints" v={promoter.total_complaints} />
        </div>
        {p.co_promoters?.length ? (
          <Subsection title={`Co-Promoters (${p.co_promoters.length})`}>
            <>
              {p.co_promoters.map((cp, i) => (
                <div className="kv-list" style={{ marginBottom: 14 }} key={i}>
                  <KvRow k="Name" v={cp.name} />
                  <KvRow k="Type" v={cp.applicant_type} />
                  <KvRow k="Mobile" v={cp.mobile} icon="phone" />
                  <KvRow k="Email" v={cp.email} icon="mail" />
                  <KvRow k="Address" v={cp.address} />
                </div>
              ))}
            </>
          </Subsection>
        ) : null}
      </>
    ),
  });

  const hasAccounts = d.account_collection?.length || d.account_separate?.length || d.account_transaction?.length;
  if (hasAccounts) {
    sections.push({
      id: "sec-accounts",
      title: "Bank Accounts",
      node: (
        <>
          <Subsection title="Collection Account">
            <AccountBlock rows={d.account_collection} />
          </Subsection>
          <Subsection title="Separate Account">
            <AccountBlock rows={d.account_separate} />
          </Subsection>
          <Subsection title="Transaction Account">
            <AccountBlock rows={d.account_transaction} />
          </Subsection>
        </>
      ),
    });
  }

  const hasLegal = d.land_details?.length || d.khasra?.length || d.land_documents?.length || d.permits?.length;
  if (hasLegal) {
    sections.push({
      id: "sec-legal",
      title: "Land & Legal Records",
      node: (
        <>
          <Subsection title="Land Details">
            <PTable rows={d.land_details} />
          </Subsection>
          <Subsection title="Khasra Details">
            <PTable rows={d.khasra} />
          </Subsection>
          <Subsection title="Land Documents">
            <PTable rows={d.land_documents} />
          </Subsection>
          <Subsection title="Permits">
            <PTable rows={d.permits} />
          </Subsection>
        </>
      ),
    });
  }

  const hasOther = d.agents?.length || d.development_works?.length || d.registry_agreements?.length;
  if (hasOther) {
    sections.push({
      id: "sec-other",
      title: "Agents · Works · Agreements",
      node: (
        <>
          <Subsection title="Registered Agents">
            <PTable rows={d.agents} titleFields={["Agent Name"]} />
          </Subsection>
          <Subsection title="Development Works">
            <PTable rows={d.development_works} />
          </Subsection>
          <Subsection title="Registry Agreements">
            <PTable rows={d.registry_agreements} />
          </Subsection>
        </>
      ),
    });
  }

  return sections;
}
