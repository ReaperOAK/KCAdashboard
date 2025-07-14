

import React, { useState, useEffect, useCallback } from 'react';
import { AttendanceApi } from '../../api/attendance';
import AttendanceSettingsSkeleton from '../../components/attendance/AttendanceSettingsSkeleton';
import ErrorAlert from '../../components/attendance/ErrorAlert';
import SettingsForm from '../../components/attendance/SettingsForm';


// AttendanceSettings: Container for attendance settings page (single responsibility)
const AttendanceSettings = React.memo(function AttendanceSettings() {
  // State for settings, loading, saving, and error
  const [settings, setSettings] = useState({
    minAttendancePercent: 75,
    lateThreshold: 15,
    autoMarkAbsent: 30,
    reminderBefore: 60,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await AttendanceApi.getSettings();
        if (isMounted && response.success && response.settings) {
          setSettings({
            minAttendancePercent: response.settings.min_attendance_percent ?? 75,
            lateThreshold: response.settings.late_threshold_minutes ?? 15,
            autoMarkAbsent: response.settings.auto_mark_absent_after_minutes ?? 30,
            reminderBefore: response.settings.reminder_before_minutes ?? 60,
          });
        } else if (isMounted) {
          setError('Failed to load settings');
        }
      } catch (error) {
        if (isMounted) setError('Failed to load settings');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await AttendanceApi.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Responsive, beautiful, accessible card layout
  return (
    <section className="w-full max-w-2xl mx-auto px-2 sm:px-4 md:px-6 py-8">
      <div className="bg-background-light dark:bg-background-dark border border-gray-light shadow-lg rounded-2xl p-4 sm:p-8 transition-all duration-200">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-8 text-center">Attendance Settings</h1>
        {loading ? (
          <AttendanceSettingsSkeleton />
        ) : (
          <>
            <ErrorAlert error={error} />
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-success text-white border border-success text-center animate-fade-in">
                Settings saved successfully!
              </div>
            )}
            <SettingsForm
              settings={settings}
              onChange={setSettings}
              onSubmit={handleSubmit}
              saving={saving}
            />
          </>
        )}
      </div>
    </section>
  );
});

export default AttendanceSettings;
