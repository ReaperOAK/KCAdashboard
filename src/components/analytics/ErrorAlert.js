import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorAlert = ({ error, onRetry }) => (
  <div className="bg-red-100 p-4 rounded-xl text-red-700 mb-6 border border-red-400 flex items-center gap-3" role="alert">
    <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
    <div className="flex-1">
      <p className="font-bold">Error Loading Analytics</p>
      <p>{error}</p>
      <p className="text-sm mt-1">Please check your internet connection and try again.</p>
    </div>
    <button
      onClick={onRetry}
      className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
    >
      Retry
    </button>
  </div>
);

export default React.memo(ErrorAlert);
