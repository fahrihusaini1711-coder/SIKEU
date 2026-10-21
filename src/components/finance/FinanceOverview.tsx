import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { FinancialTransaction, UserSession } from '../../types';

interface FinanceOverviewProps {
  transactions: FinancialTransaction[];
  currentUser: UserSession;
  onAddTransaction: (trx: Omit<FinancialTransaction, 'id'>) => void;
  onNavigateToPayroll: () => void;
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({
  transactions,
  currentUser,
  onAddTransaction,
  onNavigateToPayroll,
}) => {
  const [filterType, setFilterType] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for manual transaction
  const [formData, setFormData] = useState({
    code: `TRX-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    type: 'masuk' as 'masuk' | 'keluar',
    category: 'Pendapatan Agrowisata & Villa',
    amount: 5000000,
    description: '',
    paymentMethod: 'Transfer Bank Mandiri',
  });

  // Calculate totals
  const totalMasuk = transactions
    .filter((t) => t.type === 'masuk')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalKeluar = transactions
    .filter((t) => t.type === 'keluar')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoKas = totalMasuk - totalKeluar;

  const bebanSDM = transactions
    .filter((t) => t.type === 'keluar' && t.category.toLowerCase().includes('gaji'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered transactions
  const filtered = transactions.filter((t) => {
    if (filterType === 'masuk') return t.type === 'masuk';
    if (filterType === 'keluar') return t.type === 'keluar';
    return true;
  });

  const handleCreateTrx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    onAddTransaction({
      code: `TRX-CMG-${Date.now().toString().slice(-4)}`,
      date: formData.date,
      type: formData.type,
      category: formData.category,
      amount: formData.amount,
      description: formData.description,
      status: 'Disetujui',
      approvedBy: currentUser.name,
      paymentMethod: formData.paymentMethod,
    });

    setShowAddModal(false);
    setFormData({
      code: `TRX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'masuk',
      category: 'Pendapatan Agrowisata & Villa',
      amount: 5000000,
      description: '',
      paymentMethod: 'Transfer Bank Mandiri',
    });
  };

  return (
    <div className="space-y-6">
      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Kas */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Saldo Kas Unit Cimanggu
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white">
              Rp {saldoKas.toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Posisi Kas Sehat
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Kas Masuk */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-950/60 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Total Kas Masuk
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-emerald-400">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pendapatan Wisata & Hasil Kebun
            </p>
          </div>
        </div>

        {/* Kas Keluar */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-rose-950/60 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Total Kas Keluar
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-rose-400">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Beban Operasional & Pemeliharaan
            </p>
          </div>
        </div>

        {/* Beban Gaji SDM Terintegrasi */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-blue-950/60 shadow-xl relative overflow-hidden group cursor-pointer hover:border-blue-700/60 transition-all"
             onClick={onNavigateToPayroll}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Beban Gaji Karyawan
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-blue-300">
              Rp {bebanSDM.toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-blue-400 mt-1 underline">
              Buka Modul Penggajian &rarr;
            </p>
          </div>
        </div>
      </div>

      {/* Transaction List Container */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Buku Arus Kas & Jurnal Pengeluaran
            </h3>
            <p className="text-xs text-slate-400">
              Catatan transaksi keuangan operasional Wangsa Manawi Group Cimanggu
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('semua')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'semua' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('masuk')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'masuk' ? 'bg-emerald-950 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('keluar')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'keluar' ? 'bg-rose-950 text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pengeluaran
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kode Transaksi</th>
                <th className="py-3 px-4">Kategori & Keterangan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Jumlah (Rp)</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-300">{trx.date}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-200">{trx.code}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white block">{trx.category}</span>
                    <span className="text-slate-400 text-[11px] block">{trx.description}</span>
                    {trx.relatedEmployeeName && (
                      <span className="text-blue-400 text-[10px] block mt-0.5 font-medium">
                        Terkait SDM: {trx.relatedEmployeeName} ({trx.relatedEmployeeId})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        trx.type === 'masuk'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {trx.type === 'masuk' ? '+' : '-'} {trx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-sm">
                    <span className={trx.type === 'masuk' ? 'text-emerald-400' : 'text-rose-400'}>
                      {trx.type === 'masuk' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{trx.paymentMethod}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Transaksi Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-white">Catat Transaksi Keuangan</h3>

            <form onSubmit={handleCreateTrx} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'masuk' })}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      formData.type === 'masuk'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    + Kas Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'keluar' })}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      formData.type === 'keluar'
                        ? 'bg-rose-950 border-rose-500 text-rose-400'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    - Kas Keluar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kategori Transaksi</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penjelasan pengeluaran / penerimaan..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
