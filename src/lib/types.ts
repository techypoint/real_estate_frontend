/**
 * Shapes returned by the Java API.
 *
 * `ProjectContent` is intentionally loose. Its authoritative definition is
 * schema/project-schema.json, which is expected to grow; mirroring every field
 * as a strict TypeScript interface would create a second definition that can
 * silently disagree with the schema. Typed where the UI reads it, index
 * signature for the rest.
 */

export type AreaPair = { sqm?: number; sqft?: number };

export type MediaRef = {
  /** Absolute CDN URL — Java resolves the stored object key before this reaches the frontend. */
  url?: string;
  label?: string;
  caption?: string;
  alt?: string;
  /** Intrinsic pixel size — reserves layout space before load, preventing CLS. */
  width?: number;
  height?: number;
  order?: number;
};

export type Provenance = {
  source_id?: string;
  page?: number;
  as_of?: string;
  confidence?: "high" | "medium" | "low";
  computed?: boolean;
  note?: string;
};

export type UnitType = {
  key: string;
  tower_family?: string;
  bhk: number;
  variant?: string;
  config_label?: string;
  extras?: string[];
  wings?: string[];
  is_full_floor?: boolean;
  areas: {
    super?: AreaPair;
    built_up?: AreaPair;
    carpet?: AreaPair;
    balcony?: AreaPair;
  };
  price?: {
    basis?: string;
    bsp_per_sqft?: number;
    indicative_total?: number;
    computed?: boolean;
  };
  media?: {
    plan_2d?: MediaRef[];
    plan_3d?: MediaRef[];
    renders?: MediaRef[];
    tour_url?: string;
  };
  availability?: string;
  source_ref?: Provenance;
};

export type CustomSection = {
  id?: string;
  title?: string;
  type: "kv" | "table" | "cards" | "gallery" | "stats" | "prose" | "list";
  order?: number;
  data: unknown;
};

export type ProjectContent = {
  registration_no: string;
  slug?: string;
  published?: boolean;
  marketing?: {
    display_name?: string;
    tagline?: string;
    locality?: string;
    city?: string;
    status?: string;
    possession_on?: string;
    highlights?: string[];
  };
  scale?: {
    land_area?: { value?: number; unit?: string };
    total_units?: number;
    tower_count?: number;
    green_area?: { value?: number; unit?: string };
    green_breakup?: { name: string; sqm?: number; acres?: number }[];
  };
  pricing?: {
    area_basis?: string;
    bsp?: { amount?: number; unit?: string; wef?: string };
    starting_price?: { amount?: number; display?: string };
    payment_plan?: { headline?: string; milestones?: { label: string; percent: number; note?: string }[] };
    charges?: { head: string; amount?: number; basis?: string; note?: string }[];
    inclusions_note?: string;
  };
  amenities?: { group: string; items: string[]; access?: string }[];
  clubs?: { name: string; size_sqft?: number; count?: number; access?: string; note?: string; media?: MediaRef[] }[];
  connectivity?: { name: string; category?: string; minutes?: number; distance_km?: number }[];
  unit_types?: UnitType[];
  gallery?: MediaRef[];
  master_plan?: MediaRef[];
  location_map?: MediaRef[];
  custom_sections?: CustomSection[];
  section_order?: string[];
  hidden_sections?: string[];
  sources?: { id: string; label: string; type: string; as_of?: string; url?: string }[];
  [key: string]: unknown;
};

export type ProjectDocument = {
  document_name?: string;
  file_name?: string;
  uploaded_date?: string;
  /** Absolute CDN URL — Java resolves the stored R2 object key before this reaches the frontend. */
  url?: string;
  size?: number;
};

export type Project = {
  _id: string;
  registration_no: string;
  project_name?: string;
  promoter_name?: string;
  district?: string;
  project_type?: string;
  project_category?: string;
  state?: string;
  tehsil?: string;
  project_address?: string;
  registration_date?: string;
  declared_completion_date?: string;
  proposed_start_date?: string;
  project_duration_months?: string;
  proposed_period_months?: string;
  registration_fee?: string;
  promoter?: Record<string, string | undefined>;
  co_promoters?: Record<string, string | undefined>[];
  detail?: Record<string, Record<string, string>[]>;
  documents?: ProjectDocument[];
  has_detail?: boolean;
  content?: ProjectContent;
};

export type ProjectSummary = Pick<
  Project,
  | "_id"
  | "registration_no"
  | "project_name"
  | "promoter_name"
  | "district"
  | "project_type"
  | "project_category"
  | "has_detail"
  | "declared_completion_date"
  | "registration_date"
>;

export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type Stats = { total: number; withDetail: number; listed: number; districts: number };

/** One entry from `/api/projects/meta/published` — feeds the URL slug and generateStaticParams. */
export type PublishedProjectRef = { registration_no: string; name: string };
