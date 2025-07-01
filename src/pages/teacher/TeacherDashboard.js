
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';

// --- Skeleton Loader ---
const DashboardSkeleton = React.memo(() => (
  <div className="min-h-screen bg-background-light flex items-center justify-center" role="status" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4" />
      <p className="text-secondary">Loading dashboard...</p>
    </div>
  </div>
));

// --- Error Alert ---
const ErrorAlert = React.memo(({ message, onRetry }) => (
  <div className="min-h-screen bg-background-light flex items-center justify-center" role="alert">
    <div className="text-center">
      <div className="bg-red-700 border border-red-800 text-white px-4 py-3 rounded mb-4">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="bg-secondary text-white px-4 py-2 rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Retry loading dashboard"
      >
        Retry
      </button>
    </div>
  </div>
));

// --- Stats Cards ---
const StatsGrid = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
    <StatsCard label="Total Students" value={stats.totalStudents} />
    <StatsCard label="Active Classes" value={stats.activeClasses} />
    <StatsCard label="Upcoming Classes" value={stats.upcomingClasses} />
    <StatsCard label="Completed Classes" value={stats.completedClasses} />
  </div>
));

const StatsCard = React.memo(({ label, value }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col items-start" role="region" aria-label={label}>
    <h2 className="text-base sm:text-lg font-semibold text-secondary">{label}</h2>
    <p className="text-2xl sm:text-3xl font-bold text-primary">{value}</p>
  </div>
));

// --- Recent Activities ---
const RecentActivities = React.memo(({ activities }) => {
  if (!activities.length) return null;
  return (
    <section className="bg-white p-4 sm:p-6 rounded-xl shadow-md" aria-labelledby="recent-activities-title">
      <h2 id="recent-activities-title" className="text-lg sm:text-xl font-semibold text-primary mb-3 sm:mb-4">Recent Activities</h2>
      <div className="space-y-2 sm:space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-light/30 rounded-lg">
            <div>
              <h3 className="font-medium text-primary text-base sm:text-lg">{activity.title}</h3>
              <p className="text-xs sm:text-sm text-gray-dark">Batch: {activity.batch_name}</p>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <p className="text-xs sm:text-sm text-gray-dark/80">
                {new Date(activity.date_time).toLocaleDateString()}
              </p>
              <span className={
                `inline-block px-2 py-1 text-xs rounded-full font-medium ` +
                (activity.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : activity.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800')
              }>
                {activity.status === 'upcoming' ? 'Upcoming'
                  : activity.status === 'completed' ? 'Completed'
                  : 'In Progress'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

// --- Main Component ---
export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    upcomingClasses: 0,
    completedClasses: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getTeacherDashboardStats();
      if (response.success) {
        setStats(response.stats);
        setRecentActivities(response.recentActivities || []);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 break-words">
          Welcome, {user.full_name}!
        </h1>
        <StatsGrid stats={stats} />
        <RecentActivities activities={recentActivities} />
      </div>
    </div>
  );
}
