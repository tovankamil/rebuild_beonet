import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Reusable Standard DashLite Demo 3 Pagination Bar
 */
export default function DashPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
  className = '',
}) {
  if (totalItems === 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 ${className}`}
    >
      {/* Left: Range Info & Page Size Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          Menampilkan <span className="font-bold text-slate-800">{startItem}</span> &ndash;{' '}
          <span className="font-bold text-slate-800">{endItem}</span> dari{' '}
          <span className="font-bold text-slate-800">{totalItems}</span> data
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                if (onPageChange) onPageChange(1);
              }}
              className="dash-input py-1 px-2 text-xs font-semibold w-auto bg-slate-50 border-slate-200 rounded-md focus:border-emerald-600"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination Navigation Controls */}
      <div className="flex items-center gap-1 select-none">
        {/* Jump to First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Halaman Pertama"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 py-1 text-slate-400">
                  &hellip;
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] h-9 sm:min-w-[32px] sm:h-8 px-2 sm:px-2.5 rounded-lg font-semibold text-xs transition-all active:scale-95 flex items-center justify-center ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Halaman Selanjutnya"
        >
          <ChevronRight size={15} />
        </button>

        {/* Jump to Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Halaman Terakhir"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}
