import { Back } from "./AdminFlash";

type Action = (fd: FormData) => Promise<void>;

/** ↑ / ↓ for an ordered list (areas, builder brands) — each is its own tiny form, no client JS. */
export function MoveButtons({ id, first, last, action, back }: { id: string; first: boolean; last: boolean; action: Action; back: string }) {
  return (
    <>
      {(["up", "down"] as const).map((dir) => (
        <form key={dir} action={action}>
          <Back to={back} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="dir" value={dir} />
          <button className="btn btn-outline btn-sm" type="submit" disabled={dir === "up" ? first : last} aria-label={`Move ${dir}`}>
            {dir === "up" ? "↑" : "↓"}
          </button>
        </form>
      ))}
    </>
  );
}

/** Paste-a-JSON-list bulk add/update — also how the old data/*.json files get moved in once. */
export function ImportBox({ action, back, what, example }: { action: Action; back: string; what: string; example: string }) {
  return (
    <section className="adm-section">
      <details className="adm-edit">
        <summary>Import from JSON</summary>
        <form action={action} className="adm-form">
          <Back to={back} />
          <p className="adm-hint">
            Paste a list to add or update {what} in one go (matched by URL name; nothing is deleted). The old
            real_estate_scripts data file works as-is. Shape: <code>{example}</code>
          </p>
          <div className="field">
            <label htmlFor={`import-${what}`}>JSON</label>
            <textarea id={`import-${what}`} name="json" rows={8} required />
          </div>
          <button className="btn btn-primary" type="submit">Import</button>
        </form>
      </details>
    </section>
  );
}
