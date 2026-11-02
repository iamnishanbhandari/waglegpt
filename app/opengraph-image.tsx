import { ImageResponse } from "next/og";
export const alt = "WagleGPT — Unofficial Nepali vocabulary satire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#f7f0df", color: "#2c2923", display: "flex", flexDirection: "column", padding: 55, border: "18px solid #2c2923" }}><div style={{ fontSize: 19, color: "#a33729", letterSpacing: 5 }}>THE UNOFFICIAL VOCABULARY DEPARTMENT</div><div style={{ display: "flex", fontSize: 143, fontWeight: 800, marginTop: 45, letterSpacing: -8 }}>Wagle<span style={{ color: "#a33729" }}>GPT.</span></div><div style={{ fontSize: 36, marginTop: 15 }}>Small talk. Extraordinarily large words.</div><div style={{ fontSize: 21, borderTop: "2px solid #2c2923", marginTop: 55, paddingTop: 25 }}>TRANSLATE · LAUGH · SHARE A CARTOON</div><div style={{ fontSize: 16, color: "#77705f", marginTop: 20 }}>UNOFFICIAL PARODY — NOT AFFILIATED WITH SWARNIM WAGLE</div></div>, size);
}
