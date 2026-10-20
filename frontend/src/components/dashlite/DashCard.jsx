import React from 'react';

export function DashCard({ children, className = '', hover = true }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-dashlite ${
        hover ? 'hover:shadow-dashlite-md transition-shadow duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function DashCardHeader({ title, subtitle, tools, className = '' }) {
  return (
    <div className={`p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 ${className}`}>
      <div>
        {title && (
          <h4 className="font-heading font-bold text-base text-slate-800 leading-snug">
            {title}
          </h4>
        )}
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {tools && <div className="flex items-center gap-2 flex-shrink-0">{tools}</div>}
    </div>
  );
}

export function DashCardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function DashCardFooter({ children, className = '' }) {
  return (
    <div className={`p-4 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}

export default DashCard;
