import type { ArticleHeading } from "@/lib/markdown";

/**
 * Table of contents for a blog post.
 *
 * Server Component, zero client JS. Two renderings of the same list:
 *  - `variant="aside"` — the plain nav that lives in the sticky desktop column.
 *  - `variant="inline"` — a native <details>, collapsed by default, for the
 *    single-column layout below 1024px. Same zero-JS <details> instinct as
 *    `.gallery-more` on the project page rather than a scripted accordion.
 *
 * Scroll-spy highlighting is deliberately absent: it needs an
 * IntersectionObserver over the whole article, which is a poor trade for a
 * highlight effect on a site with a near-zero client-JS budget.
 */
export function ArticleToc({
  headings,
  variant,
}: {
  headings: ArticleHeading[];
  variant: "aside" | "inline";
}) {
  // A single heading is not a structure worth navigating — and a post with
  // none at all must not leave an empty box behind.
  if (headings.length < 2) return null;

  const list = (
    <ol className="toc">
      {headings.map((h) => (
        <li key={h.id} className={h.depth === 3 ? "toc-l3" : undefined}>
          <a href={`#${h.id}`}>{h.text}</a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="toc-mobile">
        <summary>On this page ({headings.length})</summary>
        {list}
      </details>
    );
  }

  return (
    <nav className="toc-aside" aria-label="On this page">
      <div className="aside-title">On this page</div>
      {list}
    </nav>
  );
}
