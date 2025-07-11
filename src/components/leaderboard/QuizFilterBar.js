import React from 'react';
import { FaChess } from 'react-icons/fa';

const QuizFilterBar = React.memo(({ quizzes, activeQuiz, onQuizChange }) => (
  <nav className="p-4 flex flex-col sm:flex-row gap-2 bg-background-light border-b border-gray-light rounded-t-lg" aria-label="Quiz selection">
    <button
      type="button"
      onClick={onQuizChange('overall')}
      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200
        ${activeQuiz === 'overall' ? 'bg-secondary text-white' : 'bg-gray-light text-primary hover:bg-accent hover:text-white'}`}
      aria-pressed={activeQuiz === 'overall'}
      tabIndex={0}
    >
      Overall Ranking
    </button>
    {quizzes.map(quiz => (
      <button
        key={quiz.id}
        type="button"
        onClick={onQuizChange(quiz.id)}
        className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200
          ${activeQuiz === quiz.id ? 'bg-secondary text-white' : 'bg-gray-light text-primary hover:bg-accent hover:text-white'}`}
        aria-pressed={activeQuiz === quiz.id}
        tabIndex={0}
      >
        <FaChess className="mr-1" aria-hidden="true" /> {quiz.title}
      </button>
    ))}
  </nav>
));

export default QuizFilterBar;
