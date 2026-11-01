import React, { useState } from 'react';
import { ExternalLink, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoadSequenceWidget() {
  const [timeRange, setTimeRange] = useState('Last 24 Minutes');
  const [scrubberX, setScrubberX] = useState(30); // percentage

  return (
    <div className="rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-5 backdrop-blur-xl shadow-lg relative overflow-hidden text-slate-100 font-mono">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#0e3b2c]/60">
        <h3 className="font-heading font-bold text-sm text-white tracking-wide">
          Load Sequence
        </h3>
        <button
          className="text-slate-400 hover:text-cyan-300 transition-colors"
          title="Buka detail urutan beban"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3">
        {/* Metric 1: Alerts Velocity */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">161.35</span>
          <span className="text-[11px] text-slate-400">Alerts/min</span>
        </div>

        {/* Time Selector Dropdown */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-[#03140e] border border-[#0e3b2c] text-slate-300 text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="Last 24 Minutes">Last 24 Minutes</option>
            <option value="Last 1 Hour">Last 1 Hour</option>
            <option value="Last 6 Hours">Last 6 Hours</option>
            <option value="Last 24 Hours">Last 24 Hours</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-3 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Metric 2: Resolution Rate */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">96.15%</span>
          <span className="text-[11px] text-slate-400">Resolved</span>
        </div>
      </div>

      {/* Step / Timeline Scrubber Chart */}
      <div
        className="relative pt-6 pb-2 cursor-crosshair select-none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
          setScrubberX(pct);
        }}
      >
        {/* SVG Step Chart */}
        <svg
          viewBox="0 0 500 70"
          className="w-full h-16 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Main baseline */}
          <line
            x1="0"
            y1="48"
            x2="500"
            y2="48"
            stroke="rgba(14, 59, 44, 0.8)"
            strokeWidth="1.5"
          />

          {/* Stepped Event Segments (Horizontal steps at varying heights) */}
          {/* Segment 1: High alert sequence */}
          <line x1="30" y1="22" x2="110" y2="22" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="110" y1="22" x2="110" y2="48" stroke="#0e3b2c" strokeWidth="1" strokeDasharray="2,2" />

          {/* Segment 2: Mid-level step */}
          <line x1="160" y1="32" x2="215" y2="32" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="160" y1="32" x2="160" y2="48" stroke="#0e3b2c" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="215" y1="32" x2="215" y2="48" stroke="#0e3b2c" strokeWidth="1" strokeDasharray="2,2" />

          {/* Segment 3: Sustained normal load */}
          <line x1="240" y1="32" x2="310" y2="32" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="310" y1="32" x2="310" y2="48" stroke="#0e3b2c" strokeWidth="1" strokeDasharray="2,2" />

          {/* Segment 4: Lower baseline burst */}
          <line x1="340" y1="42" x2="400" y2="42" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="340" y1="42" x2="340" y2="48" stroke="#0e3b2c" strokeWidth="1" strokeDasharray="2,2" />

          {/* Segment 5: Minor elevated spike */}
          <line x1="430" y1="20" x2="475" y2="20" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="475" y1="20" x2="475" y2="48" stroke="#0e3b2c" strokeWidth="1" strokeDasharray="2,2" />

          {/* Interactive vertical scrubber line */}
          <line
            x1={`${scrubberX * 5}`}
            y1="5"
            x2={`${scrubberX * 5}`}
            y2="55"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />
          {/* Shaded scrubber area */}
          <rect
            x={`${Math.max(0, scrubberX * 5 - 28)}`}
            y="12"
            width="28"
            height="36"
            fill="rgba(6, 182, 212, 0.12)"
            rx="2"
          />
          <circle
            cx={`${scrubberX * 5}`}
            cy="48"
            r="3.5"
            fill="#22d3ee"
            stroke="#03140e"
            strokeWidth="2"
          />
        </svg>

        {/* Timeline bottom timestamps */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-2 mt-1">
          <span>14:16</span>
          <span className="text-cyan-400 font-bold">14:24</span>
          <span>14:32</span>
          <span>14:36</span>
          <span>14:40</span>
        </div>
      </div>
    </div>
  );
}
