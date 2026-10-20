import React from 'react';

/**
 * DashLite Badge Component
 * Variants: 'dot' | 'dim' | 'solid' | 'outline'
 * Colors: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark'
 */
export default function DashBadge({
  children,
  variant = 'dim',
  color = 'primary',
  className = '',
  size = 'md',
}) {
  const colorMap = {
    primary: {
      solid: 'bg-emerald-600 text-white',
      dim: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      outline: 'border border-emerald-600 text-emerald-600',
      dot: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    success: {
      solid: 'bg-emerald-600 text-white',
      dim: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      outline: 'border border-emerald-600 text-emerald-600',
      dot: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    warning: {
      solid: 'bg-amber-500 text-white',
      dim: 'bg-amber-50 text-amber-800 border border-amber-200',
      outline: 'border border-amber-500 text-amber-600',
      dot: 'text-amber-700',
      dotColor: 'bg-amber-500',
    },
    danger: {
      solid: 'bg-rose-500 text-white',
      dim: 'bg-rose-50 text-rose-700 border border-rose-200',
      outline: 'border border-rose-500 text-rose-600',
      dot: 'text-rose-700',
      dotColor: 'bg-rose-500',
    },
    info: {
      solid: 'bg-cyan-600 text-white',
      dim: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      outline: 'border border-cyan-600 text-cyan-600',
      dot: 'text-cyan-700',
      dotColor: 'bg-cyan-500',
    },
    light: {
      solid: 'bg-slate-200 text-slate-800',
      dim: 'bg-slate-100 text-slate-600 border border-slate-200',
      outline: 'border border-slate-300 text-slate-600',
      dot: 'text-slate-600',
      dotColor: 'bg-slate-400',
    },
  };

  const selected = colorMap[color] || colorMap.primary;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  if (variant === 'dot') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold text-xs ${selected.dot} ${className}`}>
        <span className={`w-2 h-2 rounded-full ${selected.dotColor} flex-shrink-0`} />
        <span>{children}</span>
      </span>
    );
  }

  const variantClass = selected[variant] || selected.dim;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md ${variantClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {children}
    </span>
  );
}
