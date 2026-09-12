import type { CustomSection } from "@/lib/types";
import { ZoomableImage } from "./ZoomableImage";

/**
 * Primitive renderers for `custom_sections` — data-only, no code per section.
 *
 * Adding one of these to a project's content JSON produces a real page section
 * with zero frontend changes. That is what keeps the "insert data, get UI"
 * promise true for the long tail that varies per builder.
 */
export const PRIMITIVE_TYPES = ["kv", "table", "cards", "gallery", "stats", "prose", "list"] as const;

type KV = { k: string; v: string };
type TableData = { columns: string[]; rows: (string | number)[][] };
type Stat = { value: string; label: string };
type ListGroup = { group: string; items: string[] };
type Card = { title: string; body?: string; media?: { url: string; alt?: string } };
type Media = { url: string; alt?: string; caption?: string };

export function CustomBlock({ section }: { section: CustomSection }) {
  const d = section.data;

  switch (section.type) {
    case "kv":
      return (
        <div className="kv-list">
          {(d as KV[]).map((r, i) => (
            <div className="row" key={i}>
              <span className="k">{r.k}</span>
              <span className="v">{r.v}</span>
            </div>
          ))}
        </div>
      );

    case "table": {
      const t = d as TableData;
      if (!t?.rows?.length) return null;
      return (
        <div className="ptable-wrap" style={{ ["--ptable-cols" as string]: `repeat(${t.columns.length}, minmax(110px,1fr))` }}>
          <div className="ptable-head">
            {t.columns.map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
          <div className="ptable-body">
            {t.rows.map((row, i) => (
              <div className="ptable-row" key={i}>
                {row.map((cell, j) => (
                  <div className="cell" data-label={t.columns[j]} key={j}>
                    <span className="cell-value">{cell}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "stats":
      return (
        <div className="stat-strip">
          {(d as Stat[]).map((s, i) => (
            <div className="stat-cell" key={i}>
              <span className="num">{s.value}</span>
              <span className="label">{s.label}</span>
            </div>
          ))}
        </div>
      );

    case "list":
      return (
        <>
          {(d as ListGroup[]).map((g) => (
            <div className="subsection" key={g.group}>
              <h4 className="subhead">{g.group}</h4>
              <ul className="tag-list">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      );

    case "cards":
      return (
        <div className="mini-cards">
          {(d as Card[]).map((c, i) => (
            <div className="mini-card" key={i}>
              {c.media?.url && (
                <ZoomableImage m={c.media} alt={c.media.alt || c.title} sizes="(min-width:1024px) 340px, (min-width:600px) 45vw, 92vw" />
              )}
              <div className="mini-card-body">
                <div className="mini-card-title">{c.title}</div>
                {c.body && <p>{c.body}</p>}
              </div>
            </div>
          ))}
        </div>
      );

    case "gallery":
      return (
        <div className="media-grid">
          {(d as Media[]).map((m, i) => (
            <figure key={i}>
              <ZoomableImage m={m} alt={m.alt || m.caption || ""} sizes="(min-width:768px) 300px, 92vw" />
              {m.caption && <figcaption>{m.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );

    case "prose":
      return <p className="prose">{(d as { text: string }).text}</p>;

    default:
      return null;
  }
}
