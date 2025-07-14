
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AnalyticsApi } from '../../api/analytics';
const AnalyticsSkeleton = lazy(() => import('../../components/analytics/AnalyticsSkeleton'));
const ErrorAlert = lazy(() => import('../../components/analytics/ErrorAlert'));
const TimeRangeSelect = lazy(() => import('../../components/analytics/TimeRangeSelect'));
const UserGrowthChart = lazy(() => import('../../components/analytics/UserGrowthChart'));
const UserActivityChart = lazy(() => import('../../components/analytics/UserActivityChart'));
const PerformanceMetricsChart = lazy(() => import('../../components/analytics/PerformanceMetricsChart'));


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
    <div className="min-h-screen bg-background-light flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 sm:gap-4">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2 sm:mb-0">Platform Analytics</h1>
          <Suspense fallback={<div className='h-10 w-32 bg-gray-light animate-pulse rounded' />}> 
            <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
          </Suspense>
        </div>
        <Suspense fallback={<div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div></div>}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AnalyticsSkeleton />
              <span className="mt-4 text-gray-dark text-base animate-pulse">Loading analytics...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ErrorAlert message={error} />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-dark">
              <svg className="w-20 h-20 mb-6 text-gray-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" /></svg>
              <span className="text-lg font-semibold text-center">No analytics data available for this range.<br/>Try a different time range.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <Suspense fallback={<div className='h-64 bg-gray-light animate-pulse rounded' />}> 
                <UserGrowthChart userStats={analytics.userStats} />
              </Suspense>
              <Suspense fallback={<div className='h-64 bg-gray-light animate-pulse rounded' />}> 
                <UserActivityChart activityStats={analytics.activityStats} />
              </Suspense>
              <div className="md:col-span-2">
                <Suspense fallback={<div className='h-64 bg-gray-light animate-pulse rounded' />}> 
                  <PerformanceMetricsChart performanceStats={analytics.performanceStats} />
                </Suspense>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
});

export default PlatformAnalytics;
