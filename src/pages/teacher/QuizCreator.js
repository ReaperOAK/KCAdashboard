import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaPlus, FaTrash, FaArrowLeft, FaImage, FaCheck } from 'react-icons/fa';
import ApiService from '../../utils/api';
import { toast } from 'react-toastify';

const QuizCreator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    time_limit: 15,
    questions: []
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await ApiService.get(`/quiz/get-by-id.php?id=${id}`);
        
        if (!response.quiz) {
          throw new Error('Quiz not found');
        }
        
        setQuiz({
          ...response.quiz,
          questions: response.quiz.questions || []
        });
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load quiz');
        setLoading(false);
      }
    };

    if (isEditing) {
      fetchQuizData();
    }
  }, [id, isEditing]);
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddQuestion = () => {
    const newQuestion = {
      tempId: Date.now(), // Temporary ID for frontend use
      question: '',
      image_url: '',
      type: 'multiple_choice',
      answers: [
        { tempId: Date.now(), answer_text: '', is_correct: true },
        { tempId: Date.now() + 1, answer_text: '', is_correct: false },
        { tempId: Date.now() + 2, answer_text: '', is_correct: false },
        { tempId: Date.now() + 3, answer_text: '', is_correct: false }
      ]
    };
    
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    
    // If changing "is_correct", make sure only one answer is correct
    if (field === 'is_correct' && value === true) {
      updatedQuestions[questionIndex].answers.forEach((answer, idx) => {
        answer.is_correct = idx === answerIndex;
      });
    } else {
      updatedQuestions[questionIndex].answers[answerIndex][field] = value;
    }
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const handleImageUpload = async (questionIndex, file) => {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await ApiService.postFormData('/quiz/upload-question-image.php', formData);
      
      if (response.image_url) {
        handleQuestionChange(questionIndex, 'image_url', response.image_url);
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };
  
  const validateQuiz = () => {
    if (!quiz.title.trim()) return 'Quiz title is required';
    if (!quiz.time_limit || quiz.time_limit <= 0) return 'Time limit must be greater than 0';
    if (quiz.questions.length === 0) return 'Quiz must have at least one question';
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;
      
      const hasCorrectAnswer = q.answers.some(a => a.is_correct);
      if (!hasCorrectAnswer) return `Question ${i + 1} must have a correct answer`;
      
      const emptyAnswers = q.answers.filter(a => !a.answer_text.trim());
      if (emptyAnswers.length > 0) return `All answers for question ${i + 1} must be filled out`;
    }
    
    return null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateQuiz();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setSaving(true);
    
    try {
      const endpoint = isEditing 
        ? `/quiz/update.php?id=${id}`
        : '/quiz/create.php';
      
      const method = isEditing ? 'put' : 'post';
      
      await ApiService[method](endpoint, quiz);
      
      toast.success(`Quiz ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/teacher/quizzes');
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} quiz`);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#461fa3] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/teacher/quizzes')}
            className="mt-2 text-blue-600 hover:underline"
          >
            Back to Quiz Management
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="mr-4 p-2 rounded-lg hover:bg-white"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-[#200e4a]">
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  name="title"
                  value={quiz.title}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                  placeholder="Enter quiz title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select
                  name="difficulty"
                  value={quiz.difficulty}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                <input
                  type="number"
                  name="time_limit"
                  value={quiz.time_limit}
                  onChange={handleFormChange}
                  min="1"
                  max="120"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={quiz.description || ''}
                onChange={handleFormChange}
                rows="3"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                placeholder="Enter quiz description"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] flex items-center text-sm"
            >
              <FaPlus className="mr-2" /> Add Question
            </button>
          </div>
          
          {quiz.questions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No questions added yet</p>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
              >
                Add First Question
              </button>
            </div>
          ) : (
            <div>
              {quiz.questions.map((question, questionIndex) => (
                <div key={question.id || question.tempId} className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Question {questionIndex + 1}</h3>
                    <button
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      aria-label="Remove question"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                      rows="2"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                      placeholder="Enter question"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                    <div className="flex items-center space-x-3">
                      {question.image_url && (
                        <div className="relative group">
                          <img 
                            src={question.image_url} 
                            alt="Question" 
                            className="h-16 w-16 object-cover rounded border"
                          />
                          <button
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100"
                            onClick={() => handleQuestionChange(questionIndex, 'image_url', '')}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                      <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center">
                        <FaImage className="mr-2" />
                        <span>{question.image_url ? 'Change Image' : 'Add Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(questionIndex, e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answers</label>
                    <p className="text-sm text-gray-500 mb-2">Select the correct answer</p>
                    
                    {question.answers.map((answer, answerIndex) => (
                      <div key={answer.id || answer.tempId} className="flex items-center mb-2">
                        <div className="flex-1 flex items-center">
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                              answer.is_correct 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => handleAnswerChange(questionIndex, answerIndex, 'is_correct', true)}
                          >
                            {answer.is_correct && <FaCheck className="text-xs" />}
                          </button>
                          <input
                            type="text"
                            value={answer.answer_text}
                            onChange={(e) => handleAnswerChange(
                              questionIndex, 
                              answerIndex, 
                              'answer_text', 
                              e.target.value
                            )}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                            placeholder={`Answer ${answerIndex + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="p-6">
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] flex items-center"
            >
              <FaPlus className="mr-2" /> Add Another Question
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`px-6 py-3 bg-[#461fa3] text-white rounded-lg flex items-center ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#7646eb]'
            }`}
          >
            <FaSave className="mr-2" />
            {saving ? 'Saving...' : isEditing ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
