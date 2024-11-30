import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activeUsers: 0,
    attendanceTrends: '',
    userRoles: [],
    systemIssues: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch admin dashboard data
    fetch('/php/admin-dashboard-data.php')
      .then((response) => response.json())
      .then((data) => setDashboardData(data))
      .catch((error) => console.error('Error fetching admin dashboard data:', error));
  }, []);

  const handleManageUsers = () => {
    // Navigate to User Management page
    navigate('/manage-users');
  };

  const handleManageSystem = () => {
    // Navigate to System Management page
    navigate('/manage-system');
  };

  return (
    <div className="min-h-screen flex">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Platform Analytics</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Active Users: {dashboardData.activeUsers}</p>
            <p>Attendance Trends: {dashboardData.attendanceTrends}</p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Manage user roles, permissions, and batch assignments.</p>
            <button
              onClick={handleManageUsers}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Manage Users
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">System Issues</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.systemIssues.length > 0 ? (
              <ul>
                {dashboardData.systemIssues.map((issue, index) => (
                  <li key={index} className="mb-2">
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No current system issues.</p>
            )}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">System Configurations</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Manage tickets, FAQ automation, and system configurations.</p>
            <button
              onClick={handleManageSystem}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Manage System
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Reports</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Generate and view detailed reports.</p>
            <button
              onClick={() => navigate('/reports')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              View Reports
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Manage system notifications and alerts.</p>
            <button
              onClick={() => navigate('/notifications')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Manage Notifications
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;