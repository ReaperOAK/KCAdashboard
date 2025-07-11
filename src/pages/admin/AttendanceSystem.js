

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AttendanceApi } from '../../api/attendance';
import { BatchesApi } from '../../api/batches';
import { AuthApi } from '../../api/auth';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import AttendanceSkeleton from '../../components/attendance/AttendanceSkeleton';
import BatchSelect from '../../components/attendance/BatchSelect';
import ExportControls from '../../components/attendance/ExportControls';
import SettingsModal from '../../components/attendance/SettingsModal';

const AttendanceSystem = React.memo(function AttendanceSystem() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [settings, setSettings] = useState({
    minAttendancePercent: 75,
    lateThreshold: 15,
    autoMarkAbsent: 30,
    reminderBefore: 60,
  });
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const fetchAttendanceData = useCallback(async () => {
    try {
      const response = await AttendanceApi.getAll(selectedBatch);
      if (response.attendance_data) setAttendanceData(response.attendance_data);
      if (response.settings) setSettings(response.settings);
    } catch (error) {
      // Could add error boundary/notification here
      // eslint-disable-next-line no-console
      console.error('Failed to fetch attendance data:', error);
    }
  }, [selectedBatch]);

  const fetchBatches = useCallback(async () => {
    try {
      const response = await BatchesApi.getBatches();
      setBatches(response.batches);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch batches:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchBatches(), fetchAttendanceData()]).finally(() => setLoading(false));
  }, [fetchBatches, fetchAttendanceData]);

  const handleSettingsSave = useCallback(async () => {
    try {
      await AttendanceApi.updateSettings(settings);
      setShowSettingsModal(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update settings:', error);
    }
  }, [settings]);

  const handleExportReport = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');
      try {
        await AuthApi.verifyToken();
      } catch (error) {
        localStorage.removeItem('token');
        throw new Error('Your session has expired. Please login again.');
      }
      const blob = await AttendanceApi.exportReport({
        format: exportFormat,
        batch_id: selectedBatch,
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to export report:', error);
      // Could add error notification here
    }
  }, [exportFormat, selectedBatch, dateRange]);

  // Memoize calendar events for performance, use color tokens
  const calendarEvents = useMemo(() =>
    (attendanceData || []).map(item => ({
      title: `${item.batch_name} - ${item.present_count}/${item.total_students}`,
      start: item.session_date,
      backgroundColor: item.attendance_percentage >= settings.minAttendancePercent ? '#43a047' : '#e53935', // success/error from tailwind config
      borderColor: item.attendance_percentage >= settings.minAttendancePercent ? '#43a047' : '#e53935',
      textColor: '#fff',
    })), [attendanceData, settings.minAttendancePercent]);

  return (
    <div className="min-h-screen bg-background-light">
      <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-8">
        {loading ? (
          <AttendanceSkeleton />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Attendance System</h1>
              <div className="flex flex-col sm:flex-row sm:space-x-4 gap-2 w-full sm:w-auto">
                <BatchSelect
                  batches={batches}
                  selectedBatch={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                />
                <ExportControls
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  exportFormat={exportFormat}
                  setExportFormat={setExportFormat}
                  onExport={handleExportReport}
                  disabled={!dateRange.start || !dateRange.end}
                />
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto transition-all duration-200"
                  aria-label="Open attendance settings"
                >
                  Settings
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <Calendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                events={calendarEvents}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek',
                }}
                height="auto"
              />
            </div>
            {showSettingsModal && (
              <SettingsModal
                settings={settings}
                setSettings={setSettings}
                onClose={() => setShowSettingsModal(false)}
                onSave={handleSettingsSave}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default AttendanceSystem;
