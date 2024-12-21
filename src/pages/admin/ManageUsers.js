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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
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
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Update User Role</h2>
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
      </main>
    </div>
  );
};

export default ManageUsers;