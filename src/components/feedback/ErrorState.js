import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorState = React.memo(({ message }) => (
  <div className="bg-red-50 text-red-700 border border-red-200 rounded p-4 text-center mb-6 flex items-center justify-center gap-2" role="alert">
    <AlertTriangle className="w-5 h-5 text-red-600 inline-block mr-2" aria-hidden="true" />
    <span>{message}</span>
  </div>
));

export default ErrorState;
