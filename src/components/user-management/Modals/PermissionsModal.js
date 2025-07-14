import React, { useCallback, useRef, useEffect } from 'react';
import PERMISSIONS from '../../../utils/permissions';

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PermissionsModal = React.memo(function PermissionsModal({
  open,
  user,
  permissions,
  setPermissions,
  onClose,
  onSave,
  error,
}) {
  const modalRef = useRef(null);

  // Keyboard accessibility: close on Escape, focus trap
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (modalRef.current) modalRef.current.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleCheckboxChange = useCallback(
    (value) => (e) => {
      const checked = e.target.checked;
      setPermissions((prev) => {
        if (checked) return [...(prev || []), value];
        return (prev || []).filter((p) => p !== value);
      });
    },
    [setPermissions]
  );

  if (!open || !user) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="permissions-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-background-light border border-gray-light rounded-2xl shadow-2xl p-3 sm:p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-300 animate-fade-in"
        tabIndex={-1}
        role="document"
        aria-label="Manage user permissions modal content"
      >
        <div className="flex justify-between items-center mb-2 sm:mb-4 px-1 sm:px-2">
          <h2 id="permissions-modal-title" className="text-2xl sm:text-3xl font-semibold text-text-dark tracking-tight leading-tight" aria-label="Manage Permissions">
            Manage Permissions
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-dark hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
            aria-label="Close modal"
            tabIndex={0}
          >
            <CloseIcon />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-700 border border-red-800 text-white rounded text-sm flex items-center gap-2" role="alert">
            {/* Optionally add an error icon here */}
            {error}
          </div>
        )}
        <div className="space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1" aria-label="Permission categories">
          {Object.entries(PERMISSIONS).map(([category, perms]) => (
            <div key={category} className="border-b border-gray-light pb-4">
              <h3 className="font-medium text-primary mb-2 text-base sm:text-lg">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(perms).map(([key, value]) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={permissions?.includes(value) || false}
                      onChange={handleCheckboxChange(value)}
                      className="rounded border-gray-light text-secondary focus:ring-accent focus:outline-none transition-all duration-150"
                      aria-checked={permissions?.includes(value) || false}
                    />
                    <span className="text-sm text-text-dark">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-light rounded-lg shadow-sm text-sm font-medium text-primary hover:bg-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full sm:w-auto transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-accent hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full sm:w-auto transition-all duration-200"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
});

export default PermissionsModal;
