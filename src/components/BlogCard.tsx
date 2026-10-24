import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/lib/types";
import { Icon } from "./IconSprite";

/** Same 200 wpm basis as renderArticle, on raw Markdown — close enough for a card. */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
}

const ACRONYMS = new Set(["up", "rera", "rbi", "emi", "eblr", "qpr", "ncr", "bhk", "ca"]);

/** Tags arrive both as "UP RERA" and "up-rera" — show slugs as words, keeping acronyms upper-case. */
export function fmtTag(t: string): string {
  if (t.includes(" ") || /[A-Z]/.test(t)) return t;
  return t
    .split("-")
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * Listing card for a blog post. Server Component — a link, text and an
 * (optionally absent) image need no client JS.
 *
 * A post with no hero image is meant to publish text-only rather than
 * substitute a stock photo (see BlogHeroImage), so instead of an empty slot
 * the card gets a typographic cover built from the post's own lead tag —
 * the same size as a photo, so the grid stays even.
 */
export function BlogCard({ blog, featured = false, priority = false }: { blog: Blog; featured?: boolean; priority?: boolean }) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : undefined;
  const tag = blog.tags?.[0] ? fmtTag(blog.tags[0]) : undefined;

  return (
    <Link className={`bcard${featured ? " bcard-featured" : ""}`} href={`/blog/${encodeURIComponent(blog.slug)}`}>
      <div className="bcard-media">
        {blog.heroImageUrl ? (
          <Image
            src={blog.heroImageUrl}
            alt=""
            fill
            sizes={featured ? "(min-width: 1024px) 680px, 100vw" : "(min-width: 1024px) 380px, (min-width: 600px) 50vw, 100vw"}
            priority={priority}
            draggable={false}
          />
        ) : (
          <div className="bcard-cover" aria-hidden="true">
            <span className="bcard-cover-tag">{tag ?? "Buyer guide"}</span>
            <svg className="bcard-cover-mark" viewBox="0 0 48 48" fill="none">
              <path d="M5 22L24 7L43 22" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="12" y="30" width="5.5" height="12" rx="1.4" fill="currentColor" opacity=".55" />
              <rect x="21.2" y="25" width="5.5" height="17" rx="1.4" fill="currentColor" opacity=".9" />
              <rect x="30.4" y="33" width="5.5" height="9" rx="1.4" fill="currentColor" opacity=".4" />
            </svg>
          </div>
        )}
      </div>
      <div className="bcard-body">
        {featured && <span className="bcard-flag">Latest</span>}
        {tag && <span className="bcard-tag">{tag}</span>}
        <h3 className="bcard-title">{blog.title}</h3>
        {blog.seoDescription && <p className="bcard-excerpt">{blog.seoDescription}</p>}
        <div className="bcard-meta">
          {date && <span>{date}</span>}
          <span className="bcard-read">
            <Icon name="clock" className="icon icon-sm" />
            {readingMinutes(blog.body)} min read
          </span>
          <Icon name="arrow-right" className="icon icon-sm bcard-go" />
        </div>
        {/* Unsplash's terms require the credit wherever their photo is shown. */}
        {blog.heroImageAttribution && <div className="bcard-credit">{blog.heroImageAttribution}</div>}
      </div>
    </Link>
  );
}
