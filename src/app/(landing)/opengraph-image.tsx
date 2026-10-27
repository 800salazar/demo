import { ImageResponse } from "next/og";
import { profile } from "@/config/profile";

export const alt = "Adán Salazar · Estrategia digital y tecnología";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#101b2b", color: "#f0f4fb", padding: "68px 76px", fontFamily: "sans-serif", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", color: "#a6b4c8", fontSize: 20, letterSpacing: 4 }}>ADÁN SALAZAR / ESTRATEGIA + TECNOLOGÍA</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.1, letterSpacing: -3 }}>
          <span>Expertos en</span><span style={{ color: "#78aaff", fontWeight: 700 }}>Soluciones Digitales</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#a6b4c8", borderTop: "1px solid #344963", paddingTop: 22 }}><span>salazar.red</span><span>{profile.location}</span></div>
      </div>
    </div>,
    size,
  );
}
