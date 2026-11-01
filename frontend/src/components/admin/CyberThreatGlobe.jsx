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
    if (lat < 28 && nLon > -80) return false; // Gulf of Mexico cutout
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
    if (lat < 25 && nLon > 42 && nLon < 60) return true; // Arabian Peninsula
    if (lat < 30 && nLon > 68 && nLon < 90) return true; // India
    if (lat < 42 && nLon > 90 && nLon < 145) return true; // East Asia
    if (lat >= 42) return true; // Russia / Northern Asia
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

// Fixed threat origin locations connected to Jakarta Hub (-6.2, 106.8)
const DEFAULT_THREAT_NODES = [
  {
    id: 'THREAT-FRA',
    city: 'Frankfurt',
    country: 'Jerman',
    ip: '194.26.29.112',
    lat: 50.11,
    lon: 8.68,
    threatType: 'DDoS SYN Flood',
    severity: 'Critical',
    color: '#ef4444',
  },
  {
    id: 'THREAT-AMS',
    city: 'Amsterdam',
    country: 'Belanda',
    ip: '185.220.101.5',
    lat: 52.37,
    lon: 4.89,
    threatType: 'XSS Injection Probe',
    severity: 'High',
    color: '#f59e0b',
  },
  {
    id: 'THREAT-ASH',
    city: 'Ashburn, VA',
    country: 'USA',
    ip: '198.235.24.11',
    lat: 39.04,
    lon: -77.48,
    threatType: 'Path Traversal Scan',
    severity: 'High',
    color: '#f59e0b',
  },
  {
    id: 'THREAT-MOW',
    city: 'Moscow',
    country: 'Russia',
    ip: '91.240.118.67',
    lat: 55.75,
    lon: 37.62,
    threatType: 'HTTP/2 Rapid Reset',
    severity: 'Critical',
    color: '#f43f5e',
  },
  {
    id: 'THREAT-SIN',
    city: 'Singapore',
    country: 'Singapore',
    ip: '45.154.255.89',
    lat: 1.35,
    lon: 103.82,
    threatType: 'Hydra Brute Force',
    severity: 'High',
    color: '#f59e0b',
  },
  {
    id: 'THREAT-TYO',
    city: 'Tokyo',
    country: 'Jepang',
    ip: '133.242.18.9',
    lat: 35.68,
    lon: 139.69,
    threatType: 'Masscan Port Scan',
    severity: 'Medium',
    color: '#06b6d4',
  },
  {
    id: 'THREAT-SYD',
    city: 'Sydney',
    country: 'Australia',
    ip: '139.130.4.5',
    lat: -33.87,
    lon: 151.21,
    threatType: 'API Rate Limit Abuse',
    severity: 'Medium',
    color: '#06b6d4',
  },
  {
    id: 'THREAT-LON',
    city: 'London',
    country: 'Inggris',
    ip: '82.165.197.1',
    lat: 51.51,
    lon: -0.13,
    threatType: 'Blind SQL Injection',
    severity: 'Critical',
    color: '#ef4444',
  },
  {
    id: 'THREAT-SFO',
    city: 'San Francisco',
    country: 'USA',
    ip: '104.244.42.1',
    lat: 37.77,
    lon: -122.42,
    threatType: 'Botnet Sybil Cluster',
    severity: 'Critical',
    color: '#ef4444',
  },
];

// Nusantara Hub Node (Target destination for all incoming attack vectors)
const JAKARTA_HUB = {
  id: 'HUB-JKT',
  city: 'Jakarta (Nusantara Gateway)',
  country: 'Indonesia',
  ip: '103.145.22.84',
  lat: -6.21,
  lon: 106.85,
  threatType: 'Bionet Primary WAF Shield',
  severity: 'Secure',
  color: '#10b981',
};

