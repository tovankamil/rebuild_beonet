import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Sequence,
} from "remotion";
import { Background } from "./components/Background";

// Vertical Scene 1: Hook
const VerticalScene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const imgZoom = interpolate(frame, [0, 150], [1, 1.1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "80px 40px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Background />

      <div
        style={{
          transform: `scale(${Math.min(1, Math.max(0, spr))})`,
          opacity: Math.min(1, Math.max(0, spr)),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(6, 78, 59, 0.8)",
            border: "1px solid #10b981",
            borderRadius: "999px",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: 800,
            color: "#34d399",
            letterSpacing: "2px",
          }}
        >
          PT BIONET HERBAL INDONESIA
        </div>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 900,
            lineHeight: 1.15,
            color: "#ffffff",
            margin: "12px 0 0 0",
          }}
        >
          Ekosistem Bisnis Herbal & Binary Terdepan
        </h1>
        <p style={{ fontSize: "24px", color: "#94a3b8", margin: 0 }}>
          Resmi BPOM RI • CPOTB • 7 Fitur Cerdas AI
        </p>
      </div>

      <div
        style={{
          width: "100%",
          height: "640px",
          borderRadius: "32px",
          overflow: "hidden",
          border: "2px solid rgba(52, 211, 153, 0.4)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        <Img
          src={staticFile("bionet_business.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgZoom})`,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {["Resmi BPOM", "Bonus Harian", "7 Alat AI", "Replika Gratis"].map((tag, i) => (
          <span
            key={i}
            style={{
              backgroundColor: "rgba(6, 78, 59, 0.85)",
              border: "1px solid #34d399",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "20px",
              fontWeight: 700,
              color: "#a7f3d0",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

// Vertical Scene 2: Binary
const VerticalScene2: React.FC = () => {
  const frame = useCurrentFrame();

  const bonusAmount = Math.floor(
    interpolate(frame, [15, 80], [0, 2450000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 40px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Background accentColor="#38bdf8" />

      <div
        style={{
          backgroundColor: "rgba(14, 165, 233, 0.2)",
          border: "1px solid #38bdf8",
          borderRadius: "999px",
          padding: "8px 24px",
          fontSize: "18px",
          fontWeight: 800,
          color: "#7dd3fc",
          letterSpacing: "2px",
          marginBottom: "20px",
        }}
      >
        JARINGAN BINARY REAL-TIME
      </div>

      <h2
        style={{
          fontSize: "52px",
          fontWeight: 900,
          textAlign: "center",
          color: "#ffffff",
          lineHeight: 1.2,
          margin: "0 0 36px 0",
        }}
      >
        Bonus Pasangan Harian Cair Cepat
      </h2>

      {/* Bonus Box */}
      <div
        style={{
          width: "100%",
          backgroundColor: "rgba(4, 47, 46, 0.9)",
          border: "2px solid #34d399",
          borderRadius: "28px",
          padding: "40px 30px",
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          marginBottom: "32px",
        }}
      >
        <div style={{ fontSize: "20px", color: "#34d399", fontWeight: 700 }}>
          ESTIMASI BONUS PASANGAN
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            color: "#fbbf24",
            margin: "16px 0",
            fontFamily: "monospace",
          }}
        >
          Rp {bonusAmount.toLocaleString("id-ID")}
        </div>
        <div style={{ fontSize: "18px", color: "#cbd5e1" }}>
          98 Pasang Terhitung • Sisa Poin Tersimpan
        </div>
      </div>

      <div
        style={{
          width: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          border: "1px solid #38bdf8",
          borderRadius: "24px",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <span style={{ fontSize: "40px" }}>🏦</span>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff" }}>
            Pencairan Otomatis Flip.id
          </div>
          <div style={{ fontSize: "16px", color: "#94a3b8", marginTop: "4px" }}>
            Transfer harian langsung ke 100+ bank tanpa ribet.
          </div>
        </div>
      </div>
    </div>
  );
};

// Vertical Scene 3: Products & AI
const VerticalScene3: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "80px 40px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Background accentColor="#f59e0b" />

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.2)",
            border: "1px solid #fbbf24",
            borderRadius: "999px",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: 800,
            color: "#fbbf24",
            display: "inline-block",
            marginBottom: "16px",
          }}
        >
          PRODUK UNGGULAN BPOM
        </div>
        <h2 style={{ fontSize: "48px", fontWeight: 900, color: "#ffffff", margin: 0 }}>
          Bio-Propolis & Bio-Herbal Drops
        </h2>
      </div>

      <div
        style={{
          width: "100%",
          height: "620px",
          borderRadius: "32px",
          overflow: "hidden",
          border: "2px solid #fbbf24",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        <Img
          src={staticFile("bio_propolis.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          width: "100%",
          backgroundColor: "#10b981",
          borderRadius: "24px",
          padding: "24px",
          textAlign: "center",
          boxShadow: "0 0 30px rgba(16, 185, 129, 0.5)",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: 900, color: "#ffffff" }}>
          DAFTAR SEKARANG DI WWW.BIONET.ID
        </div>
        <div style={{ fontSize: "16px", color: "#d1fae5", marginTop: "4px" }}>
          Dapatkan Toko Online & 7 AI Tools Gratis
        </div>
      </div>
    </div>
  );
};

export const VerticalCommercial: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#021c15" }}>
      <Sequence from={0} durationInFrames={150}>
        <VerticalScene1 />
      </Sequence>
      <Sequence from={150} durationInFrames={180}>
        <VerticalScene2 />
      </Sequence>
      <Sequence from={330} durationInFrames={180}>
        <VerticalScene3 />
      </Sequence>
    </div>
  );
};

