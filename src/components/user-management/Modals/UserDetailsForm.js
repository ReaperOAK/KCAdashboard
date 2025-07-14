import React, { memo, useCallback } from 'react';

const UserDetailsForm = memo(function UserDetailsForm({ user, setUser, onSubmit, onClose, error }) {
  const handleChange = useCallback((field) => (e) => {
    setUser(prev => ({ ...prev, [field]: e.target.value }));
  }, [setUser]);

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-fade-in" autoComplete="off">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Full Name</label>
          <input
            type="text"
            value={user.full_name || ''}
            onChange={handleChange('full_name')}
            className="mt-1 block w-full rounded-lg border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-accent focus:ring-accent focus:ring-2 transition-all"
            aria-label="Full Name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
          <input
            type="email"
            value={user.email || ''}
            onChange={handleChange('email')}
            className="mt-1 block w-full rounded-lg border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-accent focus:ring-accent focus:ring-2 transition-all"
            aria-label="Email"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Role</label>
          <select
            value={user.role || ''}
            onChange={handleChange('role')}
            className="mt-1 block w-full rounded-lg border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-accent focus:ring-accent focus:ring-2 transition-all"
            aria-label="Role"
            required
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Status</label>
          <select
            value={user.status || ''}
            onChange={handleChange('status')}
            className="mt-1 block w-full rounded-lg border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-accent focus:ring-accent focus:ring-2 transition-all"
            aria-label="Status"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
      {error && (
        <div className="text-red-700 text-sm font-medium mt-2" role="alert">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-light rounded-lg shadow-sm text-sm font-medium text-gray-dark hover:bg-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full sm:w-auto transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-accent hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full sm:w-auto transition-all"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
});

export default UserDetailsForm;
