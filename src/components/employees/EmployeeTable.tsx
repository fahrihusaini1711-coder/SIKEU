import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  Phone,
  Briefcase
} from 'lucide-react';
import { Employee, EmployeeStatus, UserSession } from '../../types';
import { checkPermission, exportToCSV } from '../../services/storageService';

interface EmployeeTableProps {
  employees: Employee[];
  currentUser: UserSession;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  onOpenAddModal: () => void;
  onOpenDetailModal: (employee: Employee) => void;
  onOpenEditModal: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
  onConfirmDelete: (employee: Employee) => void;
}

type SortField = 'fullName' | 'id' | 'startDate' | 'department' | 'status';
type SortOrder = 'asc' | 'desc';

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  currentUser,
  selectedDepartment,
  setSelectedDepartment,
  onOpenAddModal,
  onOpenDetailModal,
  onOpenEditModal,
  onToggleStatus,
  onConfirmDelete,
}) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | EmployeeStatus>('Semua');
  const [positionFilter, setPositionFilter] = useState('Semua');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Permission helpers
  const canCreate = checkPermission(currentUser.role, 'EMPLOYEE_CREATE');
  const canEdit = checkPermission(currentUser.role, 'EMPLOYEE_EDIT');
  const canDelete = checkPermission(currentUser.role, 'EMPLOYEE_DELETE');
  const canToggleStatus = checkPermission(currentUser.role, 'EMPLOYEE_STATUS_CHANGE');
  const canExport = checkPermission(currentUser.role, 'EXPORT_CSV');

  // Distinct Positions for filter
  const distinctPositions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.position));
    return Array.from(set).sort();
  }, [employees]);

  // Distinct Departments for filter
  const distinctDepartments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.department));
    return Array.from(set).sort();
  }, [employees]);

  // Filter & Sort logic
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // Search by name, id, email, position
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.position.toLowerCase().includes(q) ||
          (emp.phone && emp.phone.includes(q))
      );
    }

    // Filter Department
    if (selectedDepartment !== 'Semua') {
      result = result.filter((emp) => emp.department === selectedDepartment);
    }

    // Filter Status
    if (statusFilter !== 'Semua') {
      result = result.filter((emp) => emp.status === statusFilter);
    }

    // Filter Position
    if (positionFilter !== 'Semua') {
      result = result.filter((emp) => emp.position === positionFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [employees, searchTerm, selectedDepartment, statusFilter, positionFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-60" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
    );
  };

  const renderStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case 'Aktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Aktif
          </span>
        );
      case 'Cuti':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-700/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Cuti
          </span>
        );
      case 'Nonaktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-700/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Nonaktif
          </span>
        );
    }
  };

  // Helper Initials & Gradient for Avatar
  const getAvatarFallback = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'K').toUpperCase();
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, ID (WMG-HR-...), jabatan, atau email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Buttons: Export & Add Employee */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {canExport && (
            <button
              onClick={() => exportToCSV(filteredEmployees)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-medium border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
              title="Unduh data tabel dalam format CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>
          )}

          {canCreate ? (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Karyawan</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-sm font-medium border border-slate-700/60 cursor-not-allowed opacity-75"
              title="Hanya pengguna dengan hak akses Admin yang dapat menambah karyawan."
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Karyawan (Admin Only)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-4 sm:px-5 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filter Data:</span>
        </div>

        {/* Filter Departemen */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Divisi:</span>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Semua">Semua Divisi</option>
            {distinctDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Jabatan */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Jabatan:</span>
          <select
            value={positionFilter}
            onChange={(e) => {
              setPositionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Semua">Semua Jabatan</option>
            {distinctPositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'Semua' | EmployeeStatus);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif Saja</option>
            <option value="Cuti">Cuti Saja</option>
            <option value="Nonaktif">Nonaktif Saja</option>
          </select>
        </div>

        {/* Active Filters Clear Button */}
        {(selectedDepartment !== 'Semua' || statusFilter !== 'Semua' || positionFilter !== 'Semua' || searchTerm) && (
          <button
            onClick={() => {
              setSelectedDepartment('Semua');
              setStatusFilter('Semua');
              setPositionFilter('Semua');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="text-emerald-400 hover:text-emerald-300 font-medium ml-auto"
          >
            Reset Semua Filter
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1.5">
                  <span>ID Karyawan</span>
                  {getSortIcon('id')}
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Nama & Avatar</span>
                  {getSortIcon('fullName')}
                </div>
              </th>
              <th className="py-3.5 px-4">Jabatan</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Departemen</span>
                  {getSortIcon('department')}
                </div>
              </th>
              <th className="py-3.5 px-4">No. Telepon</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('startDate')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Tgl Masuk</span>
                  {getSortIcon('startDate')}
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="max-w-sm mx-auto flex flex-col items-center gap-2">
                    <Briefcase className="w-10 h-10 text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">Tidak ada data karyawan ditemukan</p>
                    <p className="text-xs text-slate-400">
                      Coba ubah kata kunci pencarian atau reset filter yang sedang aktif.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp, index) => {
                const globalIndex = startIndex + index + 1;
                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                      {globalIndex}
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {emp.id}
                      </span>
                    </td>

                    {/* Nama & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                            emp.avatarColor || 'from-emerald-600 to-teal-700'
                          } flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0 ring-1 ring-white/10`}
                        >
                          {getAvatarFallback(emp.fullName)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onOpenDetailModal(emp)}
                            className="font-semibold text-slate-100 hover:text-emerald-400 text-sm text-left truncate block transition-colors"
                            title="Klik untuk melihat profil lengkap"
                          >
                            {emp.fullName}
                          </button>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Jabatan */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200 font-medium text-xs">
                        {emp.position}
                      </span>
                    </td>

                    {/* Departemen */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        <Building2 className="w-3 h-3 text-emerald-400" />
                        {emp.department}
                      </span>
                    </td>

                    {/* No Telepon */}
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>

                    {/* Tanggal Masuk */}
                    <td className="py-3.5 px-4 text-xs text-slate-300 font-mono">
                      {emp.startDate}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(emp.status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Detail */}
                        <button
                          onClick={() => onOpenDetailModal(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Lihat Detail Profil Karyawan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        {canEdit ? (
                          <button
                            onClick={() => onOpenEditModal(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                            title="Edit Data Karyawan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 rounded-lg text-slate-700 cursor-not-allowed"
                            title="Hanya Admin yang dapat mengedit data karyawan."
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Toggle Status (Nonaktifkan / Aktifkan) */}
                        {canToggleStatus ? (
                          <button
                            onClick={() => onToggleStatus(emp)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              emp.status === 'Aktif'
                                ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                            }`}
                            title={
                              emp.status === 'Aktif'
                                ? 'Nonaktifkan Karyawan'
                                : 'Aktifkan Kembali Karyawan'
                            }
                          >
                            {emp.status === 'Aktif' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        ) : null}

                        {/* Delete */}
                        {canDelete && (
                          <button
                            onClick={() => onConfirmDelete(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Hapus Data Karyawan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      <div className="p-4 sm:p-5 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Menampilkan</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={5}>5 baris</option>
            <option value={10}>10 baris</option>
            <option value={20}>20 baris</option>
          </select>
          <span>dari total {filteredEmployees.length} karyawan</span>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-750 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-medium text-slate-300">
            Halaman {safeCurrentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-750 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
