import React from 'react';
import {
  FileText,
  Printer,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { Employee, FinancialTransaction, PayrollRecord, UserSession } from '../../types';

interface FinancialReportsProps {
  employees: Employee[];
  transactions: FinancialTransaction[];
  payrollRecords: PayrollRecord[];
  currentUser: UserSession;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  employees,
  transactions,
  payrollRecords,
  currentUser,
}) => {
  const totalPemasukan = transactions
    .filter((t) => t.type === 'masuk')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.type === 'keluar')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const labaBersih = totalPemasukan - totalPengeluaran;

  const totalBebanSDM = transactions
    .filter((t) => t.type === 'keluar' && t.category.toLowerCase().includes('gaji'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const rasioBebanSDM = totalPengeluaran > 0 ? Math.round((totalBebanSDM / totalPengeluaran) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Laporan Keuangan & Beban Ketenagakerjaan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konsolidasi Finansial Wangsa Manawi Group &bull; Unit Perkebunan & Wisata Cimanggu
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Pendapatan Unit</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            Rp {totalPemasukan.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Sewa Villa, Tiket & Penjualan Kopi</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Beban Operasional</span>
          <p className="text-2xl font-bold text-rose-400 mt-2">
            Rp {totalPengeluaran.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Termasuk Beban Gaji SDM Terotorisasi</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Surplus / Laba Bersih</span>
          <p className="text-2xl font-bold text-white mt-2">
            Rp {labaBersih.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Margin Sehat (+{totalPemasukan > 0 ? Math.round((labaBersih / totalPemasukan) * 100) : 0}%)
          </p>
        </div>
      </div>

      {/* Breakdown Analisis SDM */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" /> Analisis Beban SDM vs Operasional Lapangan
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Beban Gaji Karyawan ({employees.length} personel)</span>
            <span className="font-mono font-bold text-emerald-400">
              Rp {totalBebanSDM.toLocaleString('id-ID')} ({rasioBebanSDM}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${rasioBebanSDM}%` }}
              title="Porsi Beban Gaji"
            />
            <div
              className="bg-slate-700 transition-all duration-500"
              style={{ width: `${100 - rasioBebanSDM}%` }}
              title="Porsi Operasional Lainnya"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Beban SDM & Gaji Karyawan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700"></span> Pemeliharaan Villa, Pupuk & Operasional Kebun
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-300">
          <p className="font-semibold text-white mb-1">Catatan Kebijakan Keuangan:</p>
          <p className="text-slate-400 leading-relaxed">
            Sistem Informasi Pengelolaan Keuangan Wangsa Manawi Group Cimanggu menerapkan audit segregasi beban. Setiap data penambahan karyawan baru memerlukan pengesahan dari Bagian SDM dan tidak akan membebani jurnal buku kas keuangan sampai dilakukan proses tutup buku atau approval draf penggajian bulanan.
          </p>
        </div>
      </div>
    </div>
  );
};
