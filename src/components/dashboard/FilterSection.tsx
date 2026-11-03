import React, { useState } from 'react';
import { Filter, RotateCcw, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useFilter } from '../../context/FilterContext';
import {
  VALID_LOKASI,
  VALID_KATEGORI,
  VALID_TINGKAT_RISIKO,
  VALID_STATUS,
  LokasiType,
  KategoriType,
  TingkatRisikoType,
  StatusType
} from '../../types/k3';

export const FilterSection: React.FC = () => {
  const {
    filter,
    toggleLokasi,
    toggleKategori,
    toggleTingkatRisiko,
    toggleStatus,
    setStartDate,
    setEndDate,
    resetFilter,
    isFilterActive
  } = useFilter();

  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="bg-[#EAF0EC] dark:bg-gray-800/80 rounded-2xl p-5 border border-emerald-100 dark:border-gray-700 shadow-xs transition-colors no-print">
      {/* Header bar of filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-200/60 dark:border-gray-700">
        <div className="flex items-center gap-2 text-[#354F52] dark:text-emerald-300">
          <Filter className="w-5 h-5 text-[#6B8E6B]" />
          <h2 className="text-sm font-bold uppercase tracking-wider">FILTER DATA (SLICER)</h2>
          {isFilterActive && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#6B8E6B] text-white">
              Filter Aktif
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDatePicker(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Rentang Tanggal</span>
            {showDatePicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={resetFilter}
            disabled={!isFilterActive}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-gray-200 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Optional Date Picker Accordion */}
      {showDatePicker && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-700/60 rounded-xl border border-emerald-100 dark:border-gray-600 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-600 dark:text-gray-300">Dari:</label>
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={e => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-600 dark:text-gray-300">Sampai:</label>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={e => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
          {(filter.startDate || filter.endDate) && (
            <button
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              Hapus Filter Tanggal
            </button>
          )}
        </div>
      )}

      {/* 4 Multi-Select Chip Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Grup 1: Lokasi */}
        <div className="bg-white/80 dark:bg-gray-700/50 p-3 rounded-xl border border-emerald-100/80 dark:border-gray-600/60">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Lokasi ({filter.lokasi.length}/{VALID_LOKASI.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VALID_LOKASI.map((loc: LokasiType) => {
              const active = filter.lokasi.includes(loc);
              return (
                <button
                  key={loc}
                  onClick={() => toggleLokasi(loc)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                    active
                      ? 'bg-[#354F52] text-white border-[#354F52] dark:bg-[#6B8E6B] dark:border-[#6B8E6B] shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 opacity-60'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grup 2: Kategori */}
        <div className="bg-white/80 dark:bg-gray-700/50 p-3 rounded-xl border border-emerald-100/80 dark:border-gray-600/60">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Kategori ({filter.kategori.length}/{VALID_KATEGORI.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VALID_KATEGORI.map((kat: KategoriType) => {
              const active = filter.kategori.includes(kat);
              return (
                <button
                  key={kat}
                  onClick={() => toggleKategori(kat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                    active
                      ? 'bg-[#354F52] text-white border-[#354F52] dark:bg-[#6B8E6B] dark:border-[#6B8E6B] shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 opacity-60'
                  }`}
                >
                  {kat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grup 3: Tingkat Risiko */}
        <div className="bg-white/80 dark:bg-gray-700/50 p-3 rounded-xl border border-emerald-100/80 dark:border-gray-600/60">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Tingkat Risiko ({filter.tingkatRisiko.length}/{VALID_TINGKAT_RISIKO.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VALID_TINGKAT_RISIKO.map((risk: TingkatRisikoType) => {
              const active = filter.tingkatRisiko.includes(risk);
              let activeColor = 'bg-gray-800 text-white border-gray-800';
              if (risk === 'Tinggi') activeColor = 'bg-red-600 text-white border-red-600';
              if (risk === 'Sedang') activeColor = 'bg-amber-500 text-white border-amber-500';
              if (risk === 'Rendah') activeColor = 'bg-emerald-600 text-white border-emerald-600';

              return (
                <button
                  key={risk}
                  onClick={() => toggleTingkatRisiko(risk)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                    active
                      ? `${activeColor} shadow-xs font-semibold`
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 opacity-60'
                  }`}
                >
                  {risk}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grup 4: Status */}
        <div className="bg-white/80 dark:bg-gray-700/50 p-3 rounded-xl border border-emerald-100/80 dark:border-gray-600/60">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Status ({filter.status.length}/{VALID_STATUS.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VALID_STATUS.map((st: StatusType) => {
              const active = filter.status.includes(st);
              let activeColor = 'bg-gray-800 text-white border-gray-800';
              if (st === 'Selesai') activeColor = 'bg-emerald-600 text-white border-emerald-600';
              if (st === 'Proses') activeColor = 'bg-blue-600 text-white border-blue-600';
              if (st === 'Belum') activeColor = 'bg-rose-600 text-white border-rose-600';

              return (
                <button
                  key={st}
                  onClick={() => toggleStatus(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                    active
                      ? `${activeColor} shadow-xs font-semibold`
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 opacity-60'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

