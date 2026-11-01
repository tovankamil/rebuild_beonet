import React, { useState, useEffect } from 'react';
import { ExternalLink, Activity } from 'lucide-react';

export default function ThreatActivityTimeline() {
  // Animated bar heights for equalizer
  const [equalizerBars, setEqualizerBars] = useState(() =>
    Array.from({ length: 32 }, (_, i) => {
      const base = 25 + Math.sin(i * 0.4) * 20 + Math.cos(i * 0.9) * 15;
      return Math.max(12, Math.min(85, base));
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEqualizerBars((prev) =>
        prev.map((val, i) => {
          const delta = (Math.random() - 0.5) * 16;
          const harmonic = Math.sin(Date.now() * 0.003 + i * 0.35) * 18;
          return Math.max(10, Math.min(92, Math.round(val * 0.6 + (35 + harmonic) * 0.4 + delta)));
        })
      );
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-64 sm:w-72 rounded-2xl bg-[#061b14]/85 border border-[#0e3b2c] p-3.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-slate-100 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#0e3b2c]/80">
        <div className="flex items-center gap-1.5">
          <Activity size={13} className="text-cyan-400 animate-pulse" />
          <span className="font-heading font-bold text-[11px] text-white tracking-wide">
            Threat Activity Timeline
          </span>
        </div>
        <button
          className="text-slate-400 hover:text-cyan-300 transition-colors"
          title="Buka panel analitik penuh"
        >
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Top Section: High-frequency Equalizer Bars */}
      <div className="relative pt-1 pb-2">
        {/* Cursor Range Markers */}
        <div className="absolute top-0 left-6 text-[9px] text-cyan-400 font-bold flex flex-col items-center">
          <span className="text-[8px] text-slate-400">▼ 215</span>
          <div className="w-[1px] h-3 bg-cyan-400/80 my-0.5" />
        </div>

        <div className="absolute top-0 right-6 text-[9px] text-cyan-400 font-bold flex flex-col items-center">
          <span className="text-[8px] text-slate-400">▼ 1344</span>
          <div className="w-[1px] h-3 bg-cyan-400/80 my-0.5" />
        </div>

        {/* Equalizer Spectrum Bars */}
        <div className="h-16 flex items-end justify-between gap-[2px] px-1 pt-4">
          {equalizerBars.map((height, idx) => {
            const isHighlighted = idx >= 4 && idx <= 26;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end items-center h-full group"
              >
                <div
                  style={{ height: `${height}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isHighlighted
                      ? 'bg-gradient-to-t from-emerald-600 via-cyan-500 to-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      : 'bg-emerald-950/60'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Base Divider */}
        <div className="w-full h-[1px] bg-cyan-500/20 mt-1" />
      </div>

      {/* Bottom Section: Spike Frequency Waves */}
      <div className="relative pt-2 pb-1">
        <svg
          viewBox="0 0 240 45"
          className="w-full h-11 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Baseline */}
          <line
            x1="0"
            y1="38"
            x2="240"
            y2="38"
            stroke="rgba(14, 59, 44, 0.9)"
            strokeWidth="1"
          />

          {/* Sharp Cyber Spike Peaks */}
          <path
            d="M 5,38 L 18,38 L 26,18 L 34,38 L 52,38 L 62,8 L 72,38 L 95,38 L 105,24 L 115,38 L 135,38 L 148,4 L 160,38 L 185,38 L 195,14 L 205,38 L 235,38"
            fill="none"
            stroke="url(#spikeGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient for Spikes */}
          <defs>
            <linearGradient id="spikeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Key Marker Dots on Peaks */}
          <circle cx="26" cy="18" r="2.2" fill="#22d3ee" />
          <circle cx="62" cy="8" r="2.5" fill="#22d3ee" className="animate-ping" />
          <circle cx="105" cy="24" r="2" fill="#34d399" />
          <circle cx="148" cy="4" r="2.8" fill="#38bdf8" className="animate-ping" />
          <circle cx="195" cy="14" r="2.2" fill="#22d3ee" />

          {/* Key Anchor Dots along baseline */}
          <circle cx="26" cy="38" r="1.5" fill="#0e3b2c" />
          <circle cx="62" cy="38" r="1.5" fill="#0e3b2c" />
          <circle cx="148" cy="38" r="1.5" fill="#0e3b2c" />
          <circle cx="195" cy="38" r="1.5" fill="#0e3b2c" />
        </svg>

        {/* Range Label Footer */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono px-1 mt-0.5">
          <span>72 Hz</span>
          <span className="text-cyan-400/90 font-bold">114.8 PK/S</span>
          <span>160 Hz</span>
        </div>
      </div>
    </div>
  );
}
