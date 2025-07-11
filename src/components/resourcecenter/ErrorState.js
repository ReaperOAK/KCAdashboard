import React from 'react';

const ErrorState = React.memo(function ErrorState({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
      {message}
    </div>
  );
});

export default ErrorState;
