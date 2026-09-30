import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/lib/types";

/**
 * Listing card for a blog post. Server Component — a link, text and an
 * (optionally absent) image need no client JS. Uses the site's .mini-card
 * pattern (image-topped) rather than .card (text-only, used by
 * ProjectCard) since blog posts now carry a hero image.
 */
export function BlogCard({ blog }: { blog: Blog }) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : undefined;

  return (
    <Link className="mini-card" href={`/blog/${encodeURIComponent(blog.slug)}`}>
      {blog.heroImageUrl && (
        <Image src={blog.heroImageUrl} alt={blog.title} width={400} height={170} sizes="(min-width: 1024px) 340px, (min-width: 600px) 45vw, 92vw" />
      )}
      <div className="mini-card-body">
        <div className="mini-card-title">{blog.title}</div>
        {blog.seoDescription && <p>{blog.seoDescription}</p>}
        {date && <div className="meta-line">{date}</div>}
        {blog.tags && blog.tags.length > 0 && (
          <div className="badge-row chips">
            {blog.tags.slice(0, 3).map((t) => (
              <span className="badge" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
        {blog.heroImageAttribution && <div className="meta-line">{blog.heroImageAttribution}</div>}
      </div>
    </Link>
  );
}
