import React from 'react';
import SortableTh from './SortableTh';
import { FaRedo } from 'react-icons/fa';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

/**
 * Table for quiz history attempts.
 * @param {Object} props
 */
const HistoryTable = React.memo(function HistoryTable({ history, loading, error, onRetry, sortBy, sortOrder, onSort }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-primary">Quiz Attempts</h2>
      </div>
      {loading ? (
        <div className="p-6 text-center">
          <p className="text-gray-dark">Loading quiz history...</p>
        </div>
      ) : error ? (
        <div className="p-6">
          <p className="text-red-500">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-dark">No quiz history found.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
          >
            Take Your First Quiz
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-light/40">
                <SortableTh label="Date" sortKey="date" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <th className="py-3 px-4 text-left">Quiz Title</th>
                <SortableTh label="Difficulty" sortKey="difficulty" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <SortableTh label="Score" sortKey="score" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <SortableTh label="Time Taken" sortKey="time" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((attempt) => {
                const percentageScore = Math.round((attempt.score / attempt.total_questions) * 100);
                const isPassing = percentageScore >= 70;
                return (
                  <tr key={attempt.id} className="border-t hover:bg-gray-light/40 transition-colors">
                    <td className="py-3 px-4">{new Date(attempt.completed_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{attempt.quiz_title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize
                        ${attempt.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        attempt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}
                      >
                        {attempt.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>{percentageScore}%</span>
                      <span className="text-gray-dark text-sm ml-1">({attempt.score}/{attempt.total_questions})</span>
                    </td>
                    <td className="py-3 px-4">{formatTime(attempt.time_taken)}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onRetry(attempt.quiz_id)}
                        className="text-secondary hover:text-accent font-medium focus:outline-none focus-visible:underline transition-colors"
                        aria-label={`Retry quiz: ${attempt.quiz_title}`}
                      >
                        <FaRedo className="inline mr-1" /> Retry
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default HistoryTable;
