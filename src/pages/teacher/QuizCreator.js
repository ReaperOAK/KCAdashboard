


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SharingControls from '../../components/quiz/SharingControls';
import SortableQuestionsList from '../../components/quiz/SortableQuestionsList';
import DraggableQuestionCard from '../../components/quiz/DraggableQuestionCard';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft, FaImage, FaCheck, FaChess, FaFileAlt } from 'react-icons/fa';
import { QuizApi } from '../../api/quiz';
import { BatchesApi } from '../../api/batches';
import { toast } from 'react-toastify';
import TagInput from '../../components/chess/TagInput';
import MultipleChoiceEditor from '../../components/chess/MultipleChoiceEditor';
import ChessQuestionEditor from '../../components/chess/ChessQuestionEditor';
import usePGNQuizIntegration from '../../hooks/usePGNQuizIntegration';

// Quiz Details Form
const QuizDetailsForm = React.memo(function QuizDetailsForm({ quiz, handleFormChange }) {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 sm:mb-8">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quiz Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Quiz Title</label>
            <input
              type="text"
              name="title"
              value={quiz.title}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Enter quiz title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Difficulty Level</label>
            <select
              name="difficulty"
              value={quiz.difficulty}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Time Limit (minutes)</label>
            <input
              type="number"
              name="time_limit"
              value={quiz.time_limit}
              onChange={handleFormChange}
              min="1"
              max="120"
              className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            />
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
          <textarea
            name="description"
            value={quiz.description || ''}
            onChange={handleFormChange}
            rows="3"
            className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            placeholder="Enter quiz description"
          ></textarea>
        </div>
      </div>
    </div>
  );
});

