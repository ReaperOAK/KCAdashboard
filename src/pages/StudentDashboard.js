import React, { useEffect, useState } from 'react';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    nextClass: { subject: '', time: '', link: '' },
    attendance: { percentage: 0, calendar: [] },
    notifications: [],
    performance: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/php/student-dashboard-data.php');
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (!response.ok) {
            throw new Error(data.message || 'Network response was not ok');
          }
          setDashboardData(data);
        } catch (jsonError) {
          throw new Error('Failed to parse JSON: ' + text);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <h2 className="text-2xl font-bold mb-4">Current Class Schedule</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Next Class: {dashboardData.nextClass?.subject || 'N/A'}</p>
            <p>Time: {dashboardData.nextClass?.time || 'N/A'}</p>
            <p>
              Link:{' '}
              {dashboardData.nextClass?.link ? (
                <a
                  href={dashboardData.nextClass?.link}
                  className="text-blue-500 hover:underline"
                >
                  Join via Zoom
                </a>
              ) : (
                'N/A'
              )}
            </p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Summary</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Attendance Percentage: {dashboardData.attendance?.percentage || 0}%</p>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {dashboardData.attendance?.calendar?.map((day, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full ${
                    day === 'present' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.notifications?.length > 0 ? (
              <ul>
                {dashboardData.notifications?.map((note, index) => (
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
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Performance Overview</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.performance?.length > 0 ? (
              <ul>
                {dashboardData.performance?.map((subject, index) => (
                  <li key={index} className="mb-2">
                    {subject.name}: {subject.grade}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No performance data available.</p>
            )}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Homework</h3>
              <p>Access your homework assignments.</p>
              <a href="/homework" className="text-blue-500 hover:underline">
                Go to Homework
              </a>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Study Materials</h3>
              <p>Download notes and study materials.</p>
              <a
                href="/study-materials"
                className="text-blue-500 hover:underline"
              >
                Go to Study Materials
              </a>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Resources</h3>
              <p>Access additional resources and links.</p>
              <a href="/resources" className="text-blue-500 hover:underline">
                Go to Resources
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;