import React, { useState, useEffect } from 'react';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    nextClass: {},
    attendancePending: 0,
    batchSchedule: [],
    notifications: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/php/teacher-dashboard-data.php', {
          method: 'GET',
          credentials: 'include', // Ensure credentials are included
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMarkAttendance = () => {
    // Simulate attendance marking
    alert('Attendance marked!');
    setDashboardData((prevData) => ({
      ...prevData,
      attendancePending: 0, // Reset attendance pending count
    }));
  };

  const handleAssignGrades = () => {
    // Simulate grade assignment
    alert('Grades assigned!');
  };

  const handleUpload = () => {
    // Simulate material upload
    alert('Materials uploaded!');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen flex">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Stats</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Upcoming Class: {dashboardData.nextClass.subject}</p>
            <p>Time: {dashboardData.nextClass.time}</p>
            <p>Pending Attendance: {dashboardData.attendancePending} students</p>
            <button
              onClick={handleMarkAttendance}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            >
              Mark Attendance
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Batch Schedule</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.batchSchedule.length > 0 ? (
              dashboardData.batchSchedule.map((batch, index) => (
                <div key={index} className="mb-4">
                  <p>Batch: {batch.name}</p>
                  <p>Time: {batch.time}</p>
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={handleMarkAttendance}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Mark Attendance
                    </button>
                    <button
                      onClick={handleAssignGrades}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Assign Grades
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No batch schedules available.</p>
            )}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.notifications.length > 0 ? (
              <ul>
                {dashboardData.notifications.map((note, index) => (
                  <li key={index} className="mb-2">
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No new notifications.</p>
            )}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Upload Materials</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Upload study materials, assignments, and feedback.</p>
            <button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            >
              Upload
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;