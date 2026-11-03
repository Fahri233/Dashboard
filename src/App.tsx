import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import { K3DataProvider } from './context/K3DataContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PengolahanPage } from './pages/PengolahanPage';
import { DatabasePage } from './pages/DatabasePage';
import { KualitasDataPage } from './pages/KualitasDataPage';

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
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
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/pengolahan" element={<PengolahanPage />} />
                    <Route path="/database" element={<DatabasePage />} />
                    <Route path="/kualitas-data" element={<KualitasDataPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </BrowserRouter>
        </K3DataProvider>
      </FilterProvider>
    </ThemeProvider>
  );
};

export default App;

