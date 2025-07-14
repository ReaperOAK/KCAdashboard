
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

// Spinner icon for loading state
const Spinner = (
  <svg className="w-5 h-5 mr-2 animate-spin text-white inline-block align-middle" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const SettingsForm = React.memo(function SettingsForm({ settings, onChange, onSubmit, saving }) {
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    onChange(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  }, [onChange]);

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-3xl mx-auto bg-background-light border border-gray-light rounded-xl shadow-md p-6 md:p-8 space-y-8 "
      aria-label="Attendance settings form"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="minAttendancePercent" className="block text-sm font-medium text-primary mb-2">
            Minimum Attendance Percentage
          </label>
          <input
            id="minAttendancePercent"
            name="minAttendancePercent"
            type="number"
            value={settings.minAttendancePercent}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-light rounded-md bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
            min="0"
            max="100"
            aria-label="Minimum attendance percent"
          />
        </div>
        <div>
          <label htmlFor="lateThreshold" className="block text-sm font-medium text-primary mb-2">
            Late Threshold (minutes)
          </label>
          <input
            id="lateThreshold"
            name="lateThreshold"
            type="number"
            value={settings.lateThreshold}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-light rounded-md bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
            min="0"
            aria-label="Late threshold in minutes"
          />
        </div>
        <div>
          <label htmlFor="autoMarkAbsent" className="block text-sm font-medium text-primary mb-2">
            Auto-mark Absent After (minutes)
          </label>
          <input
            id="autoMarkAbsent"
            name="autoMarkAbsent"
            type="number"
            value={settings.autoMarkAbsent}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-light rounded-md bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
            min="0"
            aria-label="Auto-mark absent after minutes"
          />
        </div>
        <div>
          <label htmlFor="reminderBefore" className="block text-sm font-medium text-primary mb-2">
            Reminder Before Class (minutes)
          </label>
          <input
            id="reminderBefore"
            name="reminderBefore"
            type="number"
            value={settings.reminderBefore}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-light rounded-md bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
            min="0"
            aria-label="Reminder before class in minutes"
          />
        </div>
      </div>
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center px-5 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 transition-all duration-200 text-base font-semibold shadow-sm"
          aria-busy={saving}
        >
          {saving && Spinner}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: none; } }
        . { animation: fade-in 0.3s ease; }
      `}</style>
    </form>
  );
});

SettingsForm.propTypes = {
  settings: PropTypes.shape({
    minAttendancePercent: PropTypes.number.isRequired,
    lateThreshold: PropTypes.number.isRequired,
    autoMarkAbsent: PropTypes.number.isRequired,
    reminderBefore: PropTypes.number.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
};

export default SettingsForm;
