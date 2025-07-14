

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AdminApi } from '../../api/admin';
import { motion } from 'framer-motion';
import { UserCircleIcon, AcademicCapIcon, UsersIcon, BuildingLibraryIcon, ClipboardDocumentCheckIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import StatCard from '../../components/admin/StatCard';
import LoadingState from '../../components/admin/LoadingState';
import ErrorState from '../../components/admin/ErrorState';


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
      icon: UsersIcon,
      link: '/admin/users',
      color: 'secondary',
    },
    {
      title: 'Batch Management',
      description: 'Create and manage batches',
      icon: BuildingLibraryIcon,
      link: '/admin/batches',
      color: 'accent',
    },
    {
      title: 'Attendance System',
      description: 'Track student attendance',
      icon: ClipboardDocumentCheckIcon,
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


  return (
    <div className="px-2 sm:px-4 md:px-8 py-6 sm:py-10 min-h-screen bg-gradient-to-br from-background-light via-white to-background-light dark:from-background-dark dark:via-background-dark dark:to-background-dark">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="max-w-7xl mx-auto"
        aria-label="Admin Dashboard Main Content"
      >
        <div className="flex flex-col items-center mb-8">
          <UserCircleIcon className="h-20 w-20 text-primary dark:text-accent mb-2 drop-shadow-lg" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-accent text-center drop-shadow">Welcome, <span className="text-text-dark dark:text-text-light">{user.full_name}</span>!</h1>
        </div>
        {/* Stats Grid */}
        <section aria-label="Dashboard Statistics" className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <StatCard title="Total Students" value={stats.totalStudents} Icon={UsersIcon} color="secondary" />
            <StatCard title="Total Teachers" value={stats.totalTeachers} Icon={AcademicCapIcon} color="accent" />
            <StatCard title="Active Classes" value={stats.activeClasses} Icon={BuildingLibraryIcon} color="primary" />
            <StatCard title="Total Batches" value={stats.totalBatches} Icon={ClipboardDocumentCheckIcon} color="accent" />
            <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} Icon={ChartBarIcon} color="primary" />
          </div>
        </section>
        {/* Quick Access Cards */}
        <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-accent mb-4 mt-2">Quick Access</h2>
        <section aria-label="Quick Access Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickAccessCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 + idx * 0.1, type: 'spring' }}
                  className={`group bg-white dark:bg-background-dark border border-gray-light dark:border-gray-dark border-l-4 border-${card.color} text-primary dark:text-text-light rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus-within:scale-105 focus:outline-none min-h-[140px] flex flex-col justify-between`}
                >
                  <Link to={card.link} tabIndex={0} aria-label={card.title} className="block focus:outline-none">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`h-8 w-8 text-${card.color} group-hover:text-accent transition-colors`} aria-hidden="true" />
                      <h3 className="text-lg sm:text-xl font-bold text-text-dark dark:text-text-light group-hover:text-accent transition-colors duration-200">{card.title}</h3>
                    </div>
                    <p className="text-sm sm:text-base text-text-dark dark:text-text-light/80">{card.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
