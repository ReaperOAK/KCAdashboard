
import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../utils/api';

const AttendanceSettingsSkeleton = React.memo(function AttendanceSettingsSkeleton() {
  return (
    <div className="flex items-center justify-center h-48" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading settings...</div>
    </div>
  );
});

const ErrorAlert = React.memo(function ErrorAlert({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg" role="alert">
      {error}
    </div>
  );
});

const SettingsForm = React.memo(function SettingsForm({ settings, onChange, onSubmit, saving }) {
  // Named handlers for accessibility
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
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          aria-busy={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
});

const AttendanceSettings = React.memo(function AttendanceSettings() {
  const [settings, setSettings] = useState({
    minAttendancePercent: 75,
    lateThreshold: 15,
    autoMarkAbsent: 30,
    reminderBefore: 60,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const response = await ApiService.get('/attendance/get-settings.php');
        if (isMounted && response.success && response.settings) {
          setSettings({
            minAttendancePercent: response.settings.min_attendance_percent ?? 75,
            lateThreshold: response.settings.late_threshold_minutes ?? 15,
            autoMarkAbsent: response.settings.auto_mark_absent_after_minutes ?? 30,
            reminderBefore: response.settings.reminder_before_minutes ?? 60,
          });
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load settings');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await ApiService.post('/attendance/update-settings.php', settings);
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  if (loading) return <AttendanceSettingsSkeleton />;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-primary mb-6">Attendance Settings</h2>
      <ErrorAlert error={error} />
      <SettingsForm
        settings={settings}
        onChange={setSettings}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
});

export default AttendanceSettings;
