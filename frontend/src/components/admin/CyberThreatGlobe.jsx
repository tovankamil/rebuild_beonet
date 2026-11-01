import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Shield, Radio, AlertTriangle, Globe, Crosshair } from 'lucide-react';

/**
 * Approximate continental landmass detection for generating
 * realistic point-cloud earth continents on a cyber sphere.
 */
function isEarthLand(lat, lon) {
  // Normalize lon to [-180, 180]
  let nLon = lon;
  while (nLon > 180) nLon -= 360;
  while (nLon < -180) nLon += 360;

  // North America
  if (lat >= 15 && lat <= 72 && nLon >= -168 && nLon <= -52) {
    if (lat < 28 && nLon > -80) return false;
    if (lat > 52 && nLon > -60 && lat < 62) return false;
    return true;
  }
  // South America
  if (lat >= -56 && lat <= 12 && nLon >= -82 && nLon <= -34) {
    if (lat < -20 && nLon > -40) return false;
    return true;
  }
  // Europe
  if (lat >= 36 && lat <= 71 && nLon >= -10 && nLon <= 42) {
    if (lat < 42 && nLon < -9) return false;
    return true;
  }
  // Africa
  if (lat >= -35 && lat <= 37 && nLon >= -18 && nLon <= 52) {
    if (lat < 10 && nLon > 45) return false;
    if (lat > 30 && nLon < -10) return false;
    return true;
  }
  // Asia (including Middle East, India, China, Japan, Siberia)
  if (lat >= 8 && lat <= 76 && nLon >= 42 && nLon <= 180) {
    if (lat < 25 && nLon > 42 && nLon < 60) return true;
    if (lat < 30 && nLon > 68 && nLon < 90) return true;
    if (lat < 42 && nLon > 90 && nLon < 145) return true;
    if (lat >= 42) return true;
    return true;
  }
  // Southeast Asia & Nusantara (Indonesia, Malaysia, Philippines)
  if (lat >= -11 && lat <= 20 && nLon >= 95 && nLon <= 145) {
    return true;
  }
  // Australia & New Zealand
  if (lat >= -48 && lat <= -10 && nLon >= 112 && nLon <= 178) {
    return true;
  }
  return false;
}

// Nusantara Hub Node (Target destination for all incoming attack vectors & central telemetry hub)
const JAKARTA_HUB = {
  id: 'HUB-JKT',
  city: 'Jakarta (Nusantara Gateway)',
  province: 'DKI Jakarta',
  country: 'Indonesia',
  ip: '103.145.22.84',
  lat: -6.21,
  lon: 106.85,
  threatType: 'Bionet Primary WAF Shield',
  severity: 'Secure',
  color: '#10b981',
};

// Default Indonesian regional traffic nodes (used when system is clean & peaceful)
const INDONESIA_PERIMETER_NODES = [
  { id: 'NODE-SBY', city: 'Surabaya', province: 'Jawa Timur', lat: -7.25, lon: 112.75, count: 420 },
  { id: 'NODE-BDG', city: 'Bandung', province: 'Jawa Barat', lat: -6.91, lon: 107.61, count: 315 },
  { id: 'NODE-MDN', city: 'Medan', province: 'Sumatera Utara', lat: 3.59, lon: 98.67, count: 260 },
  { id: 'NODE-SMG', city: 'Semarang', province: 'Jawa Tengah', lat: -6.97, lon: 110.42, count: 210 },
  { id: 'NODE-MKS', city: 'Makassar', province: 'Sulawesi Selatan', lat: -5.14, lon: 119.43, count: 185 },
  { id: 'NODE-DPS', city: 'Denpasar', province: 'Bali', lat: -8.67, lon: 115.21, count: 170 },
  { id: 'NODE-PLM', city: 'Palembang', province: 'Sumatera Selatan', lat: -2.99, lon: 104.76, count: 155 },
  { id: 'NODE-BPN', city: 'Balikpapan', province: 'Kalimantan Timur', lat: -1.26, lon: 116.83, count: 140 },
  { id: 'NODE-YOG', city: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.79, lon: 110.37, count: 195 },
];

