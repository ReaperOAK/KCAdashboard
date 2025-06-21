import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();  const [stats, setStats] = useState({
    totalClasses: 0,
    attendance: "0%",
    gamesPlayed: 0,
    gamesWon: 0,
    currentRating: 1200,
    upcomingClasses: 0,
    attendanceRate: 0,
    averageQuizScore: 0,
    totalQuizzes: 0,
    currentStreak: 0
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
      console.log('Fetching student dashboard data...');
      const response = await ApiService.getStudentDashboardStats();
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
            <h2 className="text-lg font-semibold text-[#461fa3]">Total Classes</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.totalClasses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Attendance</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.attendance}</p>
            {stats.currentStreak > 0 && (
              <p className="text-sm text-green-600 mt-1">🔥 {stats.currentStreak} session streak!</p>
            )}
          </div>          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Games Played</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.gamesPlayed}</p>
            {stats.gamesWon > 0 && (
              <p className="text-sm text-green-600 mt-1">Won: {stats.gamesWon}</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Upcoming Classes</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.upcomingClasses}</p>
          </div>
        </div>        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Quiz Performance</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.averageQuizScore}%</p>
            <p className="text-sm text-gray-600 mt-1">Average from {stats.totalQuizzes} quizzes</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Attendance Rate</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.attendanceRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-[#461fa3] h-2 rounded-full" 
                style={{ width: `${stats.attendanceRate}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Current Streak</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600 mt-1">Consecutive sessions attended</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Chess Rating</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.currentRating}</p>
            <p className="text-sm text-gray-600 mt-1">Current Elo rating</p>
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
                    <p className="text-sm text-gray-600">
                      {activity.activity_type === 'quiz' && `Score: ${activity.score}%`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.date_time).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      activity.activity_type === 'quiz' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {activity.activity_type}
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

export default StudentDashboard;
