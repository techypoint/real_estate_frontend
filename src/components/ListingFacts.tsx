import Link from "next/link";
import { api, type ListParams } from "@/lib/api";
import { withProjectViews, type ProjectView } from "@/lib/projectView";
import type { ProjectSummary } from "@/lib/types";

const TABLE_MAX = 30;

type Filter = Pick<ListParams, "district" | "area" | "builder">;

const years = (summary: ProjectSummary, view: ProjectView): number[] => {
  // Curated possession ("March 2031") wins; otherwise the RERA declared date ("04-01-2031").
  const text = view.possession || summary.declared_completion_date || "";
  const m = text.match(/\b(20\d\d)\b/);
  return m ? [Number(m[1])] : [];
};

const bhkList = (views: ProjectView[]): number[] =>
  [...new Set(views.flatMap((v) => (v.configurations ?? "").match(/\d+(\.\d+)?/g)?.map(Number) ?? []))].sort((a, b) => a - b);

/** RERA filings often store the promoter in capitals; show those in normal case. */
const tidy = (name: string) =>
  name === name.toUpperCase()
    ? name.toLowerCase().replace(/(^|[\s(])([a-z])/g, (_, a, b) => a + b.toUpperCase())
    : name;

const joinAnd = (items: string[]) =>
  items.length < 3 ? items.join(" and ") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/**
 * "At a glance" for a district, area or builder page: a sentence and a
 * comparison table computed from the projects themselves, so it is correct the
 * moment a project is added or changed and needs no writing. Page 1 only —
 * the later pages of a paginated list would repeat it.
 *
 * Nothing is invented: a value a project hasn't published shows as
 * "On request" / "—".
 */
export async function ListingFacts({
  filter,
  label,
  page,
  showBuilder = true,
}: {
  filter: Filter;
  /** What the page is about, e.g. "Noida" or "ATS Group". */
  label: string;
  page: number;
  showBuilder?: boolean;
}) {
  if (page > 1) return null;

  const result = await api.listProjects({ ...filter, limit: 100 });
  if (!result.items.length) return null;
  const views = await withProjectViews(result.items);

  const builders = [...new Set(views.map((v) => v.developer).filter((d): d is string => !!d))];
  const bhks = bhkList(views);
  const ys = views.flatMap((v, i) => years(result.items[i], v)).sort();

  const sentences = [
    `${label} has ${result.total} RERA-registered project${result.total === 1 ? "" : "s"} on AcreInfotech${
      showBuilder && builders.length ? `, from ${builders.length} builder${builders.length === 1 ? "" : "s"}` : ""
    }.`,
    bhks.length ? `Configurations range across ${joinAnd(bhks.map(String))} BHK.` : "",
    ys.length
      ? ys[0] === ys[ys.length - 1]
        ? `Declared completion is ${ys[0]}.`
        : `Declared completion runs from ${ys[0]} to ${ys[ys.length - 1]}.`
      : "",
  ].filter(Boolean);

  const rows = views.slice(0, TABLE_MAX);

  return (
    <section className="listing-facts" aria-labelledby="listing-facts-title">
      <h2 id="listing-facts-title">{label} at a glance</h2>
      <p>{sentences.join(" ")}</p>

      <div className="compare-scroll">
        <table className="compare-table">
          <caption className="sr-only">Projects in {label} compared</caption>
          <thead>
            <tr>
              <th scope="col">Project</th>
              {showBuilder && <th scope="col">Builder</th>}
              <th scope="col">Type</th>
              <th scope="col">Configurations</th>
              <th scope="col">Starting price</th>
              <th scope="col">Possession</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => (
              <tr key={v.reg}>
                <th scope="row">
                  <Link href={v.href}>{v.name}</Link>
                </th>
                {showBuilder && <td>{v.developer ? tidy(v.developer) : "—"}</td>}
                <td>{v.type ?? "—"}</td>
                <td>{v.configurations ?? "—"}</td>
                <td>{v.startingPrice ?? "On request"}</td>
                <td>{v.possession ?? result.items[i].declared_completion_date?.slice(-4) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="listing-facts-note">
        From the project&rsquo;s own UP-RERA filing and brochure. Prices and availability change &mdash; ask an advisor
        for the current figures.
      </p>
    </section>
  );
}
