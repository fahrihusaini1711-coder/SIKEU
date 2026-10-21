import React from 'react';
import { AlertTriangle, Trash2, X, UserX, UserCheck } from 'lucide-react';
import { Employee } from '../../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: 'delete' | 'toggle_status';
  employee: Employee | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  type,
  employee,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !employee) return null;

  const isDelete = type === 'delete';
  const isDeactivating = employee.status === 'Aktif';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 space-y-4">
        <div className="flex items-start justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDelete
                ? 'bg-rose-950/80 border border-rose-800/60 text-rose-400'
                : isDeactivating
                ? 'bg-amber-950/80 border border-amber-800/60 text-amber-400'
                : 'bg-emerald-950/80 border border-emerald-800/60 text-emerald-400'
            }`}
          >
            {isDelete ? (
              <Trash2 className="w-6 h-6" />
            ) : isDeactivating ? (
              <UserX className="w-6 h-6" />
            ) : (
              <UserCheck className="w-6 h-6" />
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {isDelete
              ? 'Hapus Data Karyawan?'
              : isDeactivating
              ? 'Nonaktifkan Karyawan?'
              : 'Aktifkan Kembali Karyawan?'}
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {isDelete ? (
              <>
                Apakah Anda yakin ingin menghapus data <b>{employee.fullName}</b> ({employee.id}) secara permanen dari sistem Wangsa Manawi Group? Tindakan ini tidak dapat dibatalkan.
              </>
            ) : isDeactivating ? (
              <>
                Status <b>{employee.fullName}</b> ({employee.id}) akan diubah menjadi <b>Nonaktif</b>. Karyawan tidak akan diikutsertakan dalam draf penggajian bulanan berikutnya.
              </>
            ) : (
              <>
                Status <b>{employee.fullName}</b> ({employee.id}) akan dikembalikan menjadi <b>Aktif</b> dan dapat menerima penugasan operasional kembali.
              </>
            )}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
          <div>ID: {employee.id}</div>
          <div>Jabatan: {employee.position} ({employee.department})</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-all ${
              isDelete
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : isDeactivating
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {isDelete
              ? 'Ya, Hapus Karyawan'
              : isDeactivating
              ? 'Ya, Nonaktifkan'
              : 'Ya, Aktifkan Kembali'}
          </button>
        </div>
      </div>
    </div>
  );
};
