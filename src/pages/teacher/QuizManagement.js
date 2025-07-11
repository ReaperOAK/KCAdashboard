import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import { FaPlus, FaFilter, FaSearch, FaChessBoard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import QuizLoadingSkeleton from '../../components/quiz/QuizLoadingSkeleton';
import QuizErrorAlert from '../../components/quiz/QuizErrorAlert';
import DeleteQuizModal from '../../components/quiz/DeleteQuizModal';
import QuizTableRow from '../../components/quiz/QuizTableRow';

export const QuizManagement = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Fetch quizzes
  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await QuizApi.getTeacherQuizzes(filter === 'all' ? undefined : filter);
      // Support both array and { quizzes: array } response
      let quizList = [];
      if (Array.isArray(result)) {
        quizList = result;
      } else if (result && Array.isArray(result.quizzes)) { 
        quizList = result.quizzes;
      }
      setQuizzes(quizList);
      setError(null);
    } catch (err) {
      setQuizzes([]); // Ensure quizzes is always an array on error
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Handlers
  const handleDeleteClick = useCallback((quiz) => {
    setQuizToDelete(quiz);
    setDeleteModalOpen(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setQuizToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await QuizApi.deleteQuiz(quizToDelete.id);
      setDeleteModalOpen(false);
      setQuizToDelete(null);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  }, [quizToDelete, fetchQuizzes]);

  const handlePublishQuiz = useCallback(async (quiz) => {
    try {
      await QuizApi.publish(quiz.id);
      toast.success('Quiz published successfully');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to publish quiz');
    }
  }, [fetchQuizzes]);

  const handleEditQuiz = useCallback((quiz) => {
    navigate(`/teacher/quiz/edit/${quiz.id}`);
  }, [navigate]);

  const handleCreateQuiz = useCallback(() => {
    navigate('/teacher/quiz/create');
  }, [navigate]);

  // Utility: badge classes
  const getDifficultyClass = useCallback((difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-light text-primary';
    }
  }, []);
  const getStatusClass = useCallback((status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-light text-primary';
      default: return 'bg-gray-light text-primary';
    }
  }, []);

  // Filter quizzes based on search query and status
  const filteredQuizzes = useMemo(() => quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [quizzes, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-background-light p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Quiz Management</h1>
          <button
            type="button"
            onClick={handleCreateQuiz}
            className="px-3 sm:px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent flex items-center focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base transition-all duration-200"
            aria-label="Create New Quiz"
          >
            <FaPlus className="mr-2" /> Create New Quiz
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md mb-6 sm:mb-8 border border-gray-light">
          <div className="p-4 border-b flex items-center gap-2">
            <FaFilter className="text-secondary mr-2" />
            <h2 className="text-base sm:text-lg font-semibold text-primary">Filter Quizzes</h2>
          </div>
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
                  <FaSearch className="absolute left-3 top-3 text-gray-dark" />
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
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-light">
          <div className="p-4 border-b flex items-center gap-2">
            <FaChessBoard className="text-secondary mr-2" />
            <h2 className="text-base sm:text-lg font-semibold text-primary">Your Quizzes</h2>
          </div>
          {loading ? (
            <QuizLoadingSkeleton />
          ) : error ? (
            <QuizErrorAlert error={error} />
          ) : filteredQuizzes.length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center gap-4">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-gray-light mb-2"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p className="text-gray-dark mb-4">No quizzes found. Create your first quiz!</p>
              <button
                type="button"
                onClick={handleCreateQuiz}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
              >
                Create Quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base min-w-[700px]">
                <thead>
                  <tr className="bg-gray-light text-primary text-xs sm:text-sm uppercase">
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
                      onEdit={() => handleEditQuiz(quiz)}
                      onPublish={() => handlePublishQuiz(quiz)}
                      onDelete={() => handleDeleteClick(quiz)}
                      getStatusClass={getStatusClass}
                      getDifficultyClass={getDifficultyClass}
                      onViewLeaderboard={() => navigate(`/teacher/quiz/${quiz.id}/leaderboard`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <DeleteQuizModal
        open={deleteModalOpen}
        quiz={quizToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default React.memo(QuizManagement);
