
import React from 'react';
import { FaTrophy, FaClock, FaChartLine } from 'react-icons/fa';

/**
 * ResultStat: Beautiful, accessible, and responsive stat card for quiz results.
 */
const ICONS = {
  trophy: FaTrophy,
  clock: FaClock,
  chart: FaChartLine,
};

const ResultStat = React.memo(function ResultStat({ icon, label, value }) {
  const Icon = ICONS[icon] || FaTrophy;
  return (
    <div className="bg-gray-light/40 dark:bg-background-dark p-4 sm:p-5 rounded-xl text-center shadow border border-gray-light flex flex-col items-center min-w-[110px]">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 mb-2">
        <Icon className="text-accent text-2xl" aria-hidden="true" />
      </span>
      <span className="text-xs text-gray-dark font-medium mb-1" aria-label={label}>{label}</span>
      <span className="text-lg sm:text-xl font-bold text-primary" aria-live="polite">{value}</span>
    </div>
  );
});

export default ResultStat;
