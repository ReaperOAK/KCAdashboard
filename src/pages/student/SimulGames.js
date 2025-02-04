import React, { useState, useEffect } from 'react';
import { FaChess, FaClock, FaUsers, FaLink } from 'react-icons/fa';

const SimulGames = () => {
  const [upcomingSimuls, setUpcomingSimuls] = useState([]);
  const [pastSimuls, setPastSimuls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSimulGames();
  }, []);

  const fetchSimulGames = async () => {
    try {
      const response = await fetch('/api/simul-games');
      const data = await response.json();
      setUpcomingSimuls(data.upcoming);
      setPastSimuls(data.past);
    } catch (err) {
      setError('Failed to load simul games');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSimul = async (simulId) => {
    try {
      const response = await fetch(`/api/simul-games/${simulId}/join`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchSimulGames();
      }
    } catch (err) {
      setError('Failed to join simul');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Simultaneous Exhibition Games</h1>

      {/* Upcoming Simuls */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#461fa3]">Upcoming Simuls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingSimuls.map(simul => (
            <div key={simul.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#200e4a]">{simul.title}</h3>
                <span className="text-[#461fa3]">
                  <FaUsers className="inline mr-2" />
                  {simul.participantsCount}/20
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="flex items-center text-[#3b3a52]">
                  <FaChess className="mr-2" /> Host: {simul.host}
                </p>
                <p className="flex items-center text-[#3b3a52]">
                  <FaClock className="mr-2" /> {new Date(simul.startTime).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleJoinSimul(simul.id)}
                className="w-full bg-[#461fa3] text-white py-2 rounded hover:bg-[#7646eb] transition-colors"
              >
                Join Simul
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Past Simuls */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-[#461fa3]">Past Simuls</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#3b3a52]">
                <th className="pb-4">Date</th>
                <th className="pb-4">Host</th>
                <th className="pb-4">Players</th>
                <th className="pb-4">Results</th>
              </tr>
            </thead>
            <tbody>
              {pastSimuls.map(simul => (
                <tr key={simul.id} className="border-t">
                  <td className="py-4">{new Date(simul.date).toLocaleDateString()}</td>
                  <td className="py-4">{simul.host}</td>
                  <td className="py-4">{simul.participantsCount}</td>
                  <td className="py-4">
                    <a 
                      href={simul.resultsLink}
                      className="text-[#461fa3] hover:text-[#7646eb]"
                    >
                      <FaLink className="inline mr-2" />
                      View Games
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SimulGames;