
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';


// Loading spinner (accessible, reusable)
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="status" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4" aria-label="Loading"></div>
      <p className="text-secondary">Loading dashboard...</p>
    </div>
  </div>
));

// Error state (accessible, reusable)
const ErrorState = React.memo(({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="alert" aria-live="assertive">
    <div className="text-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        {error}
      </div>
      <button
        onClick={onRetry}
        className="bg-secondary text-white px-4 py-2 rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Retry loading dashboard"
      >
        Retry
      </button>
    </div>
  </div>
));

// Stat card (memoized, accessible)
const StatCard = React.memo(({ title, value, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md" role="region" aria-label={title}>
    <h2 className="text-lg font-semibold text-secondary">{title}</h2>
    <p className="text-3xl font-bold text-primary">{value}</p>
    {children}
  </div>
));

// Recent activity badge (memoized)
const ActivityBadge = React.memo(({ type }) => {
  const badgeClass = type === 'quiz'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800';
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded-full ${badgeClass}`}>{type}</span>
  );
});

// Recent activities list (memoized)
const RecentActivities = React.memo(({ activities }) => (
  <div className="bg-white p-6 rounded-xl shadow-md mt-4" role="region" aria-label="Recent Activities">
    <h2 className="text-xl font-semibold text-primary mb-4">Recent Activities</h2>
    <div className="space-y-3">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-gray-light/30 rounded-lg">
          <div>
            <h3 className="font-medium text-primary">{activity.title}</h3>
            {activity.activity_type === 'quiz' && (
              <p className="text-sm text-gray-dark">Score: {activity.score}%</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-dark">{new Date(activity.date_time).toLocaleDateString()}</p>
            <ActivityBadge type={activity.activity_type} />
          </div>
        </div>
      ))}
    </div>
  </div>
));

// Main dashboard component
export const StudentDashboard = React.memo(() => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClasses: 0,
    attendance: '0%',
    gamesPlayed: 0,
    gamesWon: 0,
    currentRating: 1200,
    upcomingClasses: 0,
    attendanceRate: 0,
    averageQuizScore: 0,
    totalQuizzes: 0,
    currentStreak: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getStudentDashboardStats();
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

  // Memoize stats for performance
  const statCards = useMemo(() => ([
    {
      title: 'Total Classes',
      value: stats.totalClasses,
    },
    {
      title: 'Attendance',
      value: stats.attendance,
      children: stats.currentStreak > 0 && (
        <p className="text-sm text-green-600 mt-1" aria-label="Current attendance streak">
          🔥 {stats.currentStreak} session streak!
        </p>
      ),
    },
    {
      title: 'Games Played',
      value: stats.gamesPlayed,
      children: stats.gamesWon > 0 && (
        <p className="text-sm text-green-600 mt-1" aria-label="Games won">Won: {stats.gamesWon}</p>
      ),
    },
    {
      title: 'Upcoming Classes',
      value: stats.upcomingClasses,
    },
  ]), [stats]);

  const extraStatCards = useMemo(() => ([
    {
      title: 'Quiz Performance',
      value: `${stats.averageQuizScore}%`,
      children: (
        <p className="text-sm text-gray-dark mt-1">Average from {stats.totalQuizzes} quizzes</p>
      ),
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      children: (
        <div className="w-full bg-gray-light rounded-full h-2 mt-2" aria-label="Attendance rate progress bar">
          <div
            className="bg-secondary h-2 rounded-full"
            style={{ width: `${stats.attendanceRate}%` }}
            aria-valuenow={stats.attendanceRate}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          ></div>
        </div>
      ),
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      children: (
        <p className="text-sm text-gray-dark mt-1">Consecutive sessions attended</p>
      ),
    },
    {
      title: 'Chess Rating',
      value: stats.currentRating,
      children: (
        <p className="text-sm text-gray-dark mt-1">Current Elo rating</p>
      ),
    },
  ]), [stats]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} onRetry={fetchDashboardData} />;

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Welcome, {user.full_name}!</h1>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <StatCard key={card.title} title={card.title} value={card.value}>{card.children}</StatCard>
          ))}
        </div>
        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {extraStatCards.map((card, idx) => (
            <StatCard key={card.title} title={card.title} value={card.value}>{card.children}</StatCard>
          ))}
        </div>
        {/* Recent Activities */}
        {recentActivities.length > 0 && <RecentActivities activities={recentActivities} />}
      </div>
    </div>
  );
});

export default StudentDashboard;
