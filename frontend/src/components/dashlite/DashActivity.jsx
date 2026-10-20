import React from 'react';
import DashAvatar from './DashAvatar';

/**
 * DashLite Recent Activity Component (nk-activity)
 */
export default function DashActivity({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return <div className="p-4 text-xs text-slate-400 text-center">Tidak ada aktivitas baru</div>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {activities.map((item, idx) => (
        <li key={idx} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/60 transition-colors">
          <DashAvatar
            name={item.user || item.title}
            src={item.avatar}
            color={item.color || 'emerald'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 leading-snug">
              {item.label}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              {item.time}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
