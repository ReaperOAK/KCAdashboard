import React from 'react';
import { FaTrophy } from 'react-icons/fa';

/**
 * Leaderboard table for quiz results page.
 */
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

const LeaderboardTable = React.memo(function LeaderboardTable({ leaderboard, resultData }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-light">
        <h2 className="text-xl font-bold text-primary">Quiz Leaderboard</h2>
      </div>
      <div className="p-6">
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-light">
                  <th className="py-2 px-4 text-left">Rank</th>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Score</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-light ${resultData.user_id === entry.user_id ? 'bg-background-light' : ''}`}
                  >
                    <td className="py-2 px-4">
                      {index === 0 ? (
                        <span className="flex items-center"><FaTrophy className="text-yellow-500 mr-1" aria-hidden="true" /> 1</span>
                      ) : index === 1 ? (
                        <span className="flex items-center"><FaTrophy className="text-gray-400 mr-1" aria-hidden="true" /> 2</span>
                      ) : index === 2 ? (
                        <span className="flex items-center"><FaTrophy className="text-amber-700 mr-1" aria-hidden="true" /> 3</span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="py-2 px-4">{entry.student_name}</td>
                    <td className="py-2 px-4">{entry.score}</td>
                    <td className="py-2 px-4">{formatTime(entry.time_taken)}</td>
                    <td className="py-2 px-4">{new Date(entry.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-dark py-4">No leaderboard data available yet.</p>
        )}
      </div>
    </div>
  );
});

export default LeaderboardTable;
