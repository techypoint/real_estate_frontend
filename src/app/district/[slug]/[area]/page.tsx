import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { areaHref, districtHref, liveAreas, resolveDistrict } from "@/lib/districts";
import { fmtNum } from "@/lib/format";
import { ProjectListing, pageHref, pageNum } from "@/components/ProjectListing";
import { LeadBand, LinkCloud } from "@/components/LeadBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BottomNav } from "@/components/SiteChrome";
import { SourceNote } from "@/components/SourceNote";
import type { AreaSummary } from "@/lib/types";

export const revalidate = 300;

type Params = Promise<{ slug: string; area: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * One page per area of the master list (real_estate_scripts/data/areas.json)
 * that has at least one visible project. An area with none yet — in the
 * list but no project assigned, or all its projects hidden — 404s, so Google
 * never sees an empty page; it appears the moment its first project goes live.
 */
async function resolveArea(slug: string, areaSlug: string): Promise<{ district: string; area: AreaSummary } | undefined> {
  const district = await resolveDistrict(slug);
  if (!district) return undefined;
  const area = liveAreas(await api.areas(), district).find((a) => a.slug === areaSlug);
  return area ? { district, area } : undefined;
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const { slug, area: areaSlug } = await params;
  const found = await resolveArea(slug, areaSlug);
  if (!found) return { title: "Area not found" };
  const { district, area } = found;
  const page = pageNum(await searchParams);

  return {
    title: `New Projects in ${area.name}, ${district} — RERA-Registered`,
    description: `RERA-registered projects in ${area.name}, ${district}, Uttar Pradesh — floor plans, brochures, builder details and possession dates. Enquire for price, availability and a site visit.`,
    alternates: { canonical: pageHref(areaHref(district, area.slug), page) },
  };
}

export default async function AreaPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug, area: areaSlug } = await params;
  const [found, sp] = await Promise.all([resolveArea(slug, areaSlug), searchParams]);
  if (!found) notFound();
  const { district, area } = found;

  const page = pageNum(sp);
  const [areas, builders] = await Promise.all([api.areas(), api.builders()]);
  const href = areaHref(district, area.slug);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs
            path={href}
            items={[
              { name: "Home", href: "/" },
              { name: "Projects", href: "/projects" },
              { name: district, href: districtHref(district) },
              { name: area.name },
            ]}
          />
          <span className="eyebrow">{district}, Uttar Pradesh</span>
          <h1>New projects in {area.name}</h1>
          <p>
            {fmtNum(area.projectCount)} RERA-registered project{area.projectCount === 1 ? "" : "s"} in {area.name} with
            brochures, floor plans and builder details. Tell us your budget and we&rsquo;ll shortlist the ones that fit.
          </p>
        </div>
      </section>

      <div className="container listing-body">
        <ProjectListing filter={{ district, area: area.slug }} page={page} basePath={href} />

        <LeadBand
          title={`Looking for a home in ${area.name}?`}
          blurb="Share what you need — budget, size, when you want to move — and an advisor will call you with prices, availability and site-visit slots, including nearby areas if they fit better."
          source="area_page"
        />

        <LinkCloud
          title={`Other areas in ${district}`}
          links={liveAreas(areas, district)
            .filter((a) => a.slug !== area.slug)
            .map((a) => ({ href: areaHref(district, a.slug), label: a.name }))}
        />
        <LinkCloud title="Builders" links={builders.map((b) => ({ href: `/builder/${b.slug}`, label: b.name }))} />

        <SourceNote />
      </div>

      <BottomNav />
    </>
  );
}
