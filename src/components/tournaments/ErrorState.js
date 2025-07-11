import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Error state for tournament pages.
 * Shows a prominent error message with icon.
 */
const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-md" role="alert">
    <AlertTriangle className="w-8 h-8 text-red-700 mb-2" aria-hidden="true" />
    <span className="text-red-700 text-lg font-semibold">{message}</span>
  </div>
);

export default React.memo(ErrorState);
