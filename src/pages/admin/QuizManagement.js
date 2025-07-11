import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import { FaPlus, FaChessBoard, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import QuizLoadingSkeleton from '../../components/quiz/QuizLoadingSkeleton';
import QuizErrorAlert from '../../components/quiz/QuizErrorAlert';
import DeleteQuizModal from '../../components/quiz/DeleteQuizModal';
import QuizTableRow from '../../components/quiz/QuizTableRow';

const QuizManagement = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Helper to check if user is admin (from token or localStorage)
  const isAdmin = useMemo(() => {
    try {
      // Try user key first, then fallback to token
      let stored = localStorage.getItem('user') || localStorage.getItem('token');
      if (!stored) return false;
      // If user key, it may be a JSON object with a role property
      if (stored.startsWith('{')) {
        const userObj = JSON.parse(stored);
        if (userObj.role) {
          
          return userObj.role === 'admin';
        }
        if (userObj.token) stored = userObj.token;
        else if (userObj.jwt) stored = userObj.jwt;
        else if (userObj.accessToken) stored = userObj.accessToken;
      }
      // If it's a JWT
      if (stored.includes('.')) {
        const payload = JSON.parse(atob(stored.split('.')[1]));
        
        return payload.role === 'admin';
      }
      return false;
    } catch (e) {
      console.error('[QuizManagement] Error decoding user/token:', e);
      return false;
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (isAdmin) {
        response = filter === 'all' ? await QuizApi.getAll() : await QuizApi.getAll(filter);
      } else {
        response = filter === 'all' ? await QuizApi.getTeacherQuizzes() : await QuizApi.getTeacherQuizzes(filter);
      }
      setQuizzes(response.quizzes);
      setError(null);
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [filter, isAdmin]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

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
      await QuizApi.delete(quizToDelete.id);
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
    navigate(`/admin/quizzes/edit/${quiz.id}`);
  }, [navigate]);

  const handleCreateQuiz = useCallback(() => {
    navigate('/admin/quizzes/create');
  }, [navigate]);

  const getDifficultyClass = useCallback((difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/10 text-success';
      case 'intermediate': return 'bg-warning/10 text-warning';
      case 'advanced': return 'bg-error/10 text-error';
      default: return 'bg-gray-light text-primary';
    }
  }, []);
  const getStatusClass = useCallback((status) => {
    switch (status) {
      case 'published': return 'bg-success/10 text-success';
      case 'draft': return 'bg-gray-light text-primary';
      default: return 'bg-gray-light text-primary';
    }
  }, []);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Quiz Management</h1>
          <button
            type="button"
            onClick={handleCreateQuiz}
            className="px-3 sm:px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent flex items-center focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
            aria-label="Create New Quiz"
          >
            <FaPlus className="mr-2" /> Create New Quiz
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md mb-6 sm:mb-8">
          <div className="p-4 border-b flex items-center">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                    aria-label="Search quizzes"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-dark" />
                </div>
              </div>
              <div>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="w-full p-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
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
                  className="w-full p-2 border border-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
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
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 border-b flex items-center">
            <FaChessBoard className="text-secondary mr-2" />
            <h2 className="text-base sm:text-lg font-semibold text-primary">All Quizzes</h2>
          </div>
          {loading ? (
            <QuizLoadingSkeleton />
          ) : error ? (
            <QuizErrorAlert error={error} />
          ) : filteredQuizzes.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-dark mb-4">No quizzes found. Create your first quiz!</p>
              <button
                type="button"
                onClick={handleCreateQuiz}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Create Quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base">
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
