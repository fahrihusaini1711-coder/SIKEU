import React, { useState } from 'react';
import {
  WalletCards,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  AlertCircle,
  Building2,
  Download,
  ShieldCheck,
  Receipt,
  User,
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { Employee, PayrollRecord, UserSession, FinancialTransaction } from '../../types';
import { checkPermission } from '../../services/storageService';

interface PayrollModuleProps {
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  currentUser: UserSession;
  onSyncDrafts: () => void;
  onApprovePayrollBatch: (period: string) => void;
  onBackToEmployees: () => void;
}

export const PayrollModule: React.FC<PayrollModuleProps> = ({
  employees,
  payrollRecords,
  currentUser,
  onSyncDrafts,
  onApprovePayrollBatch,
  onBackToEmployees,
}) => {
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const activePeriod = 'Oktober 2026';

  const canApprove = checkPermission(currentUser.role, 'PAYROLL_APPROVE');
  const canCreateDraft = checkPermission(currentUser.role, 'PAYROLL_CREATE_DRAFT');

  // Calculate totals
  const totalNet = payrollRecords.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalBasic = payrollRecords.reduce((acc, curr) => acc + curr.basicSalary, 0);
  const totalAllowances = payrollRecords.reduce((acc, curr) => acc + curr.allowances, 0);
  const totalDeductions = payrollRecords.reduce((acc, curr) => acc + curr.deductions, 0);

  const approvedCount = payrollRecords.filter((p) => p.paymentStatus === 'Disetujui & Dicatat').length;
  const isFullyApproved = payrollRecords.length > 0 && approvedCount === payrollRecords.length;

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner Integrasi Keuangan Sesuai Arahan */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <WalletCards className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Modul Penggajian (Payroll) & Beban SDM Terintegrasi
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700">
                Unit Cimanggu
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Data karyawan terhubung melalui <b>ID Karyawan unik</b>. Penambahan karyawan baru tidak otomatis membebani kas. Pengeluaran gaji hanya dicatat ke buku kas keuangan setelah diverifikasi dan disetujui secara resmi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBackToEmployees}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            &larr; Data Karyawan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">
            Total Gaji Bersih ({activePeriod})
          </span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            Rp {totalNet.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {payrollRecords.length} Karyawan Terdaftar
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">
            Total Gaji Pokok
          </span>
          <p className="text-xl font-bold text-white mt-2">
            Rp {totalBasic.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Akumulasi Gaji Pokok
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">
            Tunjangan & Fasilitas
          </span>
          <p className="text-xl font-bold text-blue-400 mt-2">
            Rp {totalAllowances.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Tunjangan Kehadiran & Jabatan
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">
            Status Persetujuan Periode
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            {isFullyApproved ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui & Dicatat Kas
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-700">
                <Clock className="w-3.5 h-3.5" /> Menunggu Persetujuan
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {approvedCount} dari {payrollRecords.length} slip terverifikasi
          </p>
        </div>
      </div>

      {/* Action Controls & Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Daftar Slip Gaji & Beban Karyawan Periode {activePeriod}
            </h3>
            <p className="text-xs text-slate-400">
              Sinkronisasi data otomatis dengan status aktif SDM Wangsa Manawi Group
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {canCreateDraft && (
              <button
                onClick={onSyncDrafts}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Perbarui daftar payroll dari semua karyawan yang berstatus Aktif"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sinkronkan Karyawan Aktif</span>
              </button>
            )}

            {canApprove ? (
              <button
                onClick={() => onApprovePayrollBatch(activePeriod)}
                disabled={isFullyApproved || payrollRecords.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  isFullyApproved || payrollRecords.length === 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>
                  {isFullyApproved
                    ? 'Sudah Dicatat di Pengeluaran Keuangan'
                    : 'Setujui & Catat ke Pengeluaran Kas Keuangan'}
                </span>
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold border border-slate-700 cursor-not-allowed opacity-75"
                title="Hanya Admin atau Owner yang dapat menyetujui dan membukukan penggajian ke keuangan."
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Persetujuan Terbatas (Admin/Owner)</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Kode Slip</th>
                <th className="py-3 px-4">ID & Nama Karyawan</th>
                <th className="py-3 px-4">Jabatan & Divisi</th>
                <th className="py-3 px-4">Gaji Pokok</th>
                <th className="py-3 px-4">Tunjangan</th>
                <th className="py-3 px-4">Potongan (BPJS)</th>
                <th className="py-3 px-4">Gaji Bersih</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {payrollRecords.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                    {item.payrollCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">
                      {item.employeeName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      ID: {item.employeeId}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-200 block">{item.position}</span>
                    <span className="text-slate-400 text-[11px]">{item.department}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    Rp {item.basicSalary.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    Rp {item.allowances.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-rose-400 font-mono">
                    - Rp {item.deductions.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-sm text-emerald-400 font-mono">
                    Rp {item.netSalary.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.paymentStatus === 'Disetujui & Dicatat'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {item.paymentStatus === 'Disetujui & Dicatat' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-400" />
                      )}
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedSlip(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
                      title="Lihat Slip Gaji Karyawan"
                    >
                      Slip Gaji
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Slip Gaji */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSlip(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 space-y-4">
            {/* Printable Slip Header */}
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white tracking-tight">
                  WANGSA MANAWI GROUP CIMANGGU
                </h4>
                <p className="text-xs text-emerald-400">
                  SLIP GAJI KARYAWAN &bull; {selectedSlip.period}
                </p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Slip Content */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">ID Karyawan:</span>
                  <span className="font-mono font-bold text-white">{selectedSlip.employeeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nomor Slip:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedSlip.payrollCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nama Lengkap:</span>
                  <span className="font-bold text-white">{selectedSlip.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jabatan / Divisi:</span>
                  <span className="text-slate-200">{selectedSlip.position} ({selectedSlip.department})</span>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                <div className="p-2.5 flex items-center justify-between bg-slate-950/40">
                  <span className="text-slate-300">Gaji Pokok:</span>
                  <span className="font-mono text-white">Rp {selectedSlip.basicSalary.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-2.5 flex items-center justify-between bg-slate-950/40">
                  <span className="text-slate-300">Tunjangan Tetap & Jabatan:</span>
                  <span className="font-mono text-white">+ Rp {selectedSlip.allowances.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-2.5 flex items-center justify-between bg-slate-950/40">
                  <span className="text-rose-400">Potongan BPJS & Pajak:</span>
                  <span className="font-mono text-rose-400">- Rp {selectedSlip.deductions.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-3 flex items-center justify-between bg-emerald-950/30">
                  <span className="font-bold text-white">Total Diterima (Take Home Pay):</span>
                  <span className="font-mono font-extrabold text-base text-emerald-400">
                    Rp {selectedSlip.netSalary.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Status Verifikasi:</span>
                <span className="font-semibold text-emerald-400">{selectedSlip.paymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handlePrintSlip}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Slip</span>
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
