/**
 * AcreInfotech's public social profiles.
 *
 * Centralised because the same two URLs are needed by three unrelated files —
 * the footer (SiteChrome), the contact page, and the Organization `sameAs`
 * JSON-LD in the root layout — and one of them is a bare numeric Facebook
 * profile id that nobody can eyeball for correctness. Three hand-written
 * copies of `profile.php?id=61594832703762` is how one of them silently
 * becomes wrong.
 *
 * `icon` is the suffix of a symbol id in IconSprite.tsx (`icon-instagram`,
 * `icon-facebook`), consumed via `<Icon name={icon} />`.
 *
 * Adding a platform later is one entry here plus one `<symbol>` in the sprite;
 * every consumer maps over this array.
 */

export type SocialLink = {
  /** Platform name, used as the visible/accessible label. */
  label: string;
  href: string;
  /** Handle shown instead of the URL — the Facebook id reads as noise. */
  handle: string;
  /** IconSprite symbol id, minus the `icon-` prefix. */
  icon: string;
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/acreinfotech",
    handle: "@acreinfotech",
    icon: "instagram",
  },
  {
    // Pre-vanity-URL form. If the page ever claims a username, swap the href
    // here and `sameAs` picks up the canonical URL with no other edits.
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594832703762",
    handle: "AcreInfotech",
    icon: "facebook",
  },
];
