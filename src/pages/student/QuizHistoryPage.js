
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import { FaHistory, FaFilter, FaChartLine, FaTrophy, FaEye } from 'react-icons/fa';

// --- Utility: Format time ---
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

// --- Stats Cards ---
const StatsCards = React.memo(function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Total Quizzes</p>
            <p className="text-3xl font-bold text-secondary">{stats.total_attempts}</p>
          </div>
          <FaChartLine className="text-4xl text-gray-light" aria-hidden="true" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Average Score</p>
            <p className="text-3xl font-bold text-secondary">{stats.average_score}%</p>
          </div>
          <FaTrophy className="text-4xl text-gray-light" aria-hidden="true" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Highest Score</p>
            <p className="text-3xl font-bold text-secondary">{stats.highest_score}%</p>
          </div>
          <div className={`text-lg font-bold px-3 py-1 rounded-full capitalize
            ${stats.highest_difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            stats.highest_difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'}`}
          >
            {stats.highest_difficulty}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Unique Quizzes</p>
            <p className="text-3xl font-bold text-secondary">{stats.unique_quizzes}</p>
          </div>
          <FaEye className="text-4xl text-gray-light" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});

// --- Filter Bar ---
const FilterBar = React.memo(function FilterBar({ filter, onFilterChange }) {
  const filterOptions = useMemo(() => [
    { key: 'all', label: 'All Quizzes', active: 'bg-secondary text-white', inactive: 'bg-gray-light text-primary hover:bg-gray-200' },
    { key: 'beginner', label: 'Beginner', active: 'bg-green-600 text-white', inactive: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { key: 'intermediate', label: 'Intermediate', active: 'bg-yellow-600 text-white', inactive: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { key: 'advanced', label: 'Advanced', active: 'bg-red-600 text-white', inactive: 'bg-red-100 text-red-800 hover:bg-red-200' },
    { key: 'passed', label: 'Passed Only', active: 'bg-secondary text-white', inactive: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  ], []);
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 border-b flex items-center">
        <FaFilter className="text-secondary mr-2" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>
      <div className="p-4 flex flex-wrap gap-3">
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onFilterChange(opt.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${filter === opt.key ? opt.active : opt.inactive}`}
            aria-pressed={filter === opt.key}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
});

// --- History Table ---
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
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                  <tr key={attempt.id} className="border-t hover:bg-gray-light/40">
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
                        className="text-secondary hover:text-accent font-medium focus:outline-none focus-visible:underline"
                        aria-label={`Retry quiz: ${attempt.quiz_title}`}
                      >
                        Retry
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

// --- Sortable Table Header ---
const SortableTh = React.memo(function SortableTh({ label, sortKey, sortBy, sortOrder, onSort }) {
  return (
    <th
      className="py-3 px-4 text-left cursor-pointer select-none hover:bg-gray-100"
      onClick={() => onSort(sortKey)}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSort(sortKey); }}
      aria-sort={sortBy === sortKey ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
      scope="col"
    >
      <div className="flex items-center">
        {label}
        {sortBy === sortKey && (
          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );
});

// --- Main QuizHistoryPage ---
const QuizHistoryPage = () => {
  const navigate = useNavigate();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const response = QuizApi.getUserHistory ? await QuizApi.getUserHistory(filter) : { history: [], stats: null };
        setQuizHistory(response.history);
        setStats(response.stats);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch quiz history');
        setLoading(false);
      }
    };
    fetchQuizHistory();
  }, [filter]);

  // Memoized sorted history
  const sortedHistory = useMemo(() => {
    const arr = [...quizHistory];
    arr.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.completed_at) - new Date(b.completed_at);
      } else if (sortBy === 'score') {
        comparison = a.score - b.score;
      } else if (sortBy === 'time') {
        comparison = a.time_taken - b.time_taken;
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return arr;
  }, [quizHistory, sortBy, sortOrder]);

  // Handlers
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setLoading(true);
  }, []);
  const handleSort = useCallback((criteria) => {
    setSortBy(prev => {
      if (prev === criteria) {
        setSortOrder(order => (order === 'asc' ? 'desc' : 'asc'));
        return prev;
      } else {
        setSortOrder('desc');
        return criteria;
      }
    });
  }, []);
  const handleRetry = useCallback((quizId) => {
    navigate(`/student/quiz/${quizId}`);
  }, [navigate]);
  const handleTakeFirstQuiz = useCallback(() => {
    navigate('/student/quiz');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
            <FaHistory className="mr-3" aria-hidden="true" /> Quiz History
          </h1>
          <button
            type="button"
            onClick={handleTakeFirstQuiz}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Take new quiz"
          >
            Take New Quiz
          </button>
        </div>
        {stats && <StatsCards stats={stats} />}
        <FilterBar filter={filter} onFilterChange={handleFilterChange} />
        <div className="mt-6">
          <HistoryTable
            history={sortedHistory}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>
      </div>
    </div>
  );
};

export { QuizHistoryPage };
export default QuizHistoryPage;
