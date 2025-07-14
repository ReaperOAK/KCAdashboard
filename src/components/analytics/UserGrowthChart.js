import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

const UserGrowthChart = React.memo(function UserGrowthChart({ userStats }) {
  const borderColor = '#461fa3'; // secondary
  const backgroundColor = '#7646eb'; // accent
  const data = useMemo(() => ({
    labels: userStats?.labels || [],
    datasets: [{
      label: 'New Users',
      data: userStats?.data || [],
      borderColor,
      backgroundColor,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: borderColor,
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  }), [userStats, borderColor, backgroundColor]);

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
      aria-label="User Growth"
      tabIndex={0}
    >
      <header className="mb-4 flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-primary dark:text-text-light tracking-tight">User Growth</h2>
      </header>
      <div className="relative w-full min-h-[260px] h-[260px] sm:h-[320px] md:h-[360px] flex items-center justify-center">
        <Line data={data} options={options} aria-label="User Growth Chart" />
      </div>
    </section>
  );
});

export default UserGrowthChart;
