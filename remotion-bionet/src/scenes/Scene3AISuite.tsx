import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import { Background } from "../components/Background";

export const Scene3AISuite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const cardsSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 13, stiffness: 75 },
  });

  const previewSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 70 },
  });

  // Soundwave animation simulation for Voice Note
  const waveBars = [35, 60, 90, 45, 80, 100, 75, 40, 85, 95, 60, 30];

  // Exit transition
  const exitOpacity = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: "clamp",
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
        justifyContent: "center",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        opacity: exitOpacity,
      }}
    >
      <Background accentColor="#f59e0b" />

      {/* Top Pill */}
      <div
        style={{
          transform: `scale(${Math.min(1, Math.max(0, titleSpring))})`,
          opacity: Math.min(1, Math.max(0, titleSpring)),
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          borderRadius: "999px",
          padding: "6px 20px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#fbbf24",
          letterSpacing: "2px",
          marginBottom: "16px",
          textTransform: "uppercase",
        }}
      >
        TEKNOLOGI KECERDASAN BUATAN • BIONET AI HUB
      </div>

      {/* Main Title */}
      <div
        style={{
          textAlign: "center",
          maxWidth: "1100px",
          marginBottom: "36px",
          transform: `scale(${Math.min(1, Math.max(0, titleSpring))})`,
          opacity: Math.min(1, Math.max(0, titleSpring)),
        }}
      >
        <h2
          style={{
            fontSize: "46px",
            fontWeight: 900,
            lineHeight: 1.2,
            margin: "0 0 10px 0",
            background: "linear-gradient(135deg, #ffffff 40%, #fde68a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          7 Fitur Cerdas AI: Promosi & Rekrutmen Otomatis
        </h2>
        <p
          style={{
            fontSize: "20px",
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Setiap Mitra Dilengkapi Alat Bantu Pemasaran Tercanggih Tanpa Perlu Desain Manual
        </p>
      </div>

      {/* 2-Column AI Features Showcase */}
      <div
        style={{
          display: "flex",
          gap: "36px",
          width: "1120px",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {/* Left Column: Feature Cards */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            transform: `scale(${Math.min(1, Math.max(0, cardsSpring))})`,
            opacity: Math.min(1, Math.max(0, cardsSpring)),
          }}
        >
          {/* Feature 1: AI Image Generator */}
          <div
            style={{
              backgroundColor: "rgba(6, 44, 34, 0.75)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              borderRadius: "16px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              🎨
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                AI Image Generator 8K
              </div>
              <div style={{ fontSize: "13px", color: "#a7f3d0" }}>
                Render foto produk & wirausaha fotorealistik hitungan detik via Gemini & FLUX.
              </div>
            </div>
          </div>

          {/* Feature 2: Studio Marketing Kit */}
          <div
            style={{
              backgroundColor: "rgba(6, 44, 34, 0.75)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              borderRadius: "16px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              📄
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                Marketing Kit Berstempel Otomatis
              </div>
              <div style={{ fontSize: "13px", color: "#fde68a" }}>
                Flyer promosi HD siap cetak dengan nama, nomor WA, dan ID Referral mitra Anda.
              </div>
            </div>
          </div>

          {/* Feature 3: AI Voice Note */}
          <div
            style={{
              backgroundColor: "rgba(6, 44, 34, 0.75)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              borderRadius: "16px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(56, 189, 248, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              🎙️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                AI Voice Note WhatsApp
              </div>
              <div style={{ fontSize: "13px", color: "#7dd3fc", marginBottom: "8px" }}>
                Audio voice note natural untuk edukasi & follow up prospek.
              </div>

              {/* Animated Waveform equalizer */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "20px" }}>
                {waveBars.map((height, i) => {
                  const animHeight =
                    ((Math.sin(frame * 0.2 + i) + 1) / 2) * (height * 0.7) + 6;
                  return (
                    <div
                      key={i}
                      style={{
                        width: "4px",
                        height: `${animHeight}px`,
                        backgroundColor: "#38bdf8",
                        borderRadius: "2px",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feature 4: Copywriting & Business Simulator */}
          <div
            style={{
              backgroundColor: "rgba(6, 44, 34, 0.75)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              borderRadius: "16px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(168, 85, 247, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              🚀
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                Viral Copywriting & Simulasi Anti-Overpay
              </div>
              <div style={{ fontSize: "13px", color: "#e9d5ff" }}>
                Naskah 1-klik sebar & transparansi perhitungan komisi standar APLI.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Product Flyer with Stempel */}
        <div
          style={{
            flex: 0.9,
            backgroundColor: "rgba(3, 30, 23, 0.85)",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${Math.min(1, Math.max(0, previewSpring))})`,
            opacity: Math.min(1, Math.max(0, previewSpring)),
          }}
        >
          <div
            style={{
              width: "100%",
              height: "240px",
              borderRadius: "14px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Img
              src={staticFile("bionet_business.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                backgroundColor: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(8px)",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#10b981",
                border: "1px solid #10b981",
              }}
            >
              PROMOSI SIAP SEBAR
            </div>
          </div>

          {/* Stempel Mitra Box */}
          <div
            style={{
              width: "100%",
              marginTop: "16px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              border: "1px solid #fbbf24",
              borderRadius: "12px",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#fbbf24",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                ★ STEMPEL MITRA DISTRIBUSI RESMI
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
                Mitra Juara Perkasa
              </div>
              <div style={{ fontSize: "12px", color: "#34d399" }}>WhatsApp: 0812-9876-5432</div>
            </div>
            <div
              style={{
                backgroundColor: "#fbbf24",
                color: "#0f172a",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              MITRA01
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

