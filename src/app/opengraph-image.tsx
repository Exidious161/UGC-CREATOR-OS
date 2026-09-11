import { ImageResponse } from "next/og";

export const alt = "UGC Creator OS — the complete system for UGC creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          backgroundColor: "#F8F1E3",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#C95432",
            textTransform: "uppercase",
          }}
        >
          The Complete System for UGC Creators
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, lineHeight: 0.95 }}>
          <span style={{ display: "flex", fontSize: 140, fontWeight: 800, color: "#C95432" }}>
            UGC Creator
          </span>
          <span style={{ display: "flex", fontSize: 140, fontWeight: 800, color: "#2B2521" }}>
            OS
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 30,
            color: "#2B2521",
            opacity: 0.75,
          }}
        >
          Ideas, hooks, scripts &amp; brand pitches — one complete system.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#C95432",
              color: "#FFFFFF",
              fontSize: 26,
              fontWeight: 700,
              padding: "16px 32px",
              borderRadius: 999,
            }}
          >
            ₹199 · One-time payment
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
