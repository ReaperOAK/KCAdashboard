import React from 'react';
import { XCircle } from 'lucide-react';

const ClassroomDetailError = React.memo(({ error, onBack }) => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
    <div className="bg-red-700 border border-red-800 text-white p-6 rounded-xl max-w-lg w-full text-center shadow-lg">
      <div className="flex flex-col items-center">
        <XCircle className="w-10 h-10 mb-2 text-white" aria-hidden="true" />
        <div className="font-semibold text-lg mb-2">{error}</div>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          aria-label="Back to Classrooms"
        >
          Back to Classrooms
        </button>
      </div>
    </div>
  </div>
));

export default ClassroomDetailError;
