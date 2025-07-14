import React from 'react';
import { FaChess } from 'react-icons/fa';

/**
 * QuizFilterBar: Renders a beautiful, accessible, responsive quiz filter bar.
 * Props:
 *   - quizzes: array of quiz objects
 *   - activeQuiz: string (selected quiz id)
 *   - onQuizChange: function (quizId) => void
 */
const QuizFilterBar = React.memo(function QuizFilterBar({ quizzes, activeQuiz, onQuizChange }) {
  // Defensive: fallback if quizzes is undefined
  const quizList = Array.isArray(quizzes) ? quizzes : [];

  // Handler to ensure correct event signature
  const handleQuizChange = React.useCallback(
    (quizId) => () => {
      if (typeof onQuizChange === 'function') onQuizChange(quizId);
    },
    [onQuizChange]
  );

  return (
    <nav
      className="p-3 sm:p-4 flex flex-col sm:flex-row gap-2 bg-background-light border-b border-gray-light rounded-t-xl shadow-sm "
      aria-label="Quiz selection"
    >
      <button
        type="button"
        onClick={handleQuizChange('overall')}
        className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200
          ${activeQuiz === 'overall' ? 'bg-secondary text-white shadow-md' : 'bg-gray-light text-primary hover:bg-accent hover:text-white'}`}
        aria-pressed={activeQuiz === 'overall'}
        tabIndex={0}
      >
        Overall Ranking
      </button>
      {quizList.map((quiz) => (
        <button
          key={quiz.id}
          type="button"
          onClick={handleQuizChange(quiz.id)}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200
            ${activeQuiz === quiz.id ? 'bg-secondary text-white shadow-md' : 'bg-gray-light text-primary hover:bg-accent hover:text-white'}`}
          aria-pressed={activeQuiz === quiz.id}
          tabIndex={0}
        >
          <FaChess className="mr-1 text-accent text-base" aria-hidden="true" />
          <span className="truncate max-w-[120px] sm:max-w-[180px] text-left">{quiz.title}</span>
        </button>
      ))}
    </nav>
  );
});

export default QuizFilterBar;
