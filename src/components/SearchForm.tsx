import { Icon } from "./IconSprite";

/**
 * A plain GET form to /projects.
 *
 * No "use client", no state, no router push — the browser submits it natively
 * and Next renders the result on the server. Search works with JavaScript
 * disabled, and this page costs zero KB of client JS to make it work. That is
 * the performance budget in CLAUDE.md doing its job.
 */
export function SearchForm({
  defaultQuery = "",
  autoFocus = false,
}: {
  defaultQuery?: string;
  autoFocus?: boolean;
}) {
  return (
    <form className="searchbar" action="/projects" method="GET" role="search">
      <div className="search-field">
        <Icon name="search" />
        <input
          type="search"
          name="q"
          defaultValue={defaultQuery}
          autoFocus={autoFocus}
          placeholder="Search project, promoter or registration no…"
          aria-label="Search projects"
        />
      </div>
      <button className="btn btn-primary" type="submit">
        Search
      </button>
    </form>
  );
}
