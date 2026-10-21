import React from 'react';
import { Users, UserCheck, UserX, UserPlus, Building, Sparkles } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeStatsCardsProps {
  employees: Employee[];
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  employees,
  selectedDepartment,
  onSelectDepartment,
}) => {
  const total = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Aktif').length;
  const onLeaveCount = employees.filter((e) => e.status === 'Cuti').length;
  const inactiveCount = employees.filter((e) => e.status === 'Nonaktif').length;

  // Karyawan baru dihitung jika mulai bekerja dalam 90 hari terakhir (atau setelah 1 Juli 2026 dalam konteks simulasi)
  const newEmployeesCount = employees.filter((e) => {
    try {
      const start = new Date(e.startDate);
      const referenceDate = new Date('2026-10-20');
      const diffDays = (referenceDate.getTime() - start.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 90;
    } catch {
      return false;
    }
  }).length;

  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  // Department counts
  const departmentCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Seluruh Karyawan */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Seluruh Karyawan
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {total}
            </span>
            <span className="text-xs text-slate-400">Orang Personel</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Unit Usaha Cimanggu</span>
            <span className="text-slate-300 font-medium">100% Tercatat</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Karyawan Aktif (Aksen Hijau) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-emerald-900/40 shadow-lg relative overflow-hidden group hover:border-emerald-700/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Karyawan Aktif
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {activeCount}
            </span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
              {activePercent}% Operasional
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Kondisi Bekerja</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Bertugas Penuh
            </span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 3: Nonaktif & Cuti */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nonaktif & Cuti
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserX className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {inactiveCount + onLeaveCount}
            </span>
            <span className="text-xs text-slate-400">Orang</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-medium">
              {onLeaveCount} Cuti Resmi
            </span>
            <span className="text-rose-400 font-medium">
              {inactiveCount} Nonaktif / Resign
            </span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 4: Karyawan Baru */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Karyawan Baru (&le; 90 Hari)
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {newEmployeesCount}
            </span>
            <span className="text-xs text-teal-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> Baru Onboarding
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Masa Orientasi</span>
            <span className="text-slate-300 font-medium">Unit Cimanggu</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Quick Filter by Department Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5 shrink-0 pr-1">
          <Building className="w-3.5 h-3.5 text-slate-400" /> Filter Divisi:
        </span>
        <button
          onClick={() => onSelectDepartment('Semua')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
            selectedDepartment === 'Semua'
              ? 'bg-emerald-600 text-white font-semibold border-emerald-500 shadow-sm shadow-emerald-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Semua Divisi ({total})
        </button>
        {Object.entries(departmentCounts).map(([dept, count]) => {
          const isSelected = selectedDepartment === dept;
          return (
            <button
              key={dept}
              onClick={() => onSelectDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-emerald-600 text-white font-semibold border-emerald-500 shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {dept} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
};
