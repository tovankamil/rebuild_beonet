import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const cardSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 13, stiffness: 75 },
  });

  const btnSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Glowing pulse on the CTA button
  const buttonPulse = Math.sin(frame * 0.15) * 0.05 + 1;

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
      }}
    >
      <Background accentColor="#10b981" />

      {/* Header Pill */}
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
        PELUANG USAHA DIGITAL BERSAMA BIONET
      </div>

      {/* Main Title */}
      <div
        style={{
          textAlign: "center",
          maxWidth: "1000px",
          marginBottom: "32px",
          transform: `scale(${Math.min(1, Math.max(0, titleSpring))})`,
          opacity: Math.min(1, Math.max(0, titleSpring)),
        }}
      >
        <h2
          style={{
            fontSize: "52px",
            fontWeight: 900,
            lineHeight: 1.15,
            margin: "0 0 14px 0",
            background: "linear-gradient(135deg, #ffffff 40%, #a7f3d0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-1px",
          }}
        >
          Siap Bangun Penghasilan Harian dari Rumah?
        </h2>
        <p
          style={{
            fontSize: "22px",
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Gabung Bersama Ribuan Mitra Bionet di Seluruh Indonesia Hari Ini
        </p>
      </div>

      {/* Highlights 3 Box */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          width: "980px",
          marginBottom: "40px",
          transform: `scale(${Math.min(1, Math.max(0, cardSpring))})`,
          opacity: Math.min(1, Math.max(0, cardSpring)),
        }}
      >
        {[
          {
            icon: "🌐",
            title: "Website Replika Otomatis",
            desc: "Toko online afiliasi siap pakai langsung aktif atas nama Anda.",
          },
          {
            icon: "🤖",
            title: "Akses 7 Fitur Cerdas AI",
            desc: "Flyer berstempel, copywriting viral, dan gambar HD tanpa desain manual.",
          },
          {
            icon: "⚡",
            title: "Pencairan Bonus Harian",
            desc: "Komisi pasangan dan sponsor langsung transfer via Flip.id.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              backgroundColor: "rgba(3, 30, 23, 0.75)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              borderRadius: "18px",
              padding: "24px 20px",
              backdropFilter: "blur(12px)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>{item.icon}</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
              {item.title}
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Big Action CTA Button */}
      <div
        style={{
          transform: `scale(${Math.min(1, Math.max(0, btnSpring)) * buttonPulse})`,
          opacity: Math.min(1, Math.max(0, btnSpring)),
          backgroundColor: "#10b981",
          backgroundImage: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "2px solid #34d399",
          borderRadius: "999px",
          padding: "18px 48px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 0 40px rgba(16, 185, 129, 0.5), 0 20px 30px rgba(0,0,0,0.4)",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "1px" }}>
          KUNJUNGI & DAFTAR SEKARANG: WWW.BIONET.ID
        </span>
        <span
          style={{
            backgroundColor: "#ffffff",
            color: "#064e3b",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 800,
          }}
        >
          ➔
        </span>
      </div>

      {/* Footer Branding */}
      <div
        style={{
          marginTop: "32px",
          fontSize: "14px",
          color: "#64748b",
          fontWeight: 500,
          letterSpacing: "0.5px",
        }}
      >
        PT BIONET HERBAL INDONESIA • Solusi Herbal Resmi BPOM & Kemitraan Digital Terpercaya
      </div>
    </div>
  );
};

