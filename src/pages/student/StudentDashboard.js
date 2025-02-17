import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import TopNavbar from '../../components/TopNavbar';
import Sidebar from '../../components/Sidebar';

const StudentDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalClasses: 48,
    attendance: "85%",
    gamesPlayed: 24,
    upcomingClasses: 3
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      <TopNavbar />
      <Sidebar />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-[#200e4a] mb-6">
          Welcome, {user.full_name}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Total Classes</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.totalClasses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Attendance</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.attendance}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg"></div>
            <h2 className="text-lg font-semibold text-[#461fa3]">Games Played</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.gamesPlayed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-[#461fa3]">Upcoming Classes</h2>
            <p className="text-3xl font-bold text-[#200e4a]">{stats.upcomingClasses}</p>
          </div>
        </div>
      </div>
  );
};

export default StudentDashboard;
