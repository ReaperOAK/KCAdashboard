import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';
import PERMISSIONS, { checkPermission } from '../../utils/permissions';
import { useAuth } from '../../hooks/useAuth';

const PERMISSIONS_MAP = {
    'user.view': 1,
    'user.create': 2,
    'user.edit': 3,
    'user.delete': 4,
    'user.manage_permissions': 5,
    'batch.view': 6,
    'batch.create': 7,
    'batch.edit': 8,
    'batch.delete': 9
    // Add more mappings as needed
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const { user: currentUser } = useAuth();

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

    const handleBulkAction = async (action) => {
        try {
            switch (action) {
                case 'activate':
                    await ApiService.post('/users/bulk-update-status.php', {
                        user_ids: selectedUsers,
                        status: 'active'
                    });
                    break;
                case 'deactivate':
                    await ApiService.post('/users/bulk-update-status.php', {
                        user_ids: selectedUsers,
                        status: 'inactive'
                    });
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete these users?')) {
                        await ApiService.post('/users/bulk-delete.php', {
                            user_ids: selectedUsers
                        });
                    }
                    break;
                default:
                    console.warn('Unknown bulk action:', action);
                    return;
            }
            fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            setError('Failed to perform bulk action');
        }
    };

    const handlePermissionChange = async (userId, permissions) => {
        try {
            setError(null);
            console.log('Sending permissions:', permissions); // Debug log

            // Convert permission strings to IDs using a mapping
            const permissionIds = permissions.map(permission => ({
                name: permission,
                id: PERMISSIONS_MAP[permission] // You'll need to add this mapping
            }));

            const response = await ApiService.post('/users/update-permissions.php', {
                user_id: userId,
                permissions: permissionIds
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to update permissions');
            }

            // Update local state
            setUsers(users.map(user => {
                if (user.id === userId) {
                    return { ...user, permissions };
                }
                return user;
            }));

            setShowPermissionsModal(false);
        } catch (error) {
            setError(error.message || 'Failed to update permissions');
            console.error('Permission update error:', error);
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

                {selectedUsers.length > 0 && checkPermission(currentUser?.permissions || [], PERMISSIONS.USER_MANAGEMENT.EDIT) && (
                    <div className="mb-4 p-4 bg-white rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-700">
                            {selectedUsers.length} users selected
                        </h3>
                        <div className="mt-2 space-x-2">
                            <button
                                onClick={() => handleBulkAction('activate')}
                                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                            >
                                Activate
                            </button>
                            <button
                                onClick={() => handleBulkAction('deactivate')}
                                className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700"
                            >
                                Deactivate
                            </button>
                            <button
                                onClick={() => handleBulkAction('delete')}
                                className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers(users.map(user => user.id));
                                                } else {
                                                    setSelectedUsers([]);
                                                }
                                            }}
                                            checked={selectedUsers.length === users.length}
                                        />
                                    </th>
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
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers([...selectedUsers, user.id]);
                                                    } else {
                                                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                    }
                                                }}
                                            />
                                        </td>
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
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowPermissionsModal(true);
                                                }}
                                                className="ml-2 text-[#461fa3] hover:text-[#7646eb]"
                                            >
                                                Manage Permissions
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

                {/* Permissions Modal */}
                {showPermissionsModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Manage Permissions</h2>
                            {error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                {Object.entries(PERMISSIONS).map(([category, perms]) => (
                                    <div key={category} className="border-b pb-4">
                                        <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                                        <div className="space-y-2">
                                            {Object.entries(perms).map(([key, value]) => (
                                                <label key={value} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUser.permissions?.includes(value) || false}
                                                        onChange={(e) => {
                                                            const updatedPermissions = e.target.checked
                                                                ? [...(selectedUser.permissions || []), value]
                                                                : (selectedUser.permissions || []).filter(p => p !== value);
                                                            setSelectedUser({
                                                                ...selectedUser,
                                                                permissions: updatedPermissions
                                                            });
                                                        }}
                                                        className="rounded border-gray-300 text-[#461fa3] focus:ring-[#461fa3]"
                                                    />
                                                    <span className="text-sm text-gray-700">{key}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPermissionsModal(false);
                                        setError(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handlePermissionChange(selectedUser.id, selectedUser.permissions)}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                >
                                    Save Permissions
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
