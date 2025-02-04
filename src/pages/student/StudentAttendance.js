import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FaFileDownload, FaCalendarCheck, FaExclamationTriangle } from 'react-icons/fa';

const StudentAttendance = () => {
  const [events, setEvents] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(75);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch('/php/get-attendance.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        
        setEvents(data.events.map(event => ({
          ...event,
          backgroundColor: event.status === 'present' ? '#461fa3' : '#af0505'
        })));
        setAttendancePercentage(data.percentage);
        setThreshold(data.threshold || 75);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleExport = async (format) => {
    try {
      const response = await fetch(`/php/export-attendance.php?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export attendance data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#461fa3]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
        <div className="text-[#af0505]">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Attendance Tracker</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#461fa3] flex items-center">
            <FaCalendarCheck className="mr-2" /> Attendance Calendar
          </h2>
          <FullCalendar 
            plugins={[dayGridPlugin]} 
            initialView="dayGridMonth" 
            events={events}
            height="auto"
          />
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#461fa3]">Attendance Overview</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-[#3b3a52]">
                  Current Attendance: <span className="font-semibold">{attendancePercentage}%</span>
                </div>
                <div className="text-[#3b3a52]">
                  Required: <span className="font-semibold">{threshold}%</span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#f3f1f9]">
                <div 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    attendancePercentage >= threshold ? 'bg-[#461fa3]' : 'bg-[#af0505]'
                  }`}
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
              {attendancePercentage < threshold && (
                <div className="flex items-center text-[#af0505] mt-2">
                  <FaExclamationTriangle className="mr-2" />
                  Your attendance is below the required threshold!
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#461fa3]">Export Options</h2>
            <div className="flex gap-4">
              <button
                onClick={() => handleExport('PDF')}
                className="flex-1 bg-[#200e4a] hover:bg-[#461fa3] text-white py-2 px-4 rounded transition-colors"
              >
                <FaFileDownload className="inline mr-2" />
                PDF Report
              </button>
              <button
                onClick={() => handleExport('Excel')}
                className="flex-1 bg-[#200e4a] hover:bg-[#461fa3] text-white py-2 px-4 rounded transition-colors"
              >
                <FaFileDownload className="inline mr-2" />
                Excel Report
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentAttendance;