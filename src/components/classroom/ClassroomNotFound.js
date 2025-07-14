import React from 'react';
import { AlertTriangle } from 'lucide-react';


const ClassroomNotFound = React.memo(({ onBack }) => (
  <section className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-white dark:bg-background-dark border border-gray-light dark:border-gray-dark p-6 sm:p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl animate-fade-in">
      <div className="flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 mb-3 text-accent animate-pulse" aria-hidden="true" />
        <div className="text-xl sm:text-2xl font-semibold text-primary dark:text-text-light mb-2" aria-live="polite" role="alert">Classroom not found</div>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 px-5 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-base font-semibold transition-all duration-200 shadow-sm"
          aria-label="Back to Classrooms"
        >
          Back to Classrooms
        </button>
      </div>
    </div>
  </section>
));

export default ClassroomNotFound;
