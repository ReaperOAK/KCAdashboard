
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import LoadingSpinner from '../../components/quiz/LoadingSpinner';
import ErrorState from '../../components/quiz/ErrorState';
import QuizInstructions from '../../components/quiz/QuizInstructions';
import QuizAlreadyAttempted from '../../components/quiz/QuizAlreadyAttempted';
import QuestionNavigation from '../../components/quiz/QuestionNavigation';
import QuestionCard from '../../components/quiz/QuestionCard';
import NavigationButtons from '../../components/quiz/NavigationButtons';
import TimerBar from '../../components/quiz/TimerBar';

const QuizDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [chessMoves, setChessMoves] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const timerRef = useRef(null);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = QuizApi.getById ? await QuizApi.getById(id) : { quiz: null };
        setQuiz(response.quiz);
        setTimeLeft(response.quiz.time_limit * 60);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch quiz');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Memoized submit handler
  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const timeTaken = (quiz.time_limit * 60) - timeLeft;
      const response = QuizApi.submitQuiz ? await QuizApi.submitQuiz({
        quiz_id: id,
        answers: selectedAnswers,
        chess_moves: chessMoves,
        time_taken: timeTaken,
      }) : {};
      navigate(`/student/quiz-results/${id}`, {
        state: {
          result: response,
          quizTitle: quiz.title,
          timeTaken,
        },
      });
    } catch (error) {
      // Handle specific error messages from the backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit quiz';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  }, [id, isSubmitting, navigate, quiz, selectedAnswers, chessMoves, timeLeft]);

  // Timer effect
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

  // Handlers
  const handleStartQuiz = useCallback(() => setQuizStarted(true), []);
  const handleAnswerSelect = useCallback((questionId, answerId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  }, []);
  const handleNextQuestion = useCallback(() => setCurrentQuestionIndex(i => i + 1), []);
  const handlePreviousQuestion = useCallback(() => setCurrentQuestionIndex(i => i - 1), []);
  const handleChessMove = useCallback((questionId, moveData) => {
    setChessMoves(prev => ({ ...prev, [questionId]: moveData }));
  }, []);
  const handleJumpToQuestion = useCallback((index) => setCurrentQuestionIndex(index), []);
  const handleBackToQuizzes = useCallback(() => navigate('/student/quiz'), [navigate]);
  const handleViewHistory = useCallback(() => navigate('/student/quiz-history'), [navigate]);

  // Render
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} onBack={handleBackToQuizzes} />;
  if (quiz && quiz.has_attempted) return <QuizAlreadyAttempted quiz={quiz} onViewHistory={handleViewHistory} onBackToQuizzes={handleBackToQuizzes} />;
  if (!quizStarted) return <QuizInstructions quiz={quiz} onStart={handleStartQuiz} />;

  const currentQuestion = quiz.questions ? quiz.questions[currentQuestionIndex] : null;

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 flex flex-col">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        <TimerBar quizTitle={quiz.title} timeLeft={timeLeft} />
        <div className="bg-white/95 rounded-2xl shadow-lg p-3 sm:p-6 md:p-8 flex flex-col gap-6">
          {currentQuestion ? (
            <>
              <QuestionCard
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={quiz.questions.length}
                quizDifficulty={quiz.difficulty}
                selectedAnswers={selectedAnswers}
                onAnswerSelect={handleAnswerSelect}
                chessMoves={chessMoves}
                onChessMove={handleChessMove}
              />
              <NavigationButtons
                currentIndex={currentQuestionIndex}
                totalQuestions={quiz.questions.length}
                onPrev={handlePreviousQuestion}
                onNext={handleNextQuestion}
                onSubmit={handleSubmitQuiz}
                isSubmitting={isSubmitting}
              />
            </>
          ) : (
            <div className="text-center text-gray-dark text-lg font-medium py-8">No questions found for this quiz.</div>
          )}
        </div>
        <QuestionNavigation
          questions={quiz.questions}
          currentIndex={currentQuestionIndex}
          onJump={handleJumpToQuestion}
          selectedAnswers={selectedAnswers}
          chessMoves={chessMoves}
        />
      </div>
    </div>
  );
};

export { QuizDetailPage };
export default QuizDetailPage;
