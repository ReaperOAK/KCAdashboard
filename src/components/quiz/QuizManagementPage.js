import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaChessBoard, FaFilter, FaSearch } from 'react-icons/fa';
import QuizLoadingSkeleton from './QuizLoadingSkeleton';
import QuizErrorAlert from './QuizErrorAlert';
import DeleteQuizModal from './DeleteQuizModal';
import QuizTableRow from './QuizTableRow';

/**
 * QuizManagementPage: Generic, beautiful, responsive, accessible quiz management UI.
 * Props:
 * - title: string
 * - fetchQuizzes: () => Promise<array>
 * - onEdit: (quiz) => void
 * - onCreate: () => void
 * - onPublish: (quiz) => void
 * - onDelete: (quiz) => void
 * - showLeaderboard: bool
 * - getStatusClass: (status) => string
 * - getDifficultyClass: (difficulty) => string
 */
const QuizManagementPage = React.memo(function QuizManagementPage({
  title,
  fetchQuizzes,
  onEdit,
  onCreate,
  onPublish,
  onDelete,
  showLeaderboard = false,
  getStatusClass,
  getDifficultyClass,
  leaderboardHandler,
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchQuizzes(filter);
      setQuizzes(Array.isArray(data) ? data : data?.quizzes || []);
      setError(null);
    } catch (err) {
      setQuizzes([]);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [fetchQuizzes, filter]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleDeleteClick = useCallback((quiz) => {
    setQuizToDelete(quiz);
    setDeleteModalOpen(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setQuizToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    await onDelete(quizToDelete);
    setDeleteModalOpen(false);
    setQuizToDelete(null);
    loadQuizzes();
  }, [onDelete, quizToDelete, loadQuizzes]);

  const filteredQuizzes = useMemo(() => quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [quizzes, searchQuery, statusFilter]);

  return (
    <main className="min-h-screen bg-background-light p-4 sm:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary flex items-center gap-2">
            <FaChessBoard className="w-7 h-7 text-accent mr-2" aria-hidden="true" />
            {title}
          </h1>
          <button
            type="button"
            onClick={onCreate}
            className="px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base transition-all duration-200 flex items-center"
            aria-label="Create New Quiz"
          >
            <FaPlus className="mr-2" /> Create New Quiz
          </button>
        </section>
        {/* Search and Filter */}
        <section className="bg-background-light dark:bg-background-dark rounded-xl shadow-md mb-6 sm:mb-8 border border-gray-light animate-fade-in">
          <header className="p-4 border-b flex items-center gap-2">
            <FaFilter className="text-secondary mr-2" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-semibold text-primary">Filter Quizzes</h2>
          </header>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all duration-200"
                    aria-label="Search quizzes"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-dark" aria-hidden="true" />
                </div>
              </div>
              <div>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="w-full p-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm transition-all duration-200"
                  aria-label="Filter by difficulty"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm transition-all duration-200"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        {/* Quiz List */}
        <section className="bg-background-light dark:bg-background-dark rounded-xl shadow-md border border-gray-light animate-fade-in">
          <header className="p-4 border-b flex items-center gap-2">
            <FaChessBoard className="text-secondary mr-2" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-semibold text-primary">All Quizzes</h2>
          </header>
          {loading ? (
            <QuizLoadingSkeleton />
          ) : error ? (
            <QuizErrorAlert error={error} />
          ) : filteredQuizzes.length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center gap-4 animate-fade-in">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-gray-light mb-2" aria-hidden="true"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p className="text-gray-dark mb-4">No quizzes found. Create your first quiz!</p>
              <button
                type="button"
                onClick={onCreate}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
                aria-label="Create Quiz"
              >
                <FaPlus className="mr-2" /> Create Quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base min-w-[700px]">
                <thead>
                  <tr className="bg-primary text-white text-sm uppercase">
                    <th className="p-3 sm:p-4 text-left">Title</th>
                    <th className="p-3 sm:p-4 text-left">Status</th>
                    <th className="p-3 sm:p-4 text-left">Difficulty</th>
                    <th className="p-3 sm:p-4 text-left">Questions</th>
                    <th className="p-3 sm:p-4 text-left">Time Limit</th>
                    <th className="p-3 sm:p-4 text-left">Created</th>
                    <th className="p-3 sm:p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <QuizTableRow
                      key={quiz.id}
                      quiz={quiz}
                      onEdit={() => onEdit(quiz)}
                      onPublish={() => onPublish(quiz)}
                      onDelete={() => handleDeleteClick(quiz)}
                      getStatusClass={getStatusClass}
                      getDifficultyClass={getDifficultyClass}
                      onViewLeaderboard={showLeaderboard && leaderboardHandler ? () => leaderboardHandler(quiz) : undefined}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <DeleteQuizModal
        open={deleteModalOpen}
        quiz={quizToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
});

export default QuizManagementPage;
