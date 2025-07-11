import React from 'react';
import PERMISSIONS from '../../../utils/permissions';

/**
 * PermissionsModal - Modal for managing user permissions.
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Object} props.user
 * @param {Array} props.permissions
 * @param {function} props.setPermissions
 * @param {function} props.onClose
 * @param {function} props.onSave
 * @param {string} [props.error]
 */
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
      <div className="bg-background-light border border-gray-light rounded-xl p-6 max-w-lg w-full shadow-lg transition-all duration-200" tabIndex={-1}>
        <h2 id="permissions-modal-title" className="text-2xl font-bold text-primary mb-4">Manage Permissions</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">{error}</div>
        )}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto" aria-label="Permission categories">
          {Object.entries(PERMISSIONS).map(([category, perms]) => (
            <div key={category} className="border-b pb-4">
              <h3 className="font-medium text-primary mb-2">{category}</h3>
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
                    <span className="text-sm text-text-dark">{key}</span>
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
            className="px-4 py-2 border border-gray-light rounded-md shadow-sm text-sm font-medium text-primary hover:bg-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
});

export default PermissionsModal;
