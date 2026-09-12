/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Floor plans and renders are served by the Java API as absolute CDN URLs
    // (CdnUrlResolver composes them from the stored R2 object key) — the
    // browser hits the CDN edge directly, next/image just needs the hostname
    // allowed to optimise them. Update this if the CDN domain ever changes.
    remotePatterns: [
      { protocol: "https", hostname: "media.acreinfotech.com" },
      // Local backend profile points app.cdn-base-url at the bare R2.dev
      // bucket URL instead of the custom domain — see real_estate_backend
      // application-local.properties.
      { protocol: "https", hostname: "pub-9e15b4f51c5d4efbaf348e497020fd0c.r2.dev" },
    ],
    // Floor plans are tall portraits; these widths cover phone -> desktop 2x.
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600],
    imageSizes: [128, 256, 384, 520],
    formats: ["image/avif", "image/webp"],
  },

  // The design system is hand-written global CSS ported verbatim from the
  // previous build; no CSS-in-JS runtime is involved.
  poweredByHeader: false,
};

export default nextConfig;
