import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Metadata } from "next";
import { api, ApiError } from "@/lib/api";
import { BottomNav } from "@/components/SiteChrome";
import { BlogHeroImage } from "@/components/BlogHeroImage";
import type { Blog } from "@/lib/types";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

const MAX_PREBUILT_BLOGS = 200;

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

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  let blog: Blog;
  try {
    blog = await api.getBlog(slug);
  } catch {
    return { title: "Post not found" };
  }

  const description = blog.seoDescription || blog.body.slice(0, 155);

  return {
    title: blog.title,
    description,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: { title: blog.title, description, type: "article", images: blog.heroImageUrl ? [blog.heroImageUrl] : undefined },
  };
}

/** schema.org markup so search and AI crawlers get the facts structurally, not only as prose. */
function JsonLd({ blog }: { blog: Blog }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.seoDescription,
    datePublished: blog.publishedAt,
    image: blog.heroImageUrl || undefined,
    keywords: blog.tags?.length ? blog.tags.join(", ") : undefined,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);
  // blog.body is Markdown written by the content pipeline's LLM agent, which
  // reads live web search results while drafting — an indirect-prompt-
  // injection vector for smuggled HTML, even after human approval. marked
  // renders raw HTML found in Markdown by default, so sanitize before it
  // ever reaches dangerouslySetInnerHTML.
  const html = DOMPurify.sanitize(await marked.parse(blog.body));

  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : undefined;

  return (
    <>
      <JsonLd blog={blog} />

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / <span>{blog.title}</span>
        </div>

        <article>
          <h1>{blog.title}</h1>
          {date && <div className="meta-line" style={{ marginBottom: "var(--sp-4)" }}>{date}</div>}
          {blog.tags && blog.tags.length > 0 && (
            <div className="badge-row chips" style={{ marginBottom: "var(--sp-6)" }}>
              {blog.tags.map((t) => (
                <span className="badge" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
          <BlogHeroImage blog={blog} priority />
          <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>

      <BottomNav />
    </>
  );
}
