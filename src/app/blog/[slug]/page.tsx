import Link from "next/link";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import type { Metadata } from "next";
import { api, ApiError } from "@/lib/api";
import { renderArticle } from "@/lib/markdown";
import { BottomNav } from "@/components/SiteChrome";
import { BlogHeroImage } from "@/components/BlogHeroImage";
import { ArticleToc } from "@/components/ArticleToc";
import { ArticleShare } from "@/components/ArticleShare";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedPosts } from "@/components/RelatedPosts";
import { Icon } from "@/components/IconSprite";
import type { Blog } from "@/lib/types";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

const MAX_PREBUILT_BLOGS = 200;

/** One page of posts to rank "Keep reading" over — see RelatedPosts. */
const RELATED_POOL = 24;

const SITE_NAME = "AcreInfotech";
const SITE_URL = process.env.SITE_URL ?? "https://acreinfotech.com";

export async function generateStaticParams() {
  try {
    const result = await api.listBlogs({ limit: MAX_PREBUILT_BLOGS });
    return result.items.map((b) => ({ slug: b.slug }));
  } catch {
    // A backend that is down at build time should not fail the build; pages
    // fall back to on-demand rendering.
    return [];
  }
}

async function fetchBlog(slug: string): Promise<Blog> {
  try {
    return await api.getBlog(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

function postUrl(slug: string) {
  return `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  let blog: Blog;
  try {
    blog = await api.getBlog(slug);
  } catch {
    return { title: "Post not found" };
  }

  const description = blog.seoDescription || blog.body.slice(0, 155);
  const canonical = `/blog/${blog.slug}`;

  return {
    title: blog.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: blog.title,
      description,
      type: "article",
      url: canonical,
      publishedTime: blog.publishedAt,
      tags: blog.tags,
      images: blog.heroImageUrl ? [blog.heroImageUrl] : undefined,
    },
    // Without this a shared link renders as a small thumbnail card even though
    // the post has a 16:9 hero.
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.heroImageUrl ? [blog.heroImageUrl] : undefined,
    },
  };
}

/**
 * schema.org markup so search and AI crawlers get the facts structurally, not
 * only as prose.
 *
 * `dateModified` is deliberately absent: the Blog type carries no modification
 * timestamp, and `createdAt` is when the draft was written, not when the post
 * last changed — emitting it as a modification date would be a false claim in
 * structured data. Likewise there is no author Person: posts are published by
 * the organisation, so Organization is both the author and the publisher.
 */
function JsonLd({ blog, wordCount }: { blog: Blog; wordCount: number }) {
  const url = postUrl(blog.slug);
  const publisher = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/acreinfotech-appicon-dark-180w.png` },
  };

  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.seoDescription,
    datePublished: blog.publishedAt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-IN",
    author: publisher,
    publisher,
    wordCount,
    image: blog.heroImageUrl ? [blog.heroImageUrl] : undefined,
    articleSection: blog.tags?.[0],
    keywords: blog.tags?.length ? blog.tags.join(", ") : undefined,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: blog.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    </>
  );
}

/** End-of-article prompt — the point at which a reader is most likely to act. */
function ArticleCta() {
  return (
    <aside className="article-cta">
      <div className="article-cta-title">Looking for a home in Uttar Pradesh?</div>
      <p>
        Browse projects with the details each promoter filed with UP-RERA, or tell us your budget,
        configuration and timeline and we&rsquo;ll help you narrow it down.
      </p>
      <div className="btns">
        <Link className="btn btn-primary" href="/projects">Browse Projects</Link>
        <Link className="btn btn-outline" href="/contact">Talk to us</Link>
      </div>
    </aside>
  );
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;

  // Two independent cached fetches, in parallel so TTFB is the slower of the
  // two rather than their sum (same shape as HomePage). A failure to load the
  // "Keep reading" pool must not take the article down with it, so it degrades
  // to an empty pool instead of throwing.
  const [blog, pool] = await Promise.all([
    fetchBlog(slug),
    api.listBlogs({ limit: RELATED_POOL }).then((r) => r.items).catch(() => [] as Blog[]),
  ]);

  const { html: rawHtml, headings, readingMinutes, wordCount } = renderArticle(blog.body);

  // blog.body is Markdown written by the content pipeline's LLM agent, which
  // reads live web search results while drafting — an indirect-prompt-
  // injection vector for smuggled HTML, even after human approval. marked
  // renders raw HTML found in Markdown by default, so sanitize LAST, right
  // before dangerouslySetInnerHTML: anything that transforms the HTML after
  // this point re-opens the hole. (renderArticle only adds heading ids and
  // anchor links; DOMPurify permits id/href/class/aria-label, so they survive.)
  const html = DOMPurify.sanitize(rawHtml);

  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : undefined;

  const eyebrow = blog.tags?.[0];

  return (
    <>
      <JsonLd blog={blog} wordCount={wordCount} />
      <ReadingProgress />

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / <span>{blog.title}</span>
        </div>

        <div className="article-shell">
          <article>
            <header className="article-head">
              {eyebrow && <div className="showcase-eyebrow">{eyebrow}</div>}
              <h1>{blog.title}</h1>
              {blog.seoDescription && <p className="article-deck">{blog.seoDescription}</p>}

              <div className="article-meta">
                {date && <span>{date}</span>}
                <span className="article-meta-read">
                  <Icon name="clock" className="icon icon-sm" />
                  {readingMinutes} min read
                </span>
              </div>

              {blog.tags && blog.tags.length > 0 && (
                <div className="badge-row chips article-tags">
                  {blog.tags.map((t) => (
                    <span className="badge" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <BlogHeroImage blog={blog} priority />

            {/* Collapsed <details> version — CSS hides it from 1024px up, where
                the sticky aside carries the same list. */}
            <ArticleToc headings={headings} variant="inline" />

            <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

            <ArticleCta />
          </article>

          <aside className="article-aside">
            <ArticleToc headings={headings} variant="aside" />
            <ArticleShare url={postUrl(blog.slug)} title={blog.title} />
          </aside>
        </div>

        <RelatedPosts current={blog} candidates={pool} />
      </div>

      <BottomNav>
        <Link className="bn-item" href="/blog">
          <span className="icon-wrap">
            <Icon name="file" />
          </span>
          Blog
        </Link>
      </BottomNav>
    </>
  );
}
