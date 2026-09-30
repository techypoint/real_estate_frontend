import Image from "next/image";
import type { Blog } from "@/lib/types";

/**
 * Full-width hero banner for a blog post's detail page. Renders nothing if
 * there's no image — a listing announcement with no gallery photo, or a
 * topic post with no Unsplash match, is meant to publish text-only rather
 * than substitute a stock photo (see the Content Writer's prompt).
 *
 * The credit line only appears when heroImageAttribution is set (i.e. an
 * Unsplash photo, not a listing's own) — required by Unsplash's API terms
 * whenever their photo is used, not optional styling.
 */
export function BlogHeroImage({
  blog,
  priority = false,
}: {
  blog: Pick<Blog, "title" | "heroImageUrl" | "heroImageAttribution" | "heroImageAttributionUrl">;
  priority?: boolean;
}) {
  if (!blog.heroImageUrl) return null;

  return (
    <figure className="blog-hero">
      <div className="blog-hero-img">
        <Image src={blog.heroImageUrl} alt={blog.title} fill sizes="(min-width: 768px) 700px, 100vw" priority={priority} />
      </div>
      {blog.heroImageAttribution && (
        <figcaption className="blog-hero-credit">
          {blog.heroImageAttributionUrl ? (
            <a href={blog.heroImageAttributionUrl} target="_blank" rel="noopener noreferrer">
              {blog.heroImageAttribution}
            </a>
          ) : (
            blog.heroImageAttribution
          )}
        </figcaption>
      )}
    </figure>
  );
}
