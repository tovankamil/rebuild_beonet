import React, { useState } from 'react';
import { Download, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export default function ExportButtons({
  filename = 'Laporan-Bionet',
  title = 'Laporan Data',
  subtitle = '',
  headers = [],
  rows = [],
  className = '',
}) {
  const [open, setOpen] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(filename, headers, rows, title);
    setOpen(false);
  };

  const handleExportPDF = () => {
    exportToPDF(title, subtitle, headers, rows);
    setOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div className="inline-flex items-center rounded-lg shadow-sm">
        <button
          type="button"
          onClick={handleExportExcel}
          title="Ekspor langsung ke Excel (.xls)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-l-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 transition active:scale-95"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Excel</span>
        </button>
        <button
          type="button"
          onClick={handleExportPDF}
          title="Cetak atau Simpan sebagai PDF"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border-t border-b border-r border-rose-200 hover:bg-rose-100 hover:text-rose-800 transition active:scale-95"
        >
          <Printer className="w-3.5 h-3.5 text-rose-600" />
          <span>PDF</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="px-2 py-1.5 text-xs font-semibold rounded-r-lg text-slate-600 bg-slate-50 border-t border-b border-r border-slate-200 hover:bg-slate-100 transition"
        >
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in-50 zoom-in-95">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Format Ekspor Data
            </div>
            <button
              type="button"
              onClick={handleExportExcel}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-medium">Microsoft Excel</div>
                <div className="text-[10px] text-slate-400">Unduh lembar kerja (.xls)</div>
              </div>
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              <div>
                <div className="font-medium">Dokumen PDF</div>
                <div className="text-[10px] text-slate-400">Cetak / Simpan PDF</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
