import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { FilterProvider } from './context/FilterContext';
import { K3DataProvider } from './context/K3DataContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Code Splitting (Lazy Loading) untuk merampingkan ukuran bundle awal
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage }))
);
const PengolahanPage = lazy(() =>
  import('./pages/PengolahanPage').then(module => ({ default: module.PengolahanPage }))
);
const DatabasePage = lazy(() =>
  import('./pages/DatabasePage').then(module => ({ default: module.DatabasePage }))
);
const KualitasDataPage = lazy(() =>
  import('./pages/KualitasDataPage').then(module => ({ default: module.KualitasDataPage }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-3.5">
    <div className="w-9 h-9 border-3 border-[#354F52] dark:border-[#6B8E6B] border-t-transparent rounded-full animate-spin" />
    <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
      Memuat halaman...
    </p>
  </div>
);

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <FilterProvider>
          <K3DataProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-[#F7F9F5] dark:bg-gray-900 transition-colors">
                {/* Header Banner */}
                <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

                {/* Main Content Area with Sidebar */}
                <div className="flex flex-1">
                  {/* Sidebar Navigation */}
                  <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                  {/* Page Content */}
                  <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
                    <Suspense fallback={<PageLoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/pengolahan" element={<PengolahanPage />} />
                        <Route path="/database" element={<DatabasePage />} />
                        <Route path="/kualitas-data" element={<KualitasDataPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              </div>
            </BrowserRouter>
          </K3DataProvider>
        </FilterProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
