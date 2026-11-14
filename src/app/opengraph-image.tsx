import { ImageResponse } from "next/og";

/**
 * Default social preview for every page that doesn't set its own image
 * (the blog uses each post's hero). Without this, links shared on WhatsApp,
 * Facebook or LinkedIn show no picture.
 */
export const alt = "AcreInfotech — find your next home in Uttar Pradesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1, color: "#a78bfa" }}>AcreInfotech</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Find your next home in Uttar Pradesh
          </div>
          <div style={{ fontSize: 32, color: "#a1a1aa" }}>
            RERA-registered projects · Floor plans · Honest advice
          </div>
        </div>
      </div>
    ),
    size,
  );
}
