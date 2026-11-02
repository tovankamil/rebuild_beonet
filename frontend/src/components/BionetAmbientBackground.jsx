import React, { useState, useEffect, useRef } from 'react';
import { Film, Network, Pause, Play, Sparkles } from 'lucide-react';

export default function SYNETIQAmbientBackground({ dimmed = false, activeMode = null, onModeChange = null }) {
  const [internalMode, setInternalMode] = useState(() => {
    return localStorage.getItem('bionet_ambient_mode') || 'luxury-biotech';
  });
  const mode = activeMode || internalMode;
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  // Helper: Hex color to RGBA string for high-perf canvas gradients & strokes
  const hexToRgba = (hex, alpha) => {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 1. Video Playback & Lifecycle Management (Battery & CPU Friendly)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if ((mode === 'video' || mode === 'video-dark' || mode === 'video-bio') && isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if ((mode === 'video' || mode === 'video-dark' || mode === 'video-bio') && isPlaying) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode, isPlaying]);

  // 2. High-Performance Coalescing Particle Simulation ("Partikel yang Menyatu")
  // Active in luxury-biotech and canvas modes
  useEffect(() => {
    if (mode !== 'canvas' && mode !== 'luxury-biotech' && mode !== 'biotech') {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Biotech Palette: Emerald, Cyan, Electric Violet, Gold, Mint
    const palette = [
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#8b5cf6', // Electric Violet
      '#f59e0b', // Gold / Amber
      '#34d399', // Mint
    ];

    // Multi-Layer Depth 1: Distant Blurred Caustic Dust / Micro-spores
    const dustCount = width > 768 ? 40 : 20;
    const dust = [];
    for (let i = 0; i < dustCount; i++) {
      dust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.25 + 0.12,
        color: Math.random() > 0.4 ? '#06b6d4' : '#10b981',
      });
    }

    // Multi-Layer Depth 2: Foreground Crisp Coalescing Nodes
    const nodeCount = width > 768 ? 58 : 28;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const isHub = Math.random() < 0.16; // 16% Hub Nodes
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: isHub ? Math.random() * 1.2 + 2.8 : Math.random() * 1.2 + 1.2,
        color,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.025 + 0.015,
        clusterCount: 0,
        isHub,
      });
    }

    // Interactive Mouse Tracking with Smooth Magnetic Coalescence
    let targetMouseX = -2000;
    let targetMouseY = -2000;
    let currentMouseX = -2000;
    let currentMouseY = -2000;
    let isMouseInView = false;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      isMouseInView = true;
    };

    const handleMouseLeave = () => {
      isMouseInView = false;
      targetMouseX = -2000;
      targetMouseY = -2000;
    };

    // Click Ripple: Expanding bio-energy pulse
    let clickRipple = null;
    const handleCanvasClick = (e) => {
      clickRipple = {
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 220,
        opacity: 0.7,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    const handleVisibility = () => {
      if (!document.hidden && isPlaying) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Physics Constants for "Partikel yang Menyatu" (Coalescing & Flocking)
    const COALESCE_DIST = 145;      // Max interaction threshold
    const EQUILIBRIUM_DIST = 38;    // Comfortable distance between clustered nodes
    const CONNECT_DIST = 125;       // Connected filament line visibility threshold
    const MOUSE_RADIUS = 210;       // Magnetic cursor attraction radius

    const render = () => {
      if (document.hidden || !isPlaying) {
        return; // Pause when hidden or paused
      }

      ctx.clearRect(0, 0, width, height);

      // --- 1. RENDER DISTANT CAUSTIC DUST (Layer 0: Deep Atmosphere) ---
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < -10) d.x = width + 10;
        if (d.x > width + 10) d.x = -10;
        if (d.y < -10) d.y = height + 10;
        if (d.y > height + 10) d.y = -10;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(d.color, d.alpha);
        ctx.fill();
      }

      // --- 2. LERP MOUSE COORDINATES FOR BUTTERY SMOOTH MAGNETIC INFLUENCE ---
      if (isMouseInView) {
        if (currentMouseX === -2000) {
          currentMouseX = targetMouseX;
          currentMouseY = targetMouseY;
        } else {
          currentMouseX += (targetMouseX - currentMouseX) * 0.12;
          currentMouseY += (targetMouseY - currentMouseY) * 0.12;
        }
      } else {
        currentMouseX = -2000;
        currentMouseY = -2000;
      }

      // Reset cluster count for each node before calculating forces
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].clusterCount = 0;
      }

      // --- 3. COALESCING INTER-PARTICLE ATTRACTION & CONNECTED FILAMENTS ---
      for (let i = 0; i < nodes.length; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nj = nodes[j];
          const dx = nj.x - ni.x;
          const dy = nj.y - ni.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < COALESCE_DIST * COALESCE_DIST) {
            const dist = Math.sqrt(distSq) || 1;

            // Increment cluster counter for nodes close together (< 65px)
            if (dist < 65) {
              ni.clusterCount++;
              nj.clusterCount++;
            }

            // Draw organic connecting filaments with smooth dynamic opacity
            if (dist < CONNECT_DIST) {
              const alpha = (1 - dist / CONNECT_DIST) * 0.32;
              ctx.beginPath();
              ctx.moveTo(ni.x, ni.y);
              ctx.lineTo(nj.x, nj.y);

              // Elegant dynamic gradient line between node colors
              const grad = ctx.createLinearGradient(ni.x, ni.y, nj.x, nj.y);
              grad.addColorStop(0, hexToRgba(ni.color, alpha));
              grad.addColorStop(1, hexToRgba(nj.color, alpha));
              ctx.strokeStyle = grad;
              ctx.lineWidth = dist < 50 ? 0.9 : 0.5;
              ctx.stroke();
            }

            // Gravitational flocking/coalescence physics:
            // - If farther than equilibrium: attract towards each other (clustering)
            // - If closer than equilibrium: soft elastic repulsion (keeps them from collapsing)
            const nx = dx / dist;
            const ny = dy / dist;

            if (dist > EQUILIBRIUM_DIST) {
              const pull = (1 - dist / COALESCE_DIST) * 0.015;
              ni.vx += nx * pull;
              ni.vy += ny * pull;
              nj.vx -= nx * pull;
              nj.vy -= ny * pull;
            } else {
              const push = (1 - dist / EQUILIBRIUM_DIST) * 0.045;
              ni.vx -= nx * push;
              ni.vy -= ny * push;
              nj.vx += nx * push;
              nj.vy += ny * push;
            }
          }
        }
      }

      // --- 4. MOUSE MAGNETIC COALESCENCE INFLUENCE ---
      if (currentMouseX > 0 && currentMouseY > 0) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const mdx = currentMouseX - n.x;
          const mdy = currentMouseY - n.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;

          if (mDist < MOUSE_RADIUS) {
            // Draw particles into a cohesive coalesced constellation around cursor
            const force = (1 - mDist / MOUSE_RADIUS) * 0.35;
            const angle = Math.atan2(mdy, mdx);

            // Radial suction pull
            n.vx += Math.cos(angle) * force;
            n.vy += Math.sin(angle) * force;

            // Gentle gentle vortex swirl
            n.vx += -Math.sin(angle) * (force * 0.18);
            n.vy += Math.cos(angle) * (force * 0.18);
          }
        }
      }

      // --- 5. CLICK RIPPLE EXPANSION & SHOCKWAVE ---
      if (clickRipple) {
        clickRipple.radius += 5.5;
        clickRipple.opacity -= 0.018;

        ctx.beginPath();
        ctx.arc(clickRipple.x, clickRipple.y, clickRipple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, clickRipple.opacity)})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Push nearby particles softly as wave propagates
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const rdx = n.x - clickRipple.x;
          const rdy = n.y - clickRipple.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
          const diff = Math.abs(rDist - clickRipple.radius);
          if (diff < 30) {
            const push = (1 - diff / 30) * 0.45;
            n.vx += (rdx / rDist) * push;
            n.vy += (rdy / rDist) * push;
          }
        }

        if (clickRipple.opacity <= 0 || clickRipple.radius >= clickRipple.maxRadius) {
          clickRipple = null;
        }
      }

      // --- 6. UPDATE POSITIONS, DAMPING & RENDER FOREGROUND CRISP NODES ---
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Organic biological flutter (Brownian thermal motion)
        n.vx += (Math.random() - 0.5) * 0.035;
        n.vy += (Math.random() - 0.5) * 0.035;

        // Fluid drag damping (keeps motion smooth & perpetual)
        n.vx *= 0.982;
        n.vy *= 0.982;

        // Velocity clamp to ensure silky, non-jarring luxury ambient motion
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        const MAX_SPEED = 1.35;
        if (speed > MAX_SPEED) {
          n.vx = (n.vx / speed) * MAX_SPEED;
          n.vy = (n.vy / speed) * MAX_SPEED;
        }

        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;

        // Soft screen bounds with gentle wrap
        const pad = 45;
        if (n.x < -pad) n.x = width + pad;
        if (n.x > width + pad) n.x = -pad;
        if (n.y < -pad) n.y = height + pad;
        if (n.y > height + pad) n.y = -pad;

        const pulseScale = Math.sin(n.pulse);
        const currentRadius = n.radius + pulseScale * 0.55;

        // Coalesced Cluster Radiant Halo:
        // When 2 or more particles cluster together, they shine with an organic biological aura
        if (n.clusterCount >= 2) {
          const haloRadius = currentRadius * 3.6;
          const haloGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloRadius);
          haloGrad.addColorStop(0, hexToRgba(n.color, 0.45));
          haloGrad.addColorStop(1, hexToRgba(n.color, 0));

          ctx.beginPath();
          ctx.arc(n.x, n.y, haloRadius, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();
        }

        // Crisp central glowing node
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.8, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = n.isHub || n.clusterCount >= 2 ? 14 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mode, isPlaying]);

  return (
    <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-slate-950">
      {/* 1. LAYER LUXURY BIOTECH (Curved Glass Backdrop + Live Coalescing Particle Canvas) */}
      {(mode === 'luxury-biotech' || mode === 'biotech') && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/synetiq_glass_curve_bg.jpg"
            alt="SYNETIQ Curved Glass Background"
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 scale-[1.01]"
          />
          {/* Subtle Ambient Radial Caustic Scrim for enhanced text & card contrast */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/25 to-slate-950/65 pointer-events-none" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-auto opacity-75"
          />
        </div>
      )}

      {/* 2. LAYER VIDEO LOOP SEAMLESS (login-page-ref.mp4 OR bionet_flow_loop_opt.mp4) */}
      {(mode === 'video' || mode === 'video-dark' || mode === 'video-bio') && (
        <video
          ref={(el) => {
            if (el) {
              el.muted = true;
              el.defaultMuted = true;
              el.play().catch(() => {});
            }
            videoRef.current = el;
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          key={mode}
          onLoadedData={() => setVideoLoaded(true)}
          onCanPlay={() => setVideoLoaded(true)}
          onPlay={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100"
          style={{ willChange: 'transform' }}
        >
          {mode === 'video-dark' ? (
            <>
              <source src="/login-page-ref.mp4" type="video/mp4" />
              <source src="/assets/video/login-page-ref.mp4" type="video/mp4" />
            </>
          ) : (
            <>
              <source src="/assets/video/bionet_flow_loop_opt.mp4" type="video/mp4" />
              <source src="/assets/video/bionet_flow_loop.webm" type="video/webm" />
            </>
          )}
        </video>
      )}

      {/* 3. LAYER PASTEL FLUID AURORA (login.webp reference) */}
      {mode === 'pastel' && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/90 via-slate-100/80 to-emerald-100/90 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-pink-200/50 blur-[90px] animate-aurora" />
          <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full bg-teal-200/50 blur-[100px] animate-aurora" style={{ animationDelay: '2.5s' }} />
          <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-[110px] animate-aurora" style={{ animationDelay: '5s' }} />
        </div>
      )}

      {/* 4. LAYER CANVAS NETWORK BINARY FLOW */}
      {mode === 'canvas' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto"
        />
      )}

      {/* 5. SOFT VIGNETTE & CONTRAST SCRIM */}
      {mode !== 'pastel' && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            dimmed ? 'bg-slate-950/30' : 'bg-slate-950/10'
          }`}
        />
      )}
    </div>
  );
}
