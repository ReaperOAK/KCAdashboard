import React from 'react';
import { FaTrophy, FaClock, FaChartLine } from 'react-icons/fa';

/**
 * Result stat card for quiz results page.
 */
const ICONS = {
  trophy: FaTrophy,
  clock: FaClock,
  chart: FaChartLine,
};

const ResultStat = React.memo(function ResultStat({ icon, label, value }) {
  const Icon = ICONS[icon] || FaTrophy;
  return (
    <div className="bg-gray-light/40 p-4 rounded-lg text-center">
      <Icon className="mx-auto text-accent text-xl mb-2" aria-hidden="true" />
      <p className="text-sm text-gray-dark">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
});

export default ResultStat;
