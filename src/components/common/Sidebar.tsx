import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TableProperties, Database, ShieldAlert, X } from 'lucide-react';
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs no-print"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static no-print flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-100 dark:border-gray-700">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Menu Navigasi</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
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

