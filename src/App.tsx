/**
 * Aplikasi Sistem Informasi Pengelolaan Keuangan & Manajemen Karyawan
 * WANGSA MANAWI GROUP CIMANGGU
 */

import React, { useState, useEffect } from 'react';
import {
  getStoredEmployees,
  saveStoredEmployees,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredPayroll,
  saveStoredPayroll,
  getStoredAuditLogs,
  addAuditLog,
  checkPermission,
  resetToSimulationDefaults,
} from './services/storageService';
import {
  Employee,
  FinancialTransaction,
  PayrollRecord,
  AuditLog,
  UserSession,
  ToastMessage,
} from './types';
import { INITIAL_USERS, SIMULATION_DISCLAIMER } from './data/initialData';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { EmployeeStatsCards } from './components/employees/EmployeeStatsCards';
import { EmployeeTable } from './components/employees/EmployeeTable';
import { EmployeeModalForm } from './components/employees/EmployeeModalForm';
import { EmployeeDetailModal } from './components/employees/EmployeeDetailModal';
import { DeleteConfirmModal } from './components/employees/DeleteConfirmModal';
import { FinanceOverview } from './components/finance/FinanceOverview';
import { PayrollModule } from './components/finance/PayrollModule';
import { FinancialReports } from './components/finance/FinancialReports';
import { AuditLogModal } from './components/audit/AuditLogModal';
import { ToastContainer } from './components/common/Toast';

