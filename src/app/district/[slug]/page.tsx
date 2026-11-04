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

export const revalidate = 300;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** "Noida, Yamuna Expressway" — areas of the district that have projects, most projects first. */
async function liveAreaNames(district: string) {
  const areas = liveAreas(await api.areas(), district).sort((a, b) => b.projectCount - a.projectCount);
  return areas.map((a) => a.name);
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const { slug } = await params;
  const district = await resolveDistrict(slug);
  if (!district) return { title: "District not found" };

  const page = pageNum(await searchParams);
  const names = await liveAreaNames(district);
  const where = names.length ? ` (${names.slice(0, 3).join(", ")})` : "";

  return {
    title: `New Projects in ${district}${where} — RERA-Registered`,
    description: `RERA-registered residential and commercial projects in ${district} district, Uttar Pradesh${names.length ? ` — ${names.join(", ")}` : ""}. Floor plans, brochures, builder details and possession dates. Enquire for price, availability and a site visit.`,
    alternates: { canonical: pageHref(districtHref(district), page) },
  };
}

export default async function DistrictPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const [district, sp] = await Promise.all([resolveDistrict(slug), searchParams]);
  if (!district) notFound();

  const page = pageNum(sp);
  const [first, districts, builders, areas] = await Promise.all([
    api.listProjects({ district, limit: 1 }),
    api.districts(),
    api.builders(),
    api.areas(),
  ]);

  // The whole master list says what the district covers; only areas with a
  // project get a chip, since only those have a page.
  const covers = areas.filter((a) => a.district === district).map((a) => a.name).sort();
  const live = liveAreas(areas, district);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs
            path={districtHref(district)}
            items={[{ name: "Home", href: "/" }, { name: "Projects", href: "/projects" }, { name: district }]}
          />
          <span className="eyebrow">District, Uttar Pradesh</span>
          <h1>New projects in {district}</h1>
          <p>
            {fmtNum(first.total)} RERA-registered project{first.total === 1 ? "" : "s"} in {district}
            {covers.length ? <> — covering {covers.join(", ")}</> : null}. Brochures, floor plans and builder details;
            tell us your budget and we&rsquo;ll shortlist the ones that fit.
          </p>
        </div>
      </section>

      <div className="container listing-body">
        <LinkCloud
          title="Browse by area"
          links={live.map((a) => ({ href: areaHref(district, a.slug), label: `${a.name} (${a.projectCount})` }))}
        />

        <ProjectListing filter={{ district }} page={page} basePath={districtHref(district)} />

        <LeadBand
          title={`Looking for a home in ${district}?`}
          blurb="Share what you need — budget, size, when you want to move — and an advisor will call you with prices, availability and site-visit slots."
          source="district_page"
        />

        <LinkCloud
          title="Other districts"
          links={districts.filter((d) => d !== district).map((d) => ({ href: districtHref(d), label: d }))}
        />
        <LinkCloud
          title="Builders"
          links={builders.map((b) => ({ href: `/builder/${b.slug}`, label: b.name }))}
        />

        <SourceNote />
      </div>

      <BottomNav />
    </>
  );
}
