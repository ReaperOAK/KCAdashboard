import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

const UserActivityChart = React.memo(function UserActivityChart({ activityStats }) {
  const data = useMemo(() => ({
    labels: activityStats?.labels || [],
    datasets: [{
      label: 'Active Users',
      data: activityStats?.data || [],
      backgroundColor: '#7646eb' // accent
    }]
  }), [activityStats]);
  return (
    <div className="bg-background-light border border-gray-light p-6 rounded-xl shadow-md" role="region" aria-label="User Activity">
      <h2 className="text-xl font-semibold text-secondary mb-4">User Activity</h2>
      <Bar data={data} aria-label="User Activity Chart" options={{plugins:{legend:{labels:{color:'#270185'}}}}} />
    </div>
  );
});

export default UserActivityChart;
