import React from 'react';
import DashAvatar from './DashAvatar';
import DashBadge from './DashBadge';

/**
 * DashLite Support Requests Component (nk-support)
 */
export default function DashSupport({ tickets = [] }) {
  if (!tickets || tickets.length === 0) {
    return <div className="p-4 text-xs text-slate-400 text-center">Tidak ada tiket bantuan</div>;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'solved':
      case 'selesai':
        return 'success';
      case 'pending':
      case 'menunggu':
        return 'warning';
      case 'open':
      case 'proses':
      default:
        return 'info';
    }
  };

  return (
    <ul className="divide-y divide-slate-100">
      {tickets.map((t, idx) => (
        <li key={idx} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/60 transition-colors">
          <DashAvatar
            name={t.name}
            color={t.avatarColor || 'cyan'}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xs text-slate-900 truncate">{t.name}</span>
              <DashBadge variant="dot" color={getStatusColor(t.status)} size="sm">
                {t.status}
              </DashBadge>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
              {t.message}
            </p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">
              {t.time}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
