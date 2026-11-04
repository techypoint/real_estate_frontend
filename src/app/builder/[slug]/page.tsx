import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, ApiError } from "@/lib/api";
import { districtHref } from "@/lib/districts";
import { fmtNum } from "@/lib/format";
import { ProjectListing, pageHref, pageNum } from "@/components/ProjectListing";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadBand, LinkCloud } from "@/components/LeadBand";
import { BottomNav } from "@/components/SiteChrome";
import { SourceNote } from "@/components/SourceNote";
import type { BuilderSummary } from "@/lib/types";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * One page per builder with at least one visible project. Builders are the
 * brand a buyer recognises ("Mahagun Group"), not the legal entity on the
 * RERA filing — the Java BuilderDirectory groups the raw promoter names.
 * A builder whose projects are all hidden 404s from the API.
 */
async function fetchBuilder(slug: string): Promise<BuilderSummary | undefined> {
  try {
    return await api.getBuilder(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const { slug } = await params;
  const builder = await fetchBuilder(slug);
  if (!builder) return { title: "Builder not found" };
  const page = pageNum(await searchParams);

  return {
    title: `${builder.name} Projects — RERA Registrations, Brochures & Floor Plans`,
    description: `All ${builder.name} projects listed on AcreInfotech: RERA registration numbers, brochures, floor plans and possession dates. Enquire for price, availability and a site visit.`,
    alternates: { canonical: pageHref(`/builder/${builder.slug}`, page) },
  };
}

export default async function BuilderPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const [builder, sp] = await Promise.all([fetchBuilder(slug), searchParams]);
  if (!builder) notFound();

  const page = pageNum(sp);
  const [builders, districts] = await Promise.all([api.builders(), api.districts()]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs
            path={`/builder/${builder.slug}`}
            items={[{ name: "Home", href: "/" }, { name: "Builders", href: "/builders" }, { name: builder.name }]}
          />
          <span className="eyebrow">Builder</span>
          <h1>{builder.name} projects</h1>
          <p>
            {fmtNum(builder.projectCount)} {builder.name} project{builder.projectCount === 1 ? "" : "s"} with RERA
            registration, brochure and floor plans. Ask us for current prices and availability.
          </p>
        </div>
      </section>

      <div className="container listing-body">
        <ProjectListing filter={{ builder: builder.slug }} page={page} basePath={`/builder/${builder.slug}`} />

        <LeadBand
          title={`Interested in a ${builder.name} project?`}
          blurb="Tell us your budget and timeline — an advisor will call with prices, available units and site-visit slots, and options from other builders if they fit better."
          source="builder_page"
        />

        <LinkCloud
          title="Other builders"
          links={builders.filter((b) => b.slug !== builder.slug).map((b) => ({ href: `/builder/${b.slug}`, label: b.name }))}
        />
        <LinkCloud title="Browse by district" links={districts.map((d) => ({ href: districtHref(d), label: d }))} />

        <SourceNote />
      </div>

      <BottomNav />
    </>
  );
}
