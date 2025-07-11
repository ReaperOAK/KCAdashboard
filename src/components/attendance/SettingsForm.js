import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

const SettingsForm = React.memo(function SettingsForm({ settings, onChange, onSubmit, saving }) {
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    onChange(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  }, [onChange]);

  return (
    <form onSubmit={onSubmit} className="space-y-6" aria-label="Attendance settings form">
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
            className="w-full px-3 py-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
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
            className="w-full px-3 py-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
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
            className="w-full px-3 py-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
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
            className="w-full px-3 py-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            min="0"
            aria-label="Reminder before class in minutes"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 transition-all duration-200"
          aria-busy={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
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