export default function CyberThreatGlobe({
  activeThreats = [],
  trafficNodes = [],
  onSelectThreat,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Rotation angles (radians) - centered facing Indonesia
  const rotationRef = useRef({ rotY: 0.6, rotX: 0.22 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hoveredNodeRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Cached world particles
  const landPointsRef = useRef([]);
  const starsRef = useRef([]);

  // Generate land particles once
  useEffect(() => {
    const points = [];
    for (let lat = -80; lat <= 80; lat += 3.2) {
      const cosLat = Math.cos((lat * Math.PI) / 180);
      const lonStep = Math.max(3.2, 3.2 / Math.max(0.2, cosLat));
      for (let lon = -180; lon <= 180; lon += lonStep) {
        if (isEarthLand(lat, lon)) {
          points.push({ lat, lon });
        }
      }
    }

    // Add high-density dots around Indonesia / Nusantara archipelago
    for (let lat = -10; lat <= 6; lat += 1.5) {
      for (let lon = 96; lon <= 140; lon += 1.5) {
        if (isEarthLand(lat, lon)) {
          points.push({
            lat: lat + (Math.random() - 0.5) * 0.5,
            lon: lon + (Math.random() - 0.5) * 0.5,
          });
        }
      }
    }

    landPointsRef.current = points;

    // Generate subtle background stars
    const stars = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // Main 3D Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let lastTime = performance.now();

    const render = (time) => {
      lastTime = time;

      // Handle canvas resize & DPR
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect ? rect.width : canvas.clientWidth || 800;
      const height = rect ? rect.height : canvas.clientHeight || 520;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Auto-rotate globe gently if not dragging
      if (!isDraggingRef.current) {
        rotationRef.current.rotY += 0.0035;
      }

      const rotY = rotationRef.current.rotY;
      const rotX = rotationRef.current.rotX;

      // Center & Globe Radius
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.38;
      const fov = 750;

      // 1. Deep space background
      ctx.fillStyle = '#030a07';
      ctx.fillRect(0, 0, width, height);

      // Cyber nebula radial gradients
      const nebulaGrad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.8);
      nebulaGrad.addColorStop(0, 'rgba(6, 182, 212, 0.07)');
      nebulaGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      nebulaGrad.addColorStop(1, 'rgba(3, 10, 7, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Background stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const currentAlpha =
          star.alpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
        ctx.fillStyle = `rgba(186, 230, 253, ${currentAlpha})`;
        ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
      }

      // 3. Project spherical (lat, lon) to 3D screen coordinates
      const project = (lat, lon, radius = R) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x0 = -radius * Math.sin(phi) * Math.cos(theta);
        const z0 = radius * Math.sin(phi) * Math.sin(theta);
        const y0 = radius * Math.cos(phi);

        // Rotate Y (longitude)
        const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
        const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);

        // Rotate X (latitude tilt)
        const y2 = y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y0 * Math.sin(rotX) + z1 * Math.cos(rotX);

        // Perspective projection
        const scale = fov / (fov + z2);
        const px = cx + x1 * scale;
        const py = cy - y2 * scale;

        return { px, py, z: z2, scale, visible: z2 > -R * 0.25 };
      };

      // 4. Outer atmosphere rim glow
      const haloGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.18);
      haloGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      haloGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
      haloGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Outer wireframe border
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Latitude and longitude wireframe rings
      ctx.lineWidth = 0.75;
      const latRings = [-60, -30, 0, 30, 60];
      for (const lat of latRings) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 6) {
          const p = project(lat, lon);
          if (p.z > 0) {
            if (first) {
              ctx.moveTo(p.px, p.py);
              first = false;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle =
          lat === 0 ? 'rgba(34, 211, 238, 0.22)' : 'rgba(16, 185, 129, 0.10)';
        ctx.stroke();
      }

      const lonRings = [-135, -90, -45, 0, 45, 90, 135, 180];
      for (const lon of lonRings) {
        ctx.beginPath();
        let first = true;
        for (let lat = -80; lat <= 80; lat += 5) {
          const p = project(lat, lon);
          if (p.z > 0) {
            if (first) {
              ctx.moveTo(p.px, p.py);
              first = false;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.stroke();
      }

      // 6. Continental land particles
      const landPoints = landPointsRef.current;
      for (let i = 0; i < landPoints.length; i++) {
        const pt = landPoints[i];
        const p = project(pt.lat, pt.lon);

        if (p.z > -R * 0.15) {
          const depthRatio = Math.max(0, (p.z + R * 0.5) / (R * 1.5));
          const alpha = 0.12 + 0.75 * Math.pow(depthRatio, 1.4);
          const size = Math.max(0.8, 1.3 * p.scale);

          ctx.fillStyle = `rgba(34, 211, 238, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Project Jakarta Nusantara Hub
      const hubProj = project(JAKARTA_HUB.lat, JAKARTA_HUB.lon);
      const isHubVisible = hubProj.z > -R * 0.2;

      // 8. Determine nodes to visualize:
      // If activeThreats > 0: map real attack vectors to Jakarta Hub with red/amber arcs
      // If activeThreats === 0: map Indonesian user traffic nodes with green/cyan pulses and calm telemetry
      const hasRealThreats = activeThreats && activeThreats.length > 0;

      const nodesToDisplay = hasRealThreats
        ? activeThreats
        : trafficNodes && trafficNodes.length > 0
        ? trafficNodes
        : INDONESIA_PERIMETER_NODES;

      for (let idx = 0; idx < nodesToDisplay.length; idx++) {
        const node = nodesToDisplay[idx];
        const nodeLat = node.lat ?? (node.latitude || -6.2);
        const nodeLon = node.lon ?? (node.longitude || 106.8);
        const srcProj = project(nodeLat, nodeLon);

        // Draw curved Great-Circle arc between node and Jakarta Hub
        if (srcProj.z > -R * 0.35 || hubProj.z > -R * 0.35) {
          const arcPoints = 32;
          ctx.beginPath();

          const phi1 = (90 - nodeLat) * (Math.PI / 180);
          const theta1 = (nodeLon + 180) * (Math.PI / 180);
          const v1 = [
            -Math.sin(phi1) * Math.cos(theta1),
            Math.cos(phi1),
            Math.sin(phi1) * Math.sin(theta1),
          ];

          const phi2 = (90 - JAKARTA_HUB.lat) * (Math.PI / 180);
          const theta2 = (JAKARTA_HUB.lon + 180) * (Math.PI / 180);
          const v2 = [
            -Math.sin(phi2) * Math.cos(theta2),
            Math.cos(phi2),
            Math.sin(phi2) * Math.sin(theta2),
          ];

          const dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
          const omega = Math.acos(dot);

          let firstArcPoint = true;
          for (let step = 0; step <= arcPoints; step++) {
            const frac = step / arcPoints;
            let vi;
            if (omega < 0.001) {
              vi = v1;
            } else {
              const sinOmega = Math.sin(omega);
              const w1 = Math.sin((1 - frac) * omega) / sinOmega;
              const w2 = Math.sin(frac * omega) / sinOmega;
              vi = [
                w1 * v1[0] + w2 * v2[0],
                w1 * v1[1] + w2 * v2[1],
                w1 * v1[2] + w2 * v2[2],
              ];
            }

            const arcAltitude = R * (1 + (hasRealThreats ? 0.32 : 0.16) * Math.sin(Math.PI * frac));

            const x0 = vi[0] * arcAltitude;
            const y0 = vi[1] * arcAltitude;
            const z0 = vi[2] * arcAltitude;

            const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
            const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);
            const y2 = y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
            const z2 = y0 * Math.sin(rotX) + z1 * Math.cos(rotX);

            const scale = fov / (fov + z2);
            const apx = cx + x1 * scale;
            const apy = cy - y2 * scale;

            if (firstArcPoint) {
              ctx.moveTo(apx, apy);
              firstArcPoint = false;
            } else {
              ctx.lineTo(apx, apy);
            }
          }

          // Arc stroke styling: Red/amber for threats, cyan/emerald for safe user traffic
          const isCrit = node.severity === 'Critical';
          const isHovered = hoveredNodeRef.current?.id === node.id;

          if (hasRealThreats) {
            ctx.strokeStyle = isHovered
              ? '#38bdf8'
              : isCrit
              ? 'rgba(239, 68, 68, 0.45)'
              : 'rgba(245, 158, 11, 0.35)';
            ctx.lineWidth = isHovered ? 2.5 : isCrit ? 1.6 : 1.2;
          } else {
            ctx.strokeStyle = isHovered
              ? 'rgba(34, 211, 238, 0.8)'
              : 'rgba(16, 185, 129, 0.22)';
            ctx.lineWidth = isHovered ? 2.0 : 1.0;
          }
          ctx.stroke();

          // Animated particle gliding along the arc
          if (omega > 0.001) {
            const speed = hasRealThreats ? 0.45 + (idx % 3) * 0.15 : 0.25;
            const laserFrac = (time * 0.001 * speed + idx * 0.28) % 1.0;
            const sinOmega = Math.sin(omega);
            const w1 = Math.sin((1 - laserFrac) * omega) / sinOmega;
            const w2 = Math.sin(laserFrac * omega) / sinOmega;
            const laserV = [
              w1 * v1[0] + w2 * v2[0],
              w1 * v1[1] + w2 * v2[1],
              w1 * v1[2] + w2 * v2[2],
            ];

            const laserAlt = R * (1 + (hasRealThreats ? 0.32 : 0.16) * Math.sin(Math.PI * laserFrac));
            const lx0 = laserV[0] * laserAlt;
            const ly0 = laserV[1] * laserAlt;
            const lz0 = laserV[2] * laserAlt;

            const lx1 = lx0 * Math.cos(rotY) + lz0 * Math.sin(rotY);
            const lz1 = -lx0 * Math.sin(rotY) + lz0 * Math.cos(rotY);
            const ly2 = ly0 * Math.cos(rotX) - lz1 * Math.sin(rotX);
            const lz2 = ly0 * Math.sin(rotX) + lz1 * Math.cos(rotX);

            if (lz2 > -R * 0.2) {
              const lscale = fov / (fov + lz2);
              const lpx = cx + lx1 * lscale;
              const lpy = cy - ly2 * lscale;

              ctx.fillStyle = hasRealThreats
                ? isCrit
                  ? '#f43f5e'
                  : '#f59e0b'
                : '#34d399';
              ctx.shadowColor = hasRealThreats
                ? isCrit
                  ? 'rgba(244, 63, 94, 0.8)'
                  : 'rgba(245, 158, 11, 0.8)'
                : 'rgba(16, 185, 129, 0.8)';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(lpx, lpy, Math.max(1.8, 2.8 * lscale), 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }

        // Draw node beacon dot
        if (srcProj.z > -R * 0.15) {
          const isCrit = node.severity === 'Critical';
          const nodeColor = hasRealThreats
            ? isCrit
              ? '#ef4444'
              : '#f59e0b'
            : '#10b981';
          const isHovered = hoveredNodeRef.current?.id === node.id;

          // Pulsing ping ring
          const pingScale = ((time * 0.002 + idx) % 1.5) / 1.5;
          const pingAlpha = Math.max(0, 1 - pingScale) * 0.7;

          ctx.strokeStyle = hasRealThreats
            ? isCrit
              ? `rgba(239, 68, 68, ${pingAlpha})`
              : `rgba(245, 158, 11, ${pingAlpha})`
            : `rgba(16, 185, 129, ${pingAlpha})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(
            srcProj.px,
            srcProj.py,
            Math.max(3, (4 + 12 * pingScale) * srcProj.scale),
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // Central solid dot
          ctx.fillStyle = isHovered ? '#ffffff' : nodeColor;
          ctx.beginPath();
          ctx.arc(
            srcProj.px,
            srcProj.py,
            Math.max(2.2, (isHovered ? 5.0 : 3.5) * srcProj.scale),
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Label
          if (srcProj.z > R * 0.15 || isHovered) {
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillStyle = isHovered
              ? '#38bdf8'
              : hasRealThreats
              ? 'rgba(226, 232, 240, 0.85)'
              : '#a7f3d0';
            ctx.fillText(node.city || 'Node', srcProj.px + 7, srcProj.py - 4);
          }
        }
      }

      // 9. Draw Jakarta Nusantara Central Hub
      if (isHubVisible) {
        for (let ring = 0; ring < 3; ring++) {
          const ringFrac = (time * 0.0015 + ring * 0.33) % 1.0;
          const ringRadius = (5 + ringFrac * 26) * hubProj.scale;
          const ringAlpha = (1 - ringFrac) * 0.75;

          ctx.strokeStyle = `rgba(16, 185, 129, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hubProj.px, hubProj.py, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#34d399';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.9)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(hubProj.px, hubProj.py, 6 * hubProj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('⚡ NUSANTARA GATEWAY', hubProj.px + 12, hubProj.py - 6);
        ctx.font = '9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('JKT-01 WAF ENFORCER', hubProj.px + 12, hubProj.py + 7);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeThreats, trafficNodes]);

  // Mouse drag & hover handling
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        rotationRef.current.rotY += dx * 0.005;
        rotationRef.current.rotX = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, rotationRef.current.rotX + dy * 0.005)
        );
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const width = rect.width;
        const height = rect.height;
        const cx = width / 2;
        const cy = height / 2;
        const R = Math.min(width, height) * 0.38;
        const fov = 750;
        const rotY = rotationRef.current.rotY;
        const rotX = rotationRef.current.rotX;

        const hasRealThreats = activeThreats && activeThreats.length > 0;
        const nodesToSearch = hasRealThreats
          ? [...activeThreats, JAKARTA_HUB]
          : [...(trafficNodes && trafficNodes.length > 0 ? trafficNodes : INDONESIA_PERIMETER_NODES), JAKARTA_HUB];

        let closest = null;
        let minDist = 22;

        for (const n of nodesToSearch) {
          const lat = n.lat ?? (n.latitude || -6.2);
          const lon = n.lon ?? (n.longitude || 106.8);

          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lon + 180) * (Math.PI / 180);

          const x0 = -R * Math.sin(phi) * Math.cos(theta);
          const z0 = R * Math.sin(phi) * Math.sin(theta);
          const y0 = R * Math.cos(phi);

          const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
          const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);
          const y2 = y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = y0 * Math.sin(rotX) + z1 * Math.cos(rotX);

          if (z2 > -R * 0.2) {
            const scale = fov / (fov + z2);
            const px = cx + x1 * scale;
            const py = cy - y2 * scale;

            const dist = Math.hypot(mx - px, my - py);
            if (dist < minDist) {
              minDist = dist;
              closest = {
                ...n,
                lat,
                lon,
                screenX: px,
                screenY: py,
                isTrafficNode: !hasRealThreats && n.id !== JAKARTA_HUB.id,
              };
            }
          }
        }

        hoveredNodeRef.current = closest;
        setHoveredNode(closest);
      }
    },
    [activeThreats, trafficNodes]
  );

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (isDraggingRef.current && e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      rotationRef.current.rotY += dx * 0.007;
      rotationRef.current.rotX = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, rotationRef.current.rotX + dy * 0.007)
      );
    }
  };

  const hasRealThreats = activeThreats && activeThreats.length > 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] lg:h-[530px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div
          ref={tooltipRef}
          style={{
            left: `${hoveredNode.screenX + 16}px`,
            top: `${hoveredNode.screenY - 20}px`,
          }}
          className="pointer-events-none absolute z-30 transform -translate-y-1/2 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-md font-mono text-xs space-y-1 max-w-xs transition-opacity duration-150 animate-fadeIn"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredNode.severity === 'Critical'
                  ? 'bg-rose-500 animate-ping'
                  : hoveredNode.severity === 'Secure' || hoveredNode.isTrafficNode
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-bold text-white text-xs">
              {hoveredNode.city}, {hoveredNode.country || 'Indonesia'}
            </span>
            <span
              className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                hoveredNode.severity === 'Critical'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : hoveredNode.severity === 'Secure' || hoveredNode.isTrafficNode
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {hoveredNode.severity || (hoveredNode.isTrafficNode ? 'CLEAN' : 'SECURE')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
            <span className="text-slate-400">Node Type:</span>
            <span className="text-cyan-300 font-bold truncate">
              {hoveredNode.isTrafficNode ? 'Nusantara CDN Node' : hoveredNode.threatType || 'Defense Hub'}
            </span>

            <span className="text-slate-400">
              {hoveredNode.isTrafficNode ? 'Safe Traffic:' : 'IP Origin:'}
            </span>
            <span className="text-slate-200 font-bold">
              {hoveredNode.isTrafficNode
                ? `${(hoveredNode.count || 1).toLocaleString('id-ID')} Verified Visits`
                : hoveredNode.ip || '103.145.22.84'}
            </span>

            <span className="text-slate-400">Coordinates:</span>
            <span className="text-slate-300">
              {hoveredNode.lat.toFixed(1)}°, {hoveredNode.lon.toFixed(1)}°
            </span>

            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold">
              {hoveredNode.isTrafficNode ? '🛡️ Perimeter Clean' : '100% Intercepted'}
            </span>
          </div>
        </div>
      )}

      {/* Top-Right Globe Controls Pill */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        {hasRealThreats ? (
          <div className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 backdrop-blur-md flex items-center gap-2 text-[11px] font-mono text-rose-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>
              {activeThreats.length} THREAT VECTOR{activeThreats.length > 1 ? 'S' : ''} DETECTED
            </span>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md flex items-center gap-2 text-[11px] font-mono text-emerald-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🛡️ DEFENSE PERIMETER ACTIVE - 0 THREAT INTRUSIONS</span>
          </div>
        )}

        <button
          onClick={() => {
            rotationRef.current = { rotY: 0.6, rotX: 0.22 };
          }}
          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
          title="Reset Rotasi Globe ke Posisi Nusantara"
        >
          <Crosshair size={14} className="text-cyan-400" />
        </button>
      </div>
    </div>
  );
}
