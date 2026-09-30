"use client";

import { useState } from "react";
import { Icon } from "./IconSprite";

/**
 * Share row for a blog post.
 *
 * Client Component for one reason only: the copy-link button needs
 * navigator.clipboard. The three share targets are plain intent URLs and would
 * work with JS disabled.
 *
 * `url` and `title` are passed in from the server (built from SITE_URL) rather
 * than read off `window.location`, so the links are correct on first paint and
 * identical in the server-rendered HTML.
 */
export function ArticleShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Insecure origin, denied permission, or no clipboard API — the share
      // links beside this button still work, same spirit as ThemeToggle's
      // localStorage guard.
    }
  }

  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  return (
    <div className="article-share">
      <div className="aside-title">
        <Icon name="share" className="icon icon-sm" />
        Share
      </div>
      <div className="article-share-row">
        <button type="button" className="share-btn" onClick={copy}>
          <Icon name="link" className="icon icon-sm" />
          {copied ? "Copied" : "Copy link"}
        </button>
        {targets.map((t) => (
          <a key={t.label} className="share-btn" href={t.href} target="_blank" rel="noopener noreferrer">
            {t.label}
          </a>
        ))}
      </div>
      {/*
        aria-live so the visual "Copied" swap is announced too — a screen-reader
        user otherwise gets no confirmation that the button did anything.
        Always rendered (not mounted on copy) so the region exists before the
        update, which is what makes the announcement fire.
      */}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
