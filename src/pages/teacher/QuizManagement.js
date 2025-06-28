import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { FaPlus, FaEdit, FaTrash, FaChessBoard, FaFilter, FaSearch, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const QuizManagement = () => {
  const navigate = useNavigate();  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  useEffect(() => {
    const fetchQuizzesData = async () => {
      setLoading(true);
      try {
        const endpoint = filter === 'all' 
          ? '/quiz/get-teacher-quizzes.php'
          : `/quiz/get-teacher-quizzes.php?difficulty=${filter}`;
        
        const response = await ApiService.get(endpoint);
        setQuizzes(response.quizzes);
        setLoading(false);
      } catch (error) {
        setError('Failed to load quizzes');
        setLoading(false);
      }
    };

    fetchQuizzesData();
  }, [filter]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all' 
        ? '/quiz/get-teacher-quizzes.php'
        : `/quiz/get-teacher-quizzes.php?difficulty=${filter}`;
      
      const response = await ApiService.get(endpoint);
      setQuizzes(response.quizzes);
      setLoading(false);
    } catch (error) {
      setError('Failed to load quizzes');
      setLoading(false);
    }
  };

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await ApiService.delete(`/quiz/delete.php?id=${quizToDelete.id}`);
      setDeleteModalOpen(false);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePublishQuiz = async (quiz) => {
    try {
      await ApiService.post('/quiz/publish.php', { id: quiz.id });
      toast.success('Quiz published successfully');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to publish quiz');
    }
  };

  // Filter quizzes based on search query and status
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#200e4a]">Quiz Management</h1>
          <button
            onClick={() => navigate('/teacher/quiz/create')}
            className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] flex items-center"
          >
            <FaPlus className="mr-2" /> Create New Quiz
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-4 border-b flex items-center">
            <FaFilter className="text-[#461fa3] mr-2" />
            <h2 className="text-lg font-semibold">Filter Quizzes</h2>
          </div>          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
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
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b flex items-center">
            <FaChessBoard className="text-[#461fa3] mr-2" />
            <h2 className="text-lg font-semibold">Your Quizzes</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#461fa3] border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading quizzes...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No quizzes found. Create your first quiz!</p>
              <button
                onClick={() => navigate('/teacher/quiz/create')}
                className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
              >
                Create Quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Difficulty</th>
                    <th className="p-4 text-left">Questions</th>
                    <th className="p-4 text-left">Time Limit</th>
                    <th className="p-4 text-left">Created</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>{filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-[#461fa3]">{quiz.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{quiz.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(quiz.status)}`}>
                        {quiz.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyClass(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="p-4">{quiz.question_count || "-"}</td>
                    <td className="p-4">{quiz.time_limit} mins</td>
                    <td className="p-4">{new Date(quiz.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/teacher/quiz/edit/${quiz.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          aria-label="Edit quiz"
                        >
                          <FaEdit />
                        </button>
                        {quiz.status === 'draft' && (
                          <button
                            onClick={() => handlePublishQuiz(quiz)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            aria-label="Publish quiz"
                          >
                            <FaEye />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(quiz)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          aria-label="Delete quiz"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Quiz</h2>
            <p className="mb-6">
              Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
