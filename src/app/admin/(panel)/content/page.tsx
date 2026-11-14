import type { Metadata } from "next";
import { adminFetch, type AdminContentItem, type ContentDoc } from "@/lib/adminApi";
import { AdminFlash, Back } from "@/components/admin/AdminFlash";
import { approveContent, discardContent, saveContentDraft, unpublishContent } from "../../actions";

export const metadata: Metadata = { title: "Page text" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const faqText = (d: ContentDoc) => d.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
const sourcesText = (d: ContentDoc) => d.sources.map((s) => `${s.label} | ${s.url}`).join("\n");

/**
 * Review queue for generated area and builder text. The content pipeline only
 * ever writes drafts; approving here is the only way text reaches the public
 * page. Approve saves what's on screen first, so the text that was read is the
 * text that goes live.
 */
export default async function AdminContentPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { items } = await adminFetch<{ items: AdminContentItem[] }>("/content/pending");
  const waiting = items.filter((i) => i.draft);
  const liveOnly = items.filter((i) => !i.draft && i.approved);

  return (
    <>
      <header className="adm-head">
        <h1>Page text</h1>
        <p>
          Guides, FAQs and builder notes drafted for area and builder pages. Check every fact against its source, edit
          anything wrong, then approve. Nothing goes on the site until you do.
        </p>
      </header>
      <AdminFlash sp={sp} />

      <section className="adm-section">
        <h2>Waiting for review ({waiting.length})</h2>
        {waiting.length === 0 && <p className="adm-hint">No drafts waiting.</p>}
        <ul className="adm-list">
          {waiting.map((it) => {
            const d = it.draft!;
            const key = `${it.kind}-${it.district ?? ""}-${it.slug}`;
            return (
              <li key={key} className="adm-item">
                <div className="adm-item-head">
                  <div>
                    <strong>{it.name}</strong>
                    <span className="adm-item-meta">
                      {it.kind}
                      {it.district ? ` · ${it.district}` : ""} · drafted {d.savedAt?.slice(0, 10)} by {d.savedBy}
                      {it.approved ? " · replaces live text" : ""}
                    </span>
                  </div>
                </div>
                <form className="adm-form adm-content-form">
                  <Back to="/admin/content" />
                  <input type="hidden" name="kind" value={it.kind} />
                  <input type="hidden" name="district" value={it.district ?? ""} />
                  <input type="hidden" name="slug" value={it.slug} />
                  <div className="field">
                    <label htmlFor={`t-${key}`}>Text (blank line between paragraphs, plain text)</label>
                    <textarea id={`t-${key}`} name="text" defaultValue={d.text} rows={10} required />
                  </div>
                  <div className="field">
                    <label htmlFor={`f-${key}`}>FAQ — “Q: …” then “A: …”, blank line between</label>
                    <textarea id={`f-${key}`} name="faq" defaultValue={faqText(d)} rows={8} />
                  </div>
                  <div className="field">
                    <label htmlFor={`s-${key}`}>Sources — “Label | https://…” one per line</label>
                    <textarea id={`s-${key}`} name="sources" defaultValue={sourcesText(d)} rows={4} required />
                  </div>
                  <div className="field">
                    <label htmlFor={`a-${key}`}>Facts checked as of</label>
                    <input id={`a-${key}`} name="asOf" type="text" defaultValue={d.asOf} pattern="\d{4}-\d{2}-\d{2}" required />
                  </div>
                  <div className="adm-actions-row">
                    <button className="btn btn-primary" type="submit" formAction={approveContent}>Approve &amp; publish</button>
                    <button className="btn btn-outline" type="submit" formAction={saveContentDraft}>Save edits</button>
                    <button className="btn btn-outline" type="submit" formAction={discardContent} formNoValidate>Discard draft</button>
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="adm-section">
        <h2>Live on the site ({items.filter((i) => i.approved).length})</h2>
        {items.every((i) => !i.approved) && <p className="adm-hint">Nothing live yet.</p>}
        <ul className="adm-list">
          {[...waiting.filter((i) => i.approved), ...liveOnly].map((it) => {
            const a = it.approved!;
            return (
              <li key={`live-${it.kind}-${it.district ?? ""}-${it.slug}`} className="adm-item">
                <div className="adm-item-head">
                  <div>
                    <strong>{it.name}</strong>
                    <span className="adm-item-meta">
                      {it.kind}
                      {it.district ? ` · ${it.district}` : ""} · approved {a.approvedAt?.slice(0, 10)} by {a.approvedBy} · facts as of {a.asOf}
                    </span>
                  </div>
                  <form action={unpublishContent} className="adm-item-actions">
                    <Back to="/admin/content" />
                    <input type="hidden" name="kind" value={it.kind} />
                    <input type="hidden" name="district" value={it.district ?? ""} />
                    <input type="hidden" name="slug" value={it.slug} />
                    <button className="btn btn-outline btn-sm" type="submit">Take down</button>
                  </form>
                </div>
                <details className="adm-edit">
                  <summary>Show live text</summary>
                  {a.text.split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
