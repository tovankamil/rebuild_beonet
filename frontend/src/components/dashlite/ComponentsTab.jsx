import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Layers,
  Send,
  Eye,
  Trash2,
  Edit2,
  Copy,
} from 'lucide-react';
import DashBadge from './DashBadge';
import DashAvatar from './DashAvatar';
import DashCard, { DashCardHeader, DashCardBody, DashCardFooter } from './DashCard';
import DashActivity from './DashActivity';
import DashSupport from './DashSupport';
import DashTimeline from './DashTimeline';

export default function ComponentsTab() {
  const [activeSection, setActiveSection] = useState('all');
  const [toggleState, setToggleState] = useState(true);

  const sampleActivities = [
    { user: 'Agus Bionet', label: 'Mendaftar sebagai mitra baru di kaki kanan', time: '10 menit yang lalu', color: 'emerald' },
    { user: 'Siti Aminah', label: 'Mengajukan penarikan saldo sebesar Rp 500.000', time: '45 menit yang lalu', color: 'amber' },
    { user: 'Budi Santoso', label: 'Mengaktivasi paket Platinum 7 Hak Usaha', time: '2 jam yang lalu', color: 'purple' },
    { user: 'Flip Gateway', label: 'Dana penarikan Rp 1.000.000 berhasil ditransfer ke BCA', time: '4 jam yang lalu', color: 'cyan' },
  ];

  const sampleTickets = [
    { name: 'Dr. Hendra Wijaya', status: 'Pending', message: 'Bagaimana cara mendaftarkan sub-stokis herbal di wilayah Surabaya?', time: '5 menit lalu', avatarColor: 'emerald' },
    { name: 'Dewi Lestari', status: 'Solved', message: 'Bonus pasangan harian sudah masuk ke dompet secara otomatis. Terima kasih!', time: '1 jam lalu', avatarColor: 'cyan' },
    { name: 'Rahmat Hidayat', status: 'Open', message: 'Mohon bantuan update rekening bank BRI saya yang baru.', time: '3 jam lalu', avatarColor: 'amber' },
  ];

  const sampleTimeline = [
    { date: '21 Okt 2026', title: 'Implementasi Design System DashLite Demo 3', desc: 'Pemetaan komponen layout, font Plus Jakarta Sans & Outfit, dan tema warna Bio-Emerald.', time: '03:15 WIB', color: 'success' },
    { date: '20 Okt 2026', title: 'Migrasi Database 100% UUID', desc: 'Seluruh 19 tabel dan relasi foreign key dimigrasikan menggunakan CHAR(36) UUID.', time: '23:45 WIB', color: 'info' },
    { date: '20 Okt 2026', title: 'Peluncuran Mesin Bonus MLM Binary', desc: 'Closure Table traversal untuk pohon kemitraan dan perhitungan bonus pasangan.', time: '18:30 WIB', color: 'warning' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Palette size={24} className="text-emerald-600" />
            <span>Katalog Komponen UI DashLite Demo 3</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Galeri komponen antarmuka yang diadaptasi dari template DashLite Demo 3 dengan Tailwind CSS & tema Bionet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            Design System v6
          </span>
        </div>
      </div>

      {/* 1. BADGES SECTION */}
      <section className="space-y-4">
        <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
          <span>1. Badges & Status Indicators (DashLite Badges)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dim Badges */}
          <DashCard>
            <DashCardHeader title="Dim Badges (Signature DashLite Soft Style)" subtitle="Latar belakang pastel dengan border halus" />
            <DashCardBody>
              <div className="flex flex-wrap gap-2">
                <DashBadge color="primary">Primary Emerald</DashBadge>
                <DashBadge color="success">Success Paid</DashBadge>
                <DashBadge color="warning">Warning Due</DashBadge>
                <DashBadge color="danger">Danger Canceled</DashBadge>
                <DashBadge color="info">Info Active</DashBadge>
                <DashBadge color="light">Light Default</DashBadge>
              </div>
            </DashCardBody>
          </DashCard>

          {/* Dot Badges */}
          <DashCard>
            <DashCardHeader title="Dot Badges (Live Status Indicators)" subtitle="Titik bulat berwarna dengan teks status" />
            <DashCardBody>
              <div className="flex flex-wrap gap-4 items-center">
                <DashBadge variant="dot" color="success">Aktif / Terverifikasi</DashBadge>
                <DashBadge variant="dot" color="warning">Menunggu Konfirmasi</DashBadge>
                <DashBadge variant="dot" color="danger">Dibatalkan / Ditolak</DashBadge>
                <DashBadge variant="dot" color="info">Sedang Diproses</DashBadge>
                <DashBadge variant="dot" color="light">Offline</DashBadge>
              </div>
            </DashCardBody>
          </DashCard>
        </div>
      </section>

      {/* 2. AVATARS SECTION */}
      <section className="space-y-4">
        <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
          <span>2. User Avatars (Inisial & Status Indikator)</span>
        </h4>

        <DashCard>
          <DashCardHeader title="User Avatar Sizing & Color Palette" subtitle="Variasi ukuran (xs, sm, md, lg, xl) dan warna inisial" />
          <DashCardBody>
            <div className="flex flex-wrap items-end gap-6">
              <div className="text-center space-y-1">
                <DashAvatar name="Ahmad Dahlan" color="emerald" size="xl" status="online" />
                <span className="text-[10px] text-slate-400 block font-semibold">XL (56px)</span>
              </div>
              <div className="text-center space-y-1">
                <DashAvatar name="Budi Santoso" color="cyan" size="lg" status="online" />
                <span className="text-[10px] text-slate-400 block font-semibold">LG (44px)</span>
              </div>
              <div className="text-center space-y-1">
                <DashAvatar name="Citra Lestari" color="amber" size="md" status="away" />
                <span className="text-[10px] text-slate-400 block font-semibold">MD (36px)</span>
              </div>
              <div className="text-center space-y-1">
                <DashAvatar name="Dewi Sartika" color="purple" size="sm" status="busy" />
                <span className="text-[10px] text-slate-400 block font-semibold">SM (32px)</span>
              </div>
              <div className="text-center space-y-1">
                <DashAvatar name="Eko Prasetyo" color="rose" size="xs" status="offline" />
                <span className="text-[10px] text-slate-400 block font-semibold">XS (24px)</span>
              </div>
            </div>
          </DashCardBody>
        </DashCard>
      </section>

      {/* 3. BUTTONS SECTION */}
      <section className="space-y-4">
        <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
          <span>3. Button Styles (Solid, Dim, Outline & Icon Triggers)</span>
        </h4>

        <DashCard>
          <DashCardHeader title="Tombol Antarmuka DashLite" subtitle="Gaya tombol primer, sekunder, dim, dan pill" />
          <DashCardBody>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg transition-colors">
                Dim Button
              </button>
              <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-lg shadow-sm transition-colors">
                Outline Light
              </button>
              <button className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors">
                Danger Dim
              </button>
              <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </DashCardBody>
        </DashCard>
      </section>

      {/* 4. ACTIVITY & SUPPORT & TIMELINE WIDGETS */}
      <section className="space-y-4">
        <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
          <span>4. Activity, Support Tickets & Timeline Widgets</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <DashCard>
            <DashCardHeader title="Recent Activities" subtitle="Arus aktivitas mitra (nk-activity)" />
            <DashActivity activities={sampleActivities} />
          </DashCard>

          {/* Support Requests */}
          <DashCard>
            <DashCardHeader title="Support Requests" subtitle="Tiket bantuan mitra (nk-support)" />
            <DashSupport tickets={sampleTickets} />
          </DashCard>

          {/* Notifications Timeline */}
          <DashCard>
            <DashCardHeader title="Milestone Timeline" subtitle="Rekam jejak sistem (timeline)" />
            <DashTimeline items={sampleTimeline} head="Oktober 2026" />
          </DashCard>
        </div>
      </section>

      {/* 5. DATA TABLE PREVIEW */}
      <section className="space-y-4">
        <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
          <span>5. Orders & Transactions Data Table (nk-tb-list)</span>
        </h4>

        <DashCard className="overflow-hidden">
          <DashCardHeader
            title="Daftar Transaksi Kemitraan Terbaru"
            subtitle="Tabel data dengan user card, nominal mata uang, status dot, dan aksi menu"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse dash-table">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Order No.
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nama Mitra
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Referensi Ref
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nominal
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">#ORD-95954</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <DashAvatar name="Abu Bin Ishtiyak" color="purple" size="sm" />
                      <span className="font-bold text-slate-800">Abu Bin Ishtiyak</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-500">SUB-2309232</td>
                  <td className="py-3.5 px-5 font-bold font-heading text-slate-900 text-sm">Rp 4.596.750</td>
                  <td className="py-3.5 px-5">
                    <DashBadge variant="dot" color="success">Paid</DashBadge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">#ORD-95850</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <DashAvatar name="Desiree Edwards" color="cyan" size="sm" />
                      <span className="font-bold text-slate-800">Desiree Edwards</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-500">SUB-2309154</td>
                  <td className="py-3.5 px-5 font-bold font-heading text-slate-900 text-sm">Rp 596.750</td>
                  <td className="py-3.5 px-5">
                    <DashBadge variant="dot" color="danger">Canceled</DashBadge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">#ORD-95135</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <DashAvatar name="Cassandra Hogan" color="emerald" size="sm" />
                      <span className="font-bold text-slate-800">Cassandra Hogan</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-500">SUB-2305564</td>
                  <td className="py-3.5 px-5 font-bold font-heading text-slate-900 text-sm">Rp 1.099.990</td>
                  <td className="py-3.5 px-5">
                    <DashBadge variant="dot" color="warning">Due / Pending</DashBadge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DashCard>
      </section>

      {/* 6. FORM CONTROLS */}
      <section className="space-y-4">
        <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
          <span>6. Form Inputs & Switches</span>
        </h4>

        <DashCard>
          <DashCardHeader title="Elemen Formulir DashLite" subtitle="Input field, select dropdown, checkbox, dan switch toggle" />
          <DashCardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard Text Input</label>
                <input type="text" placeholder="Masukkan teks..." className="dash-input text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Dropdown</label>
                <select className="dash-input text-xs">
                  <option>Pilihan Opsi 1</option>
                  <option>Pilihan Opsi 2</option>
                  <option>Pilihan Opsi 3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Switch Toggle</label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setToggleState(!toggleState)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      toggleState ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        toggleState ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-slate-600">
                    {toggleState ? 'Notifikasi Aktif' : 'Notifikasi Mati'}
                  </span>
                </div>
              </div>
            </div>
          </DashCardBody>
        </DashCard>
      </section>
    </div>
  );
}
