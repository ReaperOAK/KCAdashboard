import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        try {
            const response = await ApiService.get(`/users/get-all.php?filter=${filter}&search=${searchTerm}`);
            setUsers(response.users);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    }, [filter, searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleStatusChange = async (userId, status) => {
        try {
            await ApiService.post('/users/update-status.php', {
                user_id: userId,
                status: status
            });
            fetchUsers();
        } catch (error) {
            setError('Failed to update user status');
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await ApiService.post('/users/update-role.php', {
                user_id: userId,
                role: role
            });
            fetchUsers();
        } catch (error) {
            setError('Failed to update user role');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await ApiService.post('/users/update.php', {
                user_id: selectedUser.id,
                full_name: selectedUser.full_name,
                email: selectedUser.email,
                role: selectedUser.role,
                status: selectedUser.status
            });
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            setError('Failed to update user details');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a] mb-4">User Management</h1>
                    <div className="flex space-x-4 mb-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                        >
                            <option value="all">All Users</option>
                            <option value="student">Students</option>
                            <option value="teacher">Teachers</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="text-sm text-gray-900 rounded-md border-gray-300 focus:ring-[#461fa3]"
                                            >
                                                <option value="student">Student</option>
                                                <option value="teacher">Teacher</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.status}
                                                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                                className="text-sm rounded-md border-gray-300 focus:ring-[#461fa3]"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-[#461fa3] hover:text-[#7646eb]"
                                            >
                                                Edit Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Edit User Details</h2>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={selectedUser.full_name}
                                        onChange={(e) => setSelectedUser({
                                            ...selectedUser,
                                            full_name: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={selectedUser.email}
                                        onChange={(e) => setSelectedUser({
                                            ...selectedUser,
                                            email: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={selectedUser.role}
                                        onChange={(e) => setSelectedUser({
                                            ...selectedUser,
                                            role: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={selectedUser.status}
                                        onChange={(e) => setSelectedUser({
                                            ...selectedUser,
                                            status: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
