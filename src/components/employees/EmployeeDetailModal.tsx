import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Lock,
  Printer,
  Edit2,
  DollarSign,
  CreditCard,
  Briefcase,
  Clock,
  ShieldCheck,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { Employee, UserSession, PayrollRecord } from '../../types';
import { checkPermission } from '../../services/storageService';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  employee: Employee | null;
  currentUser: UserSession;
  payrollRecords: PayrollRecord[];
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onOpenPayroll: (employee: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  employee,
  currentUser,
  payrollRecords,
  onClose,
  onEdit,
  onOpenPayroll,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'pekerjaan' | 'gaji' | 'payroll_history'>('profil');

  if (!isOpen || !employee) return null;

  // Permissions
  const canViewSensitive = checkPermission(currentUser.role, 'VIEW_SENSITIVE_DATA');
  const canViewSalary = checkPermission(currentUser.role, 'VIEW_SALARY');
  const canEdit = checkPermission(currentUser.role, 'EMPLOYEE_EDIT');

  // Masa kerja calculator
  const calculateTenure = (startDateStr: string) => {
    try {
      const start = new Date(startDateStr);
      const now = new Date('2026-10-20');
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      if (years <= 0 && months <= 0) return 'Baru bergabung bulan ini';
      if (years <= 0) return `${months} bulan`;
      return `${years} tahun ${months} bulan`;
    } catch {
      return '-';
    }
  };

  // Get employee's payroll records
  const empPayroll = payrollRecords.filter((p) => p.employeeId === employee.id);

  // Helper mask NIK
  const maskNik = (nik?: string) => {
    if (!nik) return '-';
    if (canViewSensitive) return nik;
    // Mask for unauthorized users: 3201**********01
    return nik.substring(0, 4) + '**********' + nik.substring(nik.length - 2);
  };

  // Mask Address for unauthorized
  const maskAddress = (address: string) => {
    if (canViewSensitive) return address;
    // Show only city/district for non-authorized users
    return 'Cimanggu, Sukabumi (Detail alamat disembunyikan sesuai hak akses)';
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header Hero */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar Large */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${
                employee.avatarColor || 'from-emerald-600 to-teal-700'
              } flex items-center justify-center text-white font-extrabold text-2xl shadow-xl ring-2 ring-emerald-400/30 shrink-0`}
            >
              {employee.fullName
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {employee.id}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    employee.status === 'Aktif'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                      : employee.status === 'Cuti'
                      ? 'bg-amber-950 text-amber-400 border border-amber-700/60'
                      : 'bg-rose-950 text-rose-400 border border-rose-700/60'
                  }`}
                >
                  Status: {employee.status}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                {employee.fullName}
              </h2>
              <p className="text-sm text-slate-300 font-medium">
                {employee.position} &bull;{' '}
                <span className="text-emerald-400">{employee.department}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Cetak Rangkuman Profil Karyawan"
              >
                <Printer className="w-4 h-4" />
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(employee);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-medium text-xs border border-slate-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-medium gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profil')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'profil'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Profil & Kontak
          </button>
          <button
            onClick={() => setActiveTab('pekerjaan')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pekerjaan'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Pekerjaan & Masa Kerja
          </button>
          <button
            onClick={() => setActiveTab('gaji')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'gaji'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Kompensasi & Bank</span>
            {!canViewSalary && <Lock className="w-3 h-3 text-amber-400" />}
          </button>
          <button
            onClick={() => setActiveTab('payroll_history')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'payroll_history'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Slip Gaji & Payroll</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {empPayroll.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: Profil & Kontak */}
          {activeTab === 'profil' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Nama Lengkap
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {employee.fullName}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400">
                      Nomor Identitas (NIK)
                    </span>
                    {!canViewSensitive && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Disamarkan
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-slate-200">
                    {maskNik(employee.nik)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Jenis Kelamin
                  </span>
                  <p className="text-sm font-medium text-white">
                    {employee.gender}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400">
                      Tempat & Tanggal Lahir
                    </span>
                    {!canViewSensitive && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Terbatas
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-200">
                    {canViewSensitive
                      ? `${employee.birthPlace || '-'}, ${employee.birthDate || '-'}`
                      : 'Data pribadi dilindungi (Akses Khusus Admin/Owner)'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Nomor Telepon
                  </span>
                  <p className="text-sm font-mono text-slate-200">
                    {employee.phone}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email
                  </span>
                  <p className="text-sm text-slate-200">{employee.email}</p>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Alamat Tempat Tinggal
                    </span>
                    {!canViewSensitive && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Terproteksi
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {maskAddress(employee.address)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Data Pekerjaan */}
          {activeTab === 'pekerjaan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Posisi / Jabatan
                  </span>
                  <p className="text-base font-bold text-white">
                    {employee.position}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Status Kepegawaian: Karyawan Tetap
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Divisi / Departemen
                  </span>
                  <p className="text-base font-bold text-emerald-400">
                    {employee.department}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Lokasi: Area Wangsa Manawi Cimanggu
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Tanggal Mulai Bekerja
                  </span>
                  <p className="text-sm font-mono font-bold text-white">
                    {employee.startDate}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Masa Kerja Berjalan
                  </span>
                  <p className="text-sm font-bold text-teal-400">
                    {calculateTenure(employee.startDate)}
                  </p>
                </div>
              </div>

              {employee.notes && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300 block mb-1">
                    Catatan Khusus Karyawan:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{employee.notes}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Kompensasi & Gaji (RBAC Protected) */}
          {activeTab === 'gaji' && (
            <div className="space-y-4">
              {!canViewSalary ? (
                <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-center space-y-2">
                  <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="text-sm font-bold text-amber-200">
                    Informasi Gaji Terproteksi
                  </h4>
                  <p className="text-xs text-amber-300/80 max-w-md mx-auto">
                    Data kompensasi dan rincian gaji hanya dapat diakses oleh peran Admin dan Owner Wangsa Manawi Group sesuai kebijakan privasi internal.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                      <span className="text-xs text-emerald-400 font-semibold block mb-1">
                        Gaji Pokok Bulanan
                      </span>
                      <p className="text-xl font-bold text-white">
                        Rp {(employee.basicSalary || 0).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-xs text-slate-400 font-semibold block mb-1">
                        Tunjangan Tetap
                      </span>
                      <p className="text-xl font-bold text-white">
                        Rp {(employee.allowance || 0).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-xs text-slate-400 font-semibold block mb-1">
                        Total Estimasi Bruto
                      </span>
                      <p className="text-xl font-bold text-emerald-400">
                        Rp {((employee.basicSalary || 0) + (employee.allowance || 0)).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-xs text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Rekening Bank Payroll
                      </span>
                      <p className="text-sm font-semibold text-white">
                        {employee.bankName || 'BCA'}
                      </p>
                      <p className="text-xs font-mono text-slate-300 mt-0.5">
                        {employee.bankAccountNumber || 'Belum diisi'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <b>Ketentuan Keuangan:</b> Data gaji tidak langsung dicatat sebagai pengeluaran otomatis di buku kas umum sampai modul penggajian memproses dan menyetujui transaksi pengeluaran.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Riwayat Payroll & Integrasi Keuangan */}
          {activeTab === 'payroll_history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase">
                    Slip Gaji Tercatat untuk {employee.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    ID Referensi: {employee.id}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPayroll(employee);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Buka Modul Penggajian</span>
                </button>
              </div>

              {empPayroll.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                  <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Belum ada slip gaji yang diproses untuk karyawan ini pada periode aktif.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPayroll(employee);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
                  >
                    Buat slip gaji sekarang di modul payroll
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {empPayroll.map((slip) => (
                    <div
                      key={slip.id}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-emerald-400">
                            {slip.payrollCode}
                          </span>
                          <span className="text-xs font-medium text-white">
                            Periode {slip.period}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Gaji Pokok: Rp {slip.basicSalary.toLocaleString('id-ID')} + Tunjangan Rp {slip.allowances.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white block">
                          Rp {slip.netSalary.toLocaleString('id-ID')}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            slip.paymentStatus === 'Disetujui & Dicatat' || slip.paymentStatus === 'Dibayarkan'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {slip.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Didaftarkan: {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('id-ID') : '-'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
