import React from 'react';

const LeaderboardTable = React.memo(({ data, activeQuiz, quizzes, formatTime }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]" aria-label="Leaderboard">
        <thead className="sticky top-0 z-10">
          <tr className="bg-primary text-white text-sm uppercase">
            <th className="py-3 px-4 text-left">Rank</th>
            <th className="py-3 px-4 text-left">Student</th>
            {activeQuiz === 'overall' ? (
              <>
                <th className="py-3 px-4 text-left">Total Score</th>
                <th className="py-3 px-4 text-left">Quizzes Completed</th>
                <th className="py-3 px-4 text-left">Average Score</th>
              </>
            ) : (
              <>
                <th className="py-3 px-4 text-left">Score</th>
                <th className="py-3 px-4 text-left">Time</th>
                <th className="py-3 px-4 text-left">Date</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr
              key={index}
              className="border-b border-gray-dark hover:bg-accent/10 focus-within:bg-accent/10 transition-all duration-200"
            >
              <td className="py-3 px-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md ${
                  index === 0
                    ? 'bg-yellow-500 text-white scale-110'
                    : index === 1
                    ? 'bg-gray-400 text-white'
                    : index === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-gray-200 text-primary'
                }`} aria-label={`Rank ${index + 1}`}>{index + 1}</span>
              </td>
              <td className="py-3 px-4 font-medium text-lg">{entry.student_name}</td>
              {activeQuiz === 'overall' ? (
                <>
                  <td className="py-3 px-4 font-semibold text-secondary">{entry.total_score}</td>
                  <td className="py-3 px-4">{entry.quizzes_completed}</td>
                  <td className="py-3 px-4">{entry.average_score}%</td>
                </>
              ) : (
                <>
                  <td className="py-3 px-4 font-semibold text-secondary">{entry.score}</td>
                  <td className="py-3 px-4">{formatTime(entry.time_taken)}</td>
                  <td className="py-3 px-4">{new Date(entry.completed_at).toLocaleDateString()}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default LeaderboardTable;
