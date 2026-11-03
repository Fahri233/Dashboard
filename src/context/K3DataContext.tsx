import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
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
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json as T;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const K3DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { filter } = useFilter();

  const [findings, setFindings] = useState<K3Finding[]>([]);
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
      setFindings(json.data);
    } catch (err: any) {
      console.error('Gagal memuat data dari Turso:', err);
      setError(err.message || 'Gagal memuat data');
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

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addFinding = useCallback(
    async (item: Omit<K3Finding, 'id' | 'no'>): Promise<K3Finding> => {
      const maxNo = findings.reduce((max, f) => (f.no > max ? f.no : max), 0);
      const newNo = maxNo + 1;
      const newFinding: Omit<K3Finding, 'id'> & { id: string } = {
        ...item,
        id: `K3-${newNo}-${Date.now()}`,
        no: newNo,
      };

      const json = await apiFetch<{ success: boolean; data: K3Finding }>(
        `${API_BASE}/findings`,
        { method: 'POST', body: JSON.stringify(newFinding) }
      );

      setFindings(prev => [...prev, json.data]);
      return json.data;
    },
    [findings]
  );

  const updateFinding = useCallback(async (updated: K3Finding): Promise<void> => {
    const json = await apiFetch<{ success: boolean; data: K3Finding }>(
      `${API_BASE}/findings/${updated.id}`,
      { method: 'PUT', body: JSON.stringify(updated) }
    );
    setFindings(prev => prev.map(f => (f.id === updated.id ? json.data : f)));
  }, []);

  const deleteFinding = useCallback(async (id: string): Promise<void> => {
    await apiFetch(`${API_BASE}/findings/${id}`, { method: 'DELETE' });
    setFindings(prev => prev.filter(f => f.id !== id && String(f.no) !== id));
  }, []);

  const resetToSeed = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiFetch(`${API_BASE}/findings/reset`, { method: 'POST' });
      await refetch();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [refetch]);

  const importFindings = useCallback(
    async (imported: K3Finding[], mode: 'replace' | 'append' = 'replace'): Promise<void> => {
      let toInsert: K3Finding[];

      if (mode === 'replace') {
        // Reset first, then insert all
        await apiFetch(`${API_BASE}/findings/reset`, { method: 'POST' });
        toInsert = imported.map((item, i) => ({
          ...item,
          id: `K3-${i + 1}-${Date.now()}`,
          no: i + 1,
        }));
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
      }

      // Insert each one (batch via sequential POSTs)
      for (const item of toInsert) {
        await apiFetch(`${API_BASE}/findings`, {
          method: 'POST',
          body: JSON.stringify(item),
        });
      }

      await refetch();
    },
    [findings, refetch]
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
