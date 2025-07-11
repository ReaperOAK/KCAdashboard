
import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsApi } from '../../api/analytics';
import AnalyticsSkeleton from '../../components/analytics/AnalyticsSkeleton';
import ErrorAlert from '../../components/analytics/ErrorAlert';
import TimeRangeSelect from '../../components/analytics/TimeRangeSelect';
import UserGrowthChart from '../../components/analytics/UserGrowthChart';
import UserActivityChart from '../../components/analytics/UserActivityChart';
import PerformanceMetricsChart from '../../components/analytics/PerformanceMetricsChart';
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

  // Empty state for analytics
  const isEmpty = !analytics.userStats?.data?.length && !analytics.activityStats?.data?.length && !analytics.performanceStats;
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
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-dark">
            <svg className="w-16 h-16 mb-4 text-gray-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" /></svg>
            <span className="text-lg font-medium">No analytics data available for this range.</span>
          </div>
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
