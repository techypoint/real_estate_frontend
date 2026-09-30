import { Marked, type Token, type Tokens } from "marked";
import { slugify } from "./slug";

/**
 * Markdown → article HTML, plus the metadata a long-form page needs (table of
 * contents, reading time, word count) from the SAME pass.
 *
 * Pure module: no React, no DOM, no sanitisation. Sanitisation deliberately
 * stays at the call site, as the last transform before
 * dangerouslySetInnerHTML — see the comment in app/blog/[slug]/page.tsx for
 * why that ordering is load-bearing rather than stylistic.
 */

export type ArticleHeading = {
  id: string;
  /** Plain text — safe to render as a React child, no HTML. */
  text: string;
  depth: 2 | 3;
};

export type RenderedArticle = {
  html: string;
  headings: ArticleHeading[];
  readingMinutes: number;
  wordCount: number;
};

/** Average adult reading speed for non-technical prose. */
const WORDS_PER_MINUTE = 200;

/** Depths that get an id + a TOC entry. h1 is the page title; h4+ is too fine to navigate by. */
const LINKABLE_DEPTHS = new Set([2, 3]);

/**
 * Flatten an inline token tree to plain text, so a heading written as
 * "## The **carpet area** trap" yields a clean TOC label and a clean slug
 * rather than one containing markup.
 */
function plainText(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((t) => {
      const nested = (t as { tokens?: Token[] }).tokens;
      if (nested?.length) return plainText(nested);
      return (t as { text?: string }).text ?? "";
    })
    .join("");
}

/**
 * Escape a string for use inside an HTML attribute value. slugify() already
 * reduces ids to [a-z0-9-], so this only really guards the human-readable
 * aria-label — but it costs nothing and means no caller has to reason about
 * which of these two strings was sanitised.
 */
function attr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderArticle(markdown: string): RenderedArticle {
  const headings: ArticleHeading[] = [];
  const seen = new Map<string, number>();

  /**
   * One pass, not two: ids are minted inside the renderer, which marked calls
   * in document order, and pushed onto the same array the TOC is built from.
   * An earlier design lexed separately and matched ids to headings by index —
   * correct, but it silently depended on both traversals agreeing forever. Here
   * a TOC entry and its target id are literally the same string, so they cannot
   * drift apart.
   */
  const md = new Marked({
    renderer: {
      heading(token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        if (!LINKABLE_DEPTHS.has(token.depth)) {
          return `<h${token.depth}>${inner}</h${token.depth}>\n`;
        }

        const text = plainText(token.tokens).trim();
        const base = slugify(text) || `section-${headings.length + 1}`;
        // Two headings with the same words are common in listicles ("What to
        // check"); a duplicate id would silently send both TOC links to the
        // first one.
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n + 1}`;

        headings.push({ id, text, depth: token.depth as 2 | 3 });

        return (
          `<h${token.depth} id="${attr(id)}">${inner}` +
          `<a class="heading-anchor" href="#${attr(id)}" aria-label="Link to “${attr(text)}”">#</a>` +
          `</h${token.depth}>\n`
        );
      },
    },
  });

  // async:false pins the sync overload — this module has no async hooks, and a
  // Promise here would force every caller to await for no reason.
  const html = md.parse(markdown, { async: false });

  // Counted off the raw Markdown rather than the HTML: close enough for a
  // "5 min read" estimate, and it needs no DOM to strip tags.
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;

  return {
    html,
    headings,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
  };
}
