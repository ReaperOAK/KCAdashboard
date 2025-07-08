
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserTable from '../../components/user-management/UserTable';
import Filters from '../../components/user-management/Filters';
import EditUserModal from '../../components/user-management/Modals/EditUserModal';
import { useAuth } from '../../hooks/useAuth';
import { UsersApi } from '../../api/users';
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
  'batch.delete': 9,
  // Add more mappings as needed
};


// --- BulkActionsBar ---
const BulkActionsBar = React.memo(function BulkActionsBar({ selectedCount, onActivate, onDeactivate, onDelete }) {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow" role="region" aria-label="Bulk actions">
      <h3 className="text-sm font-medium text-gray-700">{selectedCount} users selected</h3>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onActivate}
          className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          Activate
        </button>
        <button
          type="button"
          onClick={onDeactivate}
          className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
        >
          Deactivate
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
});


// --- PermissionsModal ---
const PermissionsModal = React.memo(function PermissionsModal({
  open,
  user,
  permissions,
  setPermissions,
  onClose,
  onSave,
  error,
}) {
  // Keyboard accessibility: close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="permissions-modal-title">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg" tabIndex={-1}>
        <h2 id="permissions-modal-title" className="text-2xl font-bold text-primary mb-4">Manage Permissions</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">{error}</div>
        )}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto" aria-label="Permission categories">
          {Object.entries(PERMISSIONS).map(([category, perms]) => (
            <div key={category} className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
              <div className="space-y-2">
                {Object.entries(perms).map(([key, value]) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions?.includes(value) || false}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...(permissions || []), value]
                          : (permissions || []).filter((p) => p !== value);
                        setPermissions(updated);
                      }}
                      className="rounded border-gray-300 text-secondary focus:ring-secondary"
                      aria-checked={permissions?.includes(value) || false}
                    />
                    <span className="text-sm text-gray-700">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
});


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

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await UsersApi.update({
        user_id: selectedUser.id,
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status,
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
  }, [selectedUser, currentUser, fetchUsers]);

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
    setSelectedUser(user);
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
      <div className="p-4 sm:p-8">
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
          <div className="text-center py-8" role="status" aria-live="polite">Loading...</div>
        ) : error ? (
          <div className="text-red-500 py-8" role="alert">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <UserTable {...userTableProps} />
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            setUser={setSelectedUser}
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
