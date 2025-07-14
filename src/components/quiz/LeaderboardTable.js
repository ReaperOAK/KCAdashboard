
import React from 'react';
import { FaTrophy } from 'react-icons/fa';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

/**
 * LeaderboardTable: Beautiful, accessible, responsive leaderboard table for quiz results page.
 */
const trophyColors = [
  'text-yellow-400 drop-shadow', // 1st
  'text-gray-400', // 2nd
  'text-amber-700', // 3rd
];

const LeaderboardTable = React.memo(function LeaderboardTable({ leaderboard, resultData }) {
  return (
    <section className="bg-white dark:bg-background-dark rounded-2xl shadow-md border border-gray-light w-full max-w-3xl mx-auto  overflow-hidden">
      <header className="p-6 border-b border-gray-light flex items-center gap-2">
        <FaTrophy className="text-accent text-xl mr-2" aria-hidden="true" />
        <h2 className="text-2xl font-semibold text-primary">Quiz Leaderboard</h2>
      </header>
      <div className="p-4 sm:p-6">
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-primary text-white text-sm uppercase">
                  <th className="py-2 px-4 text-left">Rank</th>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Score</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = resultData.user_id === entry.user_id;
                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-light ${isCurrentUser ? 'bg-accent/10 font-semibold' : 'hover:bg-gray-light/40'} transition-colors`}
                    >
                      <td className="py-2 px-4">
                        {index < 3 ? (
                          <span className={`flex items-center gap-1 ${trophyColors[index]}`}> <FaTrophy aria-hidden="true" /> {index + 1}</span>
                        ) : (
                          <span className="text-primary font-medium">{index + 1}</span>
                        )}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">{entry.student_name}</td>
                      <td className="py-2 px-4">
                        <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-semibold">{entry.score}</span>
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">{formatTime(entry.time_taken)}</td>
                      <td className="py-2 px-4 whitespace-nowrap">{new Date(entry.completed_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <FaTrophy className="text-gray-light text-4xl mb-2" aria-hidden="true" />
            <p className="text-center text-gray-dark text-base">No leaderboard data available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
});

export default LeaderboardTable;
