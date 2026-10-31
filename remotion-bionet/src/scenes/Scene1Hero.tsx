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

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 85, mass: 0.8 },
  });

  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const cardSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 70 },
  });

  // Slow subtle Ken Burns on preview image
  const imgScale = interpolate(frame, [0, 160], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  // Fade out towards transition
  const exitOpacity = interpolate(frame, [130, 150], [1, 0], {
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
      <Background />

      {/* Top Header Pill */}
      <div
        style={{
          transform: `scale(${Math.min(1, Math.max(0, logoSpring))}) translateY(${interpolate(
            logoSpring,
            [0, 1],
            [-30, 0]
          )}px)`,
          opacity: Math.min(1, Math.max(0, logoSpring)),
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "rgba(6, 78, 59, 0.75)",
          border: "1px solid rgba(52, 211, 153, 0.4)",
          borderRadius: "999px",
          padding: "8px 24px",
          marginBottom: "24px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
            boxShadow: "0 0 12px #10b981",
          }}
        />
        <span
          style={{
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "2.5px",
            color: "#34d399",
            textTransform: "uppercase",
          }}
        >
          PT BIONET HERBAL INDONESIA
        </span>
        <span
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.2)",
            border: "1px solid rgba(245, 158, 11, 0.5)",
            color: "#fbbf24",
            padding: "2px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          BPOM RESMI
        </span>
      </div>

      {/* Main Title & Subtitle */}
      <div
        style={{
          textAlign: "center",
          maxWidth: "1080px",
          marginBottom: "40px",
          transform: `scale(${Math.min(1, Math.max(0, titleSpring))})`,
          opacity: Math.min(1, Math.max(0, titleSpring)),
        }}
      >
        <h1
          style={{
            fontSize: "58px",
            fontWeight: 900,
            lineHeight: 1.15,
            margin: "0 0 16px 0",
            background: "linear-gradient(135deg, #ffffff 40%, #a7f3d0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-1px",
            textShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          Ekosistem Bisnis Herbal Digital & Binary Network Masa Depan
        </h1>
        <p
          style={{
            fontSize: "22px",
            color: "#94a3b8",
            margin: 0,
            fontWeight: 400,
            letterSpacing: "0.2px",
          }}
        >
          Kombinasi Sinergis Produk Kesehatan Alami BPOM & Otomasi Digital 7 AI Tools
        </p>
      </div>

      {/* Hero Showcase Center Banner */}
      <div
        style={{
          position: "relative",
          width: "920px",
          height: "380px",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(52, 211, 153, 0.35)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.2)",
          transform: `scale(${Math.min(1, Math.max(0, cardSpring))}) translateY(${interpolate(
            cardSpring,
            [0, 1],
            [40, 0]
          )}px)`,
          opacity: Math.min(1, Math.max(0, cardSpring)),
        }}
      >
        <Img
          src={staticFile("bionet_biotech.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to right, rgba(2, 28, 21, 0.95) 0%, rgba(2, 28, 21, 0.5) 45%, rgba(2, 28, 21, 0.2) 100%)",
          }}
        />

        {/* Floating Feature Badges over Image */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#fbbf24",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            STANDAR KUALITAS TERTINGGI
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#ffffff",
              maxWidth: "520px",
              lineHeight: 1.25,
            }}
          >
            Bioteknologi Ekstraksi Alami Berizin POM TR 226012891
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            {["100% Herbal Alami", "Standar CPOTB", "Halal Indonesia", "Teknologi 7 AI"].map(
              (tag, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "rgba(6, 78, 59, 0.8)",
                    border: "1px solid rgba(52, 211, 153, 0.5)",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#a7f3d0",
                  }}
                >
                  {tag}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

