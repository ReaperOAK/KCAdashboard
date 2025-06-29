import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    totalBatches: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ApiService.get('/admin/dashboard-stats.php');
        if (response && response.stats) {
          setStats(response.stats);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setError('Failed to load dashboard statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-[#f3f1f9] min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#200e4a]">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#f3f1f9] min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  const quickAccessCards = [
    {
      title: 'User Management',
      description: 'Manage students and teachers',
      icon: '👥',
      link: '/admin/users',
      color: 'bg-[#461fa3]'
    },
    {
      title: 'Batch Management',
      description: 'Create and manage batches',
      icon: '📚',
      link: '/admin/batches',
      color: 'bg-[#7646eb]'
    },
    {
      title: 'Attendance System',
      description: 'Track student attendance',
      icon: '📋',
      link: '/admin/attendance',
      color: 'bg-[#200e4a]'
    }
  ];

  return (
    <div className="p-8 bg-[#f3f1f9] min-h-screen">
      <h1 className="text-3xl font-bold text-[#200e4a] mb-6">
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
      <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessCards.map((card, index) => (
          <Link key={index} to={card.link}>
            <div className={`${card.color} text-white rounded-xl p-6 transition-transform hover:scale-105`}>
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[#461fa3]">{title}</h2>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-[#200e4a]">{value}</p>
  </div>
);

export default AdminDashboard;
