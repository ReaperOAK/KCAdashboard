import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminDashboard component displays various admin functionalities and data.
 */
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activeUsers: 0,
    attendanceTrends: '',
    userRoles: [],
    systemIssues: [],
  });
  const [newRole, setNewRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch admin dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/php/admin-dashboard-data.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleManageUsers = () => {
    navigate('/manage-users');
  };

  const handleManageSystem = () => {
    navigate('/manage-system');
  };

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) {
      alert('Please select a user and a role.');
      return;
    }

    try {
      const response = await fetch('/php/update-user-role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        alert('User role updated successfully');
        setDashboardData((prevData) => ({
          ...prevData,
          userRoles: prevData.userRoles.map((user) =>
            user.id === selectedUser ? { ...user, role: newRole } : user
          ),
        }));
      } else {
        alert('Error updating user role: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('An error occurred while updating user role.');
    }
  };

  const handleResolveIssue = async (issueId) => {
    try {
      const response = await fetch('/php/resolve-system-issue.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        alert('System issue resolved successfully');
        setDashboardData((prevData) => ({
          ...prevData,
          systemIssues: prevData.systemIssues.filter((issue) => issue.id !== issueId),
        }));
      } else {
        alert('Error resolving system issue: ' + data.message);
      }
    } catch (error) {
      console.error('Error resolving system issue:', error);
      alert('An error occurred while resolving system issue.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2">Update User Role</h3>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                onChange={(e) => handleUserSelect(e.target.value)}
              >
                <option value="">Select User</option>
                {dashboardData.userRoles && dashboardData.userRoles.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                value={newRole}
                onChange={handleRoleChange}
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleUpdateRole}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Update Role
              </button>
            </div>
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
                    <button
                      onClick={() => handleResolveIssue(issue.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-4"
                    >
                      Resolve
                    </button>
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