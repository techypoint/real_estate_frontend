import type { PageResponse, Project, ProjectSummary, PublishedProjectRef, Stats } from "./types";

/**
 * Client for the Java backend.
 *
 * Called from Server Components only — the browser never talks to the API
 * directly, so the API origin stays an internal address and there is no CORS
 * surface on the public site. Anything that needs client-side data goes through
 * a Next route handler acting as a thin proxy.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8888";

/** How long a fetched resource stays fresh before ISR revalidates it. */
export const REVALIDATE = {
  // Project content changes only when a curator publishes; the publish webhook
  // revalidates the exact page, so this is just a safety net.
  project: 3600,
  // Listing and counts move as the importer runs.
  list: 300,
} as const;

type FetchOpts = { revalidate?: number; tags?: string[] };

async function apiGet<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    next: { revalidate: opts.revalidate ?? REVALIDATE.list, tags: opts.tags },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError(`API ${res.status} for ${path}`, res.status);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== false) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type ListParams = {
  q?: string;
  district?: string;
  type?: string;
  hasDetail?: boolean;
  page?: number;
  limit?: number;
};

export const api = {
  listProjects: (params: ListParams = {}) =>
    apiGet<PageResponse<ProjectSummary>>(`/api/projects${qs(params)}`, { revalidate: REVALIDATE.list }),

  getProject: (registrationNo: string) =>
    apiGet<Project>(`/api/projects/${encodeURIComponent(registrationNo)}`, {
      revalidate: REVALIDATE.project,
      tags: [`project:${registrationNo}`],
    }),

  districts: () => apiGet<string[]>("/api/projects/meta/districts", { revalidate: 86400 }),

  stats: () => apiGet<Stats>("/api/projects/meta/stats", { revalidate: REVALIDATE.list }),

  /** Registration number + name of published projects — feeds the URL slug and generateStaticParams. */
  publishedProjectRefs: () =>
    apiGet<PublishedProjectRef[]>("/api/projects/meta/published", { revalidate: REVALIDATE.list }),
};
