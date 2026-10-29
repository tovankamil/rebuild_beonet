import React, { useState, useEffect, useRef } from 'react';
import { Film, Network, Pause, Play, Sparkles } from 'lucide-react';

export default function BionetAmbientBackground({ dimmed = false, activeMode = null, onModeChange = null }) {
  const [internalMode, setInternalMode] = useState(() => {
    return localStorage.getItem('bionet_ambient_mode') || 'luxury-biotech';
  });
  const mode = activeMode || internalMode;
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  // Simpan preferensi pengguna
  const handleModeChange = (newMode) => {
    setInternalMode(newMode);
    localStorage.setItem('bionet_ambient_mode', newMode);
    if (onModeChange) onModeChange(newMode);
  };

  // 1. Video Playback & Lifecycle Management (Hemat Baterai & CPU)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if ((mode === 'video' || mode === 'video-dark' || mode === 'video-bio') && isPlaying) {
      video.play().catch(() => {
        // Autoplay policy fallback
      });
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

  // 2. High-Performance Canvas Interactive Binary Node Flow (Active in luxury-biotech and canvas)
  useEffect(() => {
    if (mode !== 'canvas' && mode !== 'luxury-biotech') {
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

    // Titik node jaringan MLM Bionet (Kiri, Kanan, Leader, Bonus Pairing)
    const nodeCount = Math.min(width > 768 ? 45 : 25, 55);
    const nodes = [];
    const colors = ['#10b981', '#14b8a6', '#06b6d4', '#eab308', '#34d399'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI,
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    const handleVisibility = () => {
      if (!document.hidden && isPlaying) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (document.hidden || !isPlaying) {
        return; // Hentikan loop saat tersembunyi/paused (hemat CPU & baterai)
      }

      ctx.clearRect(0, 0, width, height);

      // Gambar koneksi garis biner antar node
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.28;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update posisi dan render node
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.03;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Efek kedekatan kursor mouse
        const mdx = mouseX - n.x;
        const mdy = mouseY - n.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 120) {
          const force = (1 - mDist / 120) * 0.8;
          n.x -= (mdx / mDist) * force;
          n.y -= (mdy / mDist) * force;
        }

        const currentRadius = n.radius + Math.sin(n.pulse) * 0.8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mode, isPlaying]);

  return (
    <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-slate-950">
      {/* 1. LAYER LUXURY BIOTECH (Bespoke 3D Cinematic Atmosphere + Live Particle Mesh) */}
      {(mode === 'luxury-biotech' || mode === 'biotech') && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/bionet_ambient_luxury.jpg"
            alt="Bionet Luxury Biotech Background"
            className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 transition-transform duration-1000"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-auto"
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
            dimmed
              ? 'bg-slate-950/30'
              : 'bg-slate-950/10'
          }`}
        />
      )}
    </div>
  );
}
