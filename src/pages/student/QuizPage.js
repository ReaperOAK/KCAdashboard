
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import QuizCard from '../../components/student/QuizCard';
import { FaSearch, FaTrophy, FaHistory } from 'react-icons/fa';

// --- Filters ---
const FILTERS = [
  { id: 'all', label: 'All Quizzes' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

// --- Loading Spinner ---
const LoadingSpinner = React.memo(function LoadingSpinner({ label = 'Loading quizzes...' }) {
  return (
    <div className="text-center py-8" role="status" aria-live="polite">
      <div className="animate-spin w-12 h-12 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-600">{label}</p>
    </div>
  );
});

// --- Error State ---
const ErrorState = React.memo(function ErrorState({ message }) {
  return (
    <div className="bg-red-50 p-4 rounded-lg text-red-800" role="alert">
      <p>{message}</p>
    </div>
  );
});

// --- Empty State ---
const EmptyState = React.memo(function EmptyState({ searchQuery, onClear }) {
  return (
    <div className="text-center py-8 bg-white rounded-lg shadow-md">
      <p className="text-gray-600 mb-4">No quizzes found matching your criteria.</p>
      {searchQuery && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Clear Search
        </button>
      )}
    </div>
  );
});

// --- Filter Tabs ---
const FilterTabs = React.memo(function FilterTabs({ filters, activeFilter, onChange }) {
  return (
    <div className="flex space-x-2 overflow-x-auto" role="tablist" aria-label="Quiz difficulty filters">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent ${activeFilter === filter.id ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'}`}
          role="tab"
          aria-selected={activeFilter === filter.id}
          tabIndex={activeFilter === filter.id ? 0 : -1}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
});

// --- Search Bar ---
const SearchBar = React.memo(function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-grow max-w-md">
      <input
        type="text"
        placeholder="Search quizzes..."
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Search quizzes"
      />
      <FaSearch className="absolute left-3 top-3 text-gray-400" aria-hidden />
    </div>
  );
});

// --- Action Buttons ---
const ActionButtons = React.memo(function ActionButtons({ onHistory, onLeaderboard }) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onHistory}
        className="px-4 py-2 rounded-lg bg-white border border-secondary text-secondary hover:bg-background-light flex items-center focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Quiz History"
      >
        <FaHistory className="mr-2" aria-hidden />
        Quiz History
      </button>
      <button
        onClick={onLeaderboard}
        className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-accent flex items-center focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Leaderboard"
      >
        <FaTrophy className="mr-2" aria-hidden />
        Leaderboard
      </button>
    </div>
  );
});

// --- Main Component ---
export default function QuizPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch quizzes
  useEffect(() => {
    let isMounted = true;
    const fetchQuizzes = async () => {
      try {
        const endpoint = activeFilter === 'all'
          ? '/quiz/get-all.php'
          : `/quiz/get-by-difficulty.php?difficulty=${activeFilter}`;
        const response = await ApiService.get(endpoint);
        if (isMounted) {
          setQuizzes(response.quizzes);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch quizzes');
          setLoading(false);
        }
      }
    };
    fetchQuizzes();
    return () => { isMounted = false; };
  }, [activeFilter]);

  // Memoized filtered quizzes
  const filteredQuizzes = useMemo(() =>
    quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [quizzes, searchQuery]
  );

  // Memoized handlers
  const handleFilterChange = useCallback((id) => setActiveFilter(id), []);
  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);
  const handleClearSearch = useCallback(() => setSearchQuery(''), []);
  const handleHistory = useCallback(() => navigate('/student/quiz-history'), [navigate]);
  const handleLeaderboard = useCallback(() => navigate('/student/leaderboard'), [navigate]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Chess Quizzes</h1>
          <ActionButtons onHistory={handleHistory} onLeaderboard={handleLeaderboard} />
        </div>
        <div className="flex flex-col md:flex-row justify-between mb-4 sm:mb-6 gap-4">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
          <FilterTabs filters={FILTERS} activeFilter={activeFilter} onChange={handleFilterChange} />
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredQuizzes.length === 0 ? (
          <EmptyState searchQuery={searchQuery} onClear={handleClearSearch} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
