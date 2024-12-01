import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const StudentAttendance = () => {
  const [events, setEvents] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch('/php/get-attendance.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEvents(data.events);
        setAttendancePercentage(data.percentage);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleExport = (format) => {
    // Implement export functionality here
    alert(`Exporting attendance data to ${format}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Calendar</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={events} />
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Percentage</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="w-full bg-gray-200 rounded-full">
              <div className="bg-green-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${attendancePercentage}%` }}>
                {attendancePercentage}%
              </div>
            </div>
            {attendancePercentage < 75 && (
              <p className="mt-4 text-red-500">Alert: Your attendance is below the required threshold!</p>
            )}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Export Options</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
              onClick={() => handleExport('PDF')}
            >
              Export to PDF
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => handleExport('Excel')}
            >
              Export to Excel
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentAttendance;