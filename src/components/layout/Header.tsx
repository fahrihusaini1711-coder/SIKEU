import React, { useState } from 'react';
import {
  Menu,
  Shield,
  ChevronDown,
  Info,
  MapPin,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { UserRole, UserSession } from '../../types';
import { INITIAL_USERS, SIMULATION_DISCLAIMER } from '../../data/initialData';

interface HeaderProps {
  title: string;
  breadcrumbs: string[];
  currentUser: UserSession;
  onSwitchUser: (user: UserSession) => void;
  onToggleMobileSidebar: () => void;
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumbs,
  currentUser,
  onSwitchUser,
  onToggleMobileSidebar,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin (Full Access)',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'owner':
        return {
          label: 'Owner / Direksi (Executive)',
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'finance_staff':
        return {
          label: 'Staff Keuangan (Finance Only)',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Title & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span className={idx === breadcrumbs.length - 1 ? 'text-emerald-400 font-medium' : ''}>
                    {crumb}
                  </span>
                  {idx < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Unit Cimanggu + Role Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Unit Location Tag (hidden on small mobile) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Unit Cimanggu, Sukabumi</span>
          </div>

          {/* Current Date */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Oktober 2026</span>
          </div>

          {/* Interactive Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 hover:border-slate-600 transition-colors shadow-sm"
              title="Ganti Peran Pengguna untuk Menguji Hak Akses"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {currentUser.role === 'admin'
                    ? 'Admin'
                    : currentUser.role === 'owner'
                    ? 'Owner'
                    : 'Staff Keu'}
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Ganti Hak Akses (Role)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Uji kontrol akses nyata di sistem
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPermissionInfo(!showPermissionInfo)}
                      className="p-1 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800"
                      title="Lihat matriks hak akses"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* List of 3 users */}
                  <div className="space-y-1.5">
                    {INITIAL_USERS.map((usr) => {
                      const isSelected = usr.id === currentUser.id;
                      return (
                        <button
                          key={usr.id}
                          onClick={() => {
                            onSwitchUser(usr);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors border ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-white'
                              : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700 shrink-0 mt-0.5">
                            <img
                              src={usr.avatar}
                              alt={usr.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">
                                {usr.name}
                              </span>
                              {isSelected && (
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {usr.title}
                            </p>
                            <span
                              className={`inline-block text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded mt-1 ${
                                usr.role === 'admin'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : usr.role === 'owner'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {usr.role === 'admin'
                                ? 'Admin (Bisa Tambah/Edit/Hapus)'
                                : usr.role === 'owner'
                                ? 'Owner (Read-Only Detail & Gaji)'
                                : 'Staff Keuangan (Protected)'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Permission Matrix Info Accordion */}
                  {showPermissionInfo && (
                    <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] space-y-1.5 text-slate-300">
                      <p className="font-semibold text-white flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" /> Aturan Hak Akses:
                      </p>
                      <ul className="space-y-1 pl-1 text-[10px] text-slate-300">
                        <li>
                          <b className="text-rose-400">• Admin:</b> Tambah, edit, nonaktifkan, hapus, lihat & kelola gaji pokok.
                        </li>
                        <li>
                          <b className="text-purple-400">• Owner:</b> Lihat seluruh karyawan, ringkasan eksekutif & gaji (read-only).
                        </li>
                        <li>
                          <b className="text-blue-400">• Staff Keuangan:</b> Akses info relevan transaksi/payroll, data pribadi sensitif dimasking, tidak bisa tambah/edit/hapus karyawan.
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="pt-1 text-[10px] text-slate-400 text-center">
                    {SIMULATION_DISCLAIMER}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Role Permission Alert Notice when role is restricted */}
      {currentUser.role === 'finance_staff' && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20 flex items-center justify-between text-xs text-blue-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              Mode <b>Staff Keuangan Aktif</b>: Tombol Tambah, Edit, dan Hapus karyawan dinonaktifkan sesuai hak akses.
            </span>
          </div>
          <button
            onClick={() => onSwitchUser(INITIAL_USERS[0])}
            className="text-xs text-blue-300 underline hover:text-white font-medium shrink-0 ml-2"
          >
            Beralih ke Admin
          </button>
        </div>
      )}

      {currentUser.role === 'owner' && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-xs text-purple-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              Mode <b>Owner / Direksi</b>: Akses peninjauan eksekutif dan validasi laporan keuangan.
            </span>
          </div>
          <button
            onClick={() => onSwitchUser(INITIAL_USERS[0])}
            className="text-xs text-purple-300 underline hover:text-white font-medium shrink-0 ml-2"
          >
            Beralih ke Admin
          </button>
        </div>
      )}
    </header>
  );
};
