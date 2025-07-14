import React from 'react';
import { AlertTriangle } from 'lucide-react';


const ErrorState = React.memo(({ message }) => (
  <div
    className="flex items-center justify-center min-h-[60px] bg-red-700 border border-red-800 text-white rounded-xl px-4 py-3 mb-6 gap-3 shadow-md animate-fade-in"
    role="alert"
    aria-live="assertive"
  >
    <AlertTriangle className="w-6 h-6 text-white flex-shrink-0" aria-hidden="true" />
    <span className="text-base font-medium">{message}</span>
  </div>
));

export default ErrorState;
