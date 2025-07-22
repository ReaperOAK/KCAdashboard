import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import usePGNQuizIntegration from '../../../hooks/usePGNQuizIntegration';

const CreateQuizModal = ({ isOpen, onClose, pgnGame }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'existing'
  const [selectedQuizId, setSelectedQuizId] = useState('');
  
  const {
    existingQuizzes,
    loading,
    fetchDraftQuizzes,
    storePGNForQuiz
  } = usePGNQuizIntegration();

  useEffect(() => {
    if (isOpen && activeTab === 'existing') {
      fetchDraftQuizzes();
    }
  }, [isOpen, activeTab, fetchDraftQuizzes]);

  // Handle creating new quiz with PGN
  const handleCreateNewQuiz = () => {
    storePGNForQuiz(pgnGame);
    navigate('/teacher/quiz/create');
    onClose();
  };

  // Handle adding PGN to existing quiz
  const handleAddToExistingQuiz = () => {
    if (!selectedQuizId) {
      toast.error('Please select a quiz');
      return;
    }

    storePGNForQuiz(pgnGame);
    navigate(`/teacher/quiz/edit/${selectedQuizId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-primary">Create Quiz from PGN</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* PGN Game Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Selected PGN:</h3>
          <p className="text-gray-700">{pgnGame.title}</p>
          {pgnGame.description && (
            <p className="text-sm text-gray-600 mt-1">{pgnGame.description}</p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Create New Quiz
          </button>
          <button
            onClick={() => setActiveTab('existing')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'existing'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Add to Existing Quiz
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'new' ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Create a new quiz and add this PGN as the first chess question. You can add more questions later.
            </p>
            <button
              onClick={handleCreateNewQuiz}
              className="w-full bg-accent text-white py-3 px-4 rounded-lg hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              Create New Quiz with this PGN
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select an existing draft quiz to add this PGN as a new chess question.
            </p>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : existingQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No draft quizzes available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Only draft quizzes can be edited. Published quizzes cannot be modified.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {existingQuizzes.map((quiz) => (
                    <label
                      key={quiz.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="existingQuiz"
                        value={quiz.id}
                        checked={selectedQuizId === quiz.id.toString()}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        className="mr-3 text-accent focus:ring-accent"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                        <p className="text-sm text-gray-600">
                          {quiz.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Difficulty: {quiz.difficulty}</span>
                          <span>Questions: {quiz.question_count || 0}</span>
                          <span>Status: {quiz.status}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleAddToExistingQuiz}
                  disabled={!selectedQuizId}
                  className="w-full bg-accent text-white py-3 px-4 rounded-lg hover:bg-accent-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add PGN to Selected Quiz
                </button>
              </>
            )}
          </div>
        )}

        {/* Cancel Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal;
