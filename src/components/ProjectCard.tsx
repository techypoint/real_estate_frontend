import Link from "next/link";
import type { ProjectSummary } from "@/lib/types";
import { projectSlug } from "@/lib/slug";

/**
 * Listing card. Server Component — a link and some text need no client JS.
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
      </div>
    </Link>
  );
}
