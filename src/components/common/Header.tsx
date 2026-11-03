import React from 'react';
import { ShieldCheck, Printer, Sun, Moon, RotateCcw, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useK3Data } from '../../context/K3DataContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { resetToSeed } = useK3Data();

  const handlePrint = () => {
    window.print();
  };

  const handleResetData = () => {
    if (window.confirm('Kembalikan seluruh data ke versi awal Excel (seed)? Perubahan Anda akan direset.')) {
      resetToSeed();
    }
  };

  return (
    <header className="bg-[#354F52] dark:bg-[#1e292d] text-white shadow-md transition-colors sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3.5">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 -ml-1 text-gray-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="p-2.5 bg-[#6B8E6B] rounded-xl shadow-inner flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
              K3 SAFETY MONITORING
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              Occupational Safety Risk Dashboard
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 no-print">
          {/* Reset to Excel Button */}
          <button
            onClick={handleResetData}
            title="Reset ke Data Excel Asli"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-emerald-50 transition-colors border border-white/15 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reset ke Data Excel</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            title="Cetak atau Simpan PDF"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-[#6B8E6B] hover:bg-[#587758] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak / PDF</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

