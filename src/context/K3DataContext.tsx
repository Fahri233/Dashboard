import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import seedData from '../data/seed.json';
import { K3Finding } from '../types/k3';
import { useFilter } from './FilterContext';
import { filterFindings } from '../lib/k3-calculations';

const STORAGE_KEY = 'k3_safety_findings_v1';

interface K3DataContextType {
  findings: K3Finding[];
  filteredFindings: K3Finding[];
  addFinding: (item: Omit<K3Finding, 'id' | 'no'>) => K3Finding;
  updateFinding: (item: K3Finding) => void;
  deleteFinding: (id: string) => void;
  resetToSeed: () => void;
  importFindings: (imported: K3Finding[], mode?: 'replace' | 'append') => void;
  getFindingById: (id: string) => K3Finding | undefined;
  getFindingByNo: (no: number) => K3Finding | undefined;
}

const K3DataContext = createContext<K3DataContextType | undefined>(undefined);

export const K3DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { filter } = useFilter();

  const [findings, setFindings] = useState<K3Finding[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Gagal membaca localStorage, memuat seed.json...', e);
    }
    return seedData as K3Finding[];
  });

  // Persist to localStorage whenever findings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(findings));
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage', e);
    }
  }, [findings]);

  const filteredFindings = useMemo(() => {
    return filterFindings(findings, filter);
  }, [findings, filter]);

  const addFinding = (item: Omit<K3Finding, 'id' | 'no'>): K3Finding => {
    const maxNo = findings.reduce((max, f) => (f.no > max ? f.no : max), 0);
    const newNo = maxNo + 1;
    const newFinding: K3Finding = {
      ...item,
      id: `K3-${newNo}-${Date.now()}`,
      no: newNo
    };

    setFindings(prev => [...prev, newFinding]);
    return newFinding;
  };

  const updateFinding = (updated: K3Finding) => {
    setFindings(prev => prev.map(f => (f.id === updated.id || f.no === updated.no ? updated : f)));
  };

  const deleteFinding = (id: string) => {
    setFindings(prev => prev.filter(f => f.id !== id && String(f.no) !== id));
  };

  const resetToSeed = () => {
    const seed = seedData as K3Finding[];
    setFindings(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  };

  const importFindings = (imported: K3Finding[], mode: 'replace' | 'append' = 'replace') => {
    if (mode === 'replace') {
      setFindings(imported);
    } else {
      let currentMaxNo = findings.reduce((max, f) => (f.no > max ? f.no : max), 0);
      const renumbered = imported.map(item => {
        currentMaxNo++;
        return {
          ...item,
          id: `K3-${currentMaxNo}-${Date.now()}`,
          no: currentMaxNo
        };
      });
      setFindings(prev => [...prev, ...renumbered]);
    }
  };

  const getFindingById = (id: string): K3Finding | undefined => {
    return findings.find(f => f.id === id || String(f.no) === id);
  };

  const getFindingByNo = (no: number): K3Finding | undefined => {
    return findings.find(f => f.no === no);
  };

  return (
    <K3DataContext.Provider
      value={{
        findings,
        filteredFindings,
        addFinding,
        updateFinding,
        deleteFinding,
        resetToSeed,
        importFindings,
        getFindingById,
        getFindingByNo
      }}
    >
      {children}
    </K3DataContext.Provider>
  );
};

export const useK3Data = (): K3DataContextType => {
  const context = useContext(K3DataContext);
  if (!context) {
    throw new Error('useK3Data must be used within a K3DataProvider');
  }
  return context;
};
