
import React from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';

/**
 * NavigationButtons: Beautiful, accessible, responsive navigation for quiz questions.
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
    <nav className="flex flex-row flex-wrap justify-between items-center mt-6 gap-2 w-full max-w-lg mx-auto " aria-label="Quiz navigation">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200
          ${currentIndex === 0
            ? 'border-gray-light text-gray-400 bg-gray-light cursor-not-allowed'
            : 'border-secondary text-secondary bg-white hover:bg-background-light'}
        `}
        aria-label="Previous question"
      >
        <FaArrowLeft className="text-base" aria-hidden="true" />
        <span className="hidden xs:inline">Previous</span>
      </button>
      {currentIndex < totalQuestions - 1 ? (
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 font-medium"
          aria-label="Next question"
        >
          <span className="hidden xs:inline">Next</span>
          <FaArrowRight className="text-base" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200
            ${isSubmitting
              ? 'bg-gray-light cursor-not-allowed'
              : 'bg-primary hover:bg-secondary'}
          `}
          aria-label="Submit quiz"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Submitting...</span>
          ) : (
            <><FaCheck className="text-base" aria-hidden="true" /><span className="hidden xs:inline">Submit Quiz</span></>
          )}
        </button>
      )}
    </nav>
  );
});

export default NavigationButtons;
