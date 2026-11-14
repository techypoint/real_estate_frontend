import type { EntityContent } from "@/lib/types";

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * The reviewed guide / blurb, FAQ and sources for an area or builder page.
 * The text was drafted by the content pipeline and approved by a person in
 * the admin panel (see Java EntityContent); it is plain text, rendered as
 * text — paragraphs split on blank lines, never as HTML.
 *
 * Renders nothing when there is no approved text, so a page is simply the
 * data-driven page until text exists.
 */
export function EntityGuide({ title, content }: { title: string; content: EntityContent | null }) {
  if (!content) return null;

  return (
    <section className="entity-guide" aria-labelledby="entity-guide-title">
      <h2 id="entity-guide-title">{title}</h2>
      {content.text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}

      {content.faq.length > 0 && (
        <div className="entity-faq">
          <h3>Frequently asked questions</h3>
          <dl>
            {content.faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <p className="entity-sources">
        Sources:{" "}
        {content.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && ", "}
            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
              {s.label}
            </a>
          </span>
        ))}
        . Last reviewed {fmtDate(content.asOf)}.
      </p>
    </section>
  );
}
