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
 *
 * The content pipeline's Publisher step (agentic_ai_workflow, see
 * SOCIAL_CONTENT_PIPELINE.md there) calls the same endpoint for a new blog
 * post, just with `?type=blog&slug=...` instead — blog slugs are already
 * final at write time, so there's no name-lookup step to redo.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "REVALIDATE_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "project";

  if (type === "blog") {
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Missing ?slug=" }, { status: 400 });
    }
    revalidateTag(`blog:${slug}`);
    revalidateTag("blogs");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog");
    revalidatePath("/");
    return NextResponse.json({ revalidated: true, type: "blog", slug, at: Date.now() });
  }

  const reg = url.searchParams.get("reg");
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

  return NextResponse.json({ revalidated: true, type: "project", reg, slug, at: Date.now() });
}
