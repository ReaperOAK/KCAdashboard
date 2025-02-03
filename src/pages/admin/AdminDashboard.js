import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    ongoingTournaments: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dashboard statistics
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const dashboardCards = [
    {
      title: 'User Management',
      description: 'Manage students, teachers, and admin accounts',
      link: '/admin/users',
      icon: '👥',
      color: '#461fa3'
    },
    {
      title: 'Attendance System',
      description: 'Track attendance and manage policies',
      link: '/admin/attendance',
      icon: '📊',
      color: '#7646eb'
    },
    {
      title: 'Analytics & Reports',
      description: 'View insights and generate reports',
      link: '/admin/analytics',
      icon: '📈',
      color: '#200e4a'
    },
    {
      title: 'Support System',
      description: 'Manage tickets and FAQs',
      link: '/admin/support',
      icon: '🎫',
      color: '#461fa3'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Admin Dashboard</h1>
        
        {/* Updated Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold">Total Teachers</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalTeachers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold">Active Classes</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.activeClasses}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold">Ongoing Tournaments</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.ongoingTournaments}</p>
          </div>
        </div>

        {/* Feature Cards with New Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(card.link)}
              style={{ borderLeft: `4px solid ${card.color}` }}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-[#200e4a]">{card.title}</h3>
              <p className="text-[#3b3a52]">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/admin/new-tournament')}
              className="bg-[#461fa3] hover:bg-[#7646eb] text-white px-4 py-2 rounded transition-colors"
            >
              Create Tournament
            </button>
            <button 
              onClick={() => navigate('/admin/broadcast')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send Broadcast
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Generate Reports
            </button>
          </div>
        </div>

        {/* System Health Section */}
        <section className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Add system health indicators */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;