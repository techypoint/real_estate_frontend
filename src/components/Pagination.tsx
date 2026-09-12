import Link from "next/link";

/**
 * Server-rendered pagination as real links.
 *
 * Anchors rather than buttons so crawlers can walk the whole catalogue and
 * users can open a page in a new tab — a listing that paginates via JS is
 * invisible to search engines, which for this site is the business.
 */
export function Pagination({
  page,
  pages,
  makeHref,
}: {
  page: number;
  pages: number;
  makeHref: (page: number) => string;
}) {
  if (pages <= 1) return null;

  // A compact window around the current page, always including first and last.
  const span = 2;
  const nums = new Set<number>([1, pages]);
  for (let i = page - span; i <= page + span; i++) {
    if (i >= 1 && i <= pages) nums.add(i);
  }
  const ordered = [...nums].sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  ordered.forEach((n, i) => {
    if (i > 0 && n - ordered[i - 1] > 1) items.push("gap");
    items.push(n);
  });

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} rel="prev" aria-label="Previous page">
          Prev
        </Link>
      ) : (
        <span aria-disabled="true" className="pg-disabled">
          Prev
        </span>
      )}

      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="pg-gap">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={makeHref(item)}
            className={item === page ? "active" : undefined}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Link>
        )
      )}

      {page < pages ? (
        <Link href={makeHref(page + 1)} rel="next" aria-label="Next page">
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className="pg-disabled">
          Next
        </span>
      )}
    </nav>
  );
}
