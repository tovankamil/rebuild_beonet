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

export const Scene4Products: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const product1Spring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 13, stiffness: 75 },
  });

  const product2Spring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 13, stiffness: 75 },
  });

  // Slow smooth zoom on products
  const zoom1 = interpolate(frame, [0, 180], [1, 1.06], {
    extrapolateRight: "clamp",
  });
  const zoom2 = interpolate(frame, [0, 180], [1, 1.06], {
    extrapolateRight: "clamp",
  });

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
      <Background accentColor="#10b981" />

      {/* Category Pill */}
      <div
        style={{
          transform: `scale(${Math.min(1, Math.max(0, titleSpring))})`,
          opacity: Math.min(1, Math.max(0, titleSpring)),
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "999px",
          padding: "6px 20px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#34d399",
          letterSpacing: "2px",
          marginBottom: "16px",
          textTransform: "uppercase",
        }}
      >
        PRODUK UNGGULAN BERSTANDAR TERTINGGI
      </div>

      {/* Scene Heading */}
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
            background: "linear-gradient(135deg, #ffffff 40%, #6ee7b7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          Produk Herbal Alami Berizin Edar Resmi BPOM
        </h2>
        <p
          style={{
            fontSize: "20px",
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Kualitas Bahan Alami Premium dengan Bukti Khasiat Nyata & Repeat Order Konsumen yang Tinggi
        </p>
      </div>

      {/* 2 Flagship Products Display */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          width: "1100px",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {/* Product 1: Bio-Propolis Trigona */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(3, 30, 23, 0.8)",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            transform: `scale(${Math.min(1, Math.max(0, product1Spring))})`,
            opacity: Math.min(1, Math.max(0, product1Spring)),
          }}
        >
          <div style={{ height: "260px", overflow: "hidden", position: "relative" }}>
            <Img
              src={staticFile("bio_propolis.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${zoom1})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                backgroundColor: "rgba(245, 158, 11, 0.9)",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "999px",
                letterSpacing: "0.5px",
              }}
            >
              POM TR 226012891
            </div>
          </div>
          <div style={{ padding: "24px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
              Bio-Propolis Trigona
            </div>
            <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5, margin: "0 0 16px 0" }}>
              100% Propolis Lebah Trigona murni tanpa lilin (wax-free) & bebas alkohol. Cepat meredakan nyeri persendian, asam urat, dan radang.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["100% Alami", "Bebas Alkohol", "Kemurnian Tinggi"].map((badge, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#6ee7b7",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "6px",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product 2: Bio-Herbal Drops */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(3, 30, 23, 0.8)",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            transform: `scale(${Math.min(1, Math.max(0, product2Spring))})`,
            opacity: Math.min(1, Math.max(0, product2Spring)),
          }}
        >
          <div style={{ height: "260px", overflow: "hidden", position: "relative" }}>
            <Img
              src={staticFile("bio_herbal_drops.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${zoom2})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                backgroundColor: "rgba(16, 185, 129, 0.9)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "999px",
                letterSpacing: "0.5px",
              }}
            >
              STANDAR CPOTB
            </div>
          </div>
          <div style={{ padding: "24px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
              Bio-Herbal Drops
            </div>
            <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5, margin: "0 0 16px 0" }}>
              Formula konsentrat tetes herbal dengan teknologi nano-ekstraksi. Membantu menjaga metabolisme gula darah, imunitas, dan kebugaran tubuh harian.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Ekstrak Nano", "Halal MUI", "Garansi Asli"].map((badge, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    color: "#fbbf24",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "6px",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

