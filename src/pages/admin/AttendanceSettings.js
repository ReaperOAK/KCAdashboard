
import React, { useState, useEffect, useCallback } from 'react';
import { AttendanceApi } from '../../api/attendance';
import AttendanceSettingsSkeleton from '../../components/attendance/AttendanceSettingsSkeleton';
import ErrorAlert from '../../components/attendance/ErrorAlert';
import SettingsForm from '../../components/attendance/SettingsForm';

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
        const response = await AttendanceApi.getSettings();
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
      await AttendanceApi.updateSettings(settings);
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
