import React, { useState, useEffect, useCallback } from 'react';
import UserTable from '../../components/user-management/UserTable';
import Filters from '../../components/user-management/Filters';
import EditUserModal from '../../components/user-management/Modals/EditUserModal';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';
import PERMISSIONS from '../../utils/permissions';

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
    const [activeTab, setActiveTab] = useState('details');

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

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await ApiService.post('/users/update-role.php', {
                user_id: userId,
                role: newRole,
                current_user_id: currentUser.id
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to update role');
            }

            // Update local state
            setUsers(users.map(user => {
                if (user.id === userId) {
                    return { ...user, role: newRole };
                }
                return user;
            }));

            await fetchUsers(); // Refresh the list
        } catch (error) {
            setError(error.message || 'Failed to update user role');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.post('/users/update.php', {
                user_id: selectedUser.id,
                full_name: selectedUser.full_name,
                email: selectedUser.email,
                role: selectedUser.role,
                status: selectedUser.status,
                current_user_id: currentUser.id  // Add this line
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to update user');
            }

            setShowEditModal(false);
            setActiveTab('details');
            await fetchUsers();  // Refresh the list
            setError(null);
        } catch (error) {
            setError(error.message || 'Failed to update user details');
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

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            setError(null);
            const response = await ApiService.post('/users/delete.php', {
                user_id: userId,
                current_user_id: currentUser.id
            });

            if (response.success) {
                await fetchUsers(); // Refresh the list
                // Show success message
                alert('User deleted successfully');
            } else {
                throw new Error(response.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete error:', error);
            setError(error.message || 'Failed to delete user. Please try again.');
            // Show error message
            alert(error.message || 'Failed to delete user. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-4 sm:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#200e4a] mb-4">User Management</h1>
                    <Filters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filter={filter}
                        setFilter={setFilter}
                    />
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
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

                {/* Main Content */}
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <UserTable
                            users={users}
                            selectedUsers={selectedUsers}
                            setSelectedUsers={setSelectedUsers}
                            onEdit={(user) => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                            }}
                            onPermissions={(user) => {
                                setSelectedUser(user);
                                setShowPermissionsModal(true);
                            }}
                            onDelete={handleDelete}
                            onRoleChange={handleRoleChange}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}

                {/* Modals */}
                {showEditModal && selectedUser && (
                    <EditUserModal
                        user={selectedUser}
                        setUser={setSelectedUser}
                        onSubmit={handleEditSubmit}
                        onClose={() => {
                            setShowEditModal(false);
                            setActiveTab('details');
                            setError(null);
                        }}
                        error={error}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
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
