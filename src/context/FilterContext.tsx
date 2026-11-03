import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  FilterState,
  KategoriType,
  LokasiType,
  StatusType,
  TingkatRisikoType,
  VALID_KATEGORI,
  VALID_LOKASI,
  VALID_STATUS,
  VALID_TINGKAT_RISIKO
} from '../types/k3';

interface FilterContextType {
  filter: FilterState;
  toggleLokasi: (lokasi: LokasiType) => void;
  toggleKategori: (kategori: KategoriType) => void;
  toggleTingkatRisiko: (risiko: TingkatRisikoType) => void;
  toggleStatus: (status: StatusType) => void;
  setStartDate: (date?: string) => void;
  setEndDate: (date?: string) => void;
  setSearchQuery: (query?: string) => void;
  resetFilter: () => void;
  isFilterActive: boolean;
}

const defaultFilter: FilterState = {
  lokasi: [...VALID_LOKASI],
  kategori: [...VALID_KATEGORI],
  tingkatRisiko: [...VALID_TINGKAT_RISIKO],
  status: [...VALID_STATUS],
  startDate: undefined,
  endDate: undefined,
  searchQuery: ''
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  const toggleLokasi = (loc: LokasiType) => {
    setFilter(prev => {
      const exists = prev.lokasi.includes(loc);
      const updated = exists ? prev.lokasi.filter(l => l !== loc) : [...prev.lokasi, loc];
      return { ...prev, lokasi: updated };
    });
  };

  const toggleKategori = (kat: KategoriType) => {
    setFilter(prev => {
      const exists = prev.kategori.includes(kat);
      const updated = exists ? prev.kategori.filter(k => k !== kat) : [...prev.kategori, kat];
      return { ...prev, kategori: updated };
    });
  };

  const toggleTingkatRisiko = (risk: TingkatRisikoType) => {
    setFilter(prev => {
      const exists = prev.tingkatRisiko.includes(risk);
      const updated = exists ? prev.tingkatRisiko.filter(r => r !== risk) : [...prev.tingkatRisiko, risk];
      return { ...prev, tingkatRisiko: updated };
    });
  };

  const toggleStatus = (st: StatusType) => {
    setFilter(prev => {
      const exists = prev.status.includes(st);
      const updated = exists ? prev.status.filter(s => s !== st) : [...prev.status, st];
      return { ...prev, status: updated };
    });
  };

  const setStartDate = (date?: string) => {
    setFilter(prev => ({ ...prev, startDate: date || undefined }));
  };

  const setEndDate = (date?: string) => {
    setFilter(prev => ({ ...prev, endDate: date || undefined }));
  };

  const setSearchQuery = (query?: string) => {
    setFilter(prev => ({ ...prev, searchQuery: query || '' }));
  };

  const resetFilter = () => {
    setFilter(defaultFilter);
  };

  const isFilterActive = useMemo(() => {
    const isLokasiChanged = filter.lokasi.length !== VALID_LOKASI.length;
    const isKategoriChanged = filter.kategori.length !== VALID_KATEGORI.length;
    const isRisikoChanged = filter.tingkatRisiko.length !== VALID_TINGKAT_RISIKO.length;
    const isStatusChanged = filter.status.length !== VALID_STATUS.length;
    const hasDate = Boolean(filter.startDate || filter.endDate);
    const hasSearch = Boolean(filter.searchQuery && filter.searchQuery.trim() !== '');

    return isLokasiChanged || isKategoriChanged || isRisikoChanged || isStatusChanged || hasDate || hasSearch;
  }, [filter]);

  return (
    <FilterContext.Provider
      value={{
        filter,
        toggleLokasi,
        toggleKategori,
        toggleTingkatRisiko,
        toggleStatus,
        setStartDate,
        setEndDate,
        setSearchQuery,
        resetFilter,
        isFilterActive
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

