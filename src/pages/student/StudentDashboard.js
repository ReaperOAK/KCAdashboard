import React, { useEffect, useState } from 'react';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    nextClass: { subject: '', time: '', link: '' },
    attendance: { percentage: 0, calendar: [] },
    notifications: [],
    performance: [],
    chessStudies: [],
    upcomingSimuls: [],
    tournaments: [],
    quizzes: [],
    recentGames: []
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
                  href={dashboardData.nextClass.link}
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
                {dashboardData.performance.map((subject, index) => (
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

        {/* Chess Game Area */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Chess Game Area</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Quick Play</h3>
              <div className="space-y-2">
                <a href="https://lichess.org/embed" className="block text-blue-500 hover:underline">Play with AI</a>
                <a href="https://lichess.org/training" className="block text-blue-500 hover:underline">Puzzles</a>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Recent Games</h3>
              <ul>
                {dashboardData.recentGames.map((game, index) => (
                  <li key={index} className="mb-2">
                    <a href={game.link} className="text-blue-500 hover:underline">
                      {game.opponent} - {game.result}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Chess Studies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Chess Studies</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.chessStudies.map((study, index) => (
              <div key={index} className="mb-4 p-2 border-b">
                <h3 className="font-semibold">{study.title}</h3>
                <p className="text-sm text-gray-600">{study.description}</p>
                <a href={study.lichessLink} className="text-blue-500 hover:underline">
                  Open in Lichess
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Simul Games */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Simultaneous Exhibitions</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.upcomingSimuls.map((simul, index) => (
              <div key={index} className="mb-4 p-2 border-b">
                <h3 className="font-semibold">{simul.title}</h3>
                <p>Host: {simul.host}</p>
                <p>Date: {simul.date}</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  Join Simul
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tournaments */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tournaments</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.tournaments.map((tournament, index) => (
              <div key={index} className="mb-4 p-2 border-b">
                <h3 className="font-semibold">{tournament.name}</h3>
                <p>Format: {tournament.format}</p>
                <p>Date: {tournament.date}</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  Register
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Chess Quizzes</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {dashboardData.quizzes.map((quiz, index) => (
              <div key={index} className="mb-4 p-2 border-b">
                <h3 className="font-semibold">{quiz.title}</h3>
                <p className="text-sm text-gray-600">Difficulty: {quiz.difficulty}</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;