import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import seedData from '../data/seed.json';
import { K3Finding } from '../types/k3';
import { useFilter } from './FilterContext';
import { filterFindings } from '../lib/k3-calculations';

const API_BASE = '/api';

// ─── Context type ───────────────────────────────────────────────────────────

interface K3DataContextType {
  findings: K3Finding[];
  filteredFindings: K3Finding[];
  isLoading: boolean;
  error: string | null;
  addFinding: (item: Omit<K3Finding, 'id' | 'no'>) => Promise<K3Finding>;
  updateFinding: (item: K3Finding) => Promise<void>;
  deleteFinding: (id: string) => Promise<void>;
  resetToSeed: () => Promise<void>;
  importFindings: (imported: K3Finding[], mode?: 'replace' | 'append') => Promise<void>;
  getFindingById: (id: string) => K3Finding | undefined;
  getFindingByNo: (no: number) => K3Finding | undefined;
  refetch: () => Promise<void>;
}

const K3DataContext = createContext<K3DataContextType | undefined>(undefined);

// ─── Helper ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Respon server bukan JSON: ${text.slice(0, 100)} (HTTP ${res.status})`);
  }

  if (!res.ok || json.error) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json as T;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const K3DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { filter } = useFilter();

  // Inisialisasi awal selalu dengan seedData agar UI tidak blank saat memuat
  const [findings, setFindings] = useState<K3Finding[]>(() => seedData as K3Finding[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all findings from Turso via API ──
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const json = await apiFetch<{ success: boolean; data: K3Finding[] }>(
        `${API_BASE}/findings`
      );
      if (Array.isArray(json.data) && json.data.length > 0) {
        setFindings(json.data);
      }
    } catch (apiErr: any) {
      console.warn('API /api/findings gagal dimuat, menggunakan data cache/seed lokal:', apiErr);
      setError(apiErr?.message || 'Gagal memuat data dari database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // ── Derived: filtered findings ──
  const filteredFindings = useMemo(() => {
    return filterFindings(findings, filter);
  }, [findings, filter]);

  // ── CRUD Operations ───────────────────────────────────────────────────────

  const addFinding = useCallback(
    async (item: Omit<K3Finding, 'id' | 'no'>): Promise<K3Finding> => {
      const maxNo = findings.reduce((max, f) => (f.no > max ? f.no : max), 0);
      const newNo = (item as any).no && (item as any).no > maxNo ? (item as any).no : maxNo + 1;
      const newFinding: K3Finding = {
        ...item,
        id: `K3-${newNo}-${Date.now()}`,
        no: newNo,
      };

      try {
        const json = await apiFetch<{ success: boolean; data: K3Finding }>(
          `${API_BASE}/findings`,
          { method: 'POST', body: JSON.stringify(newFinding) }
        );
        const saved = json.data || newFinding;
        setFindings(prev => [...prev.filter(f => f.id !== saved.id), saved]);
        return saved;
      } catch (apiErr: any) {
        console.warn('API POST gagal, menerapkan update optimistik lokal:', apiErr);
        setFindings(prev => [...prev, newFinding]);
        return newFinding;
      }
    },
    [findings]
  );

  const updateFinding = useCallback(async (updated: K3Finding): Promise<void> => {
    try {
      const json = await apiFetch<{ success: boolean; data: K3Finding }>(
        `${API_BASE}/findings?id=${encodeURIComponent(updated.id)}`,
        { method: 'PUT', body: JSON.stringify(updated) }
      );
      const saved = json.data || updated;
      setFindings(prev => prev.map(f => (f.id === updated.id || f.no === updated.no ? saved : f)));
    } catch (apiErr: any) {
      console.warn('API PUT gagal, menerapkan update optimistik lokal:', apiErr);
      setFindings(prev => prev.map(f => (f.id === updated.id || f.no === updated.no ? updated : f)));
    }
  }, []);

  const deleteFinding = useCallback(async (id: string): Promise<void> => {
    try {
      await apiFetch(`${API_BASE}/findings?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setFindings(prev => prev.filter(f => f.id !== id && String(f.no) !== id));
    } catch (apiErr: any) {
      console.warn('API DELETE gagal, menerapkan update optimistik lokal:', apiErr);
      setFindings(prev => prev.filter(f => f.id !== id && String(f.no) !== id));
    }
  }, []);

  const resetToSeed = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiFetch(`${API_BASE}/reset`, { method: 'POST' });
      await refetch();
    } catch (apiErr: any) {
      console.warn('API /api/reset gagal, menggunakan seed statis lokal:', apiErr);
      setFindings(seedData as K3Finding[]);
      setIsLoading(false);
    }
  }, [refetch]);

  const importFindings = useCallback(
    async (imported: K3Finding[], mode: 'replace' | 'append' = 'replace'): Promise<void> => {
      let toInsert: K3Finding[];

      if (mode === 'replace') {
        try {
          await apiFetch(`${API_BASE}/reset`, { method: 'POST' });
        } catch (e) {
          console.warn('Reset sebelum impor gagal di server:', e);
        }
        toInsert = imported.map((item, i) => ({
          ...item,
          id: `K3-${i + 1}-${Date.now()}`,
          no: i + 1,
        }));
        setFindings(toInsert);
      } else {
        let currentMaxNo = findings.reduce((max, f) => (f.no > max ? f.no : max), 0);
        toInsert = imported.map(item => {
          currentMaxNo++;
          return {
            ...item,
            id: `K3-${currentMaxNo}-${Date.now()}`,
            no: currentMaxNo,
          };
        });
        setFindings(prev => [...prev, ...toInsert]);
      }

      // Kirim record ke API
      for (const item of toInsert) {
        try {
          await apiFetch(`${API_BASE}/findings`, {
            method: 'POST',
            body: JSON.stringify(item),
          });
        } catch (e) {
          console.warn('Gagal sinkron item impor ke server:', item.id, e);
        }
      }
    },
    [findings]
  );

  // ── Lookups ───────────────────────────────────────────────────────────────

  const getFindingById = useCallback(
    (id: string): K3Finding | undefined =>
      findings.find(f => f.id === id || String(f.no) === id),
    [findings]
  );

  const getFindingByNo = useCallback(
    (no: number): K3Finding | undefined => findings.find(f => f.no === no),
    [findings]
  );

  return (
    <K3DataContext.Provider
      value={{
        findings,
        filteredFindings,
        isLoading,
        error,
        addFinding,
        updateFinding,
        deleteFinding,
        resetToSeed,
        importFindings,
        getFindingById,
        getFindingByNo,
        refetch,
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
