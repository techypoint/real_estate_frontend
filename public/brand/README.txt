ACREINFOTECH — LOGO PACKAGE
Mark: "Roofline Data" (roof formed from rising data bars)
============================================================

TWO THEMES
----------
Your site runs a light and a dark theme with DIFFERENT accent colours,
so the logo ships in matching pairs. Always use the one that matches
the surface it sits on.

  LIGHT theme  -> indigo  #6366f1  on white, ink #0f172a
  DARK  theme  -> lime    #c8f52b  on near-black #0d0d0d, ink #ffffff


FOLDER GUIDE
------------
/svg   Vector masters. Infinitely scalable. Use wherever possible.
/png   Raster, transparent background. Web, decks, docs.
/jpg   Raster, background baked in (JPG cannot hold transparency).
/ico   Multi-resolution favicons, one per theme.


WHICH FILE DO I USE?
--------------------
Site header, light theme   -> svg/acreinfotech-logo-light.svg
Site header, dark theme    -> svg/acreinfotech-logo-dark.svg
Browser tab (light)        -> ico/favicon-light.ico
Browser tab (dark)         -> ico/favicon-dark.ico
iOS home screen            -> png/acreinfotech-appicon-dark-180w.png
Android / PWA manifest     -> png/acreinfotech-appicon-dark-192w.png + -512w.png
Social profile picture     -> png/acreinfotech-appicon-dark-1024w.png
Email signature            -> png/acreinfotech-logo-light-500w.png
Letterhead / invoices      -> svg/acreinfotech-logo-black.svg
Over a photo or video      -> svg/acreinfotech-logo-white.svg
Single-colour print, stamps-> svg/acreinfotech-icon-black.svg


NEXT.JS WIRING
--------------
Drop the favicons and app icons into /public, then in app/layout.tsx:

  export const metadata = {
    icons: {
      icon: [
        { url: '/favicon-light.ico', media: '(prefers-color-scheme: light)' },
        { url: '/favicon-dark.ico',  media: '(prefers-color-scheme: dark)'  },
      ],
      apple: '/acreinfotech-appicon-dark-180w.png',
    },
  }

For the header, render the SVG inline and swap fill via currentColor, or
conditionally load the light/dark file off your theme attribute.


CLEAR SPACE & MINIMUM SIZE
--------------------------
Keep clear space around the logo equal to the height of the roof mark.
Minimum: full lockup 140px wide / 35mm print.
         icon only    24px wide /  8mm print.
The wordmark is longer than the old one, so do not go below 140px or
"RERA DATA REAL ESTATE PLATFORM" becomes unreadable. Below that, use
the icon on its own.


TYPEFACE NOTE
-------------
The wordmark uses a system sans (Segoe UI / Helvetica / Arial) as a
placeholder. Before printing anything permanent or filing a trademark,
reset it in a licensed face — Inter, General Sans or Söhne all suit
this mark — and CONVERT THE TEXT TO OUTLINES so it renders identically
everywhere regardless of installed fonts.


DO NOT
------
- Stretch or squash (always scale proportionally)
- Use the indigo version on dark, or the lime version on light
- Recolour outside the two palettes above
- Add drop shadows, outlines or gradients
- Rebuild the mark by hand — always use these source files
