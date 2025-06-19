import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaPlus, FaTrash, FaArrowLeft, FaImage, FaCheck, FaChess } from 'react-icons/fa';
import ApiService from '../../utils/api';
import { toast } from 'react-toastify';
import ChessQuizBoard from '../../components/chess/ChessQuizBoard';
import ChessPositionEditor from '../../components/chess/ChessPositionEditor';

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
    const handleAddQuestion = (questionType = 'multiple_choice') => {
    const newQuestion = {
      tempId: Date.now(), // Temporary ID for frontend use
      question: '',
      image_url: '',
      type: questionType,
    };

    if (questionType === 'chess') {
      newQuestion.chess_position = 'start';
      newQuestion.chess_orientation = 'white';
      newQuestion.correct_moves = [];
    } else {
      newQuestion.answers = [
        { tempId: Date.now(), answer_text: '', is_correct: true },
        { tempId: Date.now() + 1, answer_text: '', is_correct: false },
        { tempId: Date.now() + 2, answer_text: '', is_correct: false },
        { tempId: Date.now() + 3, answer_text: '', is_correct: false }
      ];
    }    
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
      if (!q.question.trim()) return `Question ${i + 1} text is required`;      if (q.type === 'chess') {
        // Allow chess questions to be saved without moves, but warn if no moves are set
        if (!q.correct_moves || q.correct_moves.length === 0) {
          console.warn(`Chess question ${i + 1} has no correct moves defined. Students won't be able to get this question right.`);
        } else {
          // Check if correct moves have valid from/to values
          const validMoves = q.correct_moves.filter(move => 
            move && move.from && move.to && move.from.trim() && move.to.trim()
          );
          if (validMoves.length === 0) {
            console.warn(`Chess question ${i + 1} has no valid moves. Please ensure moves have 'from' and 'to' squares defined.`);
          }
        }
      } else {
        const hasCorrectAnswer = q.answers && q.answers.some(a => a.is_correct);
        if (!hasCorrectAnswer) return `Question ${i + 1} must have a correct answer`;
        
        const emptyAnswers = q.answers ? q.answers.filter(a => !a.answer_text.trim()) : [];
        if (emptyAnswers.length > 0) return `All answers for question ${i + 1} must be filled out`;
      }
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
        // Debug: Log the quiz data being sent
      console.log('Submitting quiz data:', JSON.stringify(quiz, null, 2));
      
      // Debug: Check chess questions specifically
      const chessQuestions = quiz.questions.filter(q => q.type === 'chess');
      if (chessQuestions.length > 0) {
        console.log('Chess questions found:', chessQuestions);
        chessQuestions.forEach((q, index) => {
          console.log(`Chess question ${index + 1}:`, {
            question: q.question,
            position: q.chess_position,
            orientation: q.chess_orientation,
            correct_moves: q.correct_moves
          });
        });
      }
      
      await ApiService[method](endpoint, quiz);
      
      toast.success(`Quiz ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/teacher/quizzes');    } catch (error) {
      console.error('Quiz submission error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        quiz: quiz
      });
      
      let errorMessage = 'Unknown error occurred';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} quiz: ${errorMessage}`);
      setSaving(false);
    }
  };
    const handleChessPositionChange = (questionIndex, position) => {
    handleQuestionChange(questionIndex, 'chess_position', position);
  };

  const handleChessOrientationChange = (questionIndex, orientation) => {
    handleQuestionChange(questionIndex, 'chess_orientation', orientation);
  };

  const addCorrectMove = (questionIndex) => {
    const updatedQuestions = [...quiz.questions];
    if (!updatedQuestions[questionIndex].correct_moves) {
      updatedQuestions[questionIndex].correct_moves = [];
    }
    updatedQuestions[questionIndex].correct_moves.push({ from: '', to: '', description: '' });
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const removeCorrectMove = (questionIndex, moveIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].correct_moves.splice(moveIndex, 1);
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleCorrectMoveChange = (questionIndex, moveIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].correct_moves[moveIndex][field] = value;
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddQuestion('multiple_choice')}
                className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] flex items-center text-sm"
              >
                <FaPlus className="mr-2" /> Add Multiple Choice
              </button>
              <button
                onClick={() => handleAddQuestion('chess')}
                className="px-4 py-2 bg-[#7646eb] text-white rounded-lg hover:bg-[#461fa3] flex items-center text-sm"
              >
                <FaChess className="mr-2" /> Add Chess Question
              </button>
            </div>
          </div>
            {quiz.questions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No questions added yet</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                >
                  Add Multiple Choice Question
                </button>
                <button
                  onClick={() => handleAddQuestion('chess')}
                  className="px-4 py-2 bg-[#7646eb] text-white rounded-lg hover:bg-[#461fa3]"
                >
                  Add Chess Question
                </button>
              </div>
            </div>
          ) : (
            <div>
              {quiz.questions.map((question, questionIndex) => (                <div key={question.id || question.tempId} className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">Question {questionIndex + 1}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.type === 'chess' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {question.type === 'chess' ? 'Chess' : 'Multiple Choice'}
                      </span>
                    </div>
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
                    </div>                  </div>
                  
                  {/* Conditional rendering based on question type */}
                  {question.type === 'multiple_choice' ? (
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answers</label>
                      <p className="text-sm text-gray-500 mb-2">Select the correct answer</p>
                      
                      {question.answers && question.answers.map((answer, answerIndex) => (
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
                  ) : (                    /* Chess Question Interface */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Setup Chess Position</label>
                          <p className="text-sm text-gray-500 mb-3">
                            Drag pieces to set up the position. Use the controls to reset or clear the board.
                          </p>
                          <ChessPositionEditor
                            initialPosition={question.chess_position || 'start'}
                            orientation={question.chess_orientation || 'white'}
                            onPositionChange={(fen) => handleChessPositionChange(questionIndex, fen)}
                            width={350}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Board Orientation</label>
                            <select
                              value={question.chess_orientation || 'white'}
                              onChange={(e) => handleChessOrientationChange(questionIndex, e.target.value)}
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                            >
                              <option value="white">White</option>
                              <option value="black">Black</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position (FEN)</label>
                            <textarea
                              value={question.chess_position || 'start'}
                              onChange={(e) => handleChessPositionChange(questionIndex, e.target.value)}
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent text-xs font-mono"
                              rows="3"
                              placeholder="FEN notation will appear here"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              You can also manually edit the FEN notation
                            </p>
                          </div>
                            <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">Correct Moves</label>
                              {(!question.correct_moves || question.correct_moves.length === 0) && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                  ⚠️ No moves defined
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">Define the correct moves for this position</p>
                            
                            {question.correct_moves && question.correct_moves.map((move, moveIndex) => (
                              <div key={moveIndex} className="flex items-center gap-2 mb-2">
                                <input
                                  type="text"
                                  value={move.from || ''}
                                  onChange={(e) => handleCorrectMoveChange(questionIndex, moveIndex, 'from', e.target.value)}
                                  className="w-16 p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                                  placeholder="From"
                                />
                                <span className="text-gray-500">→</span>
                                <input
                                  type="text"
                                  value={move.to || ''}
                                  onChange={(e) => handleCorrectMoveChange(questionIndex, moveIndex, 'to', e.target.value)}
                                  className="w-16 p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                                  placeholder="To"
                                />
                                <input
                                  type="text"
                                  value={move.description || ''}
                                  onChange={(e) => handleCorrectMoveChange(questionIndex, moveIndex, 'description', e.target.value)}
                                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#461fa3] focus:border-transparent"
                                  placeholder="Move description (optional)"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCorrectMove(questionIndex, moveIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => addCorrectMove(questionIndex)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                            >
                              <FaPlus className="mr-1" /> Add Move
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Preview</label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <ChessQuizBoard
                            initialPosition={question.chess_position || 'start'}
                            orientation={question.chess_orientation || 'white'}
                            correctMoves={question.correct_moves || []}
                            question={question.question}
                            allowMoves={false}
                            width={300}
                          />
                        </div>
                      </div>
                    </div>)}
                </div>
              ))}
            </div>
          )}
          
          <div className="p-6">
            <div className="flex gap-2">
              <button
                onClick={() => handleAddQuestion('multiple_choice')}
                className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] flex items-center"
              >
                <FaPlus className="mr-2" /> Add Multiple Choice
              </button>
              <button
                onClick={() => handleAddQuestion('chess')}
                className="px-4 py-2 bg-[#7646eb] text-white rounded-lg hover:bg-[#461fa3] flex items-center"
              >
                <FaChess className="mr-2" /> Add Chess Question
              </button>
            </div>
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
