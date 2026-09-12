import Link from "next/link";
import type { ProjectSummary } from "@/lib/types";
import { projectSlug } from "@/lib/slug";

/**
 * Listing card. Server Component — a link and some text need no client JS.
 *
 * The gold "Full detail" badge is the design system's one reserved status
 * signal; nothing else on the site may use gold.
 */
export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      className="card"
      href={`/project/${encodeURIComponent(projectSlug(project.project_name, project.registration_no))}`}
    >
      <div className="name">{project.project_name || project.registration_no}</div>
      {project.promoter_name && <div className="promoter">{project.promoter_name}</div>}
      <div className="meta-line">
        {[project.district, project.registration_no].filter(Boolean).join(" · ")}
      </div>
      <div className="badge-row chips">
        {project.project_type && <span className="badge">{project.project_type}</span>}
        {project.project_category && <span className="badge">{project.project_category}</span>}
        {project.has_detail && <span className="badge detail">Full detail</span>}
      </div>
    </Link>
  );
}
