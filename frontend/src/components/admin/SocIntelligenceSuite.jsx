import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldAlert, Cpu, Eye, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SocIntelligenceSuite({
  activeThreatCount = 983,
  totalEventsCount = '983,421',
  matrixData = {
    highRisk: 89,
    medium: 215,
    low: 1203,
    resolved: 532,
  },
  confidenceScores = {
    malware: 97,
    anomaly: 94,
    attribution: 89,
  },
}) {
  // Animated radar sweep angle (0 to 360 deg)
  const [sweepAngle, setSweepAngle] = useState(45);

  useEffect(() => {
    let animId;
    const animate = () => {
      setSweepAngle((prev) => (prev + 1.2) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 24-hour attack volume bar heights
  const hourlyBars = [
    22, 18, 14, 12, 15, 28, 42, 65, 84, 92, 78, 62,
    70, 88, 96, 82, 74, 85, 91, 76, 58, 45, 34, 26
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Global Threat Radar (Circular Arc Gauge) */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-[#0e3b2c]/60">
          <h3 className="font-heading font-bold text-xs text-white tracking-wide">
            Global Threat Radar
          </h3>
          <button className="text-slate-400 hover:text-cyan-300 transition-colors" title="Buka detail radar">
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Semi-circular arc gauge */}
        <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
          <svg viewBox="0 0 200 130" className="w-48 h-32 overflow-visible">
            <defs>
              <linearGradient id="arcSweepGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(6,182,212,0.25)" />
                <stop offset="100%" stopColor="rgba(6,182,212,0)" />
              </radialGradient>
            </defs>

            {/* Background Arch Track (240 deg arc) */}
            <path
              d="M 25,115 A 75,75 0 1,1 175,115"
              fill="none"
              stroke="#0a2a1f"
              strokeWidth="9"
              strokeLinecap="round"
            />

            {/* Radial Tick Marks along the arc */}
            {Array.from({ length: 25 }, (_, i) => {
              const startAngle = 150 + i * (240 / 24);
              const rad = (startAngle * Math.PI) / 180;
              const r1 = 66;
              const r2 = 72;
              const x1 = 100 + r1 * Math.cos(rad);
              const y1 = 115 + r1 * Math.sin(rad);
              const x2 = 100 + r2 * Math.cos(rad);
              const y2 = 115 + r2 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 6 === 0 ? '#22d3ee' : '#0e3b2c'}
                  strokeWidth={i % 6 === 0 ? 1.8 : 1}
                />
              );
            })}

            {/* Active Colored Arc (Gradient) */}
            <path
              d="M 25,115 A 75,75 0 1,1 155,60"
              fill="none"
              stroke="url(#arcSweepGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            />

            {/* Radar Center Glow */}
            <circle cx="100" cy="115" r="45" fill="url(#radarCenterGlow)" />

            {/* Animated Rotating Radar Needle / Sweep Line */}
            {(() => {
              const needleRad = ((150 + (sweepAngle % 240)) * Math.PI) / 180;
              const nx = 100 + 72 * Math.cos(needleRad);
              const ny = 115 + 72 * Math.sin(needleRad);
              return (
                <g>
                  <line
                    x1="100"
                    y1="115"
                    x2={nx}
                    y2={ny}
                    stroke="#22d3ee"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_6px_#22d3ee]"
                  />
                  <circle cx="100" cy="115" r="4" fill="#38bdf8" />
                </g>
              );
            })()}
          </svg>

          {/* Metric inside/below the Arc */}
          <div className="absolute bottom-1 text-center flex flex-col items-center">
            <span className="font-extrabold text-3xl text-white tracking-tight leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              {activeThreatCount}
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">
              Active Threat Sources
            </span>
          </div>
        </div>
      </div>

      {/* 2. Attack Volume Trend */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#0e3b2c]/60">
          <h3 className="font-heading font-bold text-xs text-white tracking-wide">
            Attack Volume Trend
          </h3>
          <button className="text-slate-400 hover:text-cyan-300 transition-colors" title="Lihat riwayat volume">
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Counter */}
        <div className="my-2">
          <div className="text-xl font-extrabold text-white tracking-tight">
            {totalEventsCount}{' '}
            <span className="text-[11px] font-normal text-slate-400">Events</span>
          </div>
        </div>

        {/* Mini 24h Bar Chart */}
        <div className="h-14 flex items-end justify-between gap-1 pt-2">
          {hourlyBars.map((val, idx) => {
            const isPeak = val > 80;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end items-center h-full group relative"
              >
                <div
                  style={{ height: `${val}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isPeak
                      ? 'bg-gradient-to-t from-emerald-600 to-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      : 'bg-emerald-950/70 group-hover:bg-emerald-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Time Labels */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-[#0e3b2c]/40 mt-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
        </div>
      </div>

      {/* 3. AI Threat Detection Matrix (4 Quadrants) */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#0e3b2c]/60">
          <h3 className="font-heading font-bold text-xs text-white tracking-wide">
            AI Threat Detection
          </h3>
          <button className="text-slate-400 hover:text-cyan-300 transition-colors" title="Rincian deteksi AI">
            <ExternalLink size={13} />
          </button>
        </div>

        {/* 2x2 Quadrant Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-3">
          {/* High Risk (Critical) */}
          <div className="p-2.5 rounded-xl bg-[#12080a] border border-rose-900/50 shadow-sm">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>High Risk</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                Critical
              </span>
            </div>
            <div className="text-2xl font-extrabold text-rose-400 tracking-tight">
              {matrixData.highRisk}
            </div>
          </div>

          {/* Medium (Warning) */}
          <div className="p-2.5 rounded-xl bg-[#140e06] border border-amber-900/50 shadow-sm">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Medium</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                Warning
              </span>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {matrixData.medium}
            </div>
          </div>

          {/* Low (Basic) */}
          <div className="p-2.5 rounded-xl bg-[#06170f] border border-emerald-900/50 shadow-sm">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Low</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Basic
              </span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
              {matrixData.low.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Resolved (Mitigated) */}
          <div className="p-2.5 rounded-xl bg-[#061619] border border-cyan-900/50 shadow-sm">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Resolved</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Mitigated
              </span>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400 tracking-tight">
              {matrixData.resolved}
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI Confidence Meters */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg space-y-3">
        <h3 className="font-heading font-bold text-xs text-white tracking-wide border-b border-[#0e3b2c]/60 pb-2">
          AI Confidence
        </h3>

        {/* Progress 1: Malware Classification */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-cyan-400" />
              Malware Classification
            </span>
            <span className="text-cyan-400 font-bold">{confidenceScores.malware}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#03140e] rounded-full overflow-hidden border border-[#0e3b2c]">
            <div
              style={{ width: `${confidenceScores.malware}%` }}
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>

        {/* Progress 2: Anomaly Detection */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Cpu size={12} className="text-amber-400" />
              Anomaly Detection
            </span>
            <span className="text-amber-400 font-bold">{confidenceScores.anomaly}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#03140e] rounded-full overflow-hidden border border-[#0e3b2c]">
            <div
              style={{ width: `${confidenceScores.anomaly}%` }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            />
          </div>
        </div>

        {/* Progress 3: Threat Attribution */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Eye size={12} className="text-teal-400" />
              Threat Attribution
            </span>
            <span className="text-teal-300 font-bold">{confidenceScores.attribution}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#03140e] rounded-full overflow-hidden border border-[#0e3b2c]">
            <div
              style={{ width: `${confidenceScores.attribution}%` }}
              className="h-full bg-gradient-to-r from-teal-600 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
