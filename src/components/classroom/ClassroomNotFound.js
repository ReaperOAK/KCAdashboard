import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ClassroomNotFound = React.memo(({ onBack }) => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
    <div className="bg-white border border-gray-light p-6 rounded-xl max-w-lg w-full text-center shadow-lg">
      <div className="flex flex-col items-center">
        <AlertTriangle className="w-10 h-10 mb-2 text-accent" aria-hidden="true" />
        <div className="text-xl font-semibold text-primary mb-2">Classroom not found</div>
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

export default ClassroomNotFound;
