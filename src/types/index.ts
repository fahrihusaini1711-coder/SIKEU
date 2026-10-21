/**
 * Tipe Data dan Interface untuk Sistem Informasi Pengelolaan Keuangan
 * dan Manajemen Karyawan - Wangsa Manawi Group Cimanggu
 */

export type UserRole = 'admin' | 'owner' | 'finance_staff';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar: string;
}

export type EmployeeStatus = 'Aktif' | 'Cuti' | 'Nonaktif';
export type Gender = 'Laki-laki' | 'Perempuan';

export interface Employee {
  id: string; // e.g. WMG-HR-001
  nik?: string; // Nomor Induk Kependudukan (opsional)
  fullName: string;
  gender: Gender;
  birthPlace?: string;
  birthDate?: string; // YYYY-MM-DD
  address: string;
  phone: string;
  email: string;
  position: string; // Jabatan
  department: string; // Divisi / Departemen
  startDate: string; // Tanggal mulai bekerja (YYYY-MM-DD)
  status: EmployeeStatus;
  basicSalary?: number; // Gaji Pokok (Hanya hak akses tertentu)
  allowance?: number; // Tunjangan tetap
  bankName?: string;
  bankAccountNumber?: string;
  notes?: string;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  manager: string;
  description: string;
}

export interface FinancialTransaction {
  id: string;
  code: string; // e.g. TRX-2026-001
  date: string;
  type: 'masuk' | 'keluar';
  category: string;
  amount: number;
  description: string;
  relatedEmployeeId?: string;
  relatedEmployeeName?: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
  approvedBy?: string;
  paymentMethod: string;
}

export interface PayrollRecord {
  id: string;
  payrollCode: string;
  period: string; // e.g. "Oktober 2026"
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: 'Draf' | 'Menunggu Approval' | 'Disetujui & Dicatat' | 'Dibayarkan';
  approvalDate?: string;
  transactionId?: string; // Terhubung ke tabel transaksi keuangan saat disetujui!
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  details: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
