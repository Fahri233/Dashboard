import React from 'react';
import { useK3Data } from '../context/K3DataContext';
import { KPICards } from '../components/dashboard/KPICards';
import { FilterSection } from '../components/dashboard/FilterSection';
import { CategoryBarChart } from '../components/dashboard/CategoryBarChart';
import { RiskDonutChart } from '../components/dashboard/RiskDonutChart';
import { TrendLineChart } from '../components/dashboard/TrendLineChart';
import { StatusHorizontalBarChart } from '../components/dashboard/StatusHorizontalBarChart';
import { AttentionPanel } from '../components/dashboard/AttentionPanel';
import { RecentFindingsTable } from '../components/dashboard/RecentFindingsTable';

export const DashboardPage: React.FC = () => {
  const { filteredFindings } = useK3Data();

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <KPICards findings={filteredFindings} />

      {/* Slicer / Multi-select Filter Section */}
      <FilterSection />

      {/* Panel Perlu Perhatian (Urgent High Risk Unresolved) */}
      <AttentionPanel findings={filteredFindings} />

      {/* 4 Recharts in 2x2 Grid (1 col on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bar Chart Potensi Bahaya per Kategori */}
        <CategoryBarChart findings={filteredFindings} />

        {/* Chart 2: Donut Chart Tingkat Risiko */}
        <RiskDonutChart findings={filteredFindings} />

        {/* Chart 3: Line Chart Tren Temuan K3 per Bulan (Fixed) */}
        <TrendLineChart findings={filteredFindings} />

        {/* Chart 4: Horizontal Bar Chart Status Tindak Lanjut */}
        <StatusHorizontalBarChart findings={filteredFindings} />
      </div>

      {/* Tabel Temuan Terbaru (Top 10, newest on top, no blank) */}
      <RecentFindingsTable findings={filteredFindings} />
    </div>
  );
};

