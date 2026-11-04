import type { Metadata } from "next";
import { adminFetch, type AdminBuilder } from "@/lib/adminApi";
import { AdminFlash, Back } from "@/components/admin/AdminFlash";
import { ImportBox, MoveButtons } from "@/components/admin/ListParts";
import { deleteBuilder, importBuilders, moveBuilder, saveBuilder } from "../../actions";

export const metadata: Metadata = { title: "Builders" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Builder brands — group the many legal entities a brand files under on
 * UP-RERA ("Gaursons Realtech Pvt Ltd", "Gaursons Hi-Tech…") into one
 * builder page. Promoters that match no brand still get a page under their
 * own cleaned company name. Replaces data/builders.json + `npm run import:builders`.
 */
export default async function AdminBuildersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { items } = await adminFetch<{ items: AdminBuilder[] }>("/builders");

  return (
    <>
      <header className="adm-head">
        <h1>Builder brands</h1>
        <p>
          A project belongs to the first brand, top to bottom, whose pattern matches its lead promoter&rsquo;s name
          (lower case, &ldquo;pvt&rdquo; → &ldquo;private&rdquo;, &ldquo;ltd&rdquo; → &ldquo;limited&rdquo;, punctuation → spaces). Put
          narrower brands first.
        </p>
      </header>
      <AdminFlash sp={sp} />

      <div className="notice">
        <span>
          Adding or deleting a brand changes builder page URLs (e.g. /builder/gaursons-realtech → /builder/gaursons). Fine
          today; once builder pages are indexed by Google, tell Claude so the old URL gets a redirect (Task 2, issue 7).
        </span>
      </div>

      <section className="adm-section">
        <ul className="adm-list">
          {items.map((b, i) => (
            <li key={b.id} className="adm-item">
              <div className="adm-item-head">
                <div>
                  <strong>{b.name}</strong>
                  <span className="adm-item-meta">/builder/{b.slug} · {b.live} live project{b.live === 1 ? "" : "s"}</span>
                  <span className="adm-item-meta">Matches: {b.match.join("  |  ")}</span>
                </div>
                <div className="adm-item-actions">
                  <MoveButtons id={b.id} first={i === 0} last={i === items.length - 1} action={moveBuilder} back="/admin/builders" />
                </div>
              </div>
              <details className="adm-edit">
                <summary>Edit</summary>
                <form action={saveBuilder} className="adm-form">
                  <Back to="/admin/builders" />
                  <input type="hidden" name="id" value={b.id} />
                  <div className="field">
                    <label htmlFor={`n-${b.id}`}>Name</label>
                    <input id={`n-${b.id}`} name="name" type="text" defaultValue={b.name} required />
                  </div>
                  <div className="field">
                    <label htmlFor={`m-${b.id}`}>Match patterns — one per line</label>
                    <textarea id={`m-${b.id}`} name="match" defaultValue={b.match.join("\n")} rows={3} required />
                  </div>
                  <button className="btn btn-primary" type="submit">Save</button>
                </form>
                <details className="adm-confirm">
                  <summary>Delete…</summary>
                  <form action={deleteBuilder}>
                    <Back to="/admin/builders" />
                    <input type="hidden" name="id" value={b.id} />
                    <p>Its projects go back to builder pages under their own company names.</p>
                    <button className="btn btn-outline" type="submit">Yes, delete {b.name}</button>
                  </form>
                </details>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="adm-section">
        <h2>Add a brand</h2>
        <form action={saveBuilder} className="adm-form">
          <Back to="/admin/builders" />
          <div className="field">
            <label htmlFor="new-name">Name</label>
            <input id="new-name" name="name" type="text" placeholder="Gaursons (Gaurs Group)" required />
          </div>
          <div className="field">
            <label htmlFor="new-slug">URL name — lower case, hyphens, can&rsquo;t be changed later</label>
            <input id="new-slug" name="slug" type="text" placeholder="gaursons" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </div>
          <div className="field">
            <label htmlFor="new-match">Match patterns — one per line</label>
            <textarea id="new-match" name="match" rows={3} placeholder={"\\bgaursons\\b\n\\bgaur sons\\b"} required />
          </div>
          <button className="btn btn-primary" type="submit">Add brand</button>
        </form>
      </section>

      <ImportBox action={importBuilders} back="/admin/builders" what="builders" example='{ "builders": [ { "slug": "…", "name": "…", "match": ["…"] } ] }' />
    </>
  );
}
