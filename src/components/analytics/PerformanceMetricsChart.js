import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';

// Enhanced PerformanceMetricsChart: beautiful, responsive, accessible, and focused
const PerformanceMetricsChart = React.memo(function PerformanceMetricsChart({ performanceStats }) {
  // Memoized color tokens and labels to avoid changing dependencies
  const chartColors = useMemo(() => [
    '#461fa3', // secondary
    '#7646eb', // accent
    '#3b3a52', // gray.dark
    '#af0505'  // highlight
  ], []);
  const legendLabels = useMemo(() => ['Quizzes', 'Games', 'Tournaments', 'Classes'], []);
  const data = useMemo(() => ({
    labels: legendLabels,
    datasets: [{
      data: [
        performanceStats?.quizzes || 0,
        performanceStats?.games || 0,
        performanceStats?.tournaments || 0,
        performanceStats?.classes || 0
      ],
      backgroundColor: chartColors,
      borderWidth: 2,
      borderColor: '#f3f1f9', // background.light
      hoverOffset: 8
    }]
  }), [performanceStats, chartColors, legendLabels]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#270185', // text.dark
          font: { size: 14, family: 'inherit', weight: 'bold' },
          padding: 20,
          boxWidth: 18,
          boxHeight: 18,
        },
      },
      tooltip: {
        backgroundColor: '#200e4a',
        titleColor: '#e3e1f7',
        bodyColor: '#e3e1f7',
        borderColor: '#7646eb',
        borderWidth: 1,
      },
    },
    layout: { padding: 0 },
  }), []);

  return (
    <section
      className="bg-background-light dark:bg-background-dark border-l-4 border-accent rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-xl w-full mx-auto transition-all duration-300"
      aria-label="Performance Metrics"
      tabIndex={0}
    >
      <header className="mb-4 flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-primary dark:text-text-light tracking-tight">Performance Metrics</h2>
      </header>
      <div className="relative w-full min-h-[260px] h-[260px] sm:h-[320px] md:h-[360px] flex items-center justify-center">
        <Pie data={data} options={options} aria-label="Performance Metrics Chart" />
      </div>
    </section>
  );
});

export default PerformanceMetricsChart;
