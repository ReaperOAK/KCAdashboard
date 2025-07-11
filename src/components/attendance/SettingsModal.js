import React, { useCallback } from 'react';

const SettingsModal = React.memo(function SettingsModal({ settings, setSettings, onClose, onSave }) {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  }, [setSettings]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave();
  }, [onSave]);

  // Focus trap and escape key for accessibility
  React.useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-dark opacity-75"></div>
        </div>
        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <h2 className="text-2xl font-bold text-primary mb-4">Attendance Settings</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary" htmlFor="minAttendancePercent">
                Minimum Attendance Percentage
              </label>
              <input
                id="minAttendancePercent"
                name="minAttendancePercent"
                type="number"
                value={settings.minAttendancePercent}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
                min="0"
                max="100"
                aria-label="Minimum attendance percent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary" htmlFor="lateThreshold">
                Late Threshold (minutes)
              </label>
              <input
                id="lateThreshold"
                name="lateThreshold"
                type="number"
                value={settings.lateThreshold}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
                min="0"
                aria-label="Late threshold in minutes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary" htmlFor="autoMarkAbsent">
                Auto-mark Absent After (minutes)
              </label>
              <input
                id="autoMarkAbsent"
                name="autoMarkAbsent"
                type="number"
                value={settings.autoMarkAbsent}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
                min="0"
                aria-label="Auto-mark absent after minutes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary" htmlFor="reminderBefore">
                Reminder Before Class (minutes)
              </label>
              <input
                id="reminderBefore"
                name="reminderBefore"
                type="number"
                value={settings.reminderBefore}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
                min="0"
                aria-label="Reminder before class in minutes"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-light rounded-md shadow-sm text-sm font-medium text-primary hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
              >
                Save Settings
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-dark hover:text-gray-light focus:outline-none"
            aria-label="Close settings modal"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default SettingsModal;
