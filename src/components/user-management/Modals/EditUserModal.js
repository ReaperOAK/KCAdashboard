import React from 'react';
import UserActivity from '../../../pages/admin/UserActivity';

const EditUserModal = ({ user, setUser, onSubmit, onClose, error, activeTab, setActiveTab }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-[#200e4a] mb-4">User Management</h2>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 ${
                activeTab === 'details'
                  ? 'border-b-2 border-[#461fa3] text-[#461fa3]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User Details
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 ${
                activeTab === 'activity'
                  ? 'border-b-2 border-[#461fa3] text-[#461fa3]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Activity Logs
            </button>
          </nav>
        </div>

        {activeTab === 'details' ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={user.full_name || ''}
                onChange={(e) => setUser({
                  ...user,
                  full_name: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user.email || ''}
                onChange={(e) => setUser({
                  ...user,
                  email: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={user.role || ''}
                onChange={(e) => setUser({
                  ...user,
                  role: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={user.status || ''}
                onChange={(e) => setUser({
                  ...user,
                  status: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
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
        ) : (
          <UserActivity userId={user.id} />
        )}
      </div>
    </div>
  );
};

export default EditUserModal;