export default function App() {
  // Navigation State - default directly to the new module 'employees' as requested
  const [activeTab, setActiveTab] = useState<string>('employees');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User Authentication / RBAC Session State
  const [currentUser, setCurrentUser] = useState<UserSession>(INITIAL_USERS[0]); // Default Admin

  // Main Persistent Data States
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredEmployees());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => getStoredTransactions());
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => getStoredPayroll());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStoredAuditLogs());

  // Filter Departemen global di modul karyawan
  const [selectedDepartment, setSelectedDepartment] = useState('Semua');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'toggle_status';
    employee: Employee | null;
  }>({
    isOpen: false,
    type: 'delete',
    employee: null,
  });

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Trigger Toast Helper
  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + Math.random().toString().slice(2, 6),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    saveStoredEmployees(employees);
  }, [employees]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredPayroll(payrollRecords);
  }, [payrollRecords]);

  // Handle Switch User / Role
  const handleSwitchUser = (user: UserSession) => {
    setCurrentUser(user);
    addAuditLog(user, 'PERUBAHAN_SESI', 'Sistem Autentikasi', `Beralih ke akun ${user.name} (${user.role})`);
    setAuditLogs(getStoredAuditLogs());
    addToast(
      'info',
      `Beralih ke Peran: ${user.role.toUpperCase()}`,
      `Sekarang Anda beroperasi sebagai ${user.name} (${user.title}).`
    );
  };

  // Open Add Employee Modal
  const handleOpenAddModal = () => {
    if (!checkPermission(currentUser.role, 'EMPLOYEE_CREATE')) {
      addToast('error', 'Akses Ditolak', 'Hanya Admin yang berwenang menambah data karyawan baru.');
      return;
    }
    setEditingEmployee(null);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  // Open Edit Employee Modal
  const handleOpenEditModal = (employee: Employee) => {
    if (!checkPermission(currentUser.role, 'EMPLOYEE_EDIT')) {
      addToast('error', 'Akses Ditolak', 'Hanya Admin yang berwenang mengubah data karyawan.');
      return;
    }
    setEditingEmployee(employee);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  // Open Detail Employee Modal
  const handleOpenDetailModal = (employee: Employee) => {
    setDetailEmployee(employee);
    setIsDetailModalOpen(true);
  };

  // Save Employee (Add or Edit)
  const handleSaveEmployee = (empData: Employee) => {
    if (isEditMode) {
      // Check permission
      if (!checkPermission(currentUser.role, 'EMPLOYEE_EDIT')) {
        addToast('error', 'Otorisasi Gagal', 'Hak akses Anda tidak diizinkan mengubah data.');
        return;
      }

      setEmployees((prev) => prev.map((e) => (e.id === empData.id ? empData : e)));
      addAuditLog(
        currentUser,
        'EDIT_KARYAWAN',
        empData.id,
        `Memperbarui profil ${empData.fullName} (${empData.position})`
      );
      setAuditLogs(getStoredAuditLogs());
      addToast('success', 'Data Diperbarui', `Profil karyawan ${empData.fullName} berhasil disimpan.`);
    } else {
      // Check permission
      if (!checkPermission(currentUser.role, 'EMPLOYEE_CREATE')) {
        addToast('error', 'Otorisasi Gagal', 'Hak akses Anda tidak diizinkan menambah karyawan.');
        return;
      }

      // Check duplicate ID
      if (employees.some((e) => e.id.toLowerCase() === empData.id.toLowerCase())) {
        addToast('error', 'Duplikasi Terdeteksi', `ID Karyawan ${empData.id} sudah digunakan.`);
        return;
      }

      setEmployees((prev) => [empData, ...prev]);
      addAuditLog(
        currentUser,
        'TAMBAH_KARYAWAN',
        empData.id,
        `Mendaftarkan karyawan baru: ${empData.fullName} sebagai ${empData.position}`
      );
      setAuditLogs(getStoredAuditLogs());
      addToast(
        'success',
        'Karyawan Berhasil Ditambahkan',
        `${empData.fullName} (${empData.id}) berhasil didaftarkan ke sistem Unit Cimanggu.`
      );
    }

    setIsFormModalOpen(false);
  };

  // Open Toggle Status Modal
  const handleOpenToggleStatus = (employee: Employee) => {
    if (!checkPermission(currentUser.role, 'EMPLOYEE_STATUS_CHANGE')) {
      addToast('error', 'Akses Ditolak', 'Hanya Admin yang berwenang mengubah status karyawan.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'toggle_status',
      employee,
    });
  };

  // Open Delete Modal
  const handleOpenDelete = (employee: Employee) => {
    if (!checkPermission(currentUser.role, 'EMPLOYEE_DELETE')) {
      addToast('error', 'Akses Ditolak', 'Hanya Admin yang berwenang menghapus data karyawan.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      employee,
    });
  };

  // Execute Confirm Delete or Status Toggle
  const handleExecuteConfirm = () => {
    const { type, employee } = confirmModal;
    if (!employee) return;

    if (type === 'delete') {
      if (!checkPermission(currentUser.role, 'EMPLOYEE_DELETE')) {
        addToast('error', 'Akses Ditolak', 'Tidak memiliki izin menghapus karyawan.');
        setConfirmModal({ isOpen: false, type: 'delete', employee: null });
        return;
      }

      setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
      addAuditLog(
        currentUser,
        'HAPUS_KARYAWAN',
        employee.id,
        `Menghapus permanen data karyawan ${employee.fullName}`
      );
      setAuditLogs(getStoredAuditLogs());
      addToast('info', 'Karyawan Dihapus', `Data ${employee.fullName} telah dihapus.`);
    } else if (type === 'toggle_status') {
      if (!checkPermission(currentUser.role, 'EMPLOYEE_STATUS_CHANGE')) {
        addToast('error', 'Akses Ditolak', 'Tidak memiliki izin mengubah status.');
        setConfirmModal({ isOpen: false, type: 'toggle_status', employee: null });
        return;
      }

      const newStatus = employee.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      setEmployees((prev) =>
        prev.map((e) => (e.id === employee.id ? { ...e, status: newStatus } : e))
      );
      addAuditLog(
        currentUser,
        'UBAH_STATUS',
        employee.id,
        `Mengubah status ${employee.fullName} menjadi ${newStatus}`
      );
      setAuditLogs(getStoredAuditLogs());
      addToast(
        'success',
        'Status Berhasil Diubah',
        `Status ${employee.fullName} kini adalah "${newStatus}".`
      );
    }

    setConfirmModal({ isOpen: false, type: 'delete', employee: null });
  };

  // Financial Transaction Add
  const handleAddTransaction = (trxData: Omit<FinancialTransaction, 'id'>) => {
    const newTrx: FinancialTransaction = {
      ...trxData,
      id: 'TRX-' + Date.now(),
    };
    setTransactions((prev) => [newTrx, ...prev]);
    addAuditLog(
      currentUser,
      'CATAT_TRANSAKSI_KAS',
      newTrx.code,
      `Pencatatan kas ${newTrx.type}: Rp ${newTrx.amount.toLocaleString('id-ID')} (${newTrx.category})`
    );
    setAuditLogs(getStoredAuditLogs());
    addToast('success', 'Transaksi Tercatat', `Kas ${newTrx.type.toUpperCase()} sebesar Rp ${newTrx.amount.toLocaleString('id-ID')} berhasil dibukukan.`);
  };

  // Sync Payroll Drafts from Active Employees
  const handleSyncPayrollDrafts = () => {
    const activeEmployees = employees.filter((e) => e.status === 'Aktif');
    const period = 'Oktober 2026';

    const newPayrollList: PayrollRecord[] = activeEmployees.map((emp, idx) => {
      // Cek apakah sudah ada slip untuk karyawan ini di periode berjalan
      const existing = payrollRecords.find(
        (p) => p.employeeId === emp.id && p.period === period
      );
      if (existing) return existing;

      const basic = emp.basicSalary || 4500000;
      const allowance = emp.allowance || 500000;
      const deductions = Math.round(basic * 0.03); // estimasi BPJS 3%
      const net = basic + allowance - deductions;

      return {
        id: `PAY-${Date.now()}-${idx}`,
        payrollCode: `SLIP-OCT26-${String(idx + 1).padStart(3, '0')}`,
        period,
        employeeId: emp.id,
        employeeName: emp.fullName,
        position: emp.position,
        department: emp.department,
        basicSalary: basic,
        allowances: allowance,
        deductions,
        netSalary: net,
        paymentStatus: 'Draf',
      };
    });

    setPayrollRecords(newPayrollList);
    addAuditLog(
      currentUser,
      'SINKRONISASI_PAYROLL',
      period,
      `Menyinkronkan draf gaji untuk ${activeEmployees.length} karyawan aktif`
    );
    setAuditLogs(getStoredAuditLogs());
    addToast('success', 'Draf Penggajian Disinkronkan', `${activeEmployees.length} slip gaji karyawan aktif berhasil diperbarui.`);
  };

  // Approve Payroll Batch -> Automatically records financial expense transaction!
  const handleApprovePayrollBatch = (period: string) => {
    if (!checkPermission(currentUser.role, 'PAYROLL_APPROVE')) {
      addToast('error', 'Otorisasi Terbatas', 'Hanya Admin atau Owner yang dapat menyetujui penggajian.');
      return;
    }

    const unapproved = payrollRecords.filter((p) => p.paymentStatus !== 'Disetujui & Dicatat');
    if (unapproved.length === 0) {
      addToast('info', 'Sudah Disetujui', 'Seluruh slip periode ini sudah disetujui sebelumnya.');
      return;
    }

    const totalNetToPay = unapproved.reduce((acc, curr) => acc + curr.netSalary, 0);

    // Update payroll status
    const updated = payrollRecords.map((p) => ({
      ...p,
      paymentStatus: 'Disetujui & Dicatat' as const,
      approvalDate: '2026-10-20',
    }));
    setPayrollRecords(updated);

    // Create a corresponding transaction in finance transactions
    const expenseTransaction: FinancialTransaction = {
      id: 'TRX-PAY-' + Date.now(),
      code: `KAS-OUT-${Date.now().toString().slice(-4)}`,
      date: '2026-10-20',
      type: 'keluar',
      category: 'Beban Gaji Karyawan',
      amount: totalNetToPay,
      description: `Pembayaran Gaji Periode ${period} (${unapproved.length} Karyawan Unit Cimanggu Terotorisasi)`,
      relatedEmployeeId: 'BATCH-OCT26',
      relatedEmployeeName: `Batch ${unapproved.length} Karyawan Aktif`,
      status: 'Disetujui',
      approvedBy: currentUser.name,
      paymentMethod: 'Payroll Mandiri Auto-Debet Perusahaan',
    };

    setTransactions((prev) => [expenseTransaction, ...prev]);

    addAuditLog(
      currentUser,
      'SETUJUI_PENGGAJIAN',
      period,
      `Persetujuan resmi payroll ${period} senilai Rp ${totalNetToPay.toLocaleString('id-ID')} dicatat ke pengeluaran keuangan`
    );
    setAuditLogs(getStoredAuditLogs());

    addToast(
      'success',
      'Penggajian Disetujui & Dicatat!',
      `Beban gaji sebesar Rp ${totalNetToPay.toLocaleString('id-ID')} resmi dibukukan ke Arus Kas Keuangan.`
    );
  };

  // Reset to Simulation Defaults
  const handleResetSimulation = () => {
    if (confirm('Kembalikan seluruh data karyawan, keuangan, dan payroll ke data contoh awal simulasi?')) {
      resetToSimulationDefaults();
      setEmployees(getStoredEmployees());
      setTransactions(getStoredTransactions());
      setPayrollRecords(getStoredPayroll());
      setAuditLogs([]);
      addToast('info', 'Data Direset', 'Sistem kembali ke data contoh simulasi awal Wangsa Manawi Group.');
    }
  };

  // Header Title & Breadcrumb depending on activeTab
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'employees':
        return {
          title: 'Manajemen Karyawan',
          breadcrumbs: ['Wangsa Manawi Cimanggu', 'SDM & Umum', 'Manajemen Karyawan'],
        };
      case 'dashboard':
        return {
          title: 'Dashboard Ringkasan Eksekutif',
          breadcrumbs: ['Wangsa Manawi Cimanggu', 'Ringkasan'],
        };
      case 'transactions':
        return {
          title: 'Arus Kas & Buku Kas Umum',
          breadcrumbs: ['Wangsa Manawi Cimanggu', 'Keuangan', 'Arus Kas'],
        };
      case 'payroll':
        return {
          title: 'Penggajian & Beban SDM',
          breadcrumbs: ['Wangsa Manawi Cimanggu', 'Keuangan', 'Penggajian'],
        };
      case 'reports':
        return {
          title: 'Laporan Keuangan Konsolidasi',
          breadcrumbs: ['Wangsa Manawi Cimanggu', 'Laporan'],
        };
      default:
        return {
          title: 'Sistem Informasi Pengelolaan Keuangan',
          breadcrumbs: ['Wangsa Manawi Cimanggu'],
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        totalEmployees={employees.length}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onResetData={handleResetSimulation}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Header with Breadcrumbs & User Role Switcher */}
        <Header
          title={headerInfo.title}
          breadcrumbs={headerInfo.breadcrumbs}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAudit={() => setIsAuditModalOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB: MANAJEMEN KARYAWAN (MODUL UTAMA) */}
          {activeTab === 'employees' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Stats Cards */}
              <EmployeeStatsCards
                employees={employees}
                selectedDepartment={selectedDepartment}
                onSelectDepartment={setSelectedDepartment}
              />

              {/* Employees Table */}
              <EmployeeTable
                employees={employees}
                currentUser={currentUser}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                onOpenAddModal={handleOpenAddModal}
                onOpenDetailModal={handleOpenDetailModal}
                onOpenEditModal={handleOpenEditModal}
                onToggleStatus={handleOpenToggleStatus}
                onConfirmDelete={handleOpenDelete}
              />
            </div>
          )}

          {/* TAB: DASHBOARD RINGKASAN */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Overview Kombinasi Keuangan & SDM */}
              <FinanceOverview
                transactions={transactions}
                currentUser={currentUser}
                onAddTransaction={handleAddTransaction}
                onNavigateToPayroll={() => setActiveTab('payroll')}
              />

              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Ringkasan Ketenagakerjaan Unit Cimanggu
                    </h3>
                    <p className="text-xs text-slate-400">
                      Integrasi data SDM aktif dengan beban operasional
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('employees')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Buka Modul Manajemen Karyawan &rarr;
                  </button>
                </div>
                <EmployeeStatsCards
                  employees={employees}
                  selectedDepartment={selectedDepartment}
                  onSelectDepartment={setSelectedDepartment}
                />
              </div>
            </div>
          )}

          {/* TAB: ARUS KAS & TRANSAKSI */}
          {activeTab === 'transactions' && (
            <div className="animate-in fade-in duration-200">
              <FinanceOverview
                transactions={transactions}
                currentUser={currentUser}
                onAddTransaction={handleAddTransaction}
                onNavigateToPayroll={() => setActiveTab('payroll')}
              />
            </div>
          )}

          {/* TAB: PENGGAJIAN / PAYROLL (INTEGRASI SDM & KEUANGAN) */}
          {activeTab === 'payroll' && (
            <div className="animate-in fade-in duration-200">
              <PayrollModule
                employees={employees}
                payrollRecords={payrollRecords}
                currentUser={currentUser}
                onSyncDrafts={handleSyncPayrollDrafts}
                onApprovePayrollBatch={handleApprovePayrollBatch}
                onBackToEmployees={() => setActiveTab('employees')}
              />
            </div>
          )}

          {/* TAB: LAPORAN KEUANGAN */}
          {activeTab === 'reports' && (
            <div className="animate-in fade-in duration-200">
              <FinancialReports
                employees={employees}
                transactions={transactions}
                payrollRecords={payrollRecords}
                currentUser={currentUser}
              />
            </div>
          )}
        </main>
      </div>

      {/* MODAL: FORM TAMBAH / EDIT KARYAWAN */}
      <EmployeeModalForm
        isOpen={isFormModalOpen}
        isEdit={isEditMode}
        initialData={editingEmployee}
        existingEmployees={employees}
        currentUser={currentUser}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveEmployee}
      />

      {/* MODAL: DETAIL KARYAWAN */}
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        employee={detailEmployee}
        currentUser={currentUser}
        payrollRecords={payrollRecords}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(emp) => {
          setIsDetailModalOpen(false);
          handleOpenEditModal(emp);
        }}
        onOpenPayroll={(emp) => {
          setIsDetailModalOpen(false);
          setActiveTab('payroll');
        }}
      />

      {/* MODAL: KONFIRMASI HAPUS / UBAH STATUS */}
      <DeleteConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        employee={confirmModal.employee}
        onClose={() => setConfirmModal({ isOpen: false, type: 'delete', employee: null })}
        onConfirm={handleExecuteConfirm}
      />

      {/* MODAL: AUDIT LOG & HAK AKSES */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
        currentUser={currentUser}
      />
    </div>
  );
}
