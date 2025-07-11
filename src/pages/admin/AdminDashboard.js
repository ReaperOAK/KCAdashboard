

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AdminApi } from '../../api/admin';
import { motion } from 'framer-motion';
import { UserCircleIcon, AcademicCapIcon, UsersIcon, BuildingLibraryIcon, ClipboardDocumentCheckIcon, ChartBarIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// Stat card (memoized, animated, with Heroicon)
const statIcons = [UsersIcon, AcademicCapIcon, BuildingLibraryIcon, ClipboardDocumentCheckIcon, ChartBarIcon];
const StatCard = React.memo(function StatCard({ title, value, iconIdx }) {
  const Icon = statIcons[iconIdx % statIcons.length] || UsersIcon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="bg-white p-6 rounded-xl shadow-lg border border-accent/10 flex flex-col gap-2"
      role="region"
      aria-label={title}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-secondary">{title}</h2>
        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </motion.div>
  );
});

// Loading state (animated)
const LoadingState = React.memo(function LoadingState() {
  return (
    <div className="p-8 bg-background-light min-h-screen flex items-center justify-center" role="status" aria-live="polite">
      <ArrowPathIcon className="animate-spin h-12 w-12 text-primary mr-4" aria-label="Loading" />
      <div className="text-xl text-primary">Loading dashboard data...</div>
    </div>
  );
});

// Error state (animated)
const ErrorState = React.memo(function ErrorState({ error }) {
  return (
    <div className="p-8 bg-background-light min-h-screen flex items-center justify-center" role="alert">
      <div className="bg-red-700 border border-red-800 text-white px-4 py-3 rounded flex items-center gap-2">
        <ExclamationCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
        <span className="font-bold">Error!</span>
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
      const response = await AdminApi.getDashboardStats();
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


  // Map color names to Tailwind classes
  const colorClassMap = {
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    primary: 'bg-primary',
  };
  const quickAccessIcons = [UsersIcon, BuildingLibraryIcon, ClipboardDocumentCheckIcon];
  return (
    <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-8 min-h-screen bg-gradient-to-br from-background-light via-white to-background-light">
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard title="Total Students" value={stats.totalStudents} iconIdx={0} />
          <StatCard title="Total Teachers" value={stats.totalTeachers} iconIdx={1} />
          <StatCard title="Active Classes" value={stats.activeClasses} iconIdx={2} />
          <StatCard title="Total Batches" value={stats.totalBatches} iconIdx={3} />
          <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} iconIdx={4} />
        </div>
        {/* Quick Access Cards */}
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickAccessCards.map((card, idx) => {
            const Icon = quickAccessIcons[idx % quickAccessIcons.length] || UsersIcon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 + idx * 0.1, type: 'spring' }}
                className={colorClassMap[card.color] + ' text-white rounded-xl p-4 sm:p-6 transition-transform hover:scale-105 focus-within:scale-105 focus:outline-none'}
              >
                <Link to={card.link} tabIndex={0} aria-label={card.title} className="block focus:outline-none">
                  <Icon className="h-8 w-8 mb-2 sm:mb-4" aria-hidden="true" />
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{card.title}</h3>
                  <p className="text-sm sm:text-base">{card.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