// Question Card - Content only (header now handled by DraggableQuestionCard)
const QuestionCard = React.memo(function QuestionCard({
  question,
  questionIndex,
  handleQuestionChange,
  handleImageUpload,
  handleAnswerChange,
  handleChessModeChange,
  handleChessPositionChange,
  handleChessOrientationChange,
  handlePGNChange,
  handlePGNUpload,
  handleExpectedPlayerColorChange,
  handleCorrectMoveChange,
  addCorrectMove,
  removeCorrectMove
}) {
  // Memoize tag suggestions
  const tagSuggestions = useMemo(() => [
    "tactic", "endgame", "opening", "fork", "skewer", "mate in 2", "pin", "discovered attack", "deflection", "zugzwang"
  ], []);
  // Remove image handler
  const handleRemoveImage = useCallback(() => handleQuestionChange(questionIndex, 'image_url', ''), [handleQuestionChange, questionIndex]);
  // Image upload handler
  const handleImageInput = useCallback(e => handleImageUpload(questionIndex, e.target.files[0]), [handleImageUpload, questionIndex]);
  // Hint change handler
  const handleHintChange = useCallback(e => handleQuestionChange(questionIndex, 'hint', e.target.value), [handleQuestionChange, questionIndex]);
  // Tags change handler
  const handleTagsChange = useCallback(tags => handleQuestionChange(questionIndex, 'tags', tags), [handleQuestionChange, questionIndex]);
  // Question text change handler
  const handleTextChange = useCallback(e => handleQuestionChange(questionIndex, 'question', e.target.value), [handleQuestionChange, questionIndex]);
  
  return (
    <div className="p-4 sm:p-6 pt-16"> {/* Extra top padding for the badges */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-dark mb-1">Question Text</label>
        <textarea
          value={question.question}
          onChange={handleTextChange}
          rows="2"
          className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="Enter question"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-dark mb-1">Image (Optional)</label>
        <div className="flex items-center space-x-3">
          {question.image_url && (
            <div className="relative group">
              <img
                src={question.image_url}
                alt="Question"
                className="h-16 w-16 object-cover rounded border border-gray-light"
              />
              <button
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={handleRemoveImage}
                aria-label="Remove image"
              >
                <FaTrash />
              </button>
            </div>
          )}
          <label className="cursor-pointer px-4 py-2 bg-gray-light hover:bg-gray-dark rounded-lg flex items-center">
            <FaImage className="mr-2" />
            <span>{question.image_url ? 'Change Image' : 'Add Image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageInput}
            />
          </label>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1 flex items-center">
            Hint (optional)
            <span className="ml-1 text-xs text-gray-400" title="This hint will be shown to students if they get the question wrong or request a hint.">?</span>
          </label>
          <input
            type="text"
            value={question.hint || ''}
            onChange={handleHintChange}
            className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter a hint for this question"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1 flex items-center">
            Tags
            <span className="ml-1 text-xs text-gray-400" title="Add tags to help categorize this question (e.g. tactic, endgame, fork, mate in 2)">?</span>
          </label>
          <TagInput
            value={question.tags || []}
            onChange={handleTagsChange}
            suggestions={tagSuggestions}
          />
        </div>
      </div>
      {question.type === 'multiple_choice' ? (
        <MultipleChoiceEditor
          question={question}
          questionIndex={questionIndex}
          handleAnswerChange={handleAnswerChange}
        />
      ) : (
        <ChessQuestionEditor
          question={question}
          questionIndex={questionIndex}
          handleChessModeChange={handleChessModeChange}
          handleChessPositionChange={handleChessPositionChange}
          handleChessOrientationChange={handleChessOrientationChange}
          handlePGNChange={handlePGNChange}
          handlePGNUpload={handlePGNUpload}
          handleExpectedPlayerColorChange={handleExpectedPlayerColorChange}
          handleCorrectMoveChange={handleCorrectMoveChange}
          addCorrectMove={addCorrectMove}
          removeCorrectMove={removeCorrectMove}
        />
      )}
    </div>
  );
});

// Questions List - Now with Drag & Drop Support
const QuestionsList = React.memo(function QuestionsList(props) {
  const { quiz, handleQuestionsReorder, handleSaveQuestionOrder, ...handlers } = props;
  
  if (quiz.questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-dark mb-4">No questions added yet</p>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlers.handleAddQuestion('multiple_choice')}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent"
          >
            Add Multiple Choice Question
          </button>
          <button
            onClick={() => handlers.handleAddQuestion('chess')}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-secondary"
          >
            Add Chess Question
          </button>
        </div>
      </div>
    );
  }

  return (
    <SortableQuestionsList
      questions={quiz.questions}
      onQuestionsReorder={handleQuestionsReorder}
      onSaveQuestionOrder={handleSaveQuestionOrder}
      showSaveButton={!!quiz.id} // Only show save button for existing quizzes
    >
      {(question, questionIndex, isDragDisabled) => (
        <DraggableQuestionCard
          key={question.id || question.tempId}
          question={question}
          questionIndex={questionIndex}
          handleRemoveQuestion={handlers.handleRemoveQuestion}
          isDragDisabled={isDragDisabled}
        >
          <QuestionCard
            question={question}
            questionIndex={questionIndex}
            {...handlers}
          />
        </DraggableQuestionCard>
      )}
    </SortableQuestionsList>
  );
});

// Add Question Buttons
const AddQuestionButtons = React.memo(function AddQuestionButtons({ handleAddQuestion }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <button
        onClick={() => handleAddQuestion('multiple_choice')}
        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent flex items-center text-sm w-full sm:w-auto"
      >
        <FaPlus className="mr-2" /> Add Multiple Choice
      </button>
      <button
        onClick={() => handleAddQuestion('chess')}
        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-secondary flex items-center text-sm w-full sm:w-auto"
      >
        <FaChess className="mr-2" /> Add Chess Question
      </button>
    </div>
  );
});

