
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AnalyticsApi } from '../../api/analytics';
import { motion } from 'framer-motion';
import { UserCircleIcon, AcademicCapIcon, TrophyIcon, CalendarDaysIcon, ChartBarIcon, FireIcon, ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid';

// Loading spinner (accessible, reusable)
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="status" aria-live="polite">
    <div className="text-center">
      <ArrowPathIcon className="animate-spin h-12 w-12 text-secondary mx-auto mb-4" aria-label="Loading" />
      <p className="text-secondary">Loading dashboard...</p>
    </div>
  </div>
));

// Error state (accessible, reusable)
const ErrorState = React.memo(({ error, onRetry }) => {
  const [retrying, setRetrying] = useState(false);
  const handleRetry = async () => {
    setRetrying(true);
    await onRetry();
    setRetrying(false);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light" role="alert" aria-live="assertive">
      <div className="text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2" role="alert">
          <ExclamationCircleIcon className="h-5 w-5 text-red-700" aria-hidden="true" />
          {error}
        </div>
        <button
          onClick={handleRetry}
          className="bg-secondary text-white px-4 py-2 rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2"
          aria-label="Retry loading dashboard"
          disabled={retrying}
        >
          {retrying && <ArrowPathIcon className="animate-spin h-5 w-5" aria-hidden="true" />} Retry
        </button>
      </div>
    </div>
  );
});

// Stat card (memoized, accessible, animated, with icon)
const statIcons = [
  AcademicCapIcon, // Total Classes
  CalendarDaysIcon, // Attendance
  PuzzlePieceIcon, // Games Played
  TrophyIcon, // Upcoming Classes
  ChartBarIcon, // Quiz Performance
  CheckCircleIcon, // Attendance Rate
  FireIcon, // Current Streak
  TrophyIcon, // Chess Rating
];

const StatCard = React.memo(({ title, value, children, iconIdx }) => {
  const Icon = statIcons[iconIdx % statIcons.length] || AcademicCapIcon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="bg-white p-6 rounded-xl shadow-md border border-accent/10 flex flex-col items-start gap-2"
      role="region"
      aria-label={title}
    >
      <Icon className="h-7 w-7 text-primary mb-1" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-secondary">{title}</h2>
      <p className="text-3xl font-bold text-primary">{value}</p>
      {children}
    </motion.div>
  );
});

// Recent activity badge (memoized, with icon)
const ActivityBadge = React.memo(({ type }) => {
  const badgeClass = type === 'quiz'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800';
  const Icon = type === 'quiz' ? ChartBarIcon : PuzzlePieceIcon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badgeClass}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {type}
    </span>
  );
});

// Recent activities list (memoized, animated)
const RecentActivities = React.memo(({ activities }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, type: 'spring' }}
    className="bg-white p-6 rounded-xl shadow-md mt-4 border border-accent/10"
    role="region"
    aria-label="Recent Activities"
  >
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
  </motion.div>
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
      const response = await AnalyticsApi.getStudentDashboardStats();
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
    <div className="min-h-screen bg-gradient-to-br from-background-light via-white to-background-light px-4 sm:px-6 md:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col items-center mb-8">
          <UserCircleIcon className="h-20 w-20 text-primary mb-2" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center">Welcome, {user.full_name}!</h1>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 md:mb-8">
          {statCards.map((card, idx) => (
            <StatCard key={card.title} title={card.title} value={card.value} iconIdx={idx}>{card.children}</StatCard>
          ))}
        </div>
        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 md:mb-8">
          {extraStatCards.map((card, idx) => (
            <StatCard key={card.title} title={card.title} value={card.value} iconIdx={idx + 4}>{card.children}</StatCard>
          ))}
        </div>
        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <RecentActivities activities={recentActivities} />
          </div>
        )}
      </motion.div>
    </div>
  );
});

export default StudentDashboard;
