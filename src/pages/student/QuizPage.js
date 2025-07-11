
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import QuizCard from '../../components/student/QuizCard';
import LoadingSpinner from '../../components/quiz/LoadingSpinner';
import ErrorState from '../../components/quiz/ErrorState';
import EmptyState from '../../components/quiz/EmptyState';
import FilterTabs from '../../components/quiz/FilterTabs';
import SearchBar from '../../components/quiz/SearchBar';
import ActionButtons from '../../components/quiz/ActionButtons';

const FILTERS = [
  { id: 'all', label: 'All Quizzes' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchQuizzes = async () => {
      try {
        let response;
        if (activeFilter === 'all') {
          response = await QuizApi.getAll();
        } else if (QuizApi.getByDifficulty) {
          response = await QuizApi.getByDifficulty(activeFilter);
        } else {
          response = { quizzes: [] };
        }
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

  const filteredQuizzes = useMemo(() =>
    quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [quizzes, searchQuery]
  );

  const handleFilterChange = useCallback((id) => setActiveFilter(id), []);
  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);
  const handleClearSearch = useCallback(() => setSearchQuery(''), []);
  const handleHistory = useCallback(() => navigate('/student/quiz-history'), [navigate]);
  const handleLeaderboard = useCallback(() => navigate('/student/leaderboard'), [navigate]);

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
