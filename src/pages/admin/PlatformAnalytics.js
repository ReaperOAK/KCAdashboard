
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnalyticsApi } from '../../api/analytics';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Skeleton loader for analytics
export const AnalyticsSkeleton = React.memo(function AnalyticsSkeleton() {
  return (
    <div className="py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
});

// Error alert
export const ErrorAlert = React.memo(function ErrorAlert({ message }) {
  return (
    <div className="bg-red-700 border-l-4 border-red-800 text-white px-6 py-4 rounded mb-6" role="alert" aria-live="assertive">
      {message}
    </div>
  );
});

// Time range selector
export const TimeRangeSelect = React.memo(function TimeRangeSelect({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <select
      value={value}
      onChange={handleChange}
      className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
      aria-label="Select time range"
    >
      <option value="week">Last Week</option>
      <option value="month">Last Month</option>
      <option value="year">Last Year</option>
    </select>
  );
});

// User Growth Chart
export const UserGrowthChart = React.memo(function UserGrowthChart({ userStats }) {
  const data = useMemo(() => ({
    labels: userStats?.labels || [],
    datasets: [{
      label: 'New Users',
      data: userStats?.data || [],
      borderColor: '#461fa3',
      tension: 0.4
    }]
  }), [userStats]);
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg" role="region" aria-label="User Growth">
      <h2 className="text-xl font-semibold text-secondary mb-4">User Growth</h2>
      <Line data={data} aria-label="User Growth Chart" />
    </div>
  );
});

// User Activity Chart
export const UserActivityChart = React.memo(function UserActivityChart({ activityStats }) {
  const data = useMemo(() => ({
    labels: activityStats?.labels || [],
    datasets: [{
      label: 'Active Users',
      data: activityStats?.data || [],
      backgroundColor: '#7646eb'
    }]
  }), [activityStats]);
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg" role="region" aria-label="User Activity">
      <h2 className="text-xl font-semibold text-secondary mb-4">User Activity</h2>
      <Bar data={data} aria-label="User Activity Chart" />
    </div>
  );
});

// Performance Metrics Chart
export const PerformanceMetricsChart = React.memo(function PerformanceMetricsChart({ performanceStats }) {
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
        '#461fa3',
        '#7646eb',
        '#9b6feb',
        '#c198eb'
      ]
    }]
  }), [performanceStats]);
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg" role="region" aria-label="Performance Metrics">
      <h2 className="text-xl font-semibold text-secondary mb-4">Performance Metrics</h2>
      <Pie data={data} aria-label="Performance Metrics Chart" />
    </div>
  );
});

// Main analytics page
const PlatformAnalytics = React.memo(function PlatformAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    userStats: null,
    activityStats: null,
    performanceStats: null
  });
  const [timeRange, setTimeRange] = useState('month');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AnalyticsApi.getPlatformStats(timeRange);
      const { userStats, activityStats, performanceStats } = response || {};
      setAnalytics({ userStats, activityStats, performanceStats });
    } catch (error) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen bg-background-light">
      <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Platform Analytics</h1>
          <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
        </div>
        {loading ? (
          <AnalyticsSkeleton />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <UserGrowthChart userStats={analytics.userStats} />
            <UserActivityChart activityStats={analytics.activityStats} />
            <PerformanceMetricsChart performanceStats={analytics.performanceStats} />
          </div>
        )}
      </div>
    </div>
  );
});

export default PlatformAnalytics;
