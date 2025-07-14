
import React from 'react';

/**
 * QuestionNavigation: Beautiful, accessible, responsive navigation for quiz questions.
 */
const QuestionNavigation = React.memo(function QuestionNavigation({ questions, currentIndex, onJump, selectedAnswers, chessMoves }) {
  return (
    <nav className="w-full max-w-3xl mx-auto mt-6 animate-fade-in" aria-label="Quiz question navigation">
      <div className="bg-white dark:bg-background-dark rounded-2xl shadow-md border border-gray-light p-4 flex flex-wrap gap-2 justify-center">
        {questions.map((question, index) => {
          const isAnswered = question.type === 'chess'
            ? chessMoves[question.id] && (
                question.pgn_data
                  ? chessMoves[question.id].completed || chessMoves[question.id].isCorrect
                  : chessMoves[question.id].from && chessMoves[question.id].to
              )
            : selectedAnswers[question.id];
          const isActive = currentIndex === index;
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onJump(index)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative font-semibold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200
                ${isActive
                  ? 'bg-accent text-white shadow-md scale-110'
                  : isAnswered
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-gray-light text-primary hover:bg-accent/10'}
              `}
              aria-label={`Go to question ${index + 1}${isAnswered ? ', answered' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              tabIndex={0}
            >
              <span>{index + 1}</span>
              {question.type === 'chess' && (
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  question.pgn_data ? 'bg-accent' : 'bg-blue-500'
                }`} aria-hidden="true"></span>
              )}
              <span className="sr-only">{isAnswered ? 'Answered' : isActive ? 'Current' : 'Not answered'}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

export default QuestionNavigation;
