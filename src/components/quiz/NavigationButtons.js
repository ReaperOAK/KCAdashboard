import React from 'react';

/**
 * Navigation buttons for quiz questions.
 * @param {Object} props
 */
const NavigationButtons = React.memo(function NavigationButtons({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting,
}) {
  return (
    <div className="flex justify-between mt-4 gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className={`px-4 py-2 rounded-lg border font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200
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
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
          aria-label="Next question"
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200
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

export default NavigationButtons;
