import React, { useState } from 'react';
import {
  Wallet,
  Users,
  GitFork,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building2,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Landmark,
} from 'lucide-react';

export default function OverviewTab({ stats, setActiveTab }) {
  const [chartHoverIndex, setChartHoverIndex] = useState(null);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const pointLeft = stats?.point_balance?.point_left || 125;
  const pointRight = stats?.point_balance?.point_right || 98;
  const totalPoints = pointLeft + pointRight || 1;
  const leftPct = Math.round((pointLeft / totalPoints) * 100);
  const rightPct = 100 - leftPct;
  const pairedPoints = Math.min(pointLeft, pointRight);
  const estPairingBonus = pairedPoints * 25000;

  // 7-day demo omset curve
  const omsetDays = [
    { day: 'Sen', omset: 1250000, points: 15 },
    { day: 'Sel', omset: 2400000, points: 28 },
    { day: 'Rab', omset: 1850000, points: 22 },
    { day: 'Kam', omset: 3100000, points: 36 },
    { day: 'Jum', omset: 2750000, points: 30 },
    { day: 'Sab', omset: 4200000, points: 52 },
    { day: 'Min', omset: 3800000, points: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* DashLite Demo 3 Page Title Block (nk-block-head) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Sales & Overview Kemitraan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Selamat datang di panel kendali Bionet. Pantau omset, bonus pasangan, dan mutasi saldo secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('genealogy')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            <GitFork size={15} className="text-emerald-600" />
            <span>Pohon Jaringan</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shadow-emerald-600/30"
          >
            <Landmark size={15} />
            <span>Tarik Saldo</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid (DashLite Demo 3 Card Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Saldo Dompet */}
        <div className="dash-card p-5 border-t-4 border-t-emerald-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Saldo Dompet Tunai
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Siap ditarik ke rekening</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {formatRupiah(stats?.wallet_balance)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="badge-dot badge-dot-success text-[11px] font-semibold text-emerald-700">
              Tersedia via Flip.id
            </span>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]"
            >
              <span>Pencairan</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 2: Bonus Sponsor */}
        <div className="dash-card p-5 border-t-4 border-t-cyan-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Bonus Sponsor
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Komisi referral langsung</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {formatRupiah(stats?.total_sponsor_bonus || 1450000)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              <ArrowUpRight size={12} /> +12.5%
            </span>
            <span>Bulan Ini</span>
          </div>
        </div>

        {/* Card 3: Bonus Pasangan */}
        <div className="dash-card p-5 border-t-4 border-t-amber-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Bonus Pasangan
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">{pairedPoints} Pasang Seimbang</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {formatRupiah(estPairingBonus)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Rp 25.000 / pasang</span>
            <span className="text-amber-600 font-bold text-[11px]">Harian</span>
          </div>
        </div>

        {/* Card 4: Total Mitra Downline */}
        <div className="dash-card p-5 border-t-4 border-t-teal-600">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Jaringan
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Closure Table Node</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <GitFork size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {stats?.total_downlines || 223} <span className="text-sm font-medium text-slate-400">Mitra</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-teal-700 font-semibold">Aktif 100%</span>
            <button
              onClick={() => setActiveTab('referrals')}
              className="text-slate-600 hover:text-emerald-600 font-semibold text-[11px]"
            >
              Lihat Daftar
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Omset Chart & Pairing Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Omset Chart (Col 8) */}
        <div className="lg:col-span-8 dash-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-800">
                Grafik Omset & Pertumbuhan Kemitraan (7 Hari Terakhir)
              </h4>
              <p className="text-xs text-slate-400">
                Pergerakan volume penjualan paket hak usaha dan Repeat Order (RO)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">
                <Calendar size={13} />
                <span>Minggu Ini</span>
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="relative pt-4 pb-2">
            <div className="h-48 w-full flex items-end justify-between gap-3 px-2">
              {omsetDays.map((item, idx) => {
                const heightPct = Math.round((item.omset / 4500000) * 100);
                const isHovered = chartHoverIndex === idx;
                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setChartHoverIndex(idx)}
                    onMouseLeave={() => setChartHoverIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-bold">{formatRupiah(item.omset)}</div>
                        <div className="text-[10px] text-emerald-400">{item.points} PV Poin</div>
                      </div>
                    )}
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isHovered
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                          : 'bg-emerald-100 hover:bg-emerald-200'
                      }`}
                    />
                    {/* Day label */}
                    <span className="text-[11px] font-semibold text-slate-500 mt-2">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Summary Stats Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Omset 7 Hari</span>
              <p className="font-heading font-bold text-base text-slate-800 mt-0.5">Rp 19.250.000</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Rata-Rata Harian</span>
              <p className="font-heading font-bold text-base text-slate-800 mt-0.5">Rp 2.750.000</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Pertumbuhan</span>
              <p className="font-heading font-bold text-base text-emerald-600 mt-0.5">+18.4%</p>
            </div>
          </div>
        </div>

        {/* Right: High-Tech Pairing Meter & Rank Qualification (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pairing Points Split Box */}
          <div className="dash-card p-6 bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="font-heading font-bold text-sm text-slate-800">
                  Rasio Kaki Binary (Pairing)
                </h5>
                <p className="text-[11px] text-slate-400">Keseimbangan Omset Kiri & Kanan</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                1:1 Matching
              </span>
            </div>

            {/* Split Columns */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-lg bg-cyan-50/70 border border-cyan-100 text-center">
                <span className="text-[10px] uppercase font-bold text-cyan-700 tracking-wider">
                  ◀ Kaki Kiri (L)
                </span>
                <div className="font-heading font-extrabold text-2xl text-cyan-900 mt-1">
                  {pointLeft}
                </div>
                <span className="text-[10px] text-cyan-600 font-medium">Poin Volume</span>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Kaki Kanan (R) ▶
                </span>
                <div className="font-heading font-extrabold text-2xl text-emerald-900 mt-1">
                  {pointRight}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Poin Volume</span>
              </div>
            </div>

            {/* Progress Split Bar */}
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Kiri: {leftPct}%</span>
                <span>Kanan: {rightPct}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div style={{ width: `${leftPct}%` }} className="bg-cyan-500 h-full" />
                <div style={{ width: `${rightPct}%` }} className="bg-emerald-500 h-full" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Bonus pasangan dihitung dari kaki yang lebih kecil ({pairedPoints} pasang = {formatRupiah(estPairingBonus)}). Sisa poin tersimpan (tidak hangus / Carry Forward).
              </p>
            </div>
          </div>

          {/* Bank Account Verification Card */}
          <div className="dash-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600" />
                <h5 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Rekening Pencairan Bank
                </h5>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Terverifikasi
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Nama Bank</div>
              <div className="font-bold text-sm text-slate-800">
                {stats?.bank?.bank_name || 'BCA (Bank Central Asia)'}
              </div>
              <div className="text-xs text-slate-500 mt-2">Nomor Rekening</div>
              <div className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                {stats?.bank?.account_number || '8830-1928-4820'}
              </div>
              <div className="text-xs text-slate-500 mt-2">Atas Nama</div>
              <div className="font-semibold text-xs text-slate-700 uppercase">
                {stats?.bank?.account_name || stats?.user?.full_name || 'MITRA BIONET MANDIRI'}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('bank')}
              className="w-full mt-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
            >
              Ubah Data Rekening
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Recent Activity & Quick Ledger (DashLite nk-tb-list style) */}
      <div className="dash-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-800">
              Riwayat Transaksi & Mutasi Dompet Terbaru
            </h4>
            <p className="text-xs text-slate-400">
              Catatan mutasi komisi bonus masuk dan penarikan saldo secara transparan
            </p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Buka Buku Besar</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  No. Transaksi (UUID)
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tipe Mutasi
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nominal (IDR)
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr className="hover:bg-slate-50/80">
                <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                  #TX-7f9a2b8e
                </td>
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    <ArrowDownLeft size={12} /> Kredit
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-emerald-600 font-heading text-sm">
                  + Rp 500.000
                </td>
                <td className="py-3.5 px-5 text-slate-700 font-medium">
                  Bonus Sponsor Baru (Mitra @agus_bionet)
                </td>
                <td className="py-3.5 px-5 text-slate-400">
                  Hari ini, 09:15 WIB
                </td>
                <td className="py-3.5 px-5">
                  <span className="badge-dot badge-dot-success text-[11px] text-emerald-700">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                  #TX-3d4c1a5b
                </td>
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    <ArrowDownLeft size={12} /> Kredit
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-emerald-600 font-heading text-sm">
                  + Rp 250.000
                </td>
                <td className="py-3.5 px-5 text-slate-700 font-medium">
                  Bonus Pasangan Binary (10 Pasang Harian)
                </td>
                <td className="py-3.5 px-5 text-slate-400">
                  Kemarin, 23:59 WIB
                </td>
                <td className="py-3.5 px-5">
                  <span className="badge-dot badge-dot-success text-[11px] text-emerald-700">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                  #TX-118fae49
                </td>
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                    <ArrowUpRight size={12} /> Debit
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-rose-600 font-heading text-sm">
                  - Rp 1.000.000
                </td>
                <td className="py-3.5 px-5 text-slate-700 font-medium">
                  Pencairan Saldo ke Rekening BCA
                </td>
                <td className="py-3.5 px-5 text-slate-400">
                  18 Okt 2026, 14:20 WIB
                </td>
                <td className="py-3.5 px-5">
                  <span className="badge-dot badge-dot-success text-[11px] text-emerald-700">
                    Berhasil Ditransfer
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
