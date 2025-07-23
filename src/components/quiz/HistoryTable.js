
import React from 'react';
import SortableTh from './SortableTh';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

/**
 * HistoryTable: Beautiful, accessible, responsive table for quiz history attempts.
 */
const HistoryTable = React.memo(function HistoryTable({ history, loading, error, sortBy, sortOrder, onSort }) {
  return (
    <section className="bg-white dark:bg-background-dark rounded-2xl shadow-md border border-gray-light w-full max-w-5xl mx-auto ">
      <header className="p-6 border-b border-gray-light flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-primary">Quiz Attempts</h2>
      </header>
      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-accent mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <p className="text-gray-dark text-base">Loading quiz history...</p>
        </div>
      ) : error ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <svg className="h-8 w-8 text-error mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          <p className="text-error text-base font-medium" role="alert">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <svg className="h-8 w-8 text-gray-dark mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          <p className="text-gray-dark text-base">No quiz history found.</p>
          <p className="text-gray-500 text-sm mt-1">Take your first quiz to see your results here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-primary text-white text-sm uppercase">
                <SortableTh label="Date" sortKey="date" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <th className="py-3 px-4 text-left">Quiz Title</th>
                <SortableTh label="Difficulty" sortKey="difficulty" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <SortableTh label="Score" sortKey="score" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <SortableTh label="Time Taken" sortKey="time" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                                    <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((attempt) => {
                const percentageScore = Math.round((attempt.score / attempt.total_questions) * 100);
                const isPassing = percentageScore >= 70;
                return (
                  <tr key={attempt.id} className="border-b border-gray-light hover:bg-gray-light/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{new Date(attempt.completed_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium whitespace-nowrap">{attempt.quiz_title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize font-semibold
                        ${attempt.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        attempt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-highlight/10 text-highlight border border-highlight'}`}
                      >
                        {attempt.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${isPassing ? 'text-success' : 'text-error'}`}>{percentageScore}%</span>
                      <span className="text-gray-dark text-sm ml-1">({attempt.score}/{attempt.total_questions})</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatTime(attempt.time_taken)}</td>
                    <td className="py-3 px-4">
                      <span className="text-gray-500 text-sm italic">
                        Quiz completed
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});

export default HistoryTable;
