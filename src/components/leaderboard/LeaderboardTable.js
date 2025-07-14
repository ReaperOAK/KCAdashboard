import React from 'react';

/**
 * LeaderboardTable: Renders a responsive, beautiful leaderboard table.
 * Props:
 *   - data: array of leaderboard entries
 *   - activeQuiz: string ("overall" or quiz id)
 *   - quizzes: array (not used here)
 *   - formatTime: function to format time
 */
const LeaderboardTable = React.memo(function LeaderboardTable({ data, activeQuiz, quizzes, formatTime }) {
  // Color classes for top 3 ranks
  const rankColors = [
    'bg-yellow-400 text-white scale-110 shadow-lg', // 1st
    'bg-gray-400 text-white', // 2nd
    'bg-amber-700 text-white', // 3rd
  ];

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[340px] sm:min-w-[600px] bg-background-light rounded-xl shadow-md border border-gray-light" aria-label="Leaderboard">
        <thead className="sticky top-0 z-10">
          <tr className="bg-primary text-white text-xs sm:text-sm uppercase tracking-wide">
            <th className="py-3 px-2 sm:px-4 text-left rounded-tl-xl">Rank</th>
            <th className="py-3 px-2 sm:px-4 text-left">Student</th>
            {activeQuiz === 'overall' ? (
              <>
                <th className="py-3 px-2 sm:px-4 text-left">Total Score</th>
                <th className="py-3 px-2 sm:px-4 text-left">Quizzes Completed</th>
                <th className="py-3 px-2 sm:px-4 text-left rounded-tr-xl">Average Score</th>
              </>
            ) : (
              <>
                <th className="py-3 px-2 sm:px-4 text-left">Score</th>
                <th className="py-3 px-2 sm:px-4 text-left">Time</th>
                <th className="py-3 px-2 sm:px-4 text-left rounded-tr-xl">Date</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={activeQuiz === 'overall' ? 5 : 5} className="py-8 text-center text-gray-400 text-base font-medium">
                No leaderboard data available.
              </td>
            </tr>
          ) : (
            data.map((entry, index) => (
              <tr
                key={entry.id || index}
                className="border-b border-gray-light hover:bg-accent/10 focus-within:bg-accent/10 transition-all duration-200 group"
                tabIndex={0}
                aria-label={`Leaderboard row for ${entry.student_name}`}
              >
                <td className="py-3 px-2 sm:px-4">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shadow-md border-2 border-white group-hover:scale-110 transition-transform duration-200 ${
                      rankColors[index] || 'bg-gray-200 text-primary'
                    }`}
                    aria-label={`Rank ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-2 sm:px-4 font-medium text-base sm:text-lg text-text-dark whitespace-nowrap">
                  {entry.student_name}
                </td>
                {activeQuiz === 'overall' ? (
                  <>
                    <td className="py-3 px-2 sm:px-4 font-semibold text-secondary">{entry.total_score}</td>
                    <td className="py-3 px-2 sm:px-4">{entry.quizzes_completed}</td>
                    <td className="py-3 px-2 sm:px-4">{entry.average_score}%</td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-2 sm:px-4 font-semibold text-secondary">{entry.score}</td>
                    <td className="py-3 px-2 sm:px-4">{formatTime(entry.time_taken)}</td>
                    <td className="py-3 px-2 sm:px-4">{new Date(entry.completed_at).toLocaleDateString()}</td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default LeaderboardTable;
