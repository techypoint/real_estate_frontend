import { fmtArea, unitFullName } from "@/lib/format";
import type { ProjectContent, UnitType } from "@/lib/types";
import { Icon } from "@/components/IconSprite";
import { PlanViewer } from "./PlanViewer";

const COLS = ["Tower Family", "Configuration", "Super", "Carpet"];

/**
 * One row per unit type, all of them visible at once (see the layout
 * brief — a comparison table, not a pick-one switcher). Reuses the site's
 * existing responsive table primitive (`.ptable-*`: CSS grid on desktop,
 * card-per-row on mobile) rather than a new component, for the same reason
 * every other wide table on the site uses it.
 *
 * Each row is a native <details> — zero JS for the expand/collapse itself.
 * Only what's genuinely interactive once a row is open (the 2D/3D switch,
 * the zoom-to-fullscreen on the plan image) is a client leaf.
 */
function UnitRow({ unit }: { unit: UnitType }) {
  const name = unitFullName(unit);

  return (
    <details className="cfg-row">
      <summary className="ptable-row">
        <span className="cell" data-label="Tower Family">
          <span className="cell-value">{unit.tower_family ?? "—"}</span>
        </span>
        <span className="cell" data-label="Configuration">
          <span className="cell-value">{unit.config_label || `${unit.bhk} BHK`}</span>
        </span>
        <span className="cell" data-label="Super">
          <span className="cell-value num">{fmtArea(unit.areas?.super?.sqft)} sq.ft.</span>
        </span>
        <span className="cell" data-label="Carpet">
          <span className="cell-value num">{fmtArea(unit.areas?.carpet?.sqft)} sq.ft.</span>
        </span>
        <Icon name="chevron-up" className="icon icon-sm chev" />
      </summary>

      <div className="cfg-row-expand">
        <PlanViewer
          plan2d={unit.media?.plan_2d ?? []}
          plan3d={unit.media?.plan_3d ?? []}
          tourUrl={unit.media?.tour_url}
          unitName={name}
        />
        <div className="cfg-row-facts">
          <div className="kv-list">
            {unit.areas?.built_up?.sqft !== undefined && (
              <div className="row">
                <span className="k">Built-up area</span>
                <span className="v">{fmtArea(unit.areas.built_up.sqft)} sq.ft.</span>
              </div>
            )}
            {unit.areas?.balcony?.sqft !== undefined && (
              <div className="row">
                <span className="k">Balcony area</span>
                <span className="v">{fmtArea(unit.areas.balcony.sqft)} sq.ft.</span>
              </div>
            )}
            {unit.wings?.length ? (
              <div className="row">
                <span className="k">Wing{unit.wings.length > 1 ? "s" : ""}</span>
                <span className="v">{unit.wings.join(", ")}</span>
              </div>
            ) : null}
          </div>

          {unit.is_full_floor && <div className="unit-tag">Full-floor apartment</div>}

          {/* A low-confidence source note is surfaced, not buried — see
              ACE Medalleo's transposed balcony row for why this exists. */}
          {unit.source_ref?.note && unit.source_ref.confidence !== "high" && (
            <p className="unit-note">
              <Icon name="info" className="icon icon-sm" />
              <span>{unit.source_ref.note}</span>
            </p>
          )}
        </div>
      </div>
    </details>
  );
}

export function ConfigurationsSection({ content }: { content: ProjectContent }) {
  const units = content.unit_types ?? [];
  if (!units.length) return null;

  return (
    <div className="ptable-wrap cfg-table" style={{ ["--ptable-cols" as string]: "repeat(4, minmax(110px,1fr)) 24px" }}>
      <div className="ptable-head">
        {COLS.map((c) => (
          <div key={c}>{c}</div>
        ))}
        <div aria-hidden="true" />
      </div>
      <div className="ptable-body">
        {units.map((u) => (
          <UnitRow unit={u} key={u.key} />
        ))}
      </div>
    </div>
  );
}
