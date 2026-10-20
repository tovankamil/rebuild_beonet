import React from 'react';
import { Clock } from 'lucide-react';

/**
 * DashLite Timeline Stepper Component (timeline)
 */
export default function DashTimeline({ items = [], head = 'Aktivitas Kemitraan' }) {
  if (!items || items.length === 0) {
    return <div className="p-4 text-xs text-slate-400 text-center">Tidak ada catatan timeline</div>;
  }

  const getStatusBg = (color) => {
    switch (color) {
      case 'success':
        return 'bg-emerald-500 ring-emerald-100';
      case 'warning':
        return 'bg-amber-500 ring-amber-100';
      case 'danger':
        return 'bg-rose-500 ring-rose-100';
      case 'info':
        return 'bg-cyan-500 ring-cyan-100';
      default:
        return 'bg-emerald-600 ring-emerald-100';
    }
  };

  return (
    <div className="p-5">
      {head && (
        <h6 className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">
          {head}
        </h6>
      )}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {items.map((it, idx) => (
          <div key={idx} className="relative group">
            {/* Status Dot */}
            <span
              className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ${getStatusBg(
                it.color
              )}`}
            />
            {/* Date & Title */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-0.5">
              <Clock size={11} />
              <span>{it.date}</span>
            </div>
            <h6 className="font-heading font-bold text-xs text-slate-800">
              {it.title}
            </h6>
            {it.desc && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {it.desc}
              </p>
            )}
            {it.time && (
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                {it.time}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
