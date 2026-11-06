import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Upload,
  RotateCcw,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { K3Finding } from '../../types/k3';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmModal } from '../common/ConfirmModal';
import { FindingFormModal } from './FindingFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { exportToExcel, exportToCSV, parseUploadedExcel } from '../../lib/excel-export';
import { useK3Data } from '../../context/K3DataContext';
import { useToast } from '../../context/ToastContext';

type SortField = keyof K3Finding;
type SortOrder = 'asc' | 'desc';

export const DataTable: React.FC = () => {
  const {
    findings,
    addFinding,
    updateFinding,
    deleteFinding,
    resetToSeed,
    importFindings,
    refetch,
    isLoading
  } = useK3Data();
  const { showToast } = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Import Modal state
  const [importPending, setImportPending] = useState<K3Finding[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Local search and filter states for the table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLokasi, setSelectedLokasi] = useState<string>('ALL');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [selectedRisiko, setSelectedRisiko] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('no');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<K3Finding | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingFinding, setDeletingFinding] = useState<K3Finding | null>(null);

  // File input ref for Excel import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    return findings
      .filter(f => {
        // Search term filter across all fields
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const match =
            String(f.no).includes(q) ||
            f.tanggal.toLowerCase().includes(q) ||
            f.lokasi.toLowerCase().includes(q) ||
            f.aktivitas.toLowerCase().includes(q) ||
            f.potensiBahaya.toLowerCase().includes(q) ||
            f.kategori.toLowerCase().includes(q) ||
            f.tingkatRisiko.toLowerCase().includes(q) ||
            f.pengendalian.toLowerCase().includes(q) ||
            f.status.toLowerCase().includes(q) ||
            f.keterangan.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Dropdown filters
        if (selectedLokasi !== 'ALL' && f.lokasi !== selectedLokasi) return false;
        if (selectedKategori !== 'ALL' && f.kategori !== selectedKategori) return false;
        if (selectedRisiko !== 'ALL' && f.tingkatRisiko !== selectedRisiko) return false;
        if (selectedStatus !== 'ALL' && f.status !== selectedStatus) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'tanggal') {
          valA = a.tanggalIso;
          valB = b.tanggalIso;
        }

        if (typeof valA === 'string') {
          const comp = valA.localeCompare(String(valB));
          return sortOrder === 'asc' ? comp : -comp;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    findings,
    searchTerm,
    selectedLokasi,
    selectedKategori,
    selectedRisiko,
    selectedStatus,
    sortField,
    sortOrder
  ]);

  // Pagination calculation
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Next sequential number for add modal
  const nextNo = useMemo(() => {
    return findings.reduce((max, f) => (f.no > max ? f.no : max), 0) + 1;
  }, [findings]);

  // Import handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedExcel(file);
      if (parsed.length === 0) {
        showToast('Tidak ada baris data valid yang ditemukan pada file Excel.', 'warning');
        return;
      }
      setImportPending(parsed);
    } catch (err: any) {
      console.error(err);
      showToast('Gagal membaca file Excel. Pastikan format tabel memiliki kolom yang sesuai.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async (mode: 'replace' | 'append') => {
    if (!importPending) return;
    setIsImporting(true);
    try {
      await importFindings(importPending, mode);
      showToast(`Berhasil mengimpor ${importPending.length} data temuan (${mode === 'replace' ? 'Gantikan' : 'Tambahkan'})!`, 'success');
      setImportPending(null);
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengimpor data ke database', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      showToast('Data database berhasil disinkronkan!', 'success');
    } catch (err: any) {
      showToast('Gagal menyinkronkan data database.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await resetToSeed();
      showToast('Database berhasil direset ke 22 temuan Excel asli!', 'success');
      setIsResetModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Gagal mereset database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(processedData, `K3_Database_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast(`Berhasil mengekspor ${processedData.length} data ke Excel!`, 'success');
    } catch (err) {
      showToast('Gagal mengekspor data ke Excel.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(processedData, `K3_Database_Export_${new Date().toISOString().split('T')[0]}.csv`);
      showToast(`Berhasil mengekspor ${processedData.length} data ke CSV!`, 'success');
    } catch (err) {
      showToast('Gagal mengekspor data ke CSV.', 'error');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#354F52] dark:text-[#6B8E6B]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#354F52] dark:text-[#6B8E6B]" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input for Excel upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Top Action Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari temuan (aktivitas, bahaya, dll.)..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-[#354F52] dark:focus:ring-[#6B8E6B]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingFinding(null);
              setIsFormOpen(true);
            }}
          >
            Tambah Temuan
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-4 h-4 text-emerald-600" />}
            onClick={() => fileInputRef.current?.click()}
            title="Import data dari file .xlsx"
          >
            Import Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-700" />}
            onClick={handleExportExcel}
            title="Export data yang sedang ditampilkan ke Excel"
          >
            Export Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-4 h-4 text-blue-600" />}
            onClick={handleExportCSV}
            title="Export data yang sedang ditampilkan ke CSV"
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Sinkronkan / Segarkan data dari database"
          >
            {isRefreshing ? 'Menyinkronkan...' : 'Segarkan'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5 text-gray-500" />}
            onClick={() => setIsResetModalOpen(true)}
            title="Reset ke Data Excel Asli"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Column Filter Bar */}
      <div className="bg-[#EAF0EC]/60 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-semibold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Kolom:</span>
        </div>

        {/* Lokasi Filter */}
        <select
          value={selectedLokasi}
          onChange={e => {
            setSelectedLokasi(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <option value="ALL">Semua Lokasi</option>
          <option value="Area Tunggu">Area Tunggu</option>
          <option value="Meja Pendaftaran">Meja Pendaftaran</option>
          <option value="Ruang Pelayanan">Ruang Pelayanan</option>
        </select>

        {/* Kategori Filter */}
        <select
          value={selectedKategori}
          onChange={e => {
            setSelectedKategori(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="Ergonomi">Ergonomi</option>
          <option value="Biologis">Biologis</option>
          <option value="Fisik">Fisik</option>
          <option value="Psikososial">Psikososial</option>
          <option value="Kimia">Kimia</option>
        </select>

        {/* Risiko Filter */}
        <select
          value={selectedRisiko}
          onChange={e => {
            setSelectedRisiko(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <option value="ALL">Semua Tingkat Risiko</option>
          <option value="Tinggi">Tinggi</option>
          <option value="Sedang">Sedang</option>
          <option value="Rendah">Rendah</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <option value="ALL">Semua Status</option>
          <option value="Belum">Belum</option>
          <option value="Proses">Proses</option>
          <option value="Selesai">Selesai</option>
        </select>

        {(selectedLokasi !== 'ALL' || selectedKategori !== 'ALL' || selectedRisiko !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedLokasi('ALL');
              setSelectedKategori('ALL');
              setSelectedRisiko('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium cursor-pointer"
          >
            Hapus Filter
          </button>
        )}
      </div>

      {/* 10-Column Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#EAF0EC]/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700 select-none">
              <tr>
                <th
                  onClick={() => handleSort('no')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>No</span>
                    {renderSortIcon('no')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('tanggal')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tanggal</span>
                    {renderSortIcon('tanggal')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('lokasi')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Lokasi</span>
                    {renderSortIcon('lokasi')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('aktivitas')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Aktivitas</span>
                    {renderSortIcon('aktivitas')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('potensiBahaya')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group min-w-[160px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Potensi Bahaya</span>
                    {renderSortIcon('potensiBahaya')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('kategori')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kategori</span>
                    {renderSortIcon('kategori')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('tingkatRisiko')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tingkat Risiko</span>
                    {renderSortIcon('tingkatRisiko')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('pengendalian')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group min-w-[160px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Pengendalian</span>
                    {renderSortIcon('pengendalian')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('keterangan')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Keterangan</span>
                    {renderSortIcon('keterangan')}
                  </div>
                </th>

                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#354F52] border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data dari database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">
                    Tidak ada data temuan yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedData.map(f => (
                  <tr
                    key={f.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="py-3 px-3.5 font-bold text-gray-900 dark:text-white">
                      {f.no}
                    </td>

                    <td className="py-3 px-3.5 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {f.tanggal}
                    </td>

                    <td className="py-3 px-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {f.lokasi}
                    </td>

                    <td className="py-3 px-3.5 text-gray-700 dark:text-gray-300">
                      {f.aktivitas}
                    </td>

                    <td className="py-3 px-3.5 font-medium text-gray-900 dark:text-white">
                      {f.potensiBahaya}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <Badge type="kategori" value={f.kategori} size="sm" />
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <Badge type="risiko" value={f.tingkatRisiko} size="sm" />
                    </td>

                    <td className="py-3 px-3.5 text-gray-700 dark:text-gray-300">
                      {f.pengendalian}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <Badge type="status" value={f.status} size="sm" />
                    </td>

                    <td className="py-3 px-3.5 text-gray-500 dark:text-gray-400 text-xs">
                      {f.keterangan}
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingFinding(f);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingFinding(f);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-gray-50/70 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-gray-400">|</span>
            <span>
              Menampilkan {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} temuan
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium">
              Hal {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              aria-label="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <FindingFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFinding(null);
        }}
        initialData={editingFinding}
        nextNo={nextNo}
        onSubmit={async data => {
          try {
            if (editingFinding) {
              await updateFinding({ ...data, id: editingFinding.id });
              showToast(`Perubahan temuan #${editingFinding.no} berhasil disimpan!`, 'success');
            } else {
              const res = await addFinding(data);
              showToast(`Temuan K3 baru #${res.no} berhasil ditambahkan!`, 'success');
            }
          } catch (err: any) {
            showToast(err?.message || 'Gagal menyimpan data temuan', 'error');
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingFinding(null);
        }}
        finding={deletingFinding}
        onConfirm={async () => {
          if (deletingFinding) {
            try {
              await deleteFinding(deletingFinding.id);
              showToast(`Temuan #${deletingFinding.no} berhasil dihapus!`, 'info');
            } catch (err: any) {
              showToast(err?.message || 'Gagal menghapus temuan', 'error');
            }
          }
        }}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Data ke Excel Asli"
        message="Apakah Anda yakin ingin mengembalikan seluruh isi tabel database ke 22 temuan Excel asli?\n\nSemua perubahan baru atau hasil editan akan digantikan dengan data bawaan."
        confirmLabel="Ya, Reset Database"
        cancelLabel="Batal"
        variant="warning"
        isLoading={isResetting}
        onConfirm={handleResetConfirm}
        onClose={() => setIsResetModalOpen(false)}
      />

      {/* Import Choice Modal */}
      {importPending && (
        <ConfirmModal
          isOpen={!!importPending}
          title="Konfirmasi Impor Data Excel"
          message={`Ditemukan ${importPending.length} baris data temuan dari file Excel.\n\nPilih "Gantikan Semua" untuk menimpa seluruh data saat ini, atau "Batal" jika Anda ingin memeriksa kembali file.`}
          confirmLabel="Gantikan Semua Data"
          cancelLabel="Batal"
          variant="primary"
          isLoading={isImporting}
          onConfirm={() => handleConfirmImport('replace')}
          onClose={() => setImportPending(null)}
        />
      )}
    </div>
  );
};
