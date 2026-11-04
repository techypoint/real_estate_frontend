import { NextResponse, type NextRequest } from "next/server";
import { adminFetch, type Pipeline } from "@/lib/adminApi";

const LIMIT = 8;

/**
 * Typeahead for the admin project search: the first few pipeline matches for
 * ?q=. Lives under /admin so middleware and adminFetch both check the session.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const district = request.nextUrl.searchParams.get("district") ?? "";

  const data = await adminFetch<Pipeline>(`/pipeline?${new URLSearchParams({ scope: "all", district, q, page: "1" })}`);
  return NextResponse.json(
    data.items.slice(0, LIMIT).map((r) => ({
      registration_no: r.registration_no,
      project_name: r.project_name,
      district: r.district,
      live: r.live,
    })),
  );
}
