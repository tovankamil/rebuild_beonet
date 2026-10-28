import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  Ban,
  UserCheck,
  Building2,
  Wallet,
  GitFork,
  ChevronRight,
  Shield,
  Edit2,
  X,
  Lock,
  Layers,
  Check,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  ShoppingBag,
  Landmark,
  LayoutDashboard,
  Truck,
  Sparkles,
  Trash2,
  History,
  CreditCard,
  FileText,
  AlertTriangle,
  UserX,
  Copy,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';
import IndonesianRegionSelect from '../common/IndonesianRegionSelect';

export default function AdminUsersTab() {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' | 'rbac-matrix' | 'audit-logs'

  // Pagination States
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [matrixPage, setMatrixPage] = useState(1);
  const [matrixPageSize, setMatrixPageSize] = useState(10);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);

  // Users State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ text: '', type: 'success' });
  const [kpiStats, setKpiStats] = useState({
    total_users: 0,
    total_members: 0,
    total_gudang: 0,
    total_admins: 0,
    active_users: 0,
    suspended_users: 0,
  });

  // Modal State for Edit User (KTP, NPWP, Avatar, Name, Phone, Role, Status, Address)
  const [editModalUser, setEditModalUser] = useState(null);
  const [editModalTab, setEditModalTab] = useState('identity'); // 'identity' | 'address'
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone: '',
    ktp: '',
    npwp: '',
    avatar: '',
    role: 'member',
    status: 'active',
    recipient_name: '',
    address: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
  });

  // Soft Delete Confirmation Modal State
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  // Reset Password Modal State
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Modal State for RBAC Role Changer
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('member');

  // RBAC Matrix State
  const [matrixData, setMatrixData] = useState({ roles: [], menus: [], permissions: {} });
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixCategory, setMatrixCategory] = useState('all');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditTableFilter, setAuditTableFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/admin/users', { params });
      if (res.data?.data) {
        setUsers(res.data.data);
      }
      if (res.data?.stats) {
        setKpiStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showNotice('Gagal memuat direktori pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatrix = async () => {
    setMatrixLoading(true);
    try {
      const res = await api.get('/admin/rbac/matrix');
      if (res.data?.data) {
        setMatrixData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load RBAC matrix:', err);
      showNotice('Gagal memuat matriks hak akses menu', 'error');
    } finally {
      setMatrixLoading(false);
    }
  };

  useEffect(() => {
    setUserPage(1);
    fetchUsers();
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    if (activeSubTab === 'rbac-matrix') {
      setMatrixPage(1);
      fetchMatrix();
    } else if (activeSubTab === 'audit-logs') {
      setAuditPage(1);
      fetchAuditLogs();
    }
  }, [activeSubTab, auditActionFilter, auditTableFilter]);

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = {};
      if (auditActionFilter) params.action = auditActionFilter;
      if (auditTableFilter) params.table_name = auditTableFilter;
      const res = await api.get('/admin/audit-logs', { params });
      setAuditLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      showNotice('Gagal memuat log audit aktivitas', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  const openEditModal = (u) => {
    setEditModalUser(u);
    setEditModalTab('identity');
    setEditFormData({
      full_name: u.full_name || '',
      phone: u.phone || '',
      ktp: u.ktp || '',
      npwp: u.npwp || '',
      avatar: u.avatar || '',
      role: u.role || 'member',
      status: u.status || 'active',
      recipient_name: u.recipient_name || u.full_name || '',
      address: u.address || '',
      province: u.province || '',
      city: u.city || '',
      district: u.district || '',
      postal_code: u.postal_code || '',
    });
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editModalUser) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${editModalUser.id}`, editFormData);
      showNotice(`Data akun @${editModalUser.username} berhasil diperbarui`);
      setEditModalUser(null);
      fetchUsers();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Gagal menyimpan perubahan pengguna', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSoftDelete = async () => {
    if (!deleteModalUser) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${deleteModalUser.id}`);
      showNotice(`Akun @${deleteModalUser.username} berhasil dinonaktifkan (Soft Delete)`);
      setDeleteModalUser(null);
      fetchUsers();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Gagal menghapus pengguna', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openResetPasswordModal = (u) => {
    setResetPasswordModalUser(u);
    setAdminNewPassword('');
    setShowAdminPassword(false);
    setPasswordCopied(false);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Bio#';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminNewPassword(pwd);
    setShowAdminPassword(true);
  };

  const handleCopyNewPassword = () => {
    if (!adminNewPassword) return;
    navigator.clipboard.writeText(adminNewPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordModalUser) return;
    if (adminNewPassword.length < 6) {
      showNotice('Kata sandi baru minimal harus 6 karakter', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${resetPasswordModalUser.id}/password`, {
        new_password: adminNewPassword,
      });
      showNotice(`Kata sandi akun @${resetPasswordModalUser.username} berhasil diperbarui!`);
      setResetPasswordModalUser(null);
      setAdminNewPassword('');
      fetchUsers();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Gagal mereset kata sandi pengguna', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotice = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification({ text: '', type: 'success' });
    }, 4000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setUserPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      showNotice(`Status pengguna berhasil diubah ke: ${newStatus}`);
      fetchUsers();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Gagal mengubah status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (u) => {
    setRoleModalUser(u);
    setSelectedRole(u.role || 'member');
  };

  const handleSaveRole = async () => {
    if (!roleModalUser) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${roleModalUser.id}/role`, { role: selectedRole });
      showNotice(`Role ${roleModalUser.username} berhasil diubah ke: ${selectedRole.toUpperCase()}`);
      setRoleModalUser(null);
      fetchUsers();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Gagal memperbarui role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle single menu permission for a specific role
  const handleTogglePermission = async (role, menuKey, currentVal) => {
    const newVal = !currentVal;
    // Optimistic UI update
    setMatrixData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [role]: {
          ...(prev.permissions[role] || {}),
          [menuKey]: newVal,
        },
      },
    }));

    try {
      await api.post('/admin/rbac/toggle', {
        role,
        menu_key: menuKey,
        is_enabled: newVal,
      });
      showNotice(`Hak akses menu ${menuKey} untuk role ${role.toUpperCase()} berhasil diperbarui`);
    } catch (err) {
      // Revert on error
      setMatrixData((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [role]: {
            ...(prev.permissions[role] || {}),
            [menuKey]: currentVal,
          },
        },
      }));
      showNotice('Gagal memperbarui izin menu', 'error');
    }
  };

  // Filtered menus for matrix
  const filteredMenus = matrixData.menus.filter((m) => {
    const matchSearch =
      !matrixSearch ||
      m.title.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      m.menu_key.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      m.description?.toLowerCase().includes(matrixSearch.toLowerCase());
    const matchCat = matrixCategory === 'all' || m.category === matrixCategory;
    return matchSearch && matchCat;
  });

  // Paged Slices
  const totalUserPages = Math.ceil(users.length / userPageSize) || 1;
  const paginatedUsers = users.slice((userPage - 1) * userPageSize, userPage * userPageSize);

  const totalMatrixPages = Math.ceil(filteredMenus.length / matrixPageSize) || 1;
  const paginatedMenus = filteredMenus.slice((matrixPage - 1) * matrixPageSize, matrixPage * matrixPageSize);

  // Calculations for KPI Cards
  const statTotal = kpiStats.total_users || users.length || 0;
  const statMembers = kpiStats.total_members || users.filter((u) => u.role === 'member').length;
  const statGudang = kpiStats.total_gudang || users.filter((u) => u.role === 'gudang').length;
  const statAdmins = kpiStats.total_admins || users.filter((u) => u.role === 'admin').length;
  const statActive = kpiStats.active_users || users.filter((u) => u.status === 'active').length;
  const statSuspended = kpiStats.suspended_users !== undefined ? kpiStats.suspended_users : Math.max(0, statTotal - statActive);

  const pctMembers = statTotal > 0 ? Math.round((statMembers / statTotal) * 100) : 0;
  const pctGudang = statTotal > 0 ? Math.round((statGudang / statTotal) * 100) : 0;
  const pctAdmins = statTotal > 0 ? Math.round((statAdmins / statTotal) * 100) : 0;

  // Active filter state detection
  const isTotalFilterActive = !roleFilter && !statusFilter;
  const isMitraFilterActive = roleFilter === 'member' && !statusFilter;
  const isGudangFilterActive = roleFilter === 'gudang' && !statusFilter;
  const isAdminFilterActive = roleFilter === 'admin' && !statusFilter;
  const isSuspendedFilterActive = statusFilter === 'suspended' && !roleFilter;

  const handleCardFilter = (role, status) => {
    setUserPage(1);
    if (!role && !status) {
      setRoleFilter('');
      setStatusFilter('');
      return;
    }
    if (role) {
      if (roleFilter === role && !statusFilter) {
        setRoleFilter('');
      } else {
        setRoleFilter(role);
        setStatusFilter('');
      }
    }
    if (status) {
      if (statusFilter === status && !roleFilter) {
        setStatusFilter('');
      } else {
        setStatusFilter(status);
        setRoleFilter('');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Manajemen Pengguna &amp; Hak Akses (RBAC)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Role &amp; Menu Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit direktori pengguna, alokasi role, dan konfigurasi daftar menu serta hak akses dinamis per role
          </p>
        </div>

        <button
          onClick={() => {
            if (activeSubTab === 'users') fetchUsers();
            else fetchMatrix();
          }}
          disabled={loading || matrixLoading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading || matrixLoading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification.text && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification({ text: '', type: 'success' })} className="font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'users'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={15} />
          <span>Direktori Akun Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rbac-matrix')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'rbac-matrix'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={15} />
          <span>Matriks Hak Akses RBAC</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Dinamis
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit-logs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'audit-logs'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History size={15} />
          <span>Audit Log Aktivitas Platform</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Audit Trail &amp; Soft Delete
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: DIREKTORI PENGGUNA */}
      {/* ============================================================== */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* KPI Summary Cards - Redesigned with Rich Gradients & Tactile Interactive Quick Filter */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Card 1: TOTAL USER */}
            <div
              onClick={() => handleCardFilter('', '')}
              title="Klik untuk tampilkan semua pengguna"
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                isTotalFilterActive
                  ? 'bg-gradient-to-br from-slate-900/[0.04] via-white to-indigo-50/40 border-slate-900 shadow-md ring-2 ring-slate-900/15 -translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="h-1 w-full bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900" />
              <div className="p-4 flex flex-col justify-between h-[calc(100%-4px)]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      TOTAL USER
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-black font-heading text-slate-900 tracking-tight mt-1.5">
                    {statTotal}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {statActive} Aktif
                  </span>
                  {isTotalFilterActive ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-white shadow-xs">
                      Semua
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
                      Lihat semua
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: MITRA JARINGAN */}
            <div
              onClick={() => handleCardFilter('member', '')}
              title="Klik untuk filter hanya Mitra Jaringan"
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                isMitraFilterActive
                  ? 'bg-gradient-to-br from-emerald-500/10 via-white to-emerald-50/30 border-emerald-600 shadow-md ring-2 ring-emerald-500/20 -translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400" />
              <div className="p-4 flex flex-col justify-between h-[calc(100%-4px)]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      MITRA JARINGAN
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
                      <UserCheck size={16} />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-black font-heading text-slate-900 tracking-tight mt-1.5">
                    {statMembers}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <span className="font-extrabold text-emerald-700">{pctMembers}%</span> • Member MLM
                  </span>
                  {isMitraFilterActive && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                      Filter Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 3: STAFF GUDANG */}
            <div
              onClick={() => handleCardFilter('gudang', '')}
              title="Klik untuk filter hanya Staff Gudang"
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                isGudangFilterActive
                  ? 'bg-gradient-to-br from-sky-500/10 via-white to-sky-50/30 border-sky-600 shadow-md ring-2 ring-sky-500/20 -translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="h-1 w-full bg-gradient-to-r from-sky-600 via-sky-500 to-blue-400" />
              <div className="p-4 flex flex-col justify-between h-[calc(100%-4px)]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      STAFF GUDANG
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
                      <Truck size={16} />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-black font-heading text-slate-900 tracking-tight mt-1.5">
                    {statGudang}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <span className="font-extrabold text-sky-700">{pctGudang}%</span> • Logistik &amp; RO
                  </span>
                  {isGudangFilterActive && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-sky-600 text-white shadow-xs">
                      Filter Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 4: ADMINISTRATOR */}
            <div
              onClick={() => handleCardFilter('admin', '')}
              title="Klik untuk filter hanya Administrator"
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                isAdminFilterActive
                  ? 'bg-gradient-to-br from-amber-500/10 via-white to-amber-50/30 border-amber-600 shadow-md ring-2 ring-amber-500/20 -translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400" />
              <div className="p-4 flex flex-col justify-between h-[calc(100%-4px)]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      ADMINISTRATOR
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-black font-heading text-slate-900 tracking-tight mt-1.5">
                    {statAdmins}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <span className="font-extrabold text-amber-700">{pctAdmins}%</span> • Akses Penuh
                  </span>
                  {isAdminFilterActive && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-600 text-white shadow-xs">
                      Filter Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 5: AKUN SUSPENDED */}
            <div
              onClick={() => handleCardFilter('', 'suspended')}
              title="Klik untuk filter akun yang ditangguhkan/suspended"
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] col-span-2 sm:col-span-1 ${
                isSuspendedFilterActive
                  ? 'bg-gradient-to-br from-rose-500/10 via-white to-rose-50/30 border-rose-600 shadow-md ring-2 ring-rose-500/20 -translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="h-1 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-red-400" />
              <div className="p-4 flex flex-col justify-between h-[calc(100%-4px)]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statSuspended > 0 ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`}></span>
                      AKUN SUSPENDED
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
                      <UserX size={16} />
                    </div>
                  </div>
                  <div className={`text-2xl lg:text-3xl font-black font-heading tracking-tight mt-1.5 ${statSuspended > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {statSuspended}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  {statSuspended > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                      <AlertTriangle size={11} /> Perlu Peninjauan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <CheckCircle size={11} className="text-emerald-500" /> Semua Normal
                    </span>
                  )}
                  {isSuspendedFilterActive && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-xs">
                      Filter Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="dash-card p-4 bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama lengkap atau username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dash-input pl-10 text-xs py-2 w-full"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <ExportButtons
                filename="Direktori_Pengguna_Bionet"
                title="DIREKTORI PENGGUNA & RBAC BIONET"
                subtitle="Data pengguna platform, alokasi role hak akses, dan status akun"
                headers={['USERNAME', 'NAMA LENGKAP', 'ROLE', 'STATUS', 'SALDO (RP)', 'POIN KIRI', 'POIN KANAN', 'TANGGAL DAFTAR']}
                rows={users.map((u) => [
                  u.username,
                  u.full_name || '-',
                  u.role?.toUpperCase(),
                  u.status === 'active' ? 'AKTIF' : 'SUSPENDED',
                  u.balance || 0,
                  u.point_left || 0,
                  u.point_right || 0,
                  formatExportDate(u.created_at, { includeTime: false }),
                ])}
              />

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
                <Filter size={14} />
                <span>Filter:</span>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="dash-input text-xs py-1.5 px-3 w-auto"
              >
                <option value="">Semua Role</option>
                <option value="member">Mitra / Member</option>
                <option value="keuangan">Tim Keuangan</option>
                <option value="cs">Customer Service</option>
                <option value="gudang">Tim Gudang</option>
                <option value="admin">Administrator</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="dash-input text-xs py-1.5 px-3 w-auto"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse dash-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Role Hak Akses (RBAC)</th>
                    <th className="py-3 px-4">Saldo Dompet</th>
                    <th className="py-3 px-4">Poin Binary (Kiri / Kanan)</th>
                    <th className="py-3 px-4">Status Akun</th>
                    <th className="py-3 px-4">Tanggal Daftar</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                        <span>Memuat direktori pengguna...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        Tidak ditemukan pengguna yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      const roleStyle = {
                        admin: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
                        keuangan: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
                        cs: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold',
                        gudang: 'bg-sky-100 text-sky-800 border-sky-300 font-bold',
                        member: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
                      }[u.role] || 'bg-slate-100 text-slate-700 font-medium';

                      const isActive = u.status === 'active';

                      return (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                          {/* User Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                                alt={u.username}
                                className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0 shadow-xs p-0.5"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                  <span>{u.full_name}</span>
                                  {u.ktp && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                      NIK: {u.ktp.length >= 12 ? `${u.ktp.substring(0, 4)}...${u.ktp.slice(-4)}` : u.ktp}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span>@{u.username}</span>
                                  {u.phone && <span>&bull; {u.phone}</span>}
                                  {u.npwp && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      &bull; NPWP: {u.npwp}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2.5 py-0.5 rounded text-[11px] border ${roleStyle}`}>
                                {u.role.toUpperCase()}
                              </span>
                              <button
                                onClick={() => openRoleModal(u)}
                                title="Ubah Role Hak Akses"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                          </td>

                          {/* Saldo Dompet */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 flex items-center gap-1">
                              <Wallet size={12} className="text-emerald-600" />
                              <span>Rp {(u.balance || 0).toLocaleString('id-ID')}</span>
                            </div>
                          </td>

                          {/* Poin Binary */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                L: {u.point_left || 0}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                                R: {u.point_right || 0}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                                isActive ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {isActive ? 'Aktif' : 'Suspended'}
                            </span>
                          </td>

                          {/* Tanggal Daftar */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(u.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Aksi */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => openEditModal(u)}
                                title="Edit Identitas, KTP, NPWP & Profil"
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-200 flex items-center gap-1"
                              >
                                <Edit2 size={11} />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => openResetPasswordModal(u)}
                                title="Reset Kata Sandi Customer"
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-200 flex items-center gap-1"
                              >
                                <KeyRound size={11} />
                                <span>Sandi</span>
                              </button>

                              <button
                                onClick={() => openRoleModal(u)}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                              >
                                Role
                              </button>

                              {u.username !== 'admin01' && (
                                <>
                                  <button
                                    onClick={() => handleToggleStatus(u.id, u.status)}
                                    disabled={actionLoading}
                                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors border ${
                                      isActive
                                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    {isActive ? 'Suspend' : 'Aktifkan'}
                                  </button>

                                  <button
                                    onClick={() => setDeleteModalUser(u)}
                                    disabled={actionLoading}
                                    title="Hapus Akun Pengguna (Soft Delete)"
                                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <DashPagination
              currentPage={userPage}
              totalPages={totalUserPages}
              totalItems={users.length}
              pageSize={userPageSize}
              onPageChange={setUserPage}
              onPageSizeChange={setUserPageSize}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: DAFTAR MENU & HAK AKSES PER ROLE (MATRIKS RBAC) */}
      {/* ============================================================== */}
      {activeSubTab === 'rbac-matrix' && (
        <div className="space-y-6">
          {/* Role Summary Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matrixData.roles.map((r) => {
              const count = Object.values(matrixData.permissions[r.role] || {}).filter(Boolean).length;
              const borderStyles = {
                admin: 'border-l-4 border-l-amber-500',
                gudang: 'border-l-4 border-l-sky-500',
                member: 'border-l-4 border-l-emerald-500',
              }[r.role];

              const badgeStyles = {
                admin: 'bg-amber-100 text-amber-800 border-amber-300',
                gudang: 'bg-sky-100 text-sky-800 border-sky-300',
                member: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              }[r.role];

              return (
                <div key={r.role} className={`dash-card p-4 bg-white shadow-sm ${borderStyles}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase ${badgeStyles}`}>
                      {r.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {count} Menu Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                </div>
              );
            })}
          </div>

          {/* Matrix Filter & Search Bar */}
          <div className="dash-card p-4 bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul menu, keterangan, atau route key..."
                value={matrixSearch}
                onChange={(e) => {
                  setMatrixSearch(e.target.value);
                  setMatrixPage(1);
                }}
                className="dash-input pl-10 text-xs py-2 w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter size={13} />
                Kategori Menu:
              </span>
              {['all', 'Admin', 'Logistik', 'Member', 'Core'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setMatrixCategory(cat);
                    setMatrixPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    matrixCategory === cat
                      ? 'bg-[#0d3b2e] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic RBAC Matrix Table */}
          <div className="dash-card p-0 bg-white overflow-hidden shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse dash-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Menu Sistem &amp; Deskripsi</th>
                    <th className="py-3 px-4">Kategori Modul</th>
                    <th className="py-3 px-4">Route Key</th>
                    <th className="py-3 px-4 text-center bg-amber-50/60 border-l border-slate-200">
                      <div className="font-bold text-amber-900">ADMINISTRATOR</div>
                      <div className="text-[10px] text-amber-700 font-normal">Super Admin</div>
                    </th>
                    <th className="py-3 px-4 text-center bg-sky-50/60 border-l border-slate-200">
                      <div className="font-bold text-sky-900">TIM GUDANG</div>
                      <div className="text-[10px] text-sky-700 font-normal">Logistik &amp; RO</div>
                    </th>
                    <th className="py-3 px-4 text-center bg-emerald-50/60 border-l border-slate-200">
                      <div className="font-bold text-emerald-900">MITRA / MEMBER</div>
                      <div className="text-[10px] text-emerald-700 font-normal">Jaringan MLM</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matrixLoading && matrixData.menus.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                        <span>Memuat matriks hak akses menu...</span>
                      </td>
                    </tr>
                  ) : filteredMenus.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">
                        Tidak ada menu yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedMenus.map((m) => {
                      const isAdminEnabled = matrixData.permissions?.admin?.[m.menu_key] ?? false;
                      const isGudangEnabled = matrixData.permissions?.gudang?.[m.menu_key] ?? false;
                      const isMemberEnabled = matrixData.permissions?.member?.[m.menu_key] ?? false;

                      const catStyles = {
                        Admin: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
                        Logistik: 'bg-sky-50 text-sky-800 border-sky-200 font-bold',
                        Member: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
                        Core: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold',
                      }[m.category] || 'bg-slate-100 text-slate-700';

                      return (
                        <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                          {/* Menu Title & Desc */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-xs">{m.title}</div>
                            <div className="text-[11px] text-slate-400">{m.description}</div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${catStyles}`}>
                              {m.category}
                            </span>
                          </td>

                          {/* Route Key */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {m.menu_key}
                            </span>
                          </td>

                          {/* Admin Toggle */}
                          <td className="py-3 px-4 text-center bg-amber-50/30 border-l border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission('admin', m.menu_key, isAdminEnabled)}
                              title={`Ubah izin Admin untuk ${m.title}`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                                isAdminEnabled
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-500'
                              }`}
                            >
                              {isAdminEnabled ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                              <span>{isAdminEnabled ? 'Aktif' : 'Nonaktif'}</span>
                            </button>
                          </td>

                          {/* Gudang Toggle */}
                          <td className="py-3 px-4 text-center bg-sky-50/30 border-l border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission('gudang', m.menu_key, isGudangEnabled)}
                              title={`Ubah izin Gudang untuk ${m.title}`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                                isGudangEnabled
                                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-500'
                              }`}
                            >
                              {isGudangEnabled ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                              <span>{isGudangEnabled ? 'Aktif' : 'Nonaktif'}</span>
                            </button>
                          </td>

                          {/* Member Toggle */}
                          <td className="py-3 px-4 text-center bg-emerald-50/30 border-l border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission('member', m.menu_key, isMemberEnabled)}
                              title={`Ubah izin Mitra untuk ${m.title}`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                                isMemberEnabled
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-500'
                              }`}
                            >
                              {isMemberEnabled ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                              <span>{isMemberEnabled ? 'Aktif' : 'Nonaktif'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <DashPagination
              currentPage={matrixPage}
              totalPages={totalMatrixPages}
              totalItems={filteredMenus.length}
              pageSize={matrixPageSize}
              onPageChange={setMatrixPage}
              onPageSizeChange={setMatrixPageSize}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: AUDIT LOGS AKTIVITAS & SOFT DELETE */}
      {/* ============================================================== */}
      {activeSubTab === 'audit-logs' && (
        <div className="space-y-6">
          <div className="dash-card p-4 bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div>
              <h4 className="font-heading font-extrabold text-base text-slate-800">
                Audit Trail &amp; Rekam Jejak Sistem
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Mencatat setiap aksi UPDATE dan DELETE (Soft Delete) dari seluruh tabel untuk transparansi dan kepatuhan audit.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ExportButtons
                filename="Audit_Logs_Bionet"
                title="LOG AUDIT AKTIVITAS &amp; SOFT DELETE BIONET"
                subtitle="Rekaman jejak perubahan data dan soft delete oleh pengguna / admin"
                headers={['WAKTU', 'EKSEKUTOR (USER ID)', 'AKSI', 'TABEL SASARAN', 'ID REKORD', 'NILAI LAMA', 'NILAI BARU', 'IP / AGENT']}
                rows={auditLogs.map((log) => [
                  formatExportDate(log.created_at),
                  log.user?.username ? `@${log.user.username} (${log.user.full_name})` : log.user_id,
                  log.action,
                  log.table_name,
                  log.record_id,
                  log.old_values || '-',
                  log.new_values || '-',
                  log.ip_address || '-',
                ])}
              />

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
                <Filter size={14} />
                <span>Filter Aksi:</span>
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="dash-input text-xs py-1.5 px-3 w-auto"
              >
                <option value="">Semua Aksi</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE (Soft Delete)</option>
              </select>

              <select
                value={auditTableFilter}
                onChange={(e) => setAuditTableFilter(e.target.value)}
                className="dash-input text-xs py-1.5 px-3 w-auto"
              >
                <option value="">Semua Tabel</option>
                <option value="users">Tabel Users</option>
                <option value="orders">Tabel Orders</option>
                <option value="withdrawals">Tabel Withdrawals</option>
                <option value="user_banks">Tabel User Banks</option>
                <option value="pin_transfers">Tabel Pin Transfers</option>
              </select>

              <button
                onClick={fetchAuditLogs}
                disabled={auditLoading}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Segarkan Log"
              >
                <RefreshCw size={14} className={auditLoading ? 'animate-spin text-emerald-600' : ''} />
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse dash-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Waktu &amp; Tanggal</th>
                    <th className="py-3 px-4">Eksekutor</th>
                    <th className="py-3 px-4">Aksi</th>
                    <th className="py-3 px-4">Tabel Sasaran</th>
                    <th className="py-3 px-4">ID Rekord</th>
                    <th className="py-3 px-4">Detail Perubahan Data (Old vs New)</th>
                    <th className="py-3 px-4">IP &amp; User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLoading && auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                        <span>Memuat rekaman log audit...</span>
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        Tidak ada log aktivitas audit yang tercatat untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    auditLogs
                      .slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize)
                      .map((log) => {
                        const isDelete = log.action === 'DELETE';
                        return (
                          <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                              {formatExportDate(log.created_at)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">
                                {log.user?.full_name || (log.user?.username ? `@${log.user.username}` : 'Sistem / User')}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {log.user_id ? log.user_id.substring(0, 8) + '...' : '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                                  isDelete
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {isDelete ? <Trash2 size={11} /> : <Edit2 size={11} />}
                                {log.action === 'DELETE' ? 'SOFT DELETE' : 'UPDATE'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-700">
                              {log.table_name}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                              #{log.record_id ? log.record_id.substring(0, 8) : '-'}...
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="space-y-1">
                                {log.old_values && (
                                  <div className="text-[10px] font-mono bg-rose-50/70 p-1 rounded border border-rose-100 text-rose-800 truncate" title={log.old_values}>
                                    <span className="font-bold">OLD:</span> {log.old_values}
                                  </div>
                                )}
                                {log.new_values && (
                                  <div className="text-[10px] font-mono bg-emerald-50/70 p-1 rounded border border-emerald-100 text-emerald-800 truncate" title={log.new_values}>
                                    <span className="font-bold">NEW:</span> {log.new_values}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[10px] font-mono max-w-[120px] truncate" title={`${log.ip_address} | ${log.user_agent}`}>
                              {log.ip_address || '127.0.0.1'}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            <DashPagination
              currentPage={auditPage}
              totalPages={Math.ceil(auditLogs.length / auditPageSize) || 1}
              totalItems={auditLogs.length}
              pageSize={auditPageSize}
              onPageChange={setAuditPage}
              onPageSizeChange={setAuditPageSize}
            />
          </div>
        </div>
      )}

      {/* 5. RBAC Role Changer Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-700" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Ubah Hak Akses (RBAC)
                </h3>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0d3b2e] text-emerald-300 font-bold flex items-center justify-center">
                {roleModalUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{roleModalUser.full_name}</div>
                <div className="text-xs text-slate-400">@{roleModalUser.username}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Pilih Role Baru:</label>

              {/* Option: Member */}
              <div
                onClick={() => setSelectedRole('member')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRole === 'member'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-600" />
                    <span>MITRA / MEMBER</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'member'}
                    onChange={() => setSelectedRole('member')}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akses portal kemitraan: pohon binary, bonus sponsor/pasangan, dompet saldo, transfer PIN, &amp; pemesanan produk RO.
                </p>
              </div>

              {/* Option: Keuangan */}
              <div
                onClick={() => setSelectedRole('keuangan')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRole === 'keuangan'
                    ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Wallet size={14} className="text-purple-600" />
                    <span>TIM KEUANGAN &amp; PEMBUKUAN</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'keuangan'}
                    onChange={() => setSelectedRole('keuangan')}
                    className="accent-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akses finansial: audit buku besar transaksi kredit/debit, approval &amp; validasi penarikan komisi Flip.id.
                </p>
              </div>

              {/* Option: CS */}
              <div
                onClick={() => setSelectedRole('cs')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRole === 'cs'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span>CUSTOMER SERVICE &amp; HELPDESK</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'cs'}
                    onChange={() => setSelectedRole('cs')}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akses layanan pelanggan: live chat bantuan mitra, tiket kendala transfer/jaringan, dan audit direktori member.
                </p>
              </div>

              {/* Option: Gudang */}
              <div
                onClick={() => setSelectedRole('gudang')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRole === 'gudang'
                    ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Building2 size={14} className="text-sky-600" />
                    <span>TIM GUDANG &amp; LOGISTIK</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'gudang'}
                    onChange={() => setSelectedRole('gudang')}
                    className="accent-sky-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akses portal gudang: manajemen inventori fisik herbal, update stok produk, dan fulfillment/pengiriman pesanan RO.
                </p>
              </div>

              {/* Option: Admin */}
              <div
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRole === 'admin'
                    ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span>ADMINISTRATOR PUSAT</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'admin'}
                    onChange={() => setSelectedRole('admin')}
                    className="accent-amber-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akses penuh sistem: kelola buku besar transaksi &amp; bonus, approval penarikan Flip.id, alokasi role, dan stokis PIN.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw size={12} className="animate-spin" />}
                <span>Simpan Perubahan Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal (KTP, NPWP, Avatar, Full Name, Phone, Role, Status & Alamat) */}
      {editModalUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-[0_25px_60px_rgba(15,23,42,0.35)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/60 shadow-xs">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 leading-tight">
                    Edit Data Pengguna &amp; Alamat
                  </h3>
                  <p className="text-xs text-slate-400">
                    UID: <span className="font-mono text-slate-600">{editModalUser.id.substring(0, 16)}...</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-Tabs: Identitas vs Alamat */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50/60 pt-2">
              <button
                type="button"
                onClick={() => setEditModalTab('identity')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                  editModalTab === 'identity'
                    ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users size={14} />
                <span>Identitas &amp; Akun</span>
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('address')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                  editModalTab === 'address'
                    ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <MapPin size={14} />
                <span>Alamat Pengiriman &amp; Domisili</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditUser} className="flex-1 overflow-y-auto p-6 space-y-4">
              {editModalTab === 'identity' ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <img
                      src={editFormData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${editModalUser.username}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white p-0.5"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">@{editModalUser.username}</div>
                      <div className="text-xs text-slate-400">UID: {editModalUser.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="dash-input text-xs w-full py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Handphone</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="0812xxxxxxxx"
                      className="dash-input text-xs w-full py-2 px-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nomor KTP (16 Digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={editFormData.ktp}
                        onChange={(e) => setEditFormData({ ...editFormData, ktp: e.target.value.replace(/\D/g, '') })}
                        placeholder="3201xxxxxxxx0001"
                        className="dash-input text-xs w-full py-2 px-3 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">NPWP</label>
                      <input
                        type="text"
                        value={editFormData.npwp}
                        onChange={(e) => setEditFormData({ ...editFormData, npwp: e.target.value })}
                        placeholder="98.765.432.1-012.000"
                        className="dash-input text-xs w-full py-2 px-3 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">URL Avatar</label>
                    <input
                      type="text"
                      value={editFormData.avatar}
                      onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
                      placeholder="https://..."
                      className="dash-input text-xs w-full py-2 px-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Role Akun</label>
                      <select
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        className="dash-input text-xs w-full py-2 px-3"
                      >
                        <option value="member">Mitra / Member</option>
                        <option value="keuangan">Tim Keuangan</option>
                        <option value="cs">Customer Service</option>
                        <option value="gudang">Tim Gudang</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status Akun</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="dash-input text-xs w-full py-2 px-3"
                      >
                        <option value="active">Aktif</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Shortcut to Reset Password Modal */}
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <KeyRound size={14} className="text-amber-700" />
                        <span>Reset Kata Sandi Pengguna</span>
                      </div>
                      <div className="text-[10px] text-amber-700/80">
                        Perbarui kata sandi customer jika lupa login
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const target = editModalUser;
                        setEditModalUser(null);
                        openResetPasswordModal(target);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition"
                    >
                      Reset Sandi
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800">
                    <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      Alamat ini digunakan oleh tim logistik gudang untuk pengiriman produk Repeat Order (RO) dan fulfillment barang herbal.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nama Penerima Paket</label>
                    <input
                      type="text"
                      value={editFormData.recipient_name}
                      onChange={(e) => setEditFormData({ ...editFormData, recipient_name: e.target.value })}
                      placeholder="Nama lengkap penerima"
                      className="dash-input text-xs w-full py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Lengkap (Jalan, No Rumah, RT/RW)</label>
                    <textarea
                      rows={3}
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      placeholder="Jl. Merdeka No. 12, RT 02/RW 05..."
                      className="dash-input text-xs w-full py-2 px-3 resize-none"
                    />
                  </div>

                  {/* Indonesian Region Cascading & Auto-Suggest Component */}
                  <IndonesianRegionSelect
                    province={editFormData.province}
                    city={editFormData.city}
                    district={editFormData.district}
                    postalCode={editFormData.postal_code}
                    onChange={({ province, city, district, postalCode }) => {
                      setEditFormData((prev) => ({
                        ...prev,
                        province,
                        city,
                        district,
                        postal_code: postalCode,
                      }));
                    }}
                    disabled={actionLoading}
                  />
                </>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw size={12} className="animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-rose-200/90 ring-1 ring-slate-900/5 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 ease-out">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Konfirmasi Soft Delete Pengguna
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menonaktifkan akun dari platform.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 text-xs text-rose-800 space-y-1">
              <p>
                Anda akan menghapus akun: <strong className="font-mono">@{deleteModalUser.username}</strong> ({deleteModalUser.full_name}).
              </p>
              <p className="text-[11px] text-slate-500">
                Data historis keuangan, saldo, dan mutasi audit tetap tersimpan di database dengan flag <code>deleted_at</code> untuk audit.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSoftDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw size={12} className="animate-spin" />}
                <span>Ya, Nonaktifkan (Soft Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Admin Reset Password Modal */}
      {resetPasswordModalUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-amber-600" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Reset Kata Sandi Customer
                </h3>
              </div>
              <button
                onClick={() => setResetPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <img
                src={resetPasswordModalUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${resetPasswordModalUser.username}`}
                alt="Avatar"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white p-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {resetPasswordModalUser.full_name || resetPasswordModalUser.username}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  @{resetPasswordModalUser.username} • Role: <span className="uppercase font-semibold text-slate-600">{resetPasswordModalUser.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    <span>Generate Acak</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="Masukkan sandi baru (min 6 karakter)"
                    className="dash-input text-xs w-full py-2.5 pl-3 pr-20 font-mono font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                    {adminNewPassword && (
                      <button
                        type="button"
                        onClick={handleCopyNewPassword}
                        title="Salin Sandi"
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        {passwordCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      {showAdminPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Password langsung aktif dan tindakan ini dicatat dalam log audit platform.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordModalUser(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !adminNewPassword}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw size={12} className="animate-spin" /> : <KeyRound size={12} />}
                  <span>{actionLoading ? 'Menyimpan...' : 'Simpan Sandi Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
