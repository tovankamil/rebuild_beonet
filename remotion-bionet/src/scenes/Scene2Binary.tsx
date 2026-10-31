import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";

export const Scene2Binary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const treeSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 13, stiffness: 75 },
  });

  const cardsSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Animated pairing counter: 0 to 2,450,000
  const bonusAmount = Math.floor(
    interpolate(frame, [25, 90], [0, 2450000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const pairsCount = Math.floor(
    interpolate(frame, [25, 90], [0, 98], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Pulse effect on pairing match
  const pulse = Math.sin(frame * 0.2) * 0.15 + 1;

  // Exit fade
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
      <Background accentColor="#38bdf8" />

      {/* Category Pill */}
      <div
        style={{
          transform: `scale(${Math.min(1, Math.max(0, headerSpring))})`,
          opacity: Math.min(1, Math.max(0, headerSpring)),
          backgroundColor: "rgba(14, 165, 233, 0.15)",
          border: "1px solid rgba(56, 189, 248, 0.4)",
          borderRadius: "999px",
          padding: "6px 20px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#38bdf8",
          letterSpacing: "2px",
          marginBottom: "16px",
          textTransform: "uppercase",
        }}
      >
        JARINGAN BINARY REAL-TIME • CLOSURE TABLE
      </div>

      {/* Scene Heading */}
      <div
        style={{
          textAlign: "center",
          maxWidth: "1100px",
          marginBottom: "36px",
          transform: `scale(${Math.min(1, Math.max(0, headerSpring))})`,
          opacity: Math.min(1, Math.max(0, headerSpring)),
        }}
      >
        <h2
          style={{
            fontSize: "46px",
            fontWeight: 900,
            lineHeight: 1.2,
            margin: "0 0 10px 0",
            background: "linear-gradient(135deg, #ffffff 40%, #7dd3fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          Sistem Komisi Binary Cepat, Adil & Otomatis
        </h2>
        <p
          style={{
            fontSize: "20px",
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Keseimbangan Omset Kaki Kiri & Kanan dengan Pencairan Harian Tanpa Menunggu Akhir Bulan
        </p>
      </div>

      {/* Main Interactive Grid Layout */}
      <div
        style={{
          display: "flex",
          gap: "36px",
          width: "1100px",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {/* Left Column: Visual Binary Tree */}
        <div
          style={{
            flex: 1.1,
            backgroundColor: "rgba(6, 32, 26, 0.75)",
            border: "1px solid rgba(52, 211, 153, 0.3)",
            borderRadius: "20px",
            padding: "28px 24px",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${Math.min(1, Math.max(0, treeSpring))})`,
            opacity: Math.min(1, Math.max(0, treeSpring)),
          }}
        >
          {/* Root Node */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "#064e3b",
              border: "2px solid #10b981",
              borderRadius: "14px",
              padding: "10px 24px",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#022c22",
                fontSize: "16px",
              }}
            >
              M
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                Mitra Juara Perkasa (Anda)
              </div>
              <div style={{ fontSize: "12px", color: "#6ee7b7" }}>ID: MITRA01 • Level Aktif</div>
            </div>
          </div>

          {/* Laser connector SVG */}
          <svg width="340" height="60" style={{ margin: "4px 0" }}>
            <path
              d="M 170 0 L 170 30 L 70 30 L 70 60"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <path
              d="M 170 0 L 170 30 L 270 30 L 270 60"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Binary Left & Right Legs */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              gap: "16px",
            }}
          >
            {/* Left Branch */}
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(6, 78, 59, 0.6)",
                border: "1px solid rgba(52, 211, 153, 0.4)",
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#a7f3d0", letterSpacing: "1px" }}>
                KAKI KIRI (L)
              </div>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "#ffffff", margin: "6px 0" }}>
                125
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Poin Volume Penjualan</div>
            </div>

            {/* Right Branch */}
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(12, 74, 110, 0.6)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#7dd3fc", letterSpacing: "1px" }}>
                KAKI KANAN (R)
              </div>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "#ffffff", margin: "6px 0" }}>
                98
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Poin Volume Penjualan</div>
            </div>
          </div>

          {/* Pairing Match Notification */}
          <div
            style={{
              marginTop: "20px",
              width: "100%",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.5)",
              borderRadius: "12px",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `scale(${pulse})`,
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#fbbf24" }}>
              ⚡ HASIL KESEIMBANGAN:
            </span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>
              {pairsCount} Pasang Terpenuhi
            </span>
          </div>
        </div>

        {/* Right Column: Earnings & Automated Payout Card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            transform: `scale(${Math.min(1, Math.max(0, cardsSpring))})`,
            opacity: Math.min(1, Math.max(0, cardsSpring)),
          }}
        >
          {/* Big Bonus Card */}
          <div
            style={{
              backgroundColor: "rgba(4, 47, 46, 0.85)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#34d399", letterSpacing: "1.5px" }}>
              BONUS PASANGAN HARIAN
            </div>
            <div
              style={{
                fontSize: "44px",
                fontWeight: 900,
                color: "#fbbf24",
                margin: "10px 0 6px 0",
                fontFamily: "monospace",
              }}
            >
              Rp {bonusAmount.toLocaleString("id-ID")}
            </div>
            <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
              Formula Rp 25.000 / pasang • Sisa poin tidak hangus (Carry Forward)
            </div>
          </div>

          {/* Instant Flip.id Payout Card */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              borderRadius: "18px",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🏦
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                Pencairan Otomatis Flip.id Gateway
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
                Dana komisi langsung transfer ke 100+ bank di Indonesia secara real-time.
              </div>
            </div>
          </div>

          {/* Anti Overpay Compliance Card */}
          <div
            style={{
              backgroundColor: "rgba(2, 44, 34, 0.7)",
              border: "1px solid rgba(52, 211, 153, 0.25)",
              borderRadius: "18px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 10px #10b981",
              }}
            />
            <div style={{ fontSize: "13px", color: "#a7f3d0", fontWeight: 500 }}>
              <strong style={{ color: "#ffffff" }}>Standar Keamanan APLI & Kemendag:</strong> Payout aman 45% dengan kalkulator simulasi anti-overpay.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

