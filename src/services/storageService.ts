/**
 * Layanan Penyimpanan & Bisnis Logika (Database & Permissions)
 * Wangsa Manawi Group Cimanggu
 */

import { Employee, FinancialTransaction, PayrollRecord, AuditLog, UserRole, UserSession, EmployeeStatus } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_TRANSACTIONS, INITIAL_PAYROLL, INITIAL_USERS } from '../data/initialData';

const STORAGE_KEYS = {
  EMPLOYEES: 'wmg_cimanggu_employees_v1',
  TRANSACTIONS: 'wmg_cimanggu_transactions_v1',
  PAYROLL: 'wmg_cimanggu_payroll_v1',
  AUDIT: 'wmg_cimanggu_audit_v1',
  ACTIVE_USER: 'wmg_cimanggu_active_user_v1',
};

// Helper permission evaluator
export const checkPermission = (role: UserRole, action: string): boolean => {
  switch (action) {
    case 'EMPLOYEE_CREATE':
    case 'EMPLOYEE_EDIT':
    case 'EMPLOYEE_STATUS_CHANGE':
    case 'EMPLOYEE_DELETE':
      return role === 'admin';

    case 'VIEW_SENSITIVE_DATA': // NIK lengkap, Tempat Tanggal Lahir, Alamat detail
      return role === 'admin' || role === 'owner';

    case 'VIEW_SALARY': // Gaji Pokok & Tunjangan
      return role === 'admin' || role === 'owner' || role === 'finance_staff'; // Finance staff butuh untuk penggajian

    case 'EDIT_SALARY':
      return role === 'admin';

    case 'PAYROLL_APPROVE':
      return role === 'admin' || role === 'owner';

    case 'PAYROLL_CREATE_DRAFT':
      return role === 'admin' || role === 'finance_staff';

    case 'EXPORT_CSV':
      return role === 'admin' || role === 'owner';

    default:
      return false;
  }
};

// Initializer / Loader
export const getStoredEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca data karyawan dari storage:', err);
    return INITIAL_EMPLOYEES;
  }
};

export const saveStoredEmployees = (employees: Employee[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (err) {
    console.error('Gagal menyimpan data karyawan:', err);
  }
};

export const getStoredTransactions = (): FinancialTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (trx: FinancialTransaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(trx));
  } catch (err) {
    console.error('Gagal menyimpan transaksi:', err);
  }
};

export const getStoredPayroll = (): PayrollRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYROLL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL));
      return INITIAL_PAYROLL;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYROLL;
  }
};

export const saveStoredPayroll = (payroll: PayrollRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll));
  } catch (err) {
    console.error('Gagal menyimpan data payroll:', err);
  }
};

export const getStoredAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const addAuditLog = (
  user: UserSession,
  action: string,
  target: string,
  details: string
): void => {
  try {
    const logs = getStoredAuditLogs();
    const newLog: AuditLog = {
      id: 'LOG-' + Date.now(),
      timestamp: new Date().toISOString(),
      userName: user.name,
      userRole: user.role,
      action,
      target,
      details,
    };
    const updated = [newLog, ...logs.slice(0, 99)]; // Keep last 100
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(updated));
  } catch (err) {
    console.error('Gagal mencatat audit log:', err);
  }
};

