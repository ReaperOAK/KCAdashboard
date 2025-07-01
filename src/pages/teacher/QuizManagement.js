
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { FaPlus, FaEdit, FaTrash, FaChessBoard, FaFilter, FaSearch, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Loading skeleton
const QuizLoadingSkeleton = React.memo(() => (
  <div className="p-6 text-center" aria-busy="true" aria-label="Loading quizzes">
    <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-2"></div>
    <p>Loading quizzes...</p>
  </div>
));

// Error alert
const QuizErrorAlert = React.memo(({ error }) => (
  <div className="p-6 text-center text-red-700 bg-red-100 border border-red-800 rounded" role="alert">
    {error}
  </div>
));

// Delete confirmation modal
const DeleteQuizModal = React.memo(({ open, quiz, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-primary">Delete Quiz</h2>
        <p className="mb-6 text-gray-dark">
          Are you sure you want to delete "{quiz?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-light rounded-md text-gray-dark hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

// Quiz table row
const QuizTableRow = React.memo(({ quiz, onEdit, onPublish, onDelete, getStatusClass, getDifficultyClass }) => (
  <tr className="border-t hover:bg-gray-light">
    <td className="p-3 sm:p-4">
      <div className="font-medium text-secondary text-sm sm:text-base">{quiz.title}</div>
      <div className="text-xs text-gray-dark mt-1 line-clamp-1">{quiz.description}</div>
    </td>
    <td className="p-3 sm:p-4">
      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(quiz.status)}`}>{quiz.status}</span>
    </td>
    <td className="p-3 sm:p-4">
      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyClass(quiz.difficulty)}`}>{quiz.difficulty}</span>
    </td>
    <td className="p-3 sm:p-4">{quiz.question_count || '-'}</td>
    <td className="p-3 sm:p-4">{quiz.time_limit} mins</td>
    <td className="p-3 sm:p-4">{new Date(quiz.created_at).toLocaleDateString()}</td>
    <td className="p-3 sm:p-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Edit quiz"
        >
          <FaEdit />
        </button>
        {quiz.status === 'draft' && (
          <button
            type="button"
            onClick={onPublish}
            className="p-2 text-green-700 hover:bg-green-100 rounded focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Publish quiz"
          >
            <FaEye />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-red-700 hover:bg-red-100 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Delete quiz"
        >
          <FaTrash />
        </button>
      </div>
    </td>
  </tr>
));

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
      const endpoint = filter === 'all'
        ? '/quiz/get-teacher-quizzes.php'
        : `/quiz/get-teacher-quizzes.php?difficulty=${filter}`;
      const response = await ApiService.get(endpoint);
      setQuizzes(response.quizzes);
      setError(null);
    } catch (err) {
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
      await ApiService.delete(`/quiz/delete.php?id=${quizToDelete.id}`);
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
      await ApiService.post('/quiz/publish.php', { id: quiz.id });
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
            className="px-3 sm:px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent flex items-center focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
            aria-label="Create New Quiz"
          >
            <FaPlus className="mr-2" /> Create New Quiz
          </button>
        </div>

        {/* Search and Filter */}
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

        {/* Quiz List */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 border-b flex items-center">
            <FaChessBoard className="text-secondary mr-2" />
            <h2 className="text-base sm:text-lg font-semibold text-primary">Your Quizzes</h2>
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
