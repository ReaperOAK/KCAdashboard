import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

const UserActivityChart = React.memo(function UserActivityChart({ activityStats }) {
  const barColor = '#7646eb'; // accent
  const data = useMemo(() => ({
    labels: activityStats?.labels || [],
    datasets: [{
      label: 'Active Users',
      data: activityStats?.data || [],
      backgroundColor: barColor,
      borderRadius: 8,
      maxBarThickness: 36,
    }]
  }), [activityStats, barColor]);

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
    scales: {
      x: {
        ticks: { color: '#270185', font: { size: 13 } },
        grid: { color: '#c2c1d3', drawBorder: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#270185', font: { size: 13 } },
        grid: { color: '#c2c1d3', drawBorder: false },
      },
    },
  }), []);

  return (
    <section
      className="bg-background-light dark:bg-background-dark border-l-4 border-accent rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-xl w-full mx-auto transition-all duration-300"
      aria-label="User Activity"
      tabIndex={0}
    >
      <header className="mb-4 flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-primary dark:text-text-light tracking-tight">User Activity</h2>
      </header>
      <div className="relative w-full min-h-[260px] h-[260px] sm:h-[320px] md:h-[360px] flex items-center justify-center">
        <Bar data={data} options={options} aria-label="User Activity Chart" />
      </div>
    </section>
  );
});

export default UserActivityChart;
