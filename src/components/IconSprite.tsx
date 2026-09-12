/**
 * Inline SVG symbol sprite — self-contained, no icon font or CDN.
 *
 * Stroke width 2.25–2.5 throughout, per the design system: icons carry visual
 * weight consistent with the Archivo Black headings. Rendered once in the root
 * layout; every `<use href="#icon-…">` on the page references it.
 */
export function IconSprite() {
  return (
    <svg style={{ display: "none" }} aria-hidden="true">
      <symbol id="icon-search" viewBox="0 0 20 20">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.25" />
        <line x1="13" y1="13" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      </symbol>
      <symbol id="icon-filter" viewBox="0 0 20 20">
        <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <circle cx="7" cy="5" r="2.25" fill="currentColor" />
        <circle cx="13" cy="10" r="2.25" fill="currentColor" />
        <circle cx="9" cy="15" r="2.25" fill="currentColor" />
      </symbol>
      <symbol id="icon-home" viewBox="0 0 20 20">
        <path d="M3 9.5L10 3L17 9.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M5 8V17H15V8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-file" viewBox="0 0 20 20">
        <path d="M5 2.5H12L15.5 6V17.5H5V2.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M12 2.5V6H15.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <line x1="7.5" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="7.5" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>
      <symbol id="icon-download" viewBox="0 0 20 20">
        <path d="M10 3V13" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <path d="M6 9.5L10 13.5L14 9.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M4 17H16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      </symbol>
      <symbol id="icon-chevron-up" viewBox="0 0 20 20">
        <path d="M5 12L10 7L15 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-map-pin" viewBox="0 0 20 20">
        <path d="M10 18C10 18 16 12.5 16 8A6 6 0 104 8C4 12.5 10 18 10 18Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      </symbol>
      <symbol id="icon-phone" viewBox="0 0 20 20">
        <path d="M6.5 3.5C6.5 3.5 5 3.7 5 5.2C5 11.5 8.5 15 14.8 15C16.3 15 16.5 13.5 16.5 13.5L13.3 11L11.7 12C10.4 11.2 8.8 9.6 8 8.3L9 6.7L6.5 3.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-mail" viewBox="0 0 20 20">
        <rect x="3" y="5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M3.5 6L10 11L16.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-x" viewBox="0 0 20 20">
        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </symbol>
      <symbol id="icon-inbox" viewBox="0 0 20 20">
        <path d="M3 11L5.5 4H14.5L17 11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M3 11V16H17V11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M3 11H7.5L8.5 13H11.5L12.5 11H17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-info" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="10" y1="9" x2="10" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="6.3" r="1.15" fill="currentColor" />
      </symbol>
      <symbol id="icon-list" viewBox="0 0 20 20">
        <line x1="4" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="4" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      </symbol>
      <symbol id="icon-cube" viewBox="0 0 20 20">
        <path d="M10 2.5L17 6.25V13.75L10 17.5L3 13.75V6.25L10 2.5Z" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" fill="none" />
        <path d="M3 6.25L10 10L17 6.25" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" fill="none" />
        <path d="M10 10V17.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      </symbol>
      <symbol id="icon-shield" viewBox="0 0 20 20">
        <path d="M10 2.5L16.5 5V9.5C16.5 13.5 13.7 16.7 10 17.5C6.3 16.7 3.5 13.5 3.5 9.5V5L10 2.5Z" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" fill="none" />
        <path d="M7 10L9.2 12.2L13.2 8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-chevron-left" viewBox="0 0 20 20">
        <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-chevron-right" viewBox="0 0 20 20">
        <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-heart" viewBox="0 0 20 20">
        <path d="M10 17.2C10 17.2 3 12.6 3 7.7C3 5.1 5 3.3 7.4 3.3C8.8 3.3 9.7 4 10 4.7C10.3 4 11.2 3.3 12.6 3.3C15 3.3 17 5.1 17 7.7C17 12.6 10 17.2 10 17.2Z" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" fill="none" />
      </symbol>
      <symbol id="icon-tag" viewBox="0 0 20 20">
        <path d="M10.3 3H5C3.9 3 3 3.9 3 5V10.3C3 10.8 3.2 11.3 3.6 11.7L11.3 19.4C12.1 20.2 13.4 20.2 14.1 19.4L19.4 14.1C20.2 13.4 20.2 12.1 19.4 11.3L11.7 3.6C11.3 3.2 10.8 3 10.3 3Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" fill="none" />
        <circle cx="6.8" cy="6.8" r="1.3" fill="currentColor" />
      </symbol>
      <symbol id="icon-sun" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="2.25" fill="none" />
        <line x1="10" y1="1.5" x2="10" y2="3.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="10" y1="16.5" x2="10" y2="18.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="1.5" y1="10" x2="3.5" y2="10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="16.5" y1="10" x2="18.5" y2="10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="14.4" y1="14.4" x2="15.8" y2="15.8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="4.2" y1="15.8" x2="5.6" y2="14.4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="14.4" y1="5.6" x2="15.8" y2="4.2" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      </symbol>
      <symbol id="icon-moon" viewBox="0 0 20 20">
        <path d="M17 12.3A7.3 7.3 0 018 3.3a.6.6 0 00-.8-.6A7.7 7.7 0 1017.6 13a.6.6 0 00-.6-.7z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" fill="none" />
      </symbol>
    </svg>
  );
}

/** Convenience wrapper so callers don't repeat the `<use href>` boilerplate. */
export function Icon({ name, className = "icon" }: { name: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#icon-${name}`} />
    </svg>
  );
}
