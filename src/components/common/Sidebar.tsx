import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TableProperties,
  Database,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import { useK3Data } from '../../context/K3DataContext';
import { detectDataQualityAnomalies } from '../../lib/data-quality';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { findings } = useK3Data();
  const anomalies = detectDataQualityAnomalies(findings);
  const warningCount = anomalies.length;

  // Tutup sidebar saat menekan tombol Escape di keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      to: '/pengolahan',
      label: 'Pengolahan Data',
      icon: <TableProperties className="w-5 h-5" />
    },
    {
      to: '/database',
      label: 'Database (CRUD)',
      icon: <Database className="w-5 h-5" />
    },
    {
      to: '/kualitas-data',
      label: 'Kualitas Data',
      icon: <ShieldAlert className="w-5 h-5" />,
      badge: warningCount > 0 ? warningCount : undefined
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 no-print"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl lg:shadow-none border-r border-gray-200 dark:border-gray-700/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] no-print flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile drawer header (hanya muncul saat mobile/tablet) */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#6B8E6B] rounded-xl text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-gray-900 dark:text-white block leading-tight">
                K3 MONITORING
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Menu Navigasi
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-[#354F52] text-white shadow-xs dark:bg-[#6B8E6B] dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/40 dark:bg-gray-800/40">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Total Temuan:</span>
            <span className="font-bold text-gray-900 dark:text-white">{findings.length}</span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
            K3 Risk Monitoring System v1.0
          </p>
        </div>
      </aside>
    </>
  );
};
