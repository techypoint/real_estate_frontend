import Link from "next/link";
import { Icon } from "@/components/IconSprite";

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: "var(--sp-20)" }}>
        <Icon name="inbox" />
        <h1 style={{ fontSize: "var(--text-lg)", margin: "0 0 var(--sp-3)" }}>Project not found</h1>
        <p style={{ margin: "0 0 var(--sp-6)" }}>
          No UP-RERA project matches that registration number.
        </p>
        <Link className="btn btn-primary" href="/projects">
          Browse all projects
        </Link>
      </div>
    </div>
  );
}
