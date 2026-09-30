import { Icon } from "./IconSprite";
import { DATA_SOURCE_DISCLAIMER } from "@/lib/copy";

/**
 * The canonical "this is the promoter's filing, not our verification" caveat.
 *
 * Server Component — static text. Reuses the design system's `.notice` block,
 * which is already the established treatment for a source-quality warning
 * about the data next to it (see `.unit-note` / `.notice` in globals.css)
 * rather than inventing a new banner.
 */
export function SourceNote({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="notice" style={style}>
      <Icon name="info" className="icon icon-sm" />
      <span>{DATA_SOURCE_DISCLAIMER}</span>
    </div>
  );
}
