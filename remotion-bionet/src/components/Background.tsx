import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const Background: React.FC<{
  accentColor?: string;
}> = ({ accentColor = "#10b981" }) => {
  const frame = useCurrentFrame();

  // Floating ambient light positions
  const orb1X = interpolate(frame, [0, 900], [20, 80], {
    extrapolateRight: "clamp",
  });
  const orb1Y = interpolate(frame, [0, 900], [30, 60], {
    extrapolateRight: "clamp",
  });
  const orb2X = interpolate(frame, [0, 900], [80, 25], {
    extrapolateRight: "clamp",
  });
  const orb2Y = interpolate(frame, [0, 900], [70, 20], {
    extrapolateRight: "clamp",
  });

  const pulse = Math.sin(frame * 0.05) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#021c15",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Deep luxury radial mesh */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `
            radial-gradient(circle at ${orb1X}% ${orb1Y}%, rgba(16, 185, 129, ${0.28 * pulse}) 0%, transparent 50%),
            radial-gradient(circle at ${orb2X}% ${orb2Y}%, rgba(245, 158, 11, ${0.16 * pulse}) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(6, 78, 59, 0.4) 0%, #01140e 100%)
          `,
        }}
      />

      {/* Cyber/Tech Isometric Dot Matrix Grid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `
            radial-gradient(rgba(52, 211, 153, 0.12) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "36px 36px",
          opacity: 0.7,
        }}
      />

      {/* Subtle top & bottom vignette shadows */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, rgba(2, 28, 21, 0.6) 0%, transparent 20%, transparent 80%, rgba(2, 28, 21, 0.85) 100%)",
        }}
      />
    </div>
  );
};

