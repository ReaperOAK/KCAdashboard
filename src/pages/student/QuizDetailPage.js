import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { FaChessPawn, FaClock, FaChessKnight } from 'react-icons/fa';

const QuizDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const timerRef = useRef(null);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await ApiService.get(`/quiz/get-by-id.php?id=${id}`);
        setQuiz(response.quiz);
        setTimeLeft(response.quiz.time_limit * 60); // Convert minutes to seconds
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch quiz');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Memoize the handleSubmitQuiz function to fix the dependency warning
  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const timeTaken = (quiz.time_limit * 60) - timeLeft;
      
      const response = await ApiService.post('/quiz/submit-quiz.php', {
        quiz_id: id,
        answers: selectedAnswers,
        time_taken: timeTaken
      });
      
      // Navigate to results page with score data
      navigate(`/student/quiz-results/${id}`, { 
        state: { 
          result: response,
          quizTitle: quiz.title,
          timeTaken
        } 
      });
    } catch (error) {
      setError('Failed to submit quiz');
      setIsSubmitting(false);
    }
  }, [id, isSubmitting, navigate, quiz, selectedAnswers, timeLeft]);

  // Timer functionality
  useEffect(() => {
    if (quizStarted && timeLeft !== null) {
      if (timeLeft <= 0) {
        handleSubmitQuiz();
        return;
      }

      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, quizStarted, handleSubmitQuiz]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8 flex items-center justify-center">
        <div className="text-center">
          <FaChessPawn className="animate-bounce mx-auto text-4xl text-[#461fa3] mb-4" />
          <p className="text-xl text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => navigate('/student/quiz')}
            className="mt-4 px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#200e4a] mb-4">{quiz.title}</h1>
          <div className="mb-6">
            <p className="text-gray-600">{quiz.description}</p>
          </div>
          
          <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FaClock className="text-[#461fa3] mr-2" />
              <span className="font-medium">Time Limit: {quiz.time_limit} minutes</span>
            </div>
            <div className="flex items-center">
              <FaChessKnight className="text-[#461fa3] mr-2" />
              <span className={`px-3 py-1 rounded-full text-xs
                ${quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}
              >
                {quiz.difficulty}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>You have {quiz.time_limit} minutes to complete this quiz</li>
              <li>The quiz consists of {quiz.questions ? quiz.questions.length : 0} questions</li>
              <li>Each question has only one correct answer</li>
              <li>You can navigate between questions</li>
              <li>Once submitted, you cannot retake the quiz immediately</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleStartQuiz}
              className="px-8 py-3 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors font-semibold text-lg"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions ? quiz.questions[currentQuestionIndex] : null;

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      {/* Timer */}
      <div className="max-w-3xl mx-auto mb-4 bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#200e4a]">{quiz.title}</h1>
        <div className="flex items-center">
          <FaClock className="text-[#461fa3] mr-2" />
          <span className={`font-mono text-xl font-semibold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {currentQuestion ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span className={`px-3 py-1 rounded-full text-xs
                  ${quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}`}
                >
                  {quiz.difficulty}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-[#200e4a]">{currentQuestion.question}</h2>
              
              {currentQuestion.image_url && (
                <div className="my-4 flex justify-center">
                  <img 
                    src={currentQuestion.image_url} 
                    alt="Question diagram" 
                    className="max-h-64 rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              {currentQuestion.answers && currentQuestion.answers.map((answer) => (
                <div 
                  key={answer.id}
                  onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedAnswers[currentQuestion.id] === answer.id 
                      ? 'border-[#461fa3] bg-[#f3f1f9]' 
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                      ${selectedAnswers[currentQuestion.id] === answer.id 
                        ? 'border-[#461fa3]' 
                        : 'border-gray-400'
                      }`}
                    >
                      {selectedAnswers[currentQuestion.id] === answer.id && (
                        <div className="w-3 h-3 rounded-full bg-[#461fa3]"></div>
                      )}
                    </div>
                    <span>{answer.answer_text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-lg border
                  ${currentQuestionIndex === 0 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-[#461fa3] text-[#461fa3] hover:bg-[#f3f1f9]'
                  }`}
              >
                Previous
              </button>

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-white
                    ${isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#461fa3] hover:bg-[#7646eb]'
                    }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </>
        ) : (
          <p>No questions found for this quiz.</p>
        )}
      </div>

      {/* Question Navigation */}
      <div className="max-w-3xl mx-auto mt-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            {quiz.questions && quiz.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${selectedAnswers[question.id] 
                    ? 'bg-[#461fa3] text-white' 
                    : currentQuestionIndex === index 
                      ? 'bg-[#7646eb] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;
