import type { Metadata } from "next";
import { api } from "@/lib/api";
import { areaHref, districtHref, liveAreas } from "@/lib/districts";
import { fmtNum } from "@/lib/format";
import { LinkCloud } from "@/components/LeadBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";
import { SourceNote } from "@/components/SourceNote";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Districts & Areas in Uttar Pradesh — New Projects by Location",
  description:
    "Browse RERA-registered real estate projects in Uttar Pradesh by district and area — brochures, floor plans and possession dates on AcreInfotech.",
  alternates: { canonical: "/districts" },
};

/** Index of every district and area page. /district (no slug) redirects here — see next.config.mjs. */
export default async function DistrictsPage() {
  const [districts, areas] = await Promise.all([api.districts(), api.areas()]);
  const counts = await Promise.all(districts.map((d) => api.listProjects({ district: d, limit: 1 }).then((r) => r.total)));
  const live = liveAreas(areas);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs path="/districts" items={[{ name: "Home", href: "/" }, { name: "Districts" }]} />
          <span className="eyebrow">Locations across Uttar Pradesh</span>
          <h1>Browse by location.</h1>
          <p>
            {fmtNum(districts.length)} district{districts.length === 1 ? "" : "s"} with projects on AcreInfotech — more
            are added as we publish new projects.
          </p>
        </div>
      </section>

      <div className="container listing-body">
        {districts.length ? (
          <>
            <LinkCloud
              title="Districts"
              links={districts.map((d, i) => ({ href: districtHref(d), label: `${d} (${counts[i]})` }))}
            />
            <LinkCloud
              title="Areas"
              links={live.map((a) => ({ href: areaHref(a.district, a.slug), label: `${a.name} (${a.projectCount})` }))}
            />
          </>
        ) : (
          <div className="empty-state">
            <Icon name="inbox" />
            No districts to show yet.
          </div>
        )}
        <SourceNote />
      </div>

      <BottomNav />
    </>
  );
}
