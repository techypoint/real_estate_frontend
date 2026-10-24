import Link from "next/link";
import { BlogCard } from "./BlogCard";
import { Icon } from "./IconSprite";
import type { Blog } from "@/lib/types";

const MAX_RELATED = 3;

/**
 * "Keep reading" strip at the foot of a blog post.
 *
 * Server Component. Ranking happens here in Node over one already-fetched page
 * of posts rather than server-side: /api/blogs has no tag filter or exclude
 * param, and adding one is a backend change that this feature doesn't need.
 * Posts sharing the most tags win; ties (and the common no-tags case) fall back
 * to most-recent, so the strip is never empty just because tags didn't overlap.
 */
export function RelatedPosts({ current, candidates }: { current: Blog; candidates: Blog[] }) {
  const currentTags = new Set((current.tags ?? []).map((t) => t.toLowerCase()));

  const ranked = candidates
    .filter((b) => b.slug !== current.slug)
    .map((b) => ({
      blog: b,
      shared: (b.tags ?? []).filter((t) => currentTags.has(t.toLowerCase())).length,
      when: b.publishedAt ? Date.parse(b.publishedAt) : 0,
    }))
    .sort((a, b) => b.shared - a.shared || b.when - a.when)
    .slice(0, MAX_RELATED)
    .map((r) => r.blog);

  if (!ranked.length) return null;

  return (
    <section className="related-posts">
      <div className="home-head-row blog-more-head">
        <h2>Keep reading</h2>
        <Link className="text-link" href="/blog">
          All articles <Icon name="arrow-right" className="icon icon-sm" />
        </Link>
      </div>
      <div className="bgrid">
        {ranked.map((b) => (
          <BlogCard key={b.id} blog={b} />
        ))}
      </div>
    </section>
  );
}
