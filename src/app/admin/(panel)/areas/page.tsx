import type { Metadata } from "next";
import { adminFetch, type AdminArea } from "@/lib/adminApi";
import { AdminFlash, Back } from "@/components/admin/AdminFlash";
import { ImportBox, MoveButtons } from "@/components/admin/ListParts";
import { areaHref } from "@/lib/districts";
import { deleteArea, importAreas, moveArea, saveArea } from "../../actions";

export const metadata: Metadata = { title: "Areas" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * The areas master list — the buyer-facing places inside each district.
 * Replaces data/areas.json + `npm run import:areas`.
 */
export default async function AdminAreasPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { items, districts } = await adminFetch<{ items: AdminArea[]; districts: string[] }>("/areas");
  const byDistrict = new Map<string, AdminArea[]>();
  for (const a of items) byDistrict.set(a.district, [...(byDistrict.get(a.district) ?? []), a]);

  return (
    <>
      <header className="adm-head">
        <h1>Areas</h1>
        <p>
          The places buyers search for inside each district. An area gets its own page on the site once at least one live
          project is set to it. Order matters for suggestions: the first area whose pattern matches a project&rsquo;s
          address is suggested, so put narrower areas first (Greater Noida West before Greater Noida).
        </p>
      </header>
      <AdminFlash sp={sp} />

      {[...byDistrict].map(([district, areas]) => (
        <section key={district} className="adm-section">
          <h2>{district}</h2>
          <ul className="adm-list">
            {areas.map((a, i) => (
              <li key={a.id} className="adm-item">
                <div className="adm-item-head">
                  <div>
                    <strong>{a.name}</strong>
                    <span className="adm-item-meta">
                      {areaHref(a.district, a.slug)} · {a.assigned} project{a.assigned === 1 ? "" : "s"} · {a.live} live
                      {a.live > 0 ? " (page is live)" : " (no page yet)"}
                    </span>
                    <span className="adm-item-meta">Suggest when address matches: {a.match.join("  |  ") || "— (never suggested)"}</span>
                  </div>
                  <div className="adm-item-actions">
                    <MoveButtons id={a.id} first={i === 0} last={i === areas.length - 1} action={moveArea} back="/admin/areas" />
                  </div>
                </div>
                <details className="adm-edit">
                  <summary>Edit</summary>
                  <form action={saveArea} className="adm-form">
                    <Back to="/admin/areas" />
                    <input type="hidden" name="id" value={a.id} />
                    <div className="field">
                      <label htmlFor={`n-${a.id}`}>Name</label>
                      <input id={`n-${a.id}`} name="name" type="text" defaultValue={a.name} required />
                    </div>
                    <div className="field">
                      <label htmlFor={`m-${a.id}`}>Match patterns — one per line</label>
                      <textarea id={`m-${a.id}`} name="match" defaultValue={a.match.join("\n")} rows={3} />
                    </div>
                    <p className="adm-hint">The URL name ({a.slug}) can&rsquo;t change — it&rsquo;s in page URLs and saved on projects.</p>
                    <button className="btn btn-primary" type="submit">Save</button>
                  </form>
                  {a.assigned > 0 ? (
                    <p className="adm-hint">To delete this area, first change the area of its {a.assigned} project(s).</p>
                  ) : (
                    <details className="adm-confirm">
                      <summary>Delete…</summary>
                      <form action={deleteArea}>
                        <Back to="/admin/areas" />
                        <input type="hidden" name="id" value={a.id} />
                        <button className="btn btn-outline" type="submit">Yes, delete {a.name}</button>
                      </form>
                    </details>
                  )}
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="adm-section">
        <h2>Add an area</h2>
        <form action={saveArea} className="adm-form">
          <Back to="/admin/areas" />
          <div className="field">
            <label htmlFor="new-district">District</label>
            <select id="new-district" name="district" required>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="new-name">Name</label>
            <input id="new-name" name="name" type="text" placeholder="Greater Noida West" required />
          </div>
          <div className="field">
            <label htmlFor="new-slug">URL name — lower case, hyphens, can&rsquo;t be changed later</label>
            <input id="new-slug" name="slug" type="text" placeholder="greater-noida-west" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </div>
          <div className="field">
            <label htmlFor="new-match">Match patterns — one per line (optional)</label>
            <textarea id="new-match" name="match" rows={3} placeholder={"greater noida west\nnoida extension"} />
          </div>
          <button className="btn btn-primary" type="submit">Add area</button>
        </form>
      </section>

      <ImportBox action={importAreas} back="/admin/areas" what="areas" example='{ "areas": [ { "district": "…", "slug": "…", "name": "…", "match": ["…"] } ] }' />
    </>
  );
}
