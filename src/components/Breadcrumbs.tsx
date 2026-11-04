import Link from "next/link";
import { Fragment } from "react";

const SITE_URL = process.env.SITE_URL ?? "https://acreinfotech.com";

export type Crumb = { name: string; href?: string };

/**
 * The visible breadcrumb trail plus the same trail as schema.org
 * BreadcrumbList, so search results can show "acreinfotech.com › Gautam
 * Buddha Nagar › Noida" instead of the raw URL. The last crumb is the current
 * page: plain text, no link, and its JSON-LD item is the page's own URL.
 */
export function Breadcrumbs({ items, path }: { items: Crumb[]; path: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${i === items.length - 1 ? path : c.href ?? path}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      <div className="breadcrumb">
        {items.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && " / "}
            {c.href && i < items.length - 1 ? <Link href={c.href}>{c.name}</Link> : <span>{c.name}</span>}
          </Fragment>
        ))}
      </div>
    </>
  );
}
