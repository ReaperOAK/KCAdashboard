import React from 'react';
import { AlertTriangle } from 'lucide-react';


const AssignmentsErrorAlert = React.memo(({ error }) => (
  <div
    className="bg-error border border-error text-white rounded-xl p-4 sm:p-6 text-center flex flex-col items-center gap-2 shadow-lg  scale-100 animate-[fadeIn_0.4s_ease-in_forwards]"
    role="alert"
    tabIndex={0}
    aria-live="assertive"
  >
    <AlertTriangle className="w-9 h-9 text-white dark:text-red-300 mb-1 drop-shadow" aria-hidden="true" />
    <span className="font-semibold text-base sm:text-lg leading-snug">{error}</span>
  </div>
));

export default AssignmentsErrorAlert;
