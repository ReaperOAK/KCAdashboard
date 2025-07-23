import React from 'react';
import { FaCheckCircle, FaHistory, FaArrowLeft } from 'react-icons/fa';

const QuizAlreadyAttempted = React.memo(function QuizAlreadyAttempted({ quiz, onViewHistory, onBackToQuizzes }) {
  const getBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const badgeClass = getBadgeClass(quiz.difficulty);

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-background-dark rounded-2xl shadow-xl border border-gray-light p-6 sm:p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Title and Badge */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3 leading-tight">{quiz.title}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold capitalize shadow-sm ${badgeClass}`}
            aria-label={`Difficulty: ${quiz.difficulty}`}
          >
            {quiz.difficulty}
          </span>
        </div>

        {/* Message */}
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Quiz Already Completed</h2>
          <p className="text-green-700 text-base leading-relaxed">
            You have already attempted this quiz. Each quiz can only be taken once to ensure fair assessment. 
            Check your quiz history to see your results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            type="button"
            onClick={onViewHistory}
            className="w-full sm:w-auto px-6 py-3 bg-secondary text-white rounded-lg hover:bg-accent focus:bg-accent flex items-center justify-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all text-base"
            aria-label="View quiz history"
          >
            <FaHistory aria-hidden="true" /> View Quiz History
          </button>
          
          <button
            type="button"
            onClick={onBackToQuizzes}
            className="w-full sm:w-auto px-6 py-3 border border-secondary text-secondary rounded-lg hover:bg-background-light focus:bg-background-light flex items-center justify-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all text-base"
            aria-label="Back to quizzes"
          >
            <FaArrowLeft aria-hidden="true" /> Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
});

export default QuizAlreadyAttempted;
