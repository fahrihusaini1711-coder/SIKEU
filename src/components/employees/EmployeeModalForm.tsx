import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  Lock,
  FileText,
  CreditCard,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Employee, EmployeeStatus, Gender, UserSession } from '../../types';
import {
  validateEmployeeForm,
  generateNextEmployeeId,
  checkPermission
} from '../../services/storageService';
import { INITIAL_DEPARTMENTS } from '../../data/initialData';

interface EmployeeModalFormProps {
  isOpen: boolean;
  isEdit: boolean;
  initialData?: Employee | null;
  existingEmployees: Employee[];
  currentUser: UserSession;
  onClose: () => void;
  onSave: (employeeData: Employee) => void;
}

export const EmployeeModalForm: React.FC<EmployeeModalFormProps> = ({
  isOpen,
  isEdit,
  initialData,
  existingEmployees,
  currentUser,
  onClose,
  onSave,
}) => {
  const canEditSalary = checkPermission(currentUser.role, 'EDIT_SALARY');

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    id: '',
    fullName: '',
    nik: '',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    position: '',
    department: 'Operasional Cimanggu',
    startDate: new Date().toISOString().split('T')[0],
    status: 'Aktif' as EmployeeStatus,
    basicSalary: 5000000,
    allowance: 750000,
    bankName: 'BCA',
    bankAccountNumber: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when opened or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({ ...initialData });
      } else {
        const autoId = generateNextEmployeeId(existingEmployees);
        setFormData({
          id: autoId,
          fullName: '',
          nik: '',
          gender: 'Laki-laki',
          birthPlace: 'Sukabumi',
          birthDate: '1995-01-01',
          address: '',
          phone: '',
          email: '',
          position: '',
          department: 'Operasional Cimanggu',
          startDate: new Date().toISOString().split('T')[0],
          status: 'Aktif',
          basicSalary: 5000000,
          allowance: 500000,
          bankName: 'BCA',
          bankAccountNumber: '',
          notes: '',
        });
      }
      setFormErrors({});
    }
  }, [isOpen, isEdit, initialData, existingEmployees]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleRegenerateId = () => {
    if (!isEdit) {
      const autoId = generateNextEmployeeId(existingEmployees);
      handleInputChange('id', autoId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateEmployeeForm(formData, isEdit, existingEmployees);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    const nowIso = new Date().toISOString();
    const finalEmployee: Employee = {
      ...(formData as Employee),
      id: formData.id!.trim().toUpperCase(),
      fullName: formData.fullName!.trim(),
      email: formData.email!.trim().toLowerCase(),
      phone: formData.phone!.trim(),
      address: formData.address!.trim(),
      position: formData.position!.trim(),
      createdAt: isEdit && initialData ? initialData.createdAt : nowIso,
      updatedAt: nowIso,
      avatarColor:
        isEdit && initialData?.avatarColor
          ? initialData.avatarColor
          : 'from-emerald-600 to-teal-700',
    };

    onSave(finalEmployee);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Unit Wangsa Manawi Group Cimanggu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Identitas Pokok & Pekerjaan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" /> 1. Data Pekerjaan & Penugasan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ID Karyawan */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ID Karyawan <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.id || ''}
                    onChange={(e) => handleInputChange('id', e.target.value.toUpperCase())}
                    placeholder="e.g. WMG-HR-009"
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.id ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={handleRegenerateId}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 text-xs"
                      title="Generate ID otomatis"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {formErrors.id ? (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.id}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format standar: WMG-HR-XXX (dapat disesuaikan & divalidasi unik)
                  </p>
                )}
              </div>

              {/* Status Karyawan */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status Karyawan <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.status || 'Aktif'}
                  onChange={(e) => handleInputChange('status', e.target.value as EmployeeStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="Aktif">Aktif (Bekerja)</option>
                  <option value="Cuti">Cuti (Izin Resmi)</option>
                  <option value="Nonaktif">Nonaktif (Resign / Selesai Kontrak)</option>
                </select>
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Jabatan / Posisi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="e.g. Mandor Kebun / Akuntan / Barista"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    formErrors.position ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.position && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.position}
                  </p>
                )}
              </div>

              {/* Departemen / Divisi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Divisi / Departemen <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.department || 'Operasional Cimanggu'}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {INITIAL_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Mulai Bekerja */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tanggal Mulai Bekerja <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.startDate ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {formErrors.startDate && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.startDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Data Pribadi & Kontak */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> 2. Data Pribadi & Kontak
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Nama lengkap sesuai KTP"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    formErrors.fullName ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.fullName}
                  </p>
                )}
              </div>

              {/* NIK (Nomor Induk Kependudukan - Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor Identitas (NIK KTP) <span className="text-slate-500 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik || ''}
                  onChange={(e) => handleInputChange('nik', e.target.value)}
                  placeholder="16 digit angka e.g. 320101..."
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    formErrors.nik ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.nik && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.nik}
                  </p>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Jenis Kelamin <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === 'Laki-laki'}
                      onChange={() => handleInputChange('gender', 'Laki-laki')}
                      className="text-emerald-500 focus:ring-emerald-400"
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === 'Perempuan'}
                      onChange={() => handleInputChange('gender', 'Perempuan')}
                      className="text-emerald-500 focus:ring-emerald-400"
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              {/* Tempat Lahir (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tempat Lahir <span className="text-slate-500 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={formData.birthPlace || ''}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  placeholder="e.g. Sukabumi, Bandung, Jakarta"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Tanggal Lahir (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tanggal Lahir <span className="text-slate-500 font-normal">(Opsional)</span>
                </label>
                <input
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Perusahaan / Pribadi <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nama@wangsamanawi.co.id"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.email ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.email}
                  </p>
                )}
              </div>

              {/* Telepon */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor Telepon (WhatsApp) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0812-3456-7890"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.phone ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Alamat Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Tempat Tinggal <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Jl. Raya Cimanggu, RT/RW, Desa Cimanggu, Sukabumi..."
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.address ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {formErrors.address && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Kompensasi & Rekening Bank (Hak Akses Terbatas) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> 3. Kompensasi & Gaji (Khusus Pengguna Berwenang)
              </h4>
              {!canEditSalary && (
                <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (Hanya Admin)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gaji Pokok */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gaji Pokok (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    disabled={!canEditSalary}
                    value={formData.basicSalary ?? 0}
                    onChange={(e) => handleInputChange('basicSalary', Number(e.target.value))}
                    className={`w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      !canEditSalary ? 'opacity-60 cursor-not-allowed bg-slate-900' : ''
                    }`}
                  />
                </div>
                {formErrors.basicSalary && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.basicSalary}
                  </p>
                )}
              </div>

              {/* Tunjangan Tetap */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tunjangan Tetap (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    disabled={!canEditSalary}
                    value={formData.allowance ?? 0}
                    onChange={(e) => handleInputChange('allowance', Number(e.target.value))}
                    className={`w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      !canEditSalary ? 'opacity-60 cursor-not-allowed bg-slate-900' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Bank & No Rekening */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Bank Payroll
                </label>
                <select
                  disabled={!canEditSalary}
                  value={formData.bankName || 'BCA'}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="BNI">BNI</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor Rekening Bank
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!canEditSalary}
                    value={formData.bankAccountNumber || ''}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    placeholder="e.g. 132-00-9812..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Catatan Tambahan (Opsional) */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Tambahan / Keterangan Penugasan <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan keahlian, status sertifikasi, tugas khusus di kebun/villa..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </form>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Karyawan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
