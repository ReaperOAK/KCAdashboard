import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

const UserGrowthChart = React.memo(function UserGrowthChart({ userStats }) {
  const data = useMemo(() => ({
    labels: userStats?.labels || [],
    datasets: [{
      label: 'New Users',
      data: userStats?.data || [],
      borderColor: '#461fa3', // secondary
      backgroundColor: '#7646eb', // accent
      tension: 0.4
    }]
  }), [userStats]);
  return (
    <div className="bg-background-light border border-gray-light p-6 rounded-xl shadow-md" role="region" aria-label="User Growth">
      <h2 className="text-xl font-semibold text-secondary mb-4">User Growth</h2>
      <Line data={data} aria-label="User Growth Chart" options={{plugins:{legend:{labels:{color:'#270185'}}}}} />
    </div>
  );
});

export default UserGrowthChart;
