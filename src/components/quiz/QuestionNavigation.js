import React from 'react';

/**
 * Navigation for quiz questions.
 * @param {Object} props
 */
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

export default QuestionNavigation;
