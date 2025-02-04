import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    nextClass: {},
    attendancePending: 0,
    batchSchedule: [],
    notifications: [],
    pgnDatabase: [],
    simulGames: [],
    studentAnalytics: {},
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

  const handlePGNUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('pgn', file);

    try {
      const response = await fetch('/php/upload-pgn.php', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setDashboardData(prev => ({
        ...prev,
        pgnDatabase: [...prev.pgnDatabase, data.pgn]
      }));
    } catch (error) {
      console.error('Error uploading PGN:', error);
    }
  };

  const createSimulGame = async () => {
    try {
      const response = await fetch('https://lichess.org/api/challenge/open', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_LICHESS_TOKEN}`
        }
      });
      const data = await response.json();
      setDashboardData(prev => ({
        ...prev,
        simulGames: [...prev.simulGames, data]
      }));
    } catch (error) {
      console.error('Error creating simul game:', error);
    }
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
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">PGN Database</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <input
              type="file"
              accept=".pgn"
              onChange={handlePGNUpload}
              className="mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              {dashboardData.pgnDatabase.map((pgn, index) => (
                <div key={index} className="p-2 border rounded">
                  <p>{pgn.title}</p>
                  <button className="text-blue-500">View</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Simul Games</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <button
              onClick={createSimulGame}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Simul Game
            </button>
            <div className="mt-4">
              {dashboardData.simulGames.map((game, index) => (
                <div key={index} className="p-2 border-b">
                  <p>Game ID: {game.id}</p>
                  <a href={game.url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-500">
                    Join Game
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Student Analytics</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <canvas id="performanceChart"></canvas>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;