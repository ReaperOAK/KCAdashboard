import React from 'react';

const QuizLoadingSkeleton = React.memo(() => (
  <div className="p-6 text-center" aria-busy="true" aria-label="Loading quizzes">
    <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-2 transition-all duration-200" />
    <p className="text-gray-dark">Loading quizzes...</p>
  </div>
));

export default QuizLoadingSkeleton;
