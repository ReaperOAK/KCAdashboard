import React from 'react';
import { FileText } from 'lucide-react';

const AssignmentsLoadingSkeleton = React.memo(() => (
  <div className="py-8 flex flex-col items-center gap-6 " aria-busy="true" aria-live="polite">
    <FileText className="w-10 h-10 text-accent mb-2 animate-pulse" aria-hidden="true" />
    <div className="w-full max-w-2xl flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse bg-background-light dark:bg-background-dark border border-gray-light dark:border-gray-dark rounded-2xl p-6 sm:p-8 shadow-md flex flex-col gap-2"
        >
          <div className="h-6 w-1/3 bg-gray-light dark:bg-gray-dark rounded mb-2" />
          <div className="h-4 w-2/3 bg-gray-light dark:bg-gray-dark rounded mb-3" />
          <div className="h-4 w-1/4 bg-gray-light dark:bg-gray-dark rounded mb-1" />
          <div className="h-4 w-1/4 bg-gray-light dark:bg-gray-dark rounded mb-1" />
        </div>
      ))}
    </div>
  </div>
));

export default AssignmentsLoadingSkeleton;
