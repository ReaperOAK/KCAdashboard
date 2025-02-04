import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Chart from 'chart.js/auto';

const TeacherAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // const [zoomMeetings, setZoomMeetings] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/php/get-students.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStudents(data);
        const initialAttendance = data.reduce((acc, student) => {
          acc[student.id] = { present: false, absent: false };
          return acc;
        }, {});
        setAttendance(initialAttendance);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    renderAnalytics();
  }, [attendance]); // Re-render chart when attendance changes

  const syncWithZoom = async () => {
    try {
      const response = await fetch('/php/sync-zoom-attendance.php');
      const data = await response.json();
      setAttendance(prevAttendance => ({
        ...prevAttendance,
        ...data
      }));
    } catch (error) {
      setError('Failed to sync with Zoom');
    }
  };

  const handleAttendanceChange = (studentId, type) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        present: type === 'present' ? !prev[studentId].present : false,
        absent: type === 'absent' ? !prev[studentId].absent : false,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    setAttendance((prev) =>
      Object.keys(prev).reduce((acc, studentId) => {
        acc[studentId] = { present: true, absent: false };
        return acc;
      }, {})
    );
  };

  const handleExport = (format) => {
    // Implement export functionality here
    alert(`Exporting attendance data to ${format}`);
  };

  const renderAnalytics = () => {
    const ctx = document.getElementById('attendanceChart');
    new Chart(ctx, {
      type: 'line',
      data: {
        // Analytics data configuration
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1f9]">
      <main className="flex-grow p-8">
        <section className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Attendance Marking</h2>
              <p className="text-gray-600">Selected Date: {selectedDate.toLocaleDateString()}</p>
            </div>
            <button
              onClick={syncWithZoom}
              className="bg-[#461fa3] hover:bg-[#7646eb] text-white px-4 py-2 rounded"
            >
              Sync with Zoom
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                select={info => setSelectedDate(info.start)}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                onClick={handleMarkAllPresent}
              >
                Mark All Present
              </button>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Student Name</th>
                    <th className="py-2 px-4 border-b">Present</th>
                    <th className="py-2 px-4 border-b">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="py-2 px-4 border-b">{student.name}</td>
                      <td className="py-2 px-4 border-b text-center">
                        <input
                          type="checkbox"
                          checked={attendance[student.id]?.present || false}
                          onChange={() => handleAttendanceChange(student.id, 'present')}
                        />
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        <input
                          type="checkbox"
                          checked={attendance[student.id]?.absent || false}
                          onChange={() => handleAttendanceChange(student.id, 'absent')}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Attendance Analytics</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <canvas id="attendanceChart"></canvas>
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

export default TeacherAttendance;