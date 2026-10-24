import Link from "next/link";
import Image from "next/image";
import type { ProjectView } from "@/lib/projectView";
import { Icon } from "./IconSprite";

/**
 * Listing card. Server Component — a link, a photo and some text need no
 * client JS. Photo-led when the project has brochure content; a project
 * without any falls back to a branded placeholder of the same size, so the
 * grid never jumps.
 */
export function ProjectCard({ project: p, priority = false }: { project: ProjectView; priority?: boolean }) {
  return (
    <Link className="pcard" href={p.href}>
      <div className="pcard-media">
        {p.cover?.url ? (
          <Image
            src={p.cover.url}
            alt={p.cover.alt || p.name}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 600px) 50vw, 100vw"
            priority={priority}
            draggable={false}
          />
        ) : (
          <div className="pcard-placeholder" aria-hidden="true">
            <Icon name="home" />
          </div>
        )}
        <div className="pcard-tags">
          {p.type && <span className="pcard-tag">{p.type}</span>}
          {p.status && <span className="pcard-tag">{p.status}</span>}
        </div>
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{p.name}</div>
        {p.location && (
          <div className="pcard-loc">
            <Icon name="map-pin" className="icon icon-sm" />
            {p.location}
          </div>
        )}
        {p.developer && <div className="pcard-dev">by {p.developer}</div>}
        {(p.configurations || p.startingPrice || p.possession) && (
          <dl className="pcard-facts">
            {p.configurations && (
              <div>
                <dt>Homes</dt>
                <dd>{p.configurations}</dd>
              </div>
            )}
            {p.startingPrice && (
              <div>
                <dt>From</dt>
                <dd>{p.startingPrice}</dd>
              </div>
            )}
            {p.possession && (
              <div>
                <dt>Possession</dt>
                <dd>{p.possession}</dd>
              </div>
            )}
          </dl>
        )}
        <span className="pcard-cta">
          View details
          <Icon name="chevron-right" className="icon icon-sm" />
        </span>
      </div>
    </Link>
  );
}
