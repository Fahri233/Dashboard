import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  K3Finding,
  LokasiType,
  KategoriType,
  TingkatRisikoType,
  StatusType,
  VALID_LOKASI,
  VALID_KATEGORI,
  VALID_TINGKAT_RISIKO,
  VALID_STATUS
} from '../../types/k3';
import { AlertTriangle } from 'lucide-react';

interface FindingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (finding: Omit<K3Finding, 'id'>) => void | Promise<void>;
  initialData?: K3Finding | null;
  nextNo: number;
}

export const FindingFormModal: React.FC<FindingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  nextNo
}) => {
  const [no, setNo] = useState<number>(nextNo);
  const [tanggalIso, setTanggalIso] = useState<string>('');
  const [lokasi, setLokasi] = useState<LokasiType>('Meja Pendaftaran');
  const [aktivitas, setAktivitas] = useState<string>('');
  const [potensiBahaya, setPotensiBahaya] = useState<string>('');
  const [kategori, setKategori] = useState<KategoriType>('Ergonomi');
  const [tingkatRisiko, setTingkatRisiko] = useState<TingkatRisikoType>('Sedang');
  const [pengendalian, setPengendalian] = useState<string>('');
  const [status, setStatus] = useState<StatusType>('Proses');
  const [keterangan, setKeterangan] = useState<string>('-');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [futureDateWarning, setFutureDateWarning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setNo(initialData.no);
      setTanggalIso(initialData.tanggalIso);
      setLokasi(initialData.lokasi);
      setAktivitas(initialData.aktivitas);
      setPotensiBahaya(initialData.potensiBahaya);
      setKategori(initialData.kategori);
      setTingkatRisiko(initialData.tingkatRisiko);
      setPengendalian(initialData.pengendalian);
      setStatus(initialData.status);
      setKeterangan(initialData.keterangan || '-');
    } else {
      setNo(nextNo);
      const today = new Date().toISOString().split('T')[0];
      setTanggalIso(today);
      setLokasi('Meja Pendaftaran');
      setAktivitas('');
      setPotensiBahaya('');
      setKategori('Ergonomi');
      setTingkatRisiko('Sedang');
      setPengendalian('');
      setStatus('Proses');
      setKeterangan('-');
    }
    setErrors({});
  }, [initialData, nextNo, isOpen]);

  useEffect(() => {
    if (tanggalIso) {
      const today = new Date().toISOString().split('T')[0];
      setFutureDateWarning(tanggalIso > today);
    } else {
      setFutureDateWarning(false);
    }
  }, [tanggalIso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!tanggalIso) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!aktivitas.trim()) newErrors.aktivitas = 'Aktivitas wajib diisi';
    if (!potensiBahaya.trim()) newErrors.potensiBahaya = 'Potensi bahaya wajib diisi';
    if (!pengendalian.trim()) newErrors.pengendalian = 'Pengendalian wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert YYYY-MM-DD to DD/MM/YYYY
    const [y, m, d] = tanggalIso.split('-');
    const ddMmYyyy = `${d}/${m}/${y}`;

    setIsSubmitting(true);
    try {
      await onSubmit({
        no,
        tanggal: ddMmYyyy,
        tanggalIso,
        lokasi,
        aktivitas: aktivitas.trim(),
        potensiBahaya: potensiBahaya.trim(),
        kategori,
        tingkatRisiko,
        pengendalian: pengendalian.trim(),
        status,
        keterangan: keterangan.trim() || '-'
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Temuan K3 (No: ${initialData.no})` : `Tambah Temuan K3 Baru (No: ${no})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {futureDateWarning && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Perhatian:</strong> Tanggal yang Anda pilih berada di masa depan. Anda tetap dapat menyimpannya jika ini memang data terencana.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* No (Read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nomor Temuan
            </label>
            <input
              type="number"
              value={no}
              readOnly
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-semibold cursor-not-allowed"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Temuan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalIso}
              onChange={e => setTanggalIso(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
              required
            />
            {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
          </div>

          {/* Lokasi Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <select
              value={lokasi}
              onChange={e => setLokasi(e.target.value as LokasiType)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
            >
              {VALID_LOKASI.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Aktivitas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Aktivitas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={aktivitas}
              onChange={e => setAktivitas(e.target.value)}
              placeholder="Contoh: Pendaftaran pasien"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
              required
            />
            {errors.aktivitas && <p className="text-red-500 text-xs mt-1">{errors.aktivitas}</p>}
          </div>

          {/* Potensi Bahaya */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Potensi Bahaya <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={potensiBahaya}
              onChange={e => setPotensiBahaya(e.target.value)}
              placeholder="Contoh: Postur duduk tidak ergonomis"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
              required
            />
            {errors.potensiBahaya && <p className="text-red-500 text-xs mt-1">{errors.potensiBahaya}</p>}
          </div>

          {/* Kategori Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={kategori}
              onChange={e => setKategori(e.target.value as KategoriType)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
            >
              {VALID_KATEGORI.map(kat => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          {/* Tingkat Risiko Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tingkat Risiko <span className="text-red-500">*</span>
            </label>
            <select
              value={tingkatRisiko}
              onChange={e => setTingkatRisiko(e.target.value as TingkatRisikoType)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
            >
              {VALID_TINGKAT_RISIKO.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Pengendalian */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Pengendalian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pengendalian}
              onChange={e => setPengendalian(e.target.value)}
              placeholder="Contoh: Atur posisi kursi dan monitor"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
              required
            />
            {errors.pengendalian && <p className="text-red-500 text-xs mt-1">{errors.pengendalian}</p>}
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Status Tindak Lanjut <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as StatusType)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
            >
              {VALID_STATUS.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Default: -"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#354F52]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : initialData ? (
              'Simpan Perubahan'
            ) : (
              'Tambah Temuan'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

