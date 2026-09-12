"use client";

import { useEffect, useState } from "react";
import { Icon } from "./IconSprite";

/**
 * Two supported themes: Arctic Violet (light, default — no attribute) and
 * Mono + Pop (dark — `data-theme="dark"`). See globals.css :root /
 * :root[data-theme="dark"] for the token blocks this flips between.
 */
export const THEME_STORAGE_KEY = "theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // ThemeScript (below) already applied the saved theme before first paint;
  // this only syncs React's copy of it, so the icon is right on load.
  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !isDark;
    const root = document.documentElement;
    if (next) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private mode / storage disabled — the theme still applies for this page.
    }
    setIsDark(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <Icon name={isDark ? "sun" : "moon"} />
    </button>
  );
}

/**
 * Applies the saved theme before first paint.
 *
 * Without this the server-rendered HTML paints in the default light theme
 * and then snaps to dark once React hydrates — a full-page colour flash on
 * every navigation for anyone who picked dark. Has to be a blocking inline
 * script in <head>; there is no way to read localStorage earlier.
 */
export function ThemeScript() {
  const js = `(function(){try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==="dark")document.documentElement.setAttribute("data-theme","dark");}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
