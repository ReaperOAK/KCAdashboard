import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalStudents: 150,
    totalTeachers: 12,
    activeClasses: 25,
    monthlyRevenue: 45000
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-[#200e4a] mb-6">
        Welcome, {user.full_name}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#461fa3]">Total Students</h2>
          <p className="text-3xl font-bold text-[#200e4a]">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#461fa3]">Total Teachers</h2>
          <p className="text-3xl font-bold text-[#200e4a]">{stats.totalTeachers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#461fa3]">Active Classes</h2>
          <p className="text-3xl font-bold text-[#200e4a]">{stats.activeClasses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#461fa3]">Monthly Revenue</h2>
          <p className="text-3xl font-bold text-[#200e4a]">₹{stats.monthlyRevenue}</p>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
