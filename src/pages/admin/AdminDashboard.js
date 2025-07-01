
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';

// Stat card (memoized)
const StatCard = React.memo(function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-secondary">{title}</h2>
        <span className="text-2xl" aria-hidden>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </div>
  );
});

// Quick access card (memoized)
const QuickAccessCard = React.memo(function QuickAccessCard({ card }) {
  return (
    <Link to={card.link} tabIndex={0} aria-label={card.title}>
      <div className={`bg-${card.color} text-white rounded-xl p-6 transition-transform hover:scale-105 focus-within:scale-105 focus:outline-none`}>
        <div className="text-4xl mb-4" aria-hidden>{card.icon}</div>
        <h3 className="text-xl font-bold mb-2">{card.title}</h3>
        <p>{card.description}</p>
      </div>
    </Link>
  );
});

// Loading state
const LoadingState = React.memo(function LoadingState() {
  return (
    <div className="p-8 bg-background-light min-h-screen flex items-center justify-center">
      <div className="text-xl text-primary">Loading dashboard data...</div>
    </div>
  );
});

// Error state
const ErrorState = React.memo(function ErrorState({ error }) {
  return (
    <div className="p-8 bg-background-light min-h-screen">
      <div className="bg-red-700 border border-red-800 text-white px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    </div>
  );
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    totalBatches: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize quick access cards for perf
  const quickAccessCards = useMemo(() => [
    {
      title: 'User Management',
      description: 'Manage students and teachers',
      icon: '👥',
      link: '/admin/users',
      color: 'secondary',
    },
    {
      title: 'Batch Management',
      description: 'Create and manage batches',
      icon: '📚',
      link: '/admin/batches',
      color: 'accent',
    },
    {
      title: 'Attendance System',
      description: 'Track student attendance',
      icon: '📋',
      link: '/admin/attendance',
      color: 'primary',
    },
  ], []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.get('/admin/dashboard-stats.php');
      if (response && response.stats) {
        setStats(response.stats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="p-8 bg-background-light min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Welcome, {user.full_name}!
      </h1>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" />
        <StatCard title="Total Teachers" value={stats.totalTeachers} icon="👨‍🏫" />
        <StatCard title="Active Classes" value={stats.activeClasses} icon="🏫" />
        <StatCard title="Total Batches" value={stats.totalBatches} icon="📚" />
        <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon="📊" />
      </div>
      {/* Quick Access Cards */}
      <h2 className="text-2xl font-bold text-primary mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessCards.map((card, idx) => (
          <QuickAccessCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
