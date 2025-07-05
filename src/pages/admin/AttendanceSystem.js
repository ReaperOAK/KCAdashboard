
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

// Loading skeleton for attendance
const AttendanceSkeleton = React.memo(function AttendanceSkeleton() {
  return (
    <div className="flex items-center justify-center h-64" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading attendance data...</div>
    </div>
  );
});

// Batch select dropdown
const BatchSelect = React.memo(function BatchSelect({ batches, selectedBatch, onChange }) {
  return (
    <select
      value={selectedBatch}
      onChange={onChange}
      className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
      aria-label="Select batch"
    >
      <option value="all">All Batches</option>
      {batches.map(batch => (
        <option key={batch.id} value={batch.id}>{batch.name}</option>
      ))}
    </select>
  );
});

// Export controls
const ExportControls = React.memo(function ExportControls({ dateRange, setDateRange, exportFormat, setExportFormat, onExport, disabled }) {
  const handleStartChange = useCallback(e => setDateRange(prev => ({ ...prev, start: e.target.value })), [setDateRange]);
  const handleEndChange = useCallback(e => setDateRange(prev => ({ ...prev, end: e.target.value })), [setDateRange]);
  const handleFormatChange = useCallback(e => setExportFormat(e.target.value), [setExportFormat]);
  return (
    <div className="flex space-x-2">
      <input
        type="date"
        value={dateRange.start || ''}
        onChange={handleStartChange}
        className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Start date"
      />
      <input
        type="date"
        value={dateRange.end || ''}
        onChange={handleEndChange}
        className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="End date"
      />
      <select
        value={exportFormat}
        onChange={handleFormatChange}
        className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Export format"
      >
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
      </select>
      <button
        type="button"
        onClick={onExport}
        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        disabled={disabled}
        aria-disabled={disabled}
      >
        Export Report
      </button>
    </div>
  );
});

// Settings modal
const SettingsModal = React.memo(function SettingsModal({ settings, setSettings, onClose, onSave }) {
  // Named handlers for accessibility
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  }, [setSettings]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave();
  }, [onSave]);

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
                className="px-4 py-2 border border-gray-light rounded-md shadow-sm text-sm font-medium text-primary hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
      const response = await ApiService.get(`/attendance/get-all.php?batch=${selectedBatch}`);
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
      const response = await ApiService.get('/batches/get-all.php');
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
      await ApiService.post('/attendance/update-settings.php', settings);
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
        await ApiService.request('/auth/verify-token.php', 'GET');
      } catch (error) {
        localStorage.removeItem('token');
        throw new Error('Your session has expired. Please login again.');
      }
      const queryString = new URLSearchParams({
        format: exportFormat,
        batch_id: selectedBatch,
        start_date: dateRange.start,
        end_date: dateRange.end,
      }).toString();
      const response = await ApiService.request(
        `/attendance/export.php?${queryString}`,
        'GET',
        null,
        {
          headers: {
            'Accept': exportFormat === 'pdf' ? 'application/pdf' : 'text/csv',
            'X-Requested-With': 'XMLHttpRequest',
          },
          responseType: exportFormat === 'pdf' ? 'blob' : undefined,
        }
      );
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Export failed');
        }
        throw new Error(`Export failed with status: ${response.status}`);
      }
      const blob = await response.blob();
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

  // Memoize calendar events for performance
  const calendarEvents = useMemo(() =>
    (attendanceData || []).map(item => ({
      title: `${item.batch_name} - ${item.present_count}/${item.total_students}`,
      start: item.session_date,
      backgroundColor: item.attendance_percentage >= settings.minAttendancePercent ? '#32CD32' : '#FF6B6B',
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
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
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
