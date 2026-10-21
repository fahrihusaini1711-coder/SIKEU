import React from 'react';
import {
  Users,
  LayoutDashboard,
  Receipt,
  WalletCards,
  FileText,
  ShieldCheck,
  Building2,
  X,
  ChevronRight,
  Database
} from 'lucide-react';
import { UserSession } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession;
  totalEmployees: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAudit: () => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  totalEmployees,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAudit,
  onResetData,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Ringkasan',
      icon: LayoutDashboard,
      badge: null,
      description: 'Finansial & Operasional',
    },
    {
      id: 'employees',
      label: 'Manajemen Karyawan',
      icon: Users,
      badge: `${totalEmployees} Orang`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      description: 'Data SDM Cimanggu',
      isPrimaryModule: true,
    },
    {
      id: 'transactions',
      label: 'Arus Kas & Transaksi',
      icon: Receipt,
      badge: null,
      description: 'Buku Kas & Pengeluaran',
    },
    {
      id: 'payroll',
      label: 'Penggajian & Beban SDM',
      icon: WalletCards,
      badge: 'Terintegrasi',
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      description: 'Slip Gaji & Jurnal Beban',
    },
    {
      id: 'reports',
      label: 'Laporan Keuangan',
      icon: FileText,
      badge: null,
      description: 'Arus Kas & Neraca',
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                WANGSA MANAWI
              </h1>
              <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Unit Cimanggu • SIPK
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Modul Utama
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all relative group ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold shadow-inner border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                )}

                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate font-normal">
                    {item.description}
                  </p>
                </div>

                {isActive && (
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 opacity-80" />
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 mb-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Keamanan & Sistem
            </span>
          </div>

          <button
            onClick={onOpenAudit}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm">Audit Log & Hak Akses</span>
              <p className="text-[11px] text-slate-400">Catatan Aktivitas Sistem</p>
            </div>
          </button>

          <button
            onClick={onResetData}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-slate-400 hover:text-amber-300 hover:bg-amber-950/20 transition-colors"
            title="Kembalikan data contoh ke pengaturan awal"
          >
            <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm">Reset Data Contoh</span>
              <p className="text-[11px] text-slate-400">Kembalikan simulasi default</p>
            </div>
          </button>
        </div>

        {/* User Role Card & Simulation Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700 border border-slate-600 shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentUser.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      currentUser.role === 'admin'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : currentUser.role === 'owner'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {currentUser.role === 'admin'
                      ? 'Admin HR'
                      : currentUser.role === 'owner'
                      ? 'Owner / Direksi'
                      : 'Staff Keuangan'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Status: Terverifikasi</span>
              <span className="text-emerald-400 font-medium">Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
