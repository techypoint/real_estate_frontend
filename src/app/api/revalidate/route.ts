import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { projectSlug } from "@/lib/slug";

/**
 * On-demand ISR hook.
 *
 * When a curator publishes or edits a project, the Java backend calls:
 *
 *   POST /api/revalidate?reg=UPRERAPRJ125561
 *   x-revalidate-secret: <shared secret>
 *
 * and that one page regenerates in seconds — no full rebuild of 1,119 pages.
 * This is the specific capability that decided Next.js over Astro for this
 * project (see CLAUDE.md, "Frontend").
 *
 * The page is cached by its full "{name}-{reg}" slug, not the bare
 * registration number the webhook receives — so this looks the project back
 * up (after invalidating its cache tag, in case the name itself just
 * changed) to know which path to regenerate.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "REVALIDATE_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reg = new URL(request.url).searchParams.get("reg");
  if (!reg) {
    return NextResponse.json({ error: "Missing ?reg=" }, { status: 400 });
  }

  // Invalidate first so the lookup below can't return a stale cached name.
  revalidateTag(`project:${reg}`);

  let slug = reg;
  try {
    const project = await api.getProject(reg);
    const name = project.content?.marketing?.display_name || project.project_name || reg;
    slug = projectSlug(name, reg);
  } catch {
    // Deleted/unpublished since the webhook fired — fall back to the bare
    // registration number so a page cached at that path still clears.
  }

  revalidatePath(`/project/${slug}`);
  // A newly published project also changes the listing and counts.
  revalidatePath("/projects");
  revalidatePath("/");

  return NextResponse.json({ revalidated: true, reg, slug, at: Date.now() });
}