export default function CyberThreatGlobe({ activeThreats = DEFAULT_THREAT_NODES, onSelectThreat }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Rotation angles (radians)
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
    // Generate grid of points on sphere and filter by isEarthLand
    for (let lat = -80; lat <= 80; lat += 3.2) {
      // Step lon based on latitude circumference to keep density uniform
      const cosLat = Math.cos((lat * Math.PI) / 180);
      const lonStep = Math.max(3.2, 3.2 / Math.max(0.2, cosLat));
      for (let lon = -180; lon <= 180; lon += lonStep) {
        if (isEarthLand(lat, lon)) {
          points.push({ lat, lon });
        }
      }
    }

    // Add extra high-density dots around Indonesia / Nusantara archipelago
    for (let lat = -10; lat <= 6; lat += 1.5) {
      for (let lon = 96; lon <= 140; lon += 1.5) {
        if (isEarthLand(lat, lon)) {
          points.push({ lat: lat + (Math.random() - 0.5) * 0.5, lon: lon + (Math.random() - 0.5) * 0.5 });
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
      const dt = (time - lastTime) / 1000;
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

      // Auto-rotate globe if user is not actively dragging
      if (!isDraggingRef.current) {
        rotationRef.current.rotY += 0.0035; // gentle smooth rotation
      }

      const rotY = rotationRef.current.rotY;
      const rotX = rotationRef.current.rotX;

      // Center & Globe Radius
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.38;
      const fov = 750;

      // 1. Clear background with deep space glow
      ctx.fillStyle = '#030a07';
      ctx.fillRect(0, 0, width, height);

      // Deep cyber nebula radial gradients
      const nebulaGrad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.8);
      nebulaGrad.addColorStop(0, 'rgba(6, 182, 212, 0.07)');
      nebulaGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      nebulaGrad.addColorStop(1, 'rgba(3, 10, 7, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render background ambient stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const currentAlpha =
          star.alpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
        ctx.fillStyle = `rgba(186, 230, 253, ${currentAlpha})`;
        ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
      }

      // 3. Helper: Project spherical (lat, lon) to 3D projected screen coordinates
      const project = (lat, lon, radius = R) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        // Standard 3D Cartesian
        const x0 = -radius * Math.sin(phi) * Math.cos(theta);
        const z0 = radius * Math.sin(phi) * Math.sin(theta);
        const y0 = radius * Math.cos(phi);

        // Rotate Y (longitude)
        const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
        const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);

        // Rotate X (latitude tilt)
        const y2 = y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y0 * Math.sin(rotX) + z1 * Math.cos(rotX);

        // Perspective scale
        const scale = fov / (fov + z2);
        const px = cx + x1 * scale;
        const py = cy - y2 * scale;

        return { px, py, z: z2, scale, visible: z2 > -R * 0.25 };
      };

      // 4. Draw outer globe atmosphere halo / rim glow
      const haloGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.18);
      haloGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      haloGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
      haloGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Outer wireframe border circle
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Draw latitude and longitude wireframe rings
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

      // 6. Draw continental land dot particles
      const landPoints = landPointsRef.current;
      for (let i = 0; i < landPoints.length; i++) {
        const pt = landPoints[i];
        const p = project(pt.lat, pt.lon);

        if (p.z > -R * 0.15) {
          // Calculate depth-based brightness and alpha
          const depthRatio = Math.max(0, (p.z + R * 0.5) / (R * 1.5));
          const alpha = 0.12 + 0.75 * Math.pow(depthRatio, 1.4);
          const size = Math.max(0.8, 1.3 * p.scale);

          ctx.fillStyle = `rgba(34, 211, 238, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Project Jakarta Hub Node
      const hubProj = project(JAKARTA_HUB.lat, JAKARTA_HUB.lon);
      const isHubVisible = hubProj.z > -R * 0.2;

      // 8. Draw attack arcs from threats to Jakarta Hub
      const threatsToRender = activeThreats && activeThreats.length > 0 ? activeThreats : DEFAULT_THREAT_NODES;
      const nodeScreenCoords = [];

      for (let tIdx = 0; tIdx < threatsToRender.length; tIdx++) {
        const threat = threatsToRender[tIdx];
        const srcProj = project(threat.lat, threat.lon);

        // Store for hover detection
        if (srcProj.z > -R * 0.2) {
          nodeScreenCoords.push({
            ...threat,
            screenX: srcProj.px,
            screenY: srcProj.py,
            depth: srcProj.z,
          });
        }

        // Draw curved Great-Circle cyber arc if both or either are somewhat facing front
        if (srcProj.z > -R * 0.35 || hubProj.z > -R * 0.35) {
          const arcPoints = 32;
          ctx.beginPath();

          // Convert lat/lon to 3D unit vectors
          const phi1 = (90 - threat.lat) * (Math.PI / 180);
          const theta1 = (threat.lon + 180) * (Math.PI / 180);
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

          // Compute dot product and angle between vectors
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

            // Elevate arc above globe surface (parabolic curve)
            const arcAltitude = R * (1 + 0.32 * Math.sin(Math.PI * frac));

            // Project elevated point to screen
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

          // Arc stroke style
          const isCrit = threat.severity === 'Critical';
          const isHovered = hoveredNodeRef.current?.id === threat.id;

          ctx.strokeStyle = isHovered
            ? '#38bdf8'
            : isCrit
            ? 'rgba(239, 68, 68, 0.45)'
            : 'rgba(6, 182, 212, 0.35)';
          ctx.lineWidth = isHovered ? 2.5 : isCrit ? 1.6 : 1.2;
          ctx.stroke();

          // Animated laser shooting particle along the arc
          const speed = 0.45 + (tIdx % 3) * 0.15;
          const laserFrac = (time * 0.001 * speed + tIdx * 0.28) % 1.0;

          if (omega > 0.001) {
            const sinOmega = Math.sin(omega);
            const w1 = Math.sin((1 - laserFrac) * omega) / sinOmega;
            const w2 = Math.sin(laserFrac * omega) / sinOmega;
            const laserV = [
              w1 * v1[0] + w2 * v2[0],
              w1 * v1[1] + w2 * v2[1],
              w1 * v1[2] + w2 * v2[2],
            ];

            const laserAlt = R * (1 + 0.32 * Math.sin(Math.PI * laserFrac));
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

              // Laser particle glow
              ctx.fillStyle = isCrit ? '#f43f5e' : '#22d3ee';
              ctx.shadowColor = isCrit ? 'rgba(244, 63, 94, 0.8)' : 'rgba(34, 211, 238, 0.8)';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(lpx, lpy, Math.max(2, 3.2 * lscale), 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0; // reset
            }
          }
        }

        // 9. Draw threat origin node dot & beacon
        if (srcProj.z > -R * 0.15) {
          const isCrit = threat.severity === 'Critical';
          const nodeColor = isCrit ? '#ef4444' : '#f59e0b';
          const isHovered = hoveredNodeRef.current?.id === threat.id;

          // Pulsing ping ring
          const pingScale = ((time * 0.002 + tIdx) % 1.5) / 1.5;
          const pingAlpha = Math.max(0, 1 - pingScale) * 0.7;

          ctx.strokeStyle = isCrit ? `rgba(239, 68, 68, ${pingAlpha})` : `rgba(245, 158, 11, ${pingAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(srcProj.px, srcProj.py, Math.max(3, (4 + 14 * pingScale) * srcProj.scale), 0, Math.PI * 2);
          ctx.stroke();

          // Central solid node
          ctx.fillStyle = isHovered ? '#ffffff' : nodeColor;
          ctx.beginPath();
          ctx.arc(srcProj.px, srcProj.py, Math.max(2.5, (isHovered ? 5.5 : 3.8) * srcProj.scale), 0, Math.PI * 2);
          ctx.fill();

          // City label on front nodes
          if (srcProj.z > R * 0.2 || isHovered) {
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillStyle = isHovered ? '#38bdf8' : 'rgba(226, 232, 240, 0.85)';
            ctx.fillText(threat.city, srcProj.px + 7, srcProj.py - 4);
          }
        }
      }

      // 10. Draw Jakarta Nusantara Hub Node (The Defensive Apex)
      if (isHubVisible) {
        nodeScreenCoords.push({
          ...JAKARTA_HUB,
          screenX: hubProj.px,
          screenY: hubProj.py,
          depth: hubProj.z,
        });

        // Expanding concentric defense radar rings
        for (let ring = 0; ring < 3; ring++) {
          const ringFrac = ((time * 0.0015 + ring * 0.33) % 1.0);
          const ringRadius = (5 + ringFrac * 28) * hubProj.scale;
          const ringAlpha = (1 - ringFrac) * 0.75;

          ctx.strokeStyle = `rgba(16, 185, 129, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hubProj.px, hubProj.py, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Inner glowing core
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.9)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(hubProj.px, hubProj.py, 6 * hubProj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hub Badge Label
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
  }, [activeThreats]);

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
        // Detect hovering over threat nodes
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Project nodes to find closest
        const width = rect.width;
        const height = rect.height;
        const cx = width / 2;
        const cy = height / 2;
        const R = Math.min(width, height) * 0.38;
        const fov = 750;
        const rotY = rotationRef.current.rotY;
        const rotX = rotationRef.current.rotX;

        const allNodes = [...activeThreats, JAKARTA_HUB];
        let closest = null;
        let minDist = 22;

        for (const n of allNodes) {
          const phi = (90 - n.lat) * (Math.PI / 180);
          const theta = (n.lon + 180) * (Math.PI / 180);

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
              closest = { ...n, screenX: px, screenY: py };
            }
          }
        }

        hoveredNodeRef.current = closest;
        setHoveredNode(closest);
      }
    },
    [activeThreats]
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
                  : hoveredNode.severity === 'Secure'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-bold text-white text-xs">
              {hoveredNode.city}, {hoveredNode.country}
            </span>
            <span
              className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                hoveredNode.severity === 'Critical'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : hoveredNode.severity === 'Secure'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {hoveredNode.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
            <span className="text-slate-400">Target Vector:</span>
            <span className="text-cyan-300 font-bold truncate">{hoveredNode.threatType}</span>

            <span className="text-slate-400">IP Origin:</span>
            <span className="text-slate-200 font-bold">{hoveredNode.ip}</span>

            <span className="text-slate-400">Coordinates:</span>
            <span className="text-slate-300">
              {hoveredNode.lat.toFixed(1)}°, {hoveredNode.lon.toFixed(1)}°
            </span>

            <span className="text-slate-400">Mitigation:</span>
            <span className="text-emerald-400 font-bold">100% Intercepted</span>
          </div>
        </div>
      )}

      {/* Top-Right Globe Controls Pill */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 text-[11px] font-mono text-emerald-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME 3D TELEMETRY</span>
        </div>
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
