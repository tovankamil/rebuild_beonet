import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldAlert, Cpu, Eye } from 'lucide-react';

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
  // Semi-circular Tachometer Arc Geometry Parameters (100% Concentric & Mathematically Exact)
  const cx = 120;
  const cy = 105;
  const R = 74; // Radius of main track arc
  const rIn = 58; // Inner tick radius
  const rOut = 64; // Outer tick radius
  const startAngle = -105; // -105 deg (0 = 12 o'clock)
  const totalSweep = 210; // 210 deg total sweep
  const arcLength = 271.224; // 74 * (210 * PI / 180) = 271.224

  // Normalized fill fraction (~70% like reference blueprint)
  const fillFraction = Math.min(0.96, Math.max(0.1, activeThreatCount / 1400));
  const activeAngle = startAngle + fillFraction * totalSweep;
  const activeRad = (activeAngle * Math.PI) / 180;
  const tipX = cx + R * Math.sin(activeRad);
  const tipY = cy - R * Math.cos(activeRad);

  // Concentric radial ticks (31 ticks, exactly 7° apart)
  const tickCount = 31;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const fraction = i / (tickCount - 1);
    const angleDeg = startAngle + fraction * totalSweep;
    const angleRad = (angleDeg * Math.PI) / 180;
    const sin = Math.sin(angleRad);
    const cos = Math.cos(angleRad);

    const x1 = cx + rIn * sin;
    const y1 = cy - rIn * cos;
    const x2 = cx + rOut * sin;
    const y2 = cy - rOut * cos;

    const isActive = fraction <= fillFraction;
    const isMajor = i % 5 === 0;

    return {
      id: i,
      x1: Number(x1.toFixed(2)),
      y1: Number(y1.toFixed(2)),
      x2: Number(x2.toFixed(2)),
      y2: Number(y2.toFixed(2)),
      isActive,
      isMajor,
    };
  });

  // 24-hour attack volume bar heights matching SOC diurnal traffic pattern
  const hourlyBars = [
    18, 14, 12, 10, 15, 24, 38, 56, 74, 88, 94, 82,
    76, 85, 96, 90, 78, 84, 89, 72, 54, 42, 30, 22
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Global Threat Radar (Concentric Tachometer Arc Gauge) */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all duration-200 hover:border-[#13533e]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#0e3b2c]/60">
          <h3 className="font-heading font-bold text-xs text-white tracking-wide">
            Global Threat Radar
          </h3>
          <button
            aria-label="Buka detail radar"
            className="text-slate-400 hover:text-cyan-300 transition-colors p-1 rounded-lg"
            title="Buka detail radar"
          >
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Semi-circular concentric arc tachometer */}
        <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
          <svg
            viewBox="0 0 240 142"
            className="w-full max-w-[240px] h-auto overflow-visible"
            aria-label="Global Threat Radar Tachometer"
          >
            <defs>
              {/* Active Glowing Arc Gradient */}
              <linearGradient id="arcSweepGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="65%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>

              {/* Center Ambient Glow */}
              <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(6,182,212,0.22)" />
                <stop offset="70%" stopColor="rgba(16,185,129,0.06)" />
                <stop offset="100%" stopColor="rgba(6,182,212,0)" />
              </radialGradient>
            </defs>

            {/* Ambient center glow circle */}
            <circle cx={cx} cy={cy - 8} r="54" fill="url(#radarCenterGlow)" />

            {/* Background Arch Track (-105° to +105° = 210° sweep, Radius 74) */}
            <path
              d="M 48.52,124.15 A 74,74 0 1,1 191.48,124.15"
              fill="none"
              stroke="#0a2a1f"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Concentric Radial Ticks along the arc (R_in: 58, R_out: 64) */}
            {ticks.map((tick) => (
              <line
                key={tick.id}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={
                  tick.isActive
                    ? tick.isMajor
                      ? '#22d3ee'
                      : '#10b981'
                    : '#0a2a1f'
                }
                strokeWidth={tick.isMajor ? 1.8 : 1.1}
                strokeLinecap="round"
                opacity={tick.isActive ? 1 : 0.65}
                className={tick.isActive ? 'transition-all' : ''}
              />
            ))}

            {/* Active Colored Arc (Gradient with identical SVG path & strokeDashoffset) */}
            <path
              d="M 48.52,124.15 A 74,74 0 1,1 191.48,124.15"
              fill="none"
              stroke="url(#arcSweepGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={Number((arcLength * (1 - fillFraction)).toFixed(2))}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.65))',
              }}
            />

            {/* Active Head Beacon Dot at the arc tip */}
            <circle
              cx={tipX.toFixed(2)}
              cy={tipY.toFixed(2)}
              r="3.2"
              fill="#ffffff"
              style={{
                filter: 'drop-shadow(0 0 6px #22d3ee)',
              }}
            />
            <circle
              cx={tipX.toFixed(2)}
              cy={tipY.toFixed(2)}
              r="5.5"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              className="animate-ping opacity-60"
            />

            {/* Clean Centered Numeric Display (No collision with hands/needles) */}
            <g className="select-none pointer-events-none">
              <text
                x={cx}
                y={cy - 9}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono font-extrabold text-[32px] fill-white tracking-tight tabular-nums"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.45)) drop-shadow(0 0 20px rgba(34, 211, 238, 0.4))',
                }}
              >
                {activeThreatCount}
              </text>
              <text
                x={cx}
                y={cy + 13}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono font-semibold text-[8.5px] fill-slate-400 tracking-wider uppercase"
              >
                Active Threat Sources
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* 2. Attack Volume Trend */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all duration-200 hover:border-[#13533e]">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#0e3b2c]/60">
          <h3 className="font-heading font-bold text-xs text-white tracking-wide">
            Attack Volume Trend
          </h3>
          <button
            aria-label="Lihat riwayat volume"
            className="text-slate-400 hover:text-cyan-300 transition-colors p-1 rounded-lg"
            title="Lihat riwayat volume"
          >
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Metric Header */}
        <div className="my-2.5">
          <div className="text-xl font-extrabold text-white tracking-tight tabular-nums">
            {totalEventsCount}{' '}
            <span className="text-[11px] font-normal text-slate-400">Events</span>
          </div>
        </div>

        {/* 24h Bar Chart with Y-Axis Markers */}
        <div className="flex items-end gap-2 pt-1">
          {/* Y-Axis Scale Markers */}
          <div className="flex flex-col justify-between text-[8px] text-slate-500 font-mono h-14 pb-0.5 select-none shrink-0">
            <span>1M</span>
            <span>500K</span>
            <span>0</span>
          </div>

          {/* Hourly Bars */}
          <div className="flex-1 h-14 flex items-end justify-between gap-[2px]">
            {hourlyBars.map((val, idx) => {
              const isPeak = val > 80;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col justify-end items-center h-full group relative cursor-pointer"
                  title={`Hour ${String(idx).padStart(2, '0')}:00 - ${val}% Load`}
                >
                  <div
                    style={{ height: `${val}%` }}
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      isPeak
                        ? 'bg-gradient-to-t from-emerald-600 via-cyan-500 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                        : 'bg-[#0d3829] group-hover:bg-emerald-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Labels */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-[#0e3b2c]/40 mt-1 pl-6">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
        </div>
      </div>

      {/* 3. AI Threat Detection Matrix (4 Quadrants) */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg transition-all duration-200 hover:border-[#13533e]">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#0e3b2c]/60">
          <h3 className="font-heading font-bold text-xs text-white tracking-wide">
            AI Threat Detection
          </h3>
          <button
            aria-label="Rincian deteksi AI"
            className="text-slate-400 hover:text-cyan-300 transition-colors p-1 rounded-lg"
            title="Rincian deteksi AI"
          >
            <ExternalLink size={13} />
          </button>
        </div>

        {/* 2x2 Quadrant Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-3">
          {/* High Risk (Critical) */}
          <div className="p-2.5 rounded-xl bg-[#12080a]/90 border border-rose-900/50 shadow-sm transition-all hover:border-rose-700/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>High Risk</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-950/90 text-rose-300 border border-rose-800">
                Critical
              </span>
            </div>
            <div className="text-2xl font-extrabold text-rose-400 tracking-tight tabular-nums">
              {matrixData.highRisk}
            </div>
          </div>

          {/* Medium (Warning) */}
          <div className="p-2.5 rounded-xl bg-[#140e06]/90 border border-amber-900/50 shadow-sm transition-all hover:border-amber-700/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Medium</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-950/90 text-amber-300 border border-amber-800">
                Warning
              </span>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 tracking-tight tabular-nums">
              {matrixData.medium}
            </div>
          </div>

          {/* Low (Basic) */}
          <div className="p-2.5 rounded-xl bg-[#06170f]/90 border border-emerald-900/50 shadow-sm transition-all hover:border-emerald-700/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Low</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                Basic
              </span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight tabular-nums">
              {matrixData.low.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Resolved (Mitigated) */}
          <div className="p-2.5 rounded-xl bg-[#061619]/90 border border-cyan-900/50 shadow-sm transition-all hover:border-cyan-700/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Resolved</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800">
                Mitigated
              </span>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400 tracking-tight tabular-nums">
              {matrixData.resolved}
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI Confidence Meters */}
      <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg space-y-3 transition-all duration-200 hover:border-[#13533e]">
        <h3 className="font-heading font-bold text-xs text-white tracking-wide border-b border-[#0e3b2c]/60 pb-2">
          AI Confidence
        </h3>

        {/* Progress 1: Malware Classification */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-cyan-400 shrink-0" />
              Malware Classification
            </span>
            <span className="text-cyan-400 font-bold tabular-nums">{confidenceScores.malware}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#03140e] rounded-full overflow-hidden border border-[#0e3b2c]">
            <div
              style={{ width: `${confidenceScores.malware}%` }}
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-500 ease-out"
            />
          </div>
        </div>

        {/* Progress 2: Anomaly Detection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Cpu size={12} className="text-amber-400 shrink-0" />
              Anomaly Detection
            </span>
            <span className="text-amber-400 font-bold tabular-nums">{confidenceScores.anomaly}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#03140e] rounded-full overflow-hidden border border-[#0e3b2c]">
            <div
              style={{ width: `${confidenceScores.anomaly}%` }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500 ease-out"
            />
          </div>
        </div>

        {/* Progress 3: Threat Attribution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Eye size={12} className="text-teal-400 shrink-0" />
              Threat Attribution
            </span>
            <span className="text-teal-300 font-bold tabular-nums">{confidenceScores.attribution}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#03140e] rounded-full overflow-hidden border border-[#0e3b2c]">
            <div
              style={{ width: `${confidenceScores.attribution}%` }}
              className="h-full bg-gradient-to-r from-teal-600 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
