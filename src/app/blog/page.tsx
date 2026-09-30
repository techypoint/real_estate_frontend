import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { BlogCard } from "@/components/BlogCard";
import { Pagination } from "@/components/Pagination";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";

const LIMIT = 20;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export const metadata: Metadata = {
  title: "Blog",
  description: "Market news, buyer guides and project updates from the UP RERA real estate market.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const result = await api.listBlogs({ page, limit: LIMIT });

  const makeHref = (nextPage: number) => (nextPage > 1 ? `/blog?page=${nextPage}` : "/blog");

  return (
    <>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <span>Blog</span>
        </div>

        <div className="section-title">
          <h2>Blog</h2>
          <span className="count">
            {fmtNum(result.total)} post{result.total === 1 ? "" : "s"}
          </span>
        </div>

        {result.items.length ? (
          <>
            <div className="mini-cards" style={{ marginBottom: "var(--sp-8)" }}>
              {result.items.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
            <Pagination page={result.page} pages={result.pages} makeHref={makeHref} />
          </>
        ) : (
          <div className="empty-state">
            <Icon name="inbox" />
            No posts yet.
          </div>
        )}
      </div>

      <BottomNav />
    </>
  );
}
