import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';

const PerformanceMetricsChart = React.memo(function PerformanceMetricsChart({ performanceStats }) {
  const data = useMemo(() => ({
    labels: ['Quizzes', 'Games', 'Tournaments', 'Classes'],
    datasets: [{
      data: [
        performanceStats?.quizzes || 0,
        performanceStats?.games || 0,
        performanceStats?.tournaments || 0,
        performanceStats?.classes || 0
      ],
      backgroundColor: [
        '#461fa3', // secondary
        '#7646eb', // accent
        '#3b3a52', // gray.dark
        '#af0505'  // highlight
      ]
    }]
  }), [performanceStats]);
  return (
    <div className="bg-background-light border border-gray-light p-6 rounded-xl shadow-md" role="region" aria-label="Performance Metrics">
      <h2 className="text-xl font-semibold text-secondary mb-4">Performance Metrics</h2>
      <Pie data={data} aria-label="Performance Metrics Chart" options={{plugins:{legend:{labels:{color:'#270185'}}}}} />
    </div>
  );
});

export default PerformanceMetricsChart;
