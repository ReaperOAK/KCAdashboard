
import React, { useCallback, memo } from 'react';
import UserActivity from '../../../pages/admin/UserActivity';

const ModalHeader = memo(function ModalHeader({ onClose }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary">User Management</h2>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-dark hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        aria-label="Close modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});

const TabNav = memo(function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="border-b border-gray-light mb-6" role="tablist" aria-label="User modal tabs">
      <ul className="flex -mb-px space-x-8">
        <li>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'details'}
            tabIndex={activeTab === 'details' ? 0 : -1}
            onClick={onTabChange.details}
            className={`py-2 px-1 transition-colors duration-150 font-medium focus:outline-none ${
              activeTab === 'details'
                ? 'border-b-2 border-secondary text-secondary'
                : 'text-gray-dark hover:text-secondary'
            }`}
          >
            User Details
          </button>
        </li>
        <li>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'activity'}
            tabIndex={activeTab === 'activity' ? 0 : -1}
            onClick={onTabChange.activity}
            className={`py-2 px-1 transition-colors duration-150 font-medium focus:outline-none ${
              activeTab === 'activity'
                ? 'border-b-2 border-secondary text-secondary'
                : 'text-gray-dark hover:text-secondary'
            }`}
          >
            Activity Logs
          </button>
        </li>
      </ul>
    </nav>
  );
});

const UserDetailsForm = memo(function UserDetailsForm({ user, setUser, onSubmit, onClose, error }) {
  const handleChange = useCallback((field) => (e) => {
    setUser({ ...user, [field]: e.target.value });
  }, [setUser, user]);

  return (
    <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
      <div>
        <label className="block text-sm font-medium text-text-dark">Full Name</label>
        <input
          type="text"
          value={user.full_name || ''}
          onChange={handleChange('full_name')}
          className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-accent focus:ring-accent text-text-dark"
          aria-label="Full Name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark">Email</label>
        <input
          type="email"
          value={user.email || ''}
          onChange={handleChange('email')}
          className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-accent focus:ring-accent text-text-dark"
          aria-label="Email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark">Role</label>
        <select
          value={user.role || ''}
          onChange={handleChange('role')}
          className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-accent focus:ring-accent text-text-dark"
          aria-label="Role"
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark">Status</label>
        <select
          value={user.status || ''}
          onChange={handleChange('status')}
          className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-accent focus:ring-accent text-text-dark"
          aria-label="Status"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      {error && (
        <div className="text-red-600 text-sm" role="alert">{error}</div>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-light rounded-md shadow-sm text-sm font-medium text-gray-dark hover:bg-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
});

function EditUserModal({ user, setUser, onSubmit, onClose, error, activeTab, setActiveTab }) {
  // Memoized event handlers
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleTabChange = {
    details: useCallback(() => setActiveTab('details'), [setActiveTab]),
    activity: useCallback(() => setActiveTab('activity'), [setActiveTab]),
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Edit user modal"
    >
      <div className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg focus:outline-none" tabIndex={-1}>
        <ModalHeader onClose={onClose} />
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        {activeTab === 'details' ? (
          <UserDetailsForm user={user} setUser={setUser} onSubmit={onSubmit} onClose={onClose} error={error} />
        ) : (
          <UserActivity userId={user.id} />
        )}
      </div>
    </div>
  );
}

export default memo(EditUserModal);
