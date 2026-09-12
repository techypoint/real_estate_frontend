import type { ProjectContent } from "@/lib/types";
import { ZoomableImage } from "./ZoomableImage";
import { Gallery } from "./Gallery";

/**
 * Brochure sections with no per-unit interactivity — gallery, amenities,
 * clubs, master plan, location. All Server Components: pure data rendering,
 * same as ReraSections. Reuses the existing primitive classes (.media-grid,
 * .tag-list, .subsection, .mini-cards, .plan-figure, .kv-list) rather than
 * inventing new ones, per the design system's "no ad hoc component" rule.
 */

/** "iconic_owners_only" -> "Iconic owners only". Never hardcode a project's
 *  own access wording — the badge must read correctly for any project. */
function formatAccess(access: string): string {
  const s = access.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * A curated 3-image teaser (order 1–3: one large + two small) leads, with the
 * rest revealed behind a zero-JS <details> — the site's convention for
 * "shown by default is a deliberate pick, not the whole set." `order` is the
 * only curation signal the schema has today (no `featured` flag); a project
 * whose brochure extraction put its best exterior shot first gets a good
 * teaser for free, but this is a convention, not an enforced one.
 *
 * Rendering itself is a client component (Gallery) — prev/next inside the
 * zoom viewer needs one shared "which photo is open" state across every
 * thumbnail, which a per-image server/client split can't give it.
 */
export function GallerySection({ content }: { content: ProjectContent }) {
  const items = [...(content.gallery ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (!items.length) return null;
  return <Gallery items={items} />;
}

/**
 * Groups and their names are per-project (the brochure's own grouping is kept
 * verbatim — see schema x-extraction), not a fixed site-wide taxonomy. A
 * project may have three groups or seven; the layout is column-per-group,
 * however many there are.
 */
export function AmenitiesSection({ content }: { content: ProjectContent }) {
  const groups = content.amenities ?? [];
  if (!groups.length) return null;

  return (
    <div className="amenity-groups">
      {groups.map((g) => (
        <div className="subsection" key={g.group}>
          <h4 className="subhead">
            {g.group}
            {g.access && g.access !== "all_residents" && (
              <span className="badge tier">{formatAccess(g.access)}</span>
            )}
          </h4>
          <ul className="tag-list">
            {g.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * The photo, if any, comes only from `club.media` — never guessed from a
 * gallery caption match. Captions in this project's own gallery turned out
 * to be internally inconsistent about which club a "clubhouse" photo
 * belongs to (see the schema changelog for 1.2.0), which is exactly why that
 * guess doesn't belong in a shared component serving 1,119 projects.
 */
export function ClubsSection({ content }: { content: ProjectContent }) {
  const clubs = content.clubs ?? [];
  if (!clubs.length) return null;

  return (
    <div className="mini-cards">
      {clubs.map((c, i) => {
        const photo = c.media?.[0];
        return (
        <div className="mini-card" key={c.name ?? i}>
          {photo?.url && (
            <ZoomableImage m={photo} alt={photo.alt || c.name} sizes="(min-width:1024px) 340px, (min-width:600px) 45vw, 92vw" />
          )}
          <div className="mini-card-body">
            <div className="mini-card-title">
              {c.name}
              {c.access && c.access !== "all_residents" && (
                <span className="badge tier">{formatAccess(c.access)}</span>
              )}
            </div>
            {(c.size_sqft || c.count) && (
              <div className="kv-list" style={{ marginTop: "var(--sp-3)" }}>
                {c.size_sqft && (
                  <div className="row">
                    <span className="k">Size</span>
                    <span className="v">{c.size_sqft.toLocaleString("en-IN")} sq.ft.</span>
                  </div>
                )}
                {c.count !== undefined && (
                  <div className="row">
                    <span className="k">Count</span>
                    <span className="v">{c.count}</span>
                  </div>
                )}
              </div>
            )}
            {c.note && <p>{c.note}</p>}
          </div>
        </div>
        );
      })}
    </div>
  );
}

export function MasterPlanSection({ content }: { content: ProjectContent }) {
  const plan = content.master_plan?.[0];
  if (!plan?.url) return null;

  return (
    <figure className="plan-figure">
      <ZoomableImage m={plan} alt={plan.alt || plan.label || "Master plan"} sizes="(min-width:1024px) 860px, 100vw" />
      {plan.label && <figcaption>{plan.label}</figcaption>}
    </figure>
  );
}

const CATEGORY_ORDER = ["road", "metro", "railway", "airport", "office", "hospital", "mall", "school", "other"];
const CATEGORY_LABELS: Record<string, string> = {
  road: "Roads & Expressways",
  metro: "Metro",
  railway: "Railway",
  airport: "Airports",
  office: "Corporate & IT",
  hospital: "Healthcare",
  mall: "Retail & Leisure",
  school: "Education",
  other: "Other",
};

function fmtDistance(item: { minutes?: number; distance_km?: number }): string {
  const parts: string[] = [];
  if (item.distance_km !== undefined) parts.push(`${item.distance_km} km`);
  if (item.minutes !== undefined) parts.push(`~${item.minutes} min`);
  return parts.join(" · ");
}

export function LocationSection({ content }: { content: ProjectContent }) {
  const map = content.location_map?.[0];
  const items = content.connectivity ?? [];

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    rows: items.filter((it) => (it.category ?? "other") === cat),
  })).filter((g) => g.rows.length);

  if (!map?.url && !groups.length) return null;

  return (
    <>
      {map?.url && (
        <figure className="plan-figure" style={{ marginBottom: groups.length ? "var(--sp-6)" : 0 }}>
          <ZoomableImage m={map} alt={map.alt || map.label || "Location map"} sizes="(min-width:1024px) 860px, 100vw" />
          {map.label && <figcaption>{map.label}</figcaption>}
        </figure>
      )}

      {groups.map((g) => (
        <div className="subsection" key={g.cat}>
          <h4 className="subhead">{CATEGORY_LABELS[g.cat] ?? g.cat}</h4>
          <div className="kv-list">
            {g.rows.map((it) => (
              <div className="row" key={it.name}>
                <span className="k">{it.name}</span>
                <span className="v">{fmtDistance(it)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
