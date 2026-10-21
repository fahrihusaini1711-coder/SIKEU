import React from 'react';
import { X, ShieldCheck, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { AuditLog, UserSession } from '../../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
  currentUser: UserSession;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  currentUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Audit Trail & Log Hak Akses Sistem
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan aktivitas perubahan data karyawan dan otorisasi keuangan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Hak Akses Penjelasan */}
        <div className="p-3.5 my-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Struktur Otorisasi & Hak Akses (Role-Based Access Control):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40">
              <span className="font-bold text-rose-300 block mb-0.5">Admin (HR Manager)</span>
              <p className="text-slate-300 leading-tight">
                Full CRUD: Tambah, edit, nonaktifkan, hapus karyawan, ubah gaji pokok, setujui payroll.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-800/40">
              <span className="font-bold text-purple-300 block mb-0.5">Owner (Direksi)</span>
              <p className="text-slate-300 leading-tight">
                Read-only: Lihat seluruh karyawan, ringkasan eksekutif, detail gaji & approval pengeluaran.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-800/40">
              <span className="font-bold text-blue-300 block mb-0.5">Staff Keuangan</span>
              <p className="text-slate-300 leading-tight">
                Finance only: Mengakses ID & nama untuk payroll, data pribadi/NIK disamarkan, dilarang edit SDM.
              </p>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Belum ada aktivitas baru yang tercatat pada sesi ini. Lakukan penambahan, edit, atau status toggle untuk melihat audit log.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span>Oleh: <b>{log.userName}</b></span>
                    <span>&bull;</span>
                    <span className="uppercase font-semibold text-emerald-400">
                      {log.userRole}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
