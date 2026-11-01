import React, { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';

export default function LoadSequenceWidget() {
  const [timeRange, setTimeRange] = useState('Last 24 Minutes');
  const [scrubberPct, setScrubberPct] = useState(28); // percentage along the timeline

  // Stepped sequence segments matching blueprint layout
  // (x1, x2, y, color) with vertical drop lines
  const segments = [
    { x1: 25, x2: 135, y: 18, color: '#22d3ee', dropEnd: true },
    { x1: 175, x2: 245, y: 32, color: '#10b981', dropStart: true, dropEnd: true },
    { x1: 275, x2: 360, y: 32, color: '#22d3ee', dropEnd: true },
    { x1: 385, x2: 440, y: 44, color: '#38bdf8', dropStart: true, dropEnd: true },
    { x1: 455, x2: 485, y: 16, color: '#34d399', dropEnd: true },
  ];

  const scrubberX = (scrubberPct / 100) * 500;

  return (
    <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 sm:p-5 backdrop-blur-xl shadow-lg relative overflow-hidden text-slate-100 font-mono select-none transition-all hover:border-[#13533e]">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#0e3b2c]/60">
        <h3 className="font-heading font-bold text-xs sm:text-sm text-white tracking-wide">
          Load Sequence
        </h3>
        <button
          aria-label="Buka detail urutan beban"
          className="text-slate-400 hover:text-cyan-300 transition-colors p-1 rounded-lg"
          title="Buka detail urutan beban"
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Metrics Row (Matching Blueprint: ○ 161.35 Alerts | Dropdown | ○ 96.15 Resolve) */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3">
        {/* Metric 1: Alerts Velocity */}
        <div className="flex items-center gap-2">
          {/* Ring badge */}
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-white tracking-tight tabular-nums">
            161.35
          </span>
          <span className="text-[11px] text-slate-400">Alerts</span>
        </div>

        {/* Time Selector Dropdown */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            aria-label="Pilih rentang waktu Load Sequence"
            className="appearance-none bg-[#03140e] border border-[#0e3b2c] text-slate-200 text-xs rounded-xl px-3 py-1.5 pr-7 hover:border-cyan-500 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer font-mono"
          >
            <option value="Last 24 Minutes">Last 24 Minutes</option>
            <option value="Last 1 Hour">Last 1 Hour</option>
            <option value="Last 6 Hours">Last 6 Hours</option>
            <option value="Last 24 Hours">Last 24 Hours</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Metric 2: Resolution Rate */}
        <div className="flex items-center gap-2">
          {/* Ring badge */}
          <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-white tracking-tight tabular-nums">
            96.15
          </span>
          <span className="text-[11px] text-slate-400">Resolve</span>
        </div>
      </div>

      {/* Step / Timeline Scrubber Chart */}
      <div
        className="relative pt-4 pb-1 cursor-ew-resize select-none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = Math.max(6, Math.min(94, ((e.clientX - rect.left) / rect.width) * 100));
          setScrubberPct(pct);
        }}
      >
        <svg
          viewBox="0 0 500 75"
          className="w-full h-16 overflow-visible"
          preserveAspectRatio="none"
          aria-label="Interactive Load Sequence Scrubber"
        >
          {/* Main baseline */}
          <line
            x1="0"
            y1="52"
            x2="500"
            y2="52"
            stroke="rgba(14, 59, 44, 0.85)"
            strokeWidth="1.5"
          />

          {/* Stepped Event Segments & Vertical Connectors */}
          {segments.map((seg, i) => (
            <g key={i}>
              {/* Horizontal line segment */}
              <line
                x1={seg.x1}
                y1={seg.y, seg.y}
                x2={seg.x2}
                y2={seg.y}
                stroke={seg.color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Vertical connector drop lines */}
              {seg.dropStart && (
                <line
                  x1={seg.x1}
                  y1={seg.y}
                  x2={seg.x1}
                  y2="52"
                  stroke="#0e3b2c"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}
              {seg.dropEnd && (
                <line
                  x1={seg.x2}
                  y1={seg.y}
                  x2={seg.x2}
                  y2="52"
                  stroke="#0e3b2c"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}
            </g>
          ))}

          {/* Shaded vertical scrubber band */}
          <rect
            x={Math.max(0, scrubberX - 35)}
            y="6"
            width="35"
            height="46"
            fill="rgba(6, 182, 212, 0.12)"
            rx="2"
          />

          {/* Interactive vertical scrubber cursor line */}
          <line
            x1={scrubberX}
            y1="4"
            x2={scrubberX}
            y2="52"
            stroke="#22d3ee"
            strokeWidth="1.6"
            strokeDasharray="3,2"
          />

          {/* Scrubber round handle on the baseline */}
          <circle
            cx={scrubberX}
            cy="52"
            r="4"
            fill="#ffffff"
            stroke="#0891b2"
            strokeWidth="2"
            style={{
              filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.8))',
            }}
          />
        </svg>

        {/* Timeline bottom timestamps */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1 mt-1 tabular-nums">
          <span>14:16</span>
          <span className="text-cyan-300 font-bold">14:24</span>
          <span>14:32</span>
          <span>14:36</span>
          <span>14:40</span>
        </div>
      </div>
    </div>
  );
}
