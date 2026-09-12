import type { ProjectContent, CustomSection } from "@/lib/types";
import { ConfigurationsSection } from "./ConfigurationsSection";
import { AmenitiesSection, ClubsSection, GallerySection, LocationSection, MasterPlanSection } from "./ContentSections";
import { CustomBlock, PRIMITIVE_TYPES } from "./Primitives";

/**
 * Content section registry.
 * ---------------------------------------------------------------------------
 * The project page does not hardcode a layout. Every brochure-derived section
 * is an entry below declaring:
 *
 *   when(content)  -> truthy if this project has the data for it
 *   Component      -> renders the section body
 *
 * A section renders if and only if its data is present, so publishing a new
 * project is an insert into `projectcontents`, never a code change. The same
 * page code serves a project with eight floor plans and one with none.
 *
 * Ported from the pre-Next build with the mechanism intact. The old `init(root)`
 * hook is gone: interactivity now lives inside the section's own client leaf
 * (see PlanViewer / ZoomableImage), which is the React equivalent.
 */
export type SectionDef = {
  id: string;
  title: string;
  order: number;
  when: (c: ProjectContent) => boolean;
  count?: (c: ProjectContent) => number;
  Component: React.ComponentType<{ content: ProjectContent }>;
};

export const CONTENT_SECTIONS: SectionDef[] = [
  {
    id: "sec-gallery",
    title: "Gallery",
    order: 30,
    when: (c) => (c.gallery?.length ?? 0) > 0,
    count: (c) => c.gallery!.length,
    Component: GallerySection,
  },
  {
    id: "sec-configurations",
    title: "Configurations & Floor Plans",
    order: 40,
    when: (c) => (c.unit_types?.length ?? 0) > 0,
    count: (c) => c.unit_types!.length,
    Component: ConfigurationsSection,
  },
  {
    id: "sec-amenities",
    title: "Amenities",
    order: 60,
    when: (c) => (c.amenities?.length ?? 0) > 0,
    Component: AmenitiesSection,
  },
  {
    id: "sec-clubs",
    title: "Clubhouses",
    order: 70,
    when: (c) => (c.clubs?.length ?? 0) > 0,
    count: (c) => c.clubs!.length,
    Component: ClubsSection,
  },
  {
    id: "sec-master-plan",
    title: "Master Plan",
    order: 80,
    when: (c) => (c.master_plan?.length ?? 0) > 0,
    Component: MasterPlanSection,
  },
  {
    id: "sec-location",
    title: "Location & Connectivity",
    order: 90,
    when: (c) => (c.connectivity?.length ?? 0) > 0 || (c.location_map?.length ?? 0) > 0,
    Component: LocationSection,
  },
  // Next orders slot in here: highlights (10), pricing (50),
  // specifications (100), sources (200).
];

export type RenderedSection = {
  id: string;
  title: string;
  count?: number;
  node: React.ReactNode;
};

/**
 * Resolve a project's content into an ordered list of renderable sections.
 * Returns the same shape the RERA sections use (see ReraSections.tsx) — the
 * Overview tab renders this list, the Legal Data tab renders that one.
 */
export function buildContentSections(content: ProjectContent | undefined): RenderedSection[] {
  if (!content) return [];
  const hidden = new Set(content.hidden_sections ?? []);

  const fromRegistry = CONTENT_SECTIONS.filter((s) => !hidden.has(s.id) && s.when(content)).map((s) => ({
    id: s.id,
    title: s.title,
    count: s.count?.(content),
    order: s.order,
    node: <s.Component content={content} />,
  }));

  // The no-code escape hatch: arbitrary blocks rendered by primitive renderers,
  // for the per-builder long tail. If the same custom section shows up on three
  // projects, promote it to a real field in schema/project-schema.json.
  const fromCustom = (content.custom_sections ?? [])
    .filter((s: CustomSection) => !hidden.has(s.id ?? "") && PRIMITIVE_TYPES.includes(s.type))
    .map((s: CustomSection) => ({
      id: s.id || `sec-custom-${s.type}`,
      title: s.title ?? "",
      count: undefined,
      order: s.order ?? 150,
      node: <CustomBlock section={s} />,
    }));

  const all = [...fromRegistry, ...fromCustom];

  // An explicit per-project section_order wins; anything unlisted keeps its
  // default order and trails behind.
  if (content.section_order?.length) {
    const rank = new Map(content.section_order.map((id, i) => [id, i]));
    all.sort((a, b) => (rank.get(a.id) ?? 1000 + a.order) - (rank.get(b.id) ?? 1000 + b.order));
  } else {
    all.sort((a, b) => a.order - b.order);
  }

  return all.map(({ id, title, count, node }) => ({ id, title, count, node }));
}