// Otomatis generate ID Karyawan unik berikutnya (e.g. WMG-HR-009)
export const generateNextEmployeeId = (existingEmployees: Employee[]): string => {
  let maxSeq = 0;
  for (const emp of existingEmployees) {
    const match = emp.id.match(/WMG-HR-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `WMG-HR-${String(nextSeq).padStart(3, '0')}`;
};

// Validasi Form Karyawan
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmployeeForm = (
  data: Partial<Employee>,
  isEdit = false,
  existingEmployees: Employee[] = []
): ValidationResult => {
  const errors: Record<string, string> = {};

  // ID Karyawan
  if (!data.id?.trim()) {
    errors.id = 'ID Karyawan wajib diisi.';
  } else {
    // Cek duplikasi jika bukan mode edit atau ID diubah
    const duplicateId = existingEmployees.find(
      (e) => e.id.toLowerCase() === data.id!.trim().toLowerCase()
    );
    if (duplicateId && (!isEdit || (isEdit && duplicateId.id !== data.id))) {
      errors.id = `ID Karyawan "${data.id}" sudah digunakan oleh ${duplicateId.fullName}.`;
    }
  }

  // Nama Lengkap
  if (!data.fullName?.trim()) {
    errors.fullName = 'Nama lengkap wajib diisi.';
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'Nama lengkap minimal 3 karakter.';
  }

  // Email
  if (!data.email?.trim()) {
    errors.email = 'Alamat email wajib diisi.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Format email tidak valid (contoh: nama@wangsamanawi.co.id).';
    } else {
      // Cek duplikasi email pada karyawan lain
      const duplicateEmail = existingEmployees.find(
        (e) => e.email.toLowerCase() === data.email!.trim().toLowerCase() && e.id !== data.id
      );
      if (duplicateEmail) {
        errors.email = `Email sudah terdaftar atas nama ${duplicateEmail.fullName}.`;
      }
    }
  }

  // Nomor Telepon
  if (!data.phone?.trim()) {
    errors.phone = 'Nomor telepon wajib diisi.';
  } else {
    const cleanPhone = data.phone.replace(/[\s-]/g, '');
    if (!/^(\+62|62|0)[0-9]{8,13}$/.test(cleanPhone)) {
      errors.phone = 'Nomor telepon tidak valid (contoh: 08123456789 atau +62812...).';
    }
  }

  // Jabatan & Departemen
  if (!data.position?.trim()) {
    errors.position = 'Jabatan wajib diisi.';
  }
  if (!data.department?.trim()) {
    errors.department = 'Departemen wajib dipilih.';
  }

  // Tanggal Mulai Bekerja
  if (!data.startDate?.trim()) {
    errors.startDate = 'Tanggal mulai bekerja wajib diisi.';
  }

  // Alamat
  if (!data.address?.trim()) {
    errors.address = 'Alamat tempat tinggal wajib diisi.';
  }

  // Status
  if (!data.status) {
    errors.status = 'Status karyawan wajib ditentukan.';
  }

  // NIK (opsional, jika diisi minimal 16 digit angka Indonesia)
  if (data.nik && data.nik.trim()) {
    const cleanNik = data.nik.trim();
    if (!/^\d{16}$/.test(cleanNik)) {
      errors.nik = 'NIK harus berupa 16 digit angka.';
    } else {
      const duplicateNik = existingEmployees.find(
        (e) => e.nik && e.nik === cleanNik && e.id !== data.id
      );
      if (duplicateNik) {
        errors.nik = `NIK sudah terdaftar atas nama ${duplicateNik.fullName}.`;
      }
    }
  }

  // Gaji Pokok jika diisi tidak boleh negatif
  if (data.basicSalary !== undefined && data.basicSalary < 0) {
    errors.basicSalary = 'Gaji pokok tidak boleh bernilai negatif.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Ekspor data ke CSV
export const exportToCSV = (employees: Employee[], fileName = 'data_karyawan_wangsa_manawi.csv'): void => {
  const headers = [
    'No',
    'ID Karyawan',
    'Nama Lengkap',
    'Jabatan',
    'Departemen',
    'Status',
    'Tanggal Masuk',
    'No Telepon',
    'Email',
    'Alamat'
  ];

  const rows = employees.map((emp, index) => [
    index + 1,
    `"${emp.id}"`,
    `"${emp.fullName.replace(/"/g, '""')}"`,
    `"${emp.position.replace(/"/g, '""')}"`,
    `"${emp.department.replace(/"/g, '""')}"`,
    `"${emp.status}"`,
    `"${emp.startDate}"`,
    `"${emp.phone}"`,
    `"${emp.email}"`,
    `"${emp.address.replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Reset ke Data Default
export const resetToSimulationDefaults = (): void => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL));
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify([]));
};
