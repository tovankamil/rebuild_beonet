/**
 * exportUtils.js
 * Utilitas ekspor data laporan ke format Microsoft Excel (.xls) dan PDF untuk DashLite Bionet
 */

/**
 * Helper pemformat tanggal aman untuk ekspor tabel
 * Mencegah output "Invalid Date" jika nilai tanggal kosong, null, atau format bervariasi
 * @param {any} val - Nilai tanggal (Date, timestamp, atau string)
 * @param {object} options - Opsi pemformatan
 * @returns {string} Tanggal terformat bahasa Indonesia atau '-'
 */
export function formatExportDate(val, options = { includeTime: true }) {
  if (!val) return '-';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '-';
    return options.includeTime
      ? val.toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : val.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  }

  const str = String(val).trim();
  if (!str || str === 'Invalid Date' || str === 'undefined' || str === 'null' || str === 'NaN') {
    return '-';
  }

  // Jika string sudah dalam format teks terbaca (cth: "27 Okt 2026")
  if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}/.test(str)) {
    return str;
  }

  // Normalisasi spasi ke T untuk format timestamp DB MySQL/Go (cth: "2026-10-27 03:45:00")
  const normalized = str.includes(' ') && !str.includes('T') ? str.replace(' ', 'T') : str;
  const d = new Date(normalized);
  if (isNaN(d.getTime()) || d.getFullYear() < 1970) {
    return str !== 'Invalid Date' && !str.startsWith('0001') ? str : '-';
  }

  return options.includeTime
    ? d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

/**
 * Pembersih sel tabel agar tidak memunculkan kata "Invalid Date", "NaN", "null", atau "undefined"
 */
function cleanExportCell(val) {
  if (val === null || val === undefined) return '-';
  if (val instanceof Date) {
    return formatExportDate(val);
  }
  const str = String(val).trim();
  if (
    str === 'Invalid Date' ||
    str === 'NaN' ||
    str === 'undefined' ||
    str === 'null' ||
    str === ''
  ) {
    return '-';
  }
  return str;
}

/**
 * Ekspor data tabular ke file Excel (.xls) dengan styling tabel bersih
 * @param {string} filename - Nama file yang diunduh (tanpa ekstensi)
 * @param {string[]} headers - Daftar header kolom
 * @param {Array<Array<any>>} rows - Matriks data baris
 * @param {string} title - Judul laporan di bagian atas lembar kerja
 */
export function exportToExcel(filename = 'Laporan-Bionet', headers = [], rows = [], title = 'LAPORAN DATA BIONET') {
  const dateStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const headerCells = headers
    .map(
      (h) =>
        `<th style="background-color: #059669; color: #ffffff; font-weight: bold; padding: 10px 14px; border: 1px solid #047857; text-align: left;">${h}</th>`
    )
    .join('');

  const bodyRows = rows
    .map(
      (row, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f0fdf4'};">
        ${row
          .map(
            (cell) =>
              `<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px;">${cleanExportCell(
                cell
              )}</td>`
          )
          .join('')}
      </tr>`
    )
    .join('');

  const tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${filename.slice(0, 30)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; }
          .header-title { font-size: 18px; font-weight: bold; color: #064e3b; margin-bottom: 4px; }
          .header-meta { font-size: 11px; color: #64748b; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="${headers.length}" class="header-title">${title}</td></tr>
          <tr><td colspan="${headers.length}" class="header-meta">Diekspor pada: ${dateStr} | Sistem Bionet Enterprise Platform</td></tr>
          <tr></tr>
          <thead>
            <tr>${headerCells}</tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${Date.now()}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Ekspor data tabular ke PDF melalui Printable Document Browser yang siap cetak / Simpan ke PDF
 * @param {string} title - Judul Laporan
 * @param {string} subtitle - Deskripsi / Subtitle Laporan
 * @param {string[]} headers - Daftar judul kolom
 * @param {Array<Array<any>>} rows - Matriks data
 */
export function exportToPDF(title = 'Laporan Bionet', subtitle = '', headers = [], rows = []) {
  const dateStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const headerHtml = headers.map((h) => `<th>${h}</th>`).join('');
  const rowsHtml = rows
    .map(
      (row, idx) => `
      <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
        ${row.map((c) => `<td>${cleanExportCell(c)}</td>`).join('')}
      </tr>`
    )
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir oleh peramban. Izinkan pop-up untuk mencetak / menyimpan PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Ekspor PDF Bionet</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 24px;
          background: #fff;
          font-size: 12px;
        }
        .header-brand {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #059669;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .brand-logo {
          font-size: 22px;
          font-weight: 800;
          color: #064e3b;
          letter-spacing: -0.5px;
        }
        .brand-logo span {
          color: #059669;
        }
        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .report-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .report-sub {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background-color: #059669;
          color: #ffffff;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
          padding: 10px 12px;
          border: 1px solid #047857;
          text-align: left;
        }
        td {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          font-size: 11px;
        }
        tr.even {
          background-color: #ffffff;
        }
        tr.odd {
          background-color: #f8fafc;
        }
        .footer-note {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 24px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-brand">
        <div>
          <div class="brand-logo">Bionet<span>Rebuild</span></div>
          <div style="font-size: 11px; color: #10b981; font-weight: 600; margin-top: 2px;">Enterprise MLM Network & Multi-Bank Platform</div>
        </div>
        <div class="meta-box">
          <div>Dokumen Resmi Sistem</div>
          <div>Dicetak: ${dateStr}</div>
        </div>
      </div>

      <h1 class="report-title">${title}</h1>
      ${subtitle ? `<div class="report-sub">${subtitle}</div>` : ''}

      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer-note">
        <div>Total Data: ${rows.length} Baris</div>
        <div>Dicetak secara otomatis oleh Bionet Enterprise Portal</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
