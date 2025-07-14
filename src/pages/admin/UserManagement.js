

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserTable from '../../components/user-management/UserTable';
import Filters from '../../components/user-management/Filters';
import EditUserModal from '../../components/user-management/Modals/EditUserModal';
import BulkActionsBar from '../../components/user-management/BulkActionsBar';
import PermissionsModal from '../../components/user-management/Modals/PermissionsModal';
import { useAuth } from '../../hooks/useAuth';
import { UsersApi } from '../../api/users';

const PERMISSIONS_MAP = {
  'user.view': 1,
  'user.create': 2,
  'user.edit': 3,
  'user.delete': 4,
  'user.manage_permissions': 5,
  'batch.view': 6,
  'batch.create': 7,
  'batch.edit': 8,
  'batch.delete': 9,
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
  const [permissionsDraft, setPermissionsDraft] = useState([]);
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('details');

  // --- Data Fetching ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await UsersApi.getAll(filter, searchTerm);
      setUsers(response.users);
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Handlers ---
  // Update user details (edit modal submit)
  const handleEditSubmit = useCallback(async (editedUser) => {
    setError(null);
    try {
      const response = await UsersApi.update({
        user_id: editedUser.id,
        full_name: editedUser.full_name,
        email: editedUser.email,
        role: editedUser.role,
        status: editedUser.status,
        current_user_id: currentUser.id,
      });
      if (!response.success) throw new Error(response.message || 'Failed to update user');
      setShowEditModal(false);
      setActiveTab('details');
      await fetchUsers();
      setError(null);
    } catch (error) {
      setError(error.message || 'Failed to update user details');
    }
  }, [currentUser, fetchUsers]);
  // Update user status (table dropdown)
  const handleStatusChange = useCallback(async (userId, status) => {
    setLoading(true);
    setError(null);
    try {
      await UsersApi.updateStatus(userId, status);
      await fetchUsers();
    } catch (error) {
      setError('Failed to update user status');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // Bulk actions bar
  const handleBulkAction = useCallback(async (action) => {
    setError(null);
    try {
      if (action === 'activate' || action === 'deactivate') {
        await UsersApi.bulkUpdateStatus(selectedUsers, action === 'activate' ? 'active' : 'inactive');
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete these users?')) {
          await UsersApi.bulkDelete(selectedUsers);
        } else {
          return;
        }
      } else {
        return;
      }
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      setError('Failed to perform bulk action');
    }
  }, [selectedUsers, fetchUsers]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    setError(null);
    try {
      const response = await UsersApi.updateRole(userId, newRole, currentUser.id);
      if (!response.success) throw new Error(response.message || 'Failed to update role');
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
      await fetchUsers();
    } catch (error) {
      setError(error.message || 'Failed to update user role');
    }
  }, [currentUser, fetchUsers]);

  // Removed duplicate handleEditSubmit

  const handlePermissionChange = useCallback(async (userId, permissions) => {
    setError(null);
    try {
      // Convert permission strings to IDs using a mapping
      const permissionIds = permissions.map((permission) => ({
        name: permission,
        id: PERMISSIONS_MAP[permission],
      }));
      const response = await UsersApi.updatePermissions(userId, permissionIds);
      if (!response.success) throw new Error(response.message || 'Failed to update permissions');
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, permissions } : user)));
      setShowPermissionsModal(false);
    } catch (error) {
      setError(error.message || 'Failed to update permissions');
    }
  }, []);

  const handleDelete = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setError(null);
    try {
      const response = await UsersApi.delete(userId, currentUser.id);
      if (response.success) {
        await fetchUsers();
        alert('User deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete user. Please try again.');
      alert(error.message || 'Failed to delete user. Please try again.');
    }
  }, [currentUser, fetchUsers]);

  // --- Modal Open/Close Handlers ---
  const openEditModal = useCallback((user) => {
    setSelectedUser(user ? { ...user } : null); // clone user to avoid reference issues
    setShowEditModal(true);
  }, []);

  const openPermissionsModal = useCallback((user) => {
    setSelectedUser(user);
    setPermissionsDraft(user.permissions || []);
    setShowPermissionsModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setActiveTab('details');
    setError(null);
  }, []);

  const closePermissionsModal = useCallback(() => {
    setShowPermissionsModal(false);
    setError(null);
  }, []);

  // --- Memoized Table Props ---
  const userTableProps = useMemo(() => ({
    users,
    selectedUsers,
    setSelectedUsers,
    onEdit: openEditModal,
    onPermissions: openPermissionsModal,
    onDelete: handleDelete,
    onRoleChange: handleRoleChange,
    onStatusChange: handleStatusChange,
  }), [users, selectedUsers, openEditModal, openPermissionsModal, handleDelete, handleRoleChange, handleStatusChange]);

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-2 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">User Management</h1>
          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filter={filter}
            setFilter={setFilter}
          />
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedUsers.length}
            onActivate={() => handleBulkAction('activate')}
            onDeactivate={() => handleBulkAction('deactivate')}
            onDelete={() => handleBulkAction('delete')}
          />
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" aria-label="Loading users" />
          </div>
        ) : error ? (
          <div className="py-8 flex justify-center">
            <div className="bg-red-700 border border-red-800 text-white rounded-lg px-6 py-4 text-center shadow-md flex items-center gap-2" role="alert">
              {/* Optionally add an error icon here */}
              {error}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2">🧑‍💻</div>
            <div className="text-lg font-semibold text-text-dark mb-1">No users found</div>
            <div className="text-gray-dark text-sm">Try adjusting your filters or search.</div>
          </div>
        ) : (
          <div className="bg-background-light border border-gray-light rounded-xl shadow-lg overflow-x-auto">
            <UserTable {...userTableProps} />
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onSubmit={handleEditSubmit}
            onClose={closeEditModal}
            error={error}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Permissions Modal */}
        <PermissionsModal
          open={showPermissionsModal && !!selectedUser}
          user={selectedUser}
          permissions={permissionsDraft}
          setPermissions={setPermissionsDraft}
          onClose={closePermissionsModal}
          onSave={() => handlePermissionChange(selectedUser.id, permissionsDraft)}
          error={error}
        />
      </div>
    </div>
  );
};

export default React.memo(UserManagement);
