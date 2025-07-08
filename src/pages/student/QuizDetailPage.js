
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import { FaChessPawn, FaClock, FaChessKnight } from 'react-icons/fa';
import ChessQuizBoard from '../../components/chess/ChessQuizBoard';
import ChessPGNBoard from '../../components/chess/ChessPGNBoard';

// --- Loading Spinner ---
const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
    <div className="text-center">
      <FaChessPawn className="animate-bounce mx-auto text-4xl text-secondary mb-4" aria-hidden="true" />
      <p className="text-xl text-gray-dark">Loading quiz...</p>
    </div>
  </div>
));

// --- Error State ---
const ErrorState = React.memo(({ error, onBack }) => (
  <div className="min-h-screen bg-background-light p-8">
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <p className="text-red-500" role="alert">{error}</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Back to Quizzes
      </button>
    </div>
  </div>
));

// --- Quiz Instructions ---
const QuizInstructions = React.memo(({ quiz, onStart }) => (
  <div className="min-h-screen bg-background-light p-8">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-primary mb-4">{quiz.title}</h1>
      <div className="mb-6">
        <p className="text-gray-dark">{quiz.description}</p>
      </div>
      <div className="flex items-center justify-between mb-8 p-4 bg-gray-light rounded-lg">
        <div className="flex items-center">
          <FaClock className="text-secondary mr-2" aria-hidden="true" />
          <span className="font-medium">Time Limit: {quiz.time_limit} minutes</span>
        </div>
        <div className="flex items-center">
          <FaChessKnight className="text-secondary mr-2" aria-hidden="true" />
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
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
          type="button"
          onClick={onStart}
          className="px-8 py-3 bg-secondary text-white rounded-lg hover:bg-accent transition-colors font-semibold text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Start Quiz
        </button>
      </div>
    </div>
  </div>
));

// --- Question Navigation ---
const QuestionNavigation = React.memo(({ questions, currentIndex, onJump, selectedAnswers, chessMoves }) => (
  <div className="max-w-3xl mx-auto mt-4">
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => {
          const isAnswered = question.type === 'chess'
            ? chessMoves[question.id] && (
                question.pgn_data
                  ? chessMoves[question.id].completed || chessMoves[question.id].isCorrect
                  : chessMoves[question.id].from && chessMoves[question.id].to
              )
            : selectedAnswers[question.id];
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onJump(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
                ${isAnswered
                  ? 'bg-secondary text-white'
                  : currentIndex === index
                    ? 'bg-accent text-white'
                    : 'bg-gray-light text-primary hover:bg-gray-200'}
              `}
              aria-label={`Go to question ${index + 1}${isAnswered ? ', answered' : ''}`}
            >
              {index + 1}
              {question.type === 'chess' && (
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  question.pgn_data ? 'bg-accent' : 'bg-blue-500'
                }`} aria-hidden="true"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  </div>
));

// --- Question Card ---
const QuestionCard = React.memo(function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  quizDifficulty,
  selectedAnswers,
  onAnswerSelect,
  chessMoves,
  onChessMove,
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-4">
        <span className="text-sm text-gray-dark">Question {questionIndex + 1} of {totalQuestions}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
          ${quizDifficulty === 'beginner' ? 'bg-green-100 text-green-800' :
          quizDifficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'}`}
        >
          {quizDifficulty}
        </span>
      </div>
      <h2 className="text-xl font-semibold text-primary">{question.question}</h2>
      {question.image_url && (
        <div className="my-4 flex justify-center">
          <img
            src={question.image_url}
            alt="Question diagram"
            className="max-h-64 rounded-lg border border-gray-light"
          />
        </div>
      )}
      {/* Chess or MCQ */}
      {question.type === 'chess' ? (
        <div className="mb-8">
          {question.pgn_data ? (
            <ChessPGNBoard
              pgn={question.pgn_data}
              expectedPlayerColor={question.expected_player_color || 'white'}
              orientation={question.chess_orientation || 'white'}
              question=""
              onMove={moveData => onChessMove(question.id, moveData)}
              width={400}
              className="mx-auto"
              quizMode={true}
            />
          ) : (
            <ChessQuizBoard
              initialPosition={question.chess_position || 'start'}
              orientation={question.chess_orientation || 'white'}
              correctMoves={question.correct_moves || []}
              question=""
              allowMoves={true}
              showAnswer={false}
              onMove={moveData => onChessMove(question.id, moveData)}
              width={400}
              className="mx-auto"
            />
          )}
          {chessMoves[question.id] && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {question.pgn_data ? (
                  chessMoves[question.id].completed ?
                    'Sequence completed successfully!'
                    : `Move recorded: ${chessMoves[question.id].san} ${chessMoves[question.id].isCorrect ? '✓' : '✗'}`
                ) : (
                  `Move recorded: ${chessMoves[question.id].from} → ${chessMoves[question.id].to}`
                )}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {question.answers && question.answers.map(answer => (
            <div
              key={answer.id}
              tabIndex={0}
              role="button"
              aria-pressed={selectedAnswers[question.id] === answer.id}
              onClick={() => onAnswerSelect(question.id, answer.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onAnswerSelect(question.id, answer.id);
              }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all outline-none
                ${selectedAnswers[question.id] === answer.id
                  ? 'border-secondary bg-background-light'
                  : 'border-gray-light hover:border-gray-dark'}
              `}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                  ${selectedAnswers[question.id] === answer.id
                    ? 'border-secondary'
                    : 'border-gray-dark'}
                `}
                >
                  {selectedAnswers[question.id] === answer.id && (
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  )}
                </div>
                <span>{answer.answer_text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// --- Navigation Buttons ---
const NavigationButtons = React.memo(function NavigationButtons({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting,
}) {
  return (
    <div className="flex justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className={`px-4 py-2 rounded-lg border font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
          ${currentIndex === 0
            ? 'border-gray-light text-gray-400 cursor-not-allowed'
            : 'border-secondary text-secondary hover:bg-background-light'}
        `}
        aria-label="Previous question"
      >
        Previous
      </button>
      {currentIndex < totalQuestions - 1 ? (
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Next question"
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
            ${isSubmitting
              ? 'bg-gray-light cursor-not-allowed'
              : 'bg-secondary hover:bg-accent'}
          `}
          aria-label="Submit quiz"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      )}
    </div>
  );
});

// --- Timer Bar ---
const TimerBar = React.memo(function TimerBar({ quizTitle, timeLeft }) {
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  return (
    <div className="max-w-3xl mx-auto mb-4 bg-white p-4 rounded-lg shadow flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary truncate" title={quizTitle}>{quizTitle}</h1>
      <div className="flex items-center">
        <FaClock className="text-secondary mr-2" aria-hidden="true" />
        <span className={`font-mono text-xl font-semibold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-dark'}`}
          aria-live="polite"
        >
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
});

// --- Main QuizDetailPage ---
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
      setError('Failed to submit quiz');
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

  // Render
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} onBack={handleBackToQuizzes} />;
  if (!quizStarted) return <QuizInstructions quiz={quiz} onStart={handleStartQuiz} />;

  const currentQuestion = quiz.questions ? quiz.questions[currentQuestionIndex] : null;

  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <TimerBar quizTitle={quiz.title} timeLeft={timeLeft} />
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-8">
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
          <p>No questions found for this quiz.</p>
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
  );
};

export { QuizDetailPage };
export default QuizDetailPage;
