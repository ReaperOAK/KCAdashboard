import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const TeacherDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalStudents: 45,
    activeClasses: 3,
    upcomingClasses: 2,
    completedClasses: 120
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-[#200e4a] mb-6">
          Welcome, {user.full_name}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
};

export default TeacherDashboard;