const QuizCreator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const {
    createPGNQuestion,
    getStoredPGNData,
    clearStoredPGNData
  } = usePGNQuizIntegration();
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    time_limit: 15,
    status: 'draft',
    questions: [],
    is_public: false,
    batch_ids: [],
    classroom_ids: [],
    student_ids: []
  });

  const [batches, setBatches] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  // Fetch batches and classrooms for sharing
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await BatchesApi.getBatches();
        setBatches(res.batches || []);
      } catch {
        setBatches([]);
      }
    };
    const fetchClassrooms = async () => {
      try {
        // Use ClassroomApi if available
        const res = await QuizApi.getClassrooms?.() || { classes: [] };
        setClassrooms(res.classes || []);
      } catch {}
    };
    fetchBatches();
    fetchClassrooms();
  }, []);

  // Student search for sharing
  useEffect(() => {
    if (!studentSearch || studentSearch.length < 2) return;
    setStudentLoading(true);
    const timeout = setTimeout(async () => {
      try {
        // Use UsersApi if available
        const res = await QuizApi.searchStudents?.(studentSearch) || { students: [] };
        setStudents(res.students || []);
      } catch {
        setStudents([]);
      } finally {
        setStudentLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [studentSearch]);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle PGN data from sessionStorage (when coming from PGN Library)
  useEffect(() => {
    const pgnData = getStoredPGNData();
    const batchData = sessionStorage.getItem('pgnBatchForQuiz');
    const batchTitle = sessionStorage.getItem('batchQuizTitle');
    
    if (batchData && !isEditing) {
      try {
        const parsedBatchData = JSON.parse(batchData);
        
        // Set quiz title from batch
        setQuiz(prev => ({
          ...prev,
          title: prev.title || batchTitle || `Multi-Game Analysis Quiz`,
          description: prev.description || `Quiz created from ${parsedBatchData.questions.length} PGN games`,
          is_public: true // Default PGN-created quizzes to public for student visibility
        }));
        
        // Add all batch questions
        setQuiz(prev => ({
          ...prev,
          questions: [...parsedBatchData.questions, ...prev.questions]
        }));
        
        // Clear sessionStorage after use
        sessionStorage.removeItem('pgnBatchForQuiz');
        sessionStorage.removeItem('batchQuizTitle');
        
        toast.success(`Added ${parsedBatchData.questions.length} PGN games as chess questions!`);
      } catch (error) {
        console.error('Error processing batch data:', error);
        toast.error('Failed to load batch PGN data');
        sessionStorage.removeItem('pgnBatchForQuiz');
        sessionStorage.removeItem('batchQuizTitle');
      }
    } else if (pgnData && !isEditing) {
      try {
        // Set quiz title based on PGN if it's empty
        setQuiz(prev => ({
          ...prev,
          title: prev.title || `Quiz: ${pgnData.title}`,
          description: prev.description || `Quiz created from PGN: ${pgnData.title}`,
          is_public: true // Default PGN-created quizzes to public for student visibility
        }));
        
        // Add PGN as first chess question (async)
        const processPGNQuestion = async () => {
          try {
            const pgnQuestion = await createPGNQuestion(pgnData, `Analyze this game: ${pgnData.title}`);
            
            setQuiz(prev => ({
              ...prev,
              questions: [pgnQuestion, ...prev.questions]
            }));
            
            toast.success('PGN added as chess question!');
          } catch (error) {
            console.error('Error creating PGN question:', error);
            toast.error('Failed to create PGN question');
          }
        };
        
        processPGNQuestion();
        
        // Clear sessionStorage after use
        clearStoredPGNData();
        
      } catch (error) {
        console.error('Error processing PGN data:', error);
        toast.error('Failed to load PGN data');
        clearStoredPGNData();
      }
    }
  }, [isEditing, createPGNQuestion, getStoredPGNData, clearStoredPGNData]);
  
  // Handle adding PGN to existing quiz (when editing)
  useEffect(() => {
    const pgnData = getStoredPGNData();
    const batchData = sessionStorage.getItem('pgnBatchForQuiz');
    
    if (batchData && isEditing && quiz.questions) {
      try {
        const parsedBatchData = JSON.parse(batchData);
        
        // Add all batch questions to existing quiz
        setQuiz(prev => ({
          ...prev,
          questions: [...prev.questions, ...parsedBatchData.questions]
        }));
        
        // Clear sessionStorage after use
        sessionStorage.removeItem('pgnBatchForQuiz');
        
        toast.success(`Added ${parsedBatchData.questions.length} PGN games as new chess questions!`);
      } catch (error) {
        toast.error('Failed to load batch PGN data');
        sessionStorage.removeItem('pgnBatchForQuiz');
      }
    } else if (pgnData && isEditing && quiz.questions) {
      try {
        // Add PGN as new chess question to existing quiz (async)
        const processPGNQuestion = async () => {
          try {
            const pgnQuestion = await createPGNQuestion(pgnData, `Analyze this game: ${pgnData.title}`);
            
            setQuiz(prev => ({
              ...prev,
              questions: [...prev.questions, pgnQuestion]
            }));
            
            toast.success('PGN added as new chess question!');
          } catch (error) {
            console.error('Error creating PGN question:', error);
            toast.error('Failed to create PGN question');
          }
        };
        
        processPGNQuestion();
        
        // Clear sessionStorage after use
        clearStoredPGNData();
        
      } catch (error) {
        toast.error('Failed to load PGN data');
        clearStoredPGNData();
      }
    }
  }, [isEditing, quiz.questions, createPGNQuestion, getStoredPGNData, clearStoredPGNData]);
  
  useEffect(() => {
    const fetchQuizData = async () => {
      try {        const response = await QuizApi.getById(id);
        
        if (!response.quiz) {
          throw new Error('Quiz not found');
        }
        
        // Process questions to ensure chess mode is set correctly
        const processedQuestions = (response.quiz.questions || []).map(question => {
          if (question.type === 'chess') {
            // Determine chess mode based on data
            const hasPgnData = question.pgn_data && question.pgn_data.trim();
            return {
              ...question,
              chess_mode: hasPgnData ? 'pgn' : 'fen',
              expected_player_color: question.expected_player_color || 'white'
            };
          }
          return question;
        });
        
        setQuiz({
          ...response.quiz,
          questions: processedQuestions
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
    // Add hints and tags to all questions
    newQuestion.hint = '';
    newQuestion.tags = [];
    if (questionType === 'chess') {
      newQuestion.chess_position = 'start';
      newQuestion.chess_orientation = 'white';
      newQuestion.correct_moves = [];
      newQuestion.chess_mode = 'fen'; // 'fen' or 'pgn'
      newQuestion.pgn_data = '';
      newQuestion.expected_player_color = 'white';
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
  
  // NEW: Drag and drop reordering handlers
  const handleQuestionsReorder = useCallback((reorderedQuestions) => {
    setQuiz(prev => ({
      ...prev,
      questions: reorderedQuestions
    }));
  }, []);

  const handleSaveQuestionOrder = useCallback(async () => {
    if (!quiz.id) {
      toast.error('Please save the quiz first before reordering questions');
      return;
    }

    try {
      // Create array with question IDs and their new order
      const questionsOrder = quiz.questions.map((question, index) => ({
        id: question.id || question.tempId,
        order_index: index + 1
      }));

      await QuizApi.reorderQuestions(quiz.id, questionsOrder);
      toast.success('Question order saved successfully!');
    } catch (error) {
      console.error('Failed to save question order:', error);
      throw error; // Re-throw to let SortableQuestionsList handle the error UI
    }
  }, [quiz.id, quiz.questions]);
  
  const handleImageUpload = async (questionIndex, file) => {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await QuizApi.uploadQuestionImage?.(formData) || {};
      
      if (response.image_url) {
        handleQuestionChange(questionIndex, 'image_url', response.image_url);
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };    const validateQuiz = () => {
    if (!quiz.title.trim()) return 'Quiz title is required';
    if (!quiz.time_limit || quiz.time_limit <= 0) return 'Time limit must be greater than 0';
    if (quiz.questions.length === 0) return 'Quiz must have at least one question';
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;      if (q.type === 'chess') {
        const mode = q.chess_mode || 'fen';
        
        if (mode === 'fen') {
          // FEN mode validation
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
        } else if (mode === 'pgn') {
          // PGN mode validation
          if (!q.pgn_data || !q.pgn_data.trim()) {
            return `Chess question ${i + 1} in PGN mode must have PGN data`;
          }
          
          // Try to validate PGN format (basic check)
          if (!q.pgn_data.includes('1.') && !q.pgn_data.includes('[White')) {
            console.warn(`Chess question ${i + 1} PGN data may be invalid`);
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
    const handleChessPositionChange = (questionIndex, position) => {
    handleQuestionChange(questionIndex, 'chess_position', position);
  };

  const handleChessOrientationChange = (questionIndex, orientation) => {
    handleQuestionChange(questionIndex, 'chess_orientation', orientation);
  };

  const handleChessModeChange = (questionIndex, mode) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      chess_mode: mode
    };
    
    // Clear data for the mode we're switching away from
    if (mode === 'fen') {
      updatedQuestions[questionIndex].pgn_data = '';
    } else if (mode === 'pgn') {
      updatedQuestions[questionIndex].chess_position = 'start';
      updatedQuestions[questionIndex].correct_moves = [];
    }
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };


  const handlePGNChange = (questionIndex, pgnData) => {
    handleQuestionChange(questionIndex, 'pgn_data', pgnData);
  };

  // PGN file upload handler for chess questions in PGN mode
  const handlePGNUpload = (questionIndex, file) => {
    if (!file) return;
    const reader = new window.FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      // Optionally, validate PGN here (basic check)
      if (!content || typeof content !== 'string' || content.trim().length < 4) {
        toast.error('Invalid or empty PGN file.');
        return;
      }
      handlePGNChange(questionIndex, content);
      toast.success('PGN uploaded!');
    };
    reader.onerror = () => {
      toast.error('Failed to read PGN file.');
    };
    reader.readAsText(file);
  };

  const handleExpectedPlayerColorChange = (questionIndex, color) => {
    handleQuestionChange(questionIndex, 'expected_player_color', color);
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

  const handleSaveDraft = async () => {
    if (!quiz.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    
    setSaving(true);
    
    try {
      const draftData = { ...quiz, status: 'draft' };
      
      const response = await QuizApi.saveDraft?.(draftData) || {};
      
      // Update the quiz ID if this was a new draft
      if (response.id && !isEditing) {
        setQuiz(prev => ({ ...prev, id: response.id }));
        // Update URL to edit mode
        window.history.replaceState(null, '', `/teacher/quiz/edit/${response.id}`);
      }
      
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setSaving(true);
    
    try {
      // First save the quiz data
      const quizDataWithStatus = { ...quiz, status: 'published' };
      
      if (isEditing) {
        await QuizApi.update?.(id, quizDataWithStatus);
      } else {
        const response = await QuizApi.create?.(quizDataWithStatus) || {};
        if (response.id) {
          setQuiz(prev => ({ ...prev, id: response.id }));
        }
      }
      
      toast.success('Quiz published successfully!');
      navigate('/teacher/quizzes');

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-secondary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="mt-2 text-accent hover:underline"
          >
            Back to Quiz Management
          </button>
        </div>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-background-light p-4 sm:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <section className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="p-2 rounded-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            aria-label="Back to Quiz Management"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <span className="inline-block">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
            </span>
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
        </section>
        <QuizDetailsForm quiz={quiz} handleFormChange={handleFormChange} />
        <SharingControls
          quiz={quiz}
          setQuiz={setQuiz}
          batches={batches}
          classrooms={classrooms}
          students={students}
          studentSearch={studentSearch}
          setStudentSearch={setStudentSearch}
          studentLoading={studentLoading}
        />
        <section className="bg-white rounded-lg shadow-md mb-6 sm:mb-8 transition-all duration-200">
          <header className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
              Questions
            </h2>
            <AddQuestionButtons handleAddQuestion={handleAddQuestion} />
          </header>
          <QuestionsList
            quiz={quiz}
            handleRemoveQuestion={handleRemoveQuestion}
            handleQuestionChange={handleQuestionChange}
            handleImageUpload={handleImageUpload}
            handleAnswerChange={handleAnswerChange}
            handleChessModeChange={handleChessModeChange}
            handleChessPositionChange={handleChessPositionChange}
            handleChessOrientationChange={handleChessOrientationChange}
            handlePGNChange={handlePGNChange}
            handlePGNUpload={handlePGNUpload}
            handleExpectedPlayerColorChange={handleExpectedPlayerColorChange}
            handleCorrectMoveChange={handleCorrectMoveChange}
            addCorrectMove={addCorrectMove}
            removeCorrectMove={removeCorrectMove}
            handleAddQuestion={handleAddQuestion}
            handleQuestionsReorder={handleQuestionsReorder}
            handleSaveQuestionOrder={handleSaveQuestionOrder}
          />
          <footer className="p-4 sm:p-6">
            <AddQuestionButtons handleAddQuestion={handleAddQuestion} />
          </footer>
        </section>
        <section className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="px-4 py-2 text-gray-dark hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent flex items-center justify-center text-sm sm:text-base transition-all"
          >
            <FaArrowLeft className="mr-2" />
            Back to Quizzes
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className={`px-4 sm:px-6 py-2 sm:py-3 bg-gray-dark text-gray-light rounded-lg flex items-center justify-center text-sm sm:text-base transition-all ${
                saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-600'
              }`}
            >
              <FaFileAlt className="mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className={`px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-white rounded-lg flex items-center justify-center text-sm sm:text-base transition-all ${
                saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-accent'
              }`}
            >
              <FaCheck className="mr-2" />
              {saving ? 'Publishing...' : 'Publish Quiz'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default QuizCreator;
