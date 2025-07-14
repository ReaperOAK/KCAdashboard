

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AttendanceApi } from '../../api/attendance';
import { BatchesApi } from '../../api/batches';
import { AuthApi } from '../../api/auth';
import AttendanceSkeleton from '../../components/attendance/AttendanceSkeleton';
import BatchSelect from '../../components/attendance/BatchSelect';
import ExportControls from '../../components/attendance/ExportControls';
import SettingsModal from '../../components/attendance/SettingsModal';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import ErrorAlert from '../../components/attendance/ErrorAlert';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

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
  const [error, setError] = useState(null);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setError(null);
      const response = await AttendanceApi.getAll(selectedBatch);
      if (response.attendance_data) setAttendanceData(response.attendance_data);
      if (response.settings) setSettings(response.settings);
    } catch (error) {
      setError('Failed to fetch attendance data. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Failed to fetch attendance data:', error);
    }
  }, [selectedBatch]);

  const fetchBatches = useCallback(async () => {
    try {
      setError(null);
      const response = await BatchesApi.getBatches();
      setBatches(response.batches);
    } catch (error) {
      setError('Failed to fetch batches. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Failed to fetch batches:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchBatches(), fetchAttendanceData()]).finally(() => setLoading(false));
  }, [fetchBatches, fetchAttendanceData]);

  const handleSettingsSave = useCallback(async () => {
    try {
      setError(null);
      await AttendanceApi.updateSettings(settings);
      setShowSettingsModal(false);
    } catch (error) {
      setError('Failed to update settings. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Failed to update settings:', error);
    }
  }, [settings]);

  const handleExportReport = useCallback(async () => {
    try {
      setError(null);
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
      setError(error.message || 'Failed to export report. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Failed to export report:', error);
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

  // Compute stats for AttendanceStats
  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, totalClasses = 0;
    (attendanceData || []).forEach(item => {
      present += item.present_count || 0;
      absent += item.absent_count || 0;
      late += item.late_count || 0;
      totalClasses += 1;
    });
    const attendancePercentage = totalClasses > 0 ? Math.round((present / (present + absent + late)) * 100) : 0;
    return { present, absent, late, totalClasses, attendancePercentage };
  }, [attendanceData]);

  // CalendarCard component for modularity
  const CalendarCard = React.memo(function CalendarCard() {
    return (
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
    );
  });

  return (
    <div className="min-h-screen bg-background-light">
      <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-8 max-w-7xl mx-auto">
        {loading ? (
          <AttendanceSkeleton />
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 lg:mb-0">Attendance System</h1>
                <div className="flex flex-col gap-2 w-full lg:w-auto lg:flex-row lg:items-center lg:space-x-4 flex-wrap md:flex-row md:space-x-3 md:gap-2">
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
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent w-full lg:w-auto transition-all duration-200"
                    aria-label="Open attendance settings"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>
            {error && <ErrorAlert error={error} />}
            <AttendanceStats stats={stats} />
            <CalendarCard />
            <div className="mt-6">
              <AttendanceTable attendanceData={attendanceData} />
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
