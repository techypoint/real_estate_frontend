import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "./adminSession";

/**
 * Server-side client for the Java admin API (/api/admin/**). Only ever runs
 * on the Next server: the browser never sees ADMIN_API_SECRET or calls Java.
 * Each call re-checks the admin session and forwards the admin username as
 * x-admin-user for the audit log. Never cached — the admin panel must always
 * show the database as it is now.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8888";

export class AdminApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AdminApiError";
  }
}

/** The logged-in admin username; sends anyone else to the login page. */
export async function requireAdmin(): Promise<string> {
  const user = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) redirect("/admin/login");
  return user;
}

export async function adminFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const user = await requireAdmin();
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) throw new AdminApiError("ADMIN_API_SECRET is not set on the frontend server", 500);

  const res = await fetch(`${API_ORIGIN}/api/admin${path}`, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-admin-secret": secret,
      "x-admin-user": user,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) {
    // Java puts a readable reason in `message` ("\"jewer\" is not an area of …").
    const err = await res.json().catch(() => ({}));
    throw new AdminApiError(err.message || `Admin API ${res.status} for ${path}`, res.status);
  }
  return res.json() as Promise<T>;
}

// ---- response shapes (see the Java Admin*Controller classes) ------------------

export type PipelineRow = {
  registration_no: string;
  project_name?: string;
  district?: string;
  promoter_name?: string;
  has_detail?: boolean;
  area?: string;
  brochure_status?: string;
  documents: number;
  hasBrochure: boolean;
  hasArea: boolean;
  hasContent: boolean;
  published: boolean;
  live: boolean;
};

export type PipelineTotals = {
  all?: number;
  live?: number;
  needsBrochure?: number;
  needsArea?: number;
  needsContent?: number;
  draft?: number;
};

export type Pipeline = {
  items: PipelineRow[];
  totals: PipelineTotals;
  total: number;
  page: number;
  pages: number;
  districts: string[];
};

export type AuditEntry = {
  _id: string;
  at: string;
  user: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
};

export type AdminProject = {
  project: {
    registration_no: string;
    project_name?: string;
    promoter_name?: string;
    district: string;
    tehsil?: string;
    project_address?: string;
    project_type?: string;
    declared_completion_date?: string;
    has_detail: boolean;
    listed: boolean;
    documents: number;
    brochure?: { file_name?: string; source_url?: string; confidence?: string; has_file: boolean };
    brochure_status?: string;
    area?: string;
  };
  visible: boolean;
  builder?: { slug: string; name: string };
  content?: { published: boolean; display_name?: string; updatedAt?: string };
  areas: { slug: string; name: string }[];
  suggestion?: { slug: string; name: string };
  history: AuditEntry[];
};

export type AdminArea = {
  id: string;
  district: string;
  slug: string;
  name: string;
  match: string[];
  assigned: number;
  live: number;
};

export type AdminBuilder = { id: string; slug: string; name: string; match: string[]; live: number };
