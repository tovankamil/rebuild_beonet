import React from 'react';

/**
 * DashLite User Avatar Component (user-avatar)
 * Sizes: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * Colors: 'emerald' | 'cyan' | 'amber' | 'rose' | 'purple' | 'slate'
 * Status: 'online' | 'offline' | 'away' | 'busy' | null
 */
export default function DashAvatar({
  name = '',
  src = '',
  size = 'md',
  color = 'emerald',
  status = null,
  className = '',
}) {
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-bold',
  };

  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const statusMap = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size] || sizeMap.md} rounded-full object-cover border border-slate-200`}
        />
      ) : (
        <div
          className={`${sizeMap[size] || sizeMap.md} ${
            colorMap[color] || colorMap.emerald
          } rounded-full border flex items-center justify-center font-bold tracking-tight select-none shadow-sm`}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
            statusMap[status] || statusMap.online
          }`}
        />
      )}
    </div>
  );
}
