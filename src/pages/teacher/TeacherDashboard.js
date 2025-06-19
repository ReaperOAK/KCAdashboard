import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    upcomingClasses: 0,
    completedClasses: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching teacher dashboard data...');
      const response = await ApiService.getTeacherDashboardStats();
      console.log('API Response:', response);
      
      if (response.success) {
        setStats(response.stats);
        setRecentActivities(response.recentActivities || []);
        console.log('Dashboard data loaded successfully:', response.stats);
      } else {
        console.error('API returned error:', response.message);
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#461fa3] mx-auto mb-4"></div>
          <p className="text-[#461fa3]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={fetchDashboardData}
            className="bg-[#461fa3] text-white px-4 py-2 rounded hover:bg-[#200e4a]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-[#200e4a] mb-6">
          Welcome, {user.full_name}!
        </h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Total Students</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.totalStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Active Classes</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.activeClasses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Upcoming Classes</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.upcomingClasses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Completed Classes</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.completedClasses}</p>
          </div>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Recent Activities</h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-[#200e4a]">{activity.title}</h3>
                    <p className="text-sm text-gray-600">Batch: {activity.batch_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.date_time).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      activity.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800' 
                        : activity.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status === 'upcoming' ? 'Upcoming' : 
                       activity.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
