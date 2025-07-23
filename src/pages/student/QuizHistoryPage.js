
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import { FaHistory } from 'react-icons/fa';
import StatsCards from '../../components/quiz/StatsCards';
import FilterBar from '../../components/quiz/FilterBar';
import HistoryTable from '../../components/quiz/HistoryTable';

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
  const handleTakeFirstQuiz = useCallback(() => {
    navigate('/student/quiz');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-8">
        {/* Header and Action */}
        <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 tracking-tight leading-tight">
            <FaHistory className="text-accent mr-2" aria-hidden="true" /> Quiz History
          </h1>
          <button
            type="button"
            onClick={handleTakeFirstQuiz}
            className="px-5 py-2.5 bg-secondary text-white rounded-lg shadow-md hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 text-base font-semibold"
            aria-label="Take new quiz"
          >
            Take New Quiz
          </button>
        </section>
        {stats && <StatsCards stats={stats} />}
        <FilterBar filter={filter} onFilterChange={handleFilterChange} />
        <section className="mt-6">
          <HistoryTable
            history={sortedHistory}
            loading={loading}
            error={error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </section>
      </div>
    </div>
  );
};

export { QuizHistoryPage };
export default QuizHistoryPage;
