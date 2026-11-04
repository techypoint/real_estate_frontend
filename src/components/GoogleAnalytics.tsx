import Script from "next/script";

const GA_MEASUREMENT_ID = "G-MEDML4NSCD";

/** Only loaded in production so local/dev traffic doesn't skew analytics — and never counts /admin. */
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // The founder's own admin-panel visits aren't site traffic.
          if (!location.pathname.startsWith('/admin')) {
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          }
        `}
      </Script>
    </>
  );
}
