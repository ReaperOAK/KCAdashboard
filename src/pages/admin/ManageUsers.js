import React, { useState, useEffect } from 'react';

/**
 * ManageUsers component handles the display and management of users.
 */
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roles = {
    student: {
      permissions: ['view_classes', 'join_tournaments', 'access_studies']
    },
    teacher: {
      permissions: ['create_classes', 'grade_students', 'manage_pgn']
    },
    admin: {
      permissions: ['manage_users', 'system_config', 'view_analytics']
    }
  };

  useEffect(() => {
    // Fetch the list of users from the server
    const fetchUsers = async () => {
      try {
        const response = await fetch('/php/get-users.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Updates the role of a selected user.
   */
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
        setUsers(users.map(user =>
          user.id === selectedUser ? { ...user, role: newRole } : user
        ));
        setSelectedUser(null);
        setNewRole('');
      } else {
        alert('Error updating user role: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('An error occurred while updating user role.');
    }
  };

  /**
   * Deletes a user from the list.
   * @param {number} userId - User ID
   */
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch('/php/delete-user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully');
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('Error deleting user: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting user.');
    }
  };

  // const handleAddUser = async (userData) => {
  //   try {
  //     const response = await fetch('/api/admin/users', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(userData)
  //     });
  //     // ...handle response
  //   } catch (error) {
  //     console.error('Error adding user:', error);
  //   }
  // };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Manage Users</h1>
        
        {/* Updated User Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.role}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role Management Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Role Management</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleUpdateRole}
            >
              Update Role
            </button>
          </div>
        </div>

        {/* New Batch Assignment Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Batch Assignments</h2>
          {/* Add batch assignment functionality */}
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Role Permissions</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {Object.entries(roles).map(([role, { permissions }]) => (
              <div key={role} className="mb-4">
                <h3 className="text-xl font-semibold capitalize">{role}</h3>
                <ul className="list-disc ml-6">
                  {permissions.map((permission, index) => (
                    <li key={index} className="text-gray-700">
                      {permission.replace('_', ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ManageUsers;