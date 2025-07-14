import React from 'react';
import { XCircle } from 'lucide-react';


const ClassroomDetailError = React.memo(({ error, onBack }) => (
  <section className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-red-700 border border-red-800 text-white p-6 sm:p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl animate-fade-in">
      <div className="flex flex-col items-center">
        <XCircle className="w-12 h-12 mb-3 text-white animate-pulse" aria-hidden="true" />
        <div className="font-semibold text-lg sm:text-xl mb-2" aria-live="polite" role="alert">{error}</div>
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

export default ClassroomDetailError;
