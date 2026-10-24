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
  description: "Market news, home-loan updates and practical buyer guides for buying a home in Uttar Pradesh.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const result = await api.listBlogs({ page, limit: LIMIT });

  const makeHref = (nextPage: number) => (nextPage > 1 ? `/blog?page=${nextPage}` : "/blog");

  // Page 1 leads with the newest post as a wide feature; later pages are a plain grid.
  const [lead, ...rest] = page === 1 ? result.items : [undefined, ...result.items];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Blog</span>
          </div>
          <span className="eyebrow">Insights &amp; buyer guides</span>
          <h1>The home buyer&rsquo;s journal.</h1>
          <p>
            Market news, home-loan updates and practical checklists for buying a home in Uttar
            Pradesh — written to help you decide, not to sell you something.
          </p>
        </div>
      </section>

      <div className="container listing-body">
        {result.items.length ? (
          <>
            {lead && <BlogCard blog={lead} featured priority />}
            {rest.length > 0 && (
              <>
                {lead && (
                  <div className="home-head-row blog-more-head">
                    <h2>More articles</h2>
                    <span className="count">{fmtNum(result.total)} posts</span>
                  </div>
                )}
                <div className="bgrid">
                  {rest.map((b) => b && <BlogCard key={b.id} blog={b} />)}
                </div>
              </>
            )}
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
