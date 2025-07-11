import React from 'react';

const ErrorState = React.memo(({ message }) => (
  <div className="bg-error/10 text-error border border-error rounded p-4 text-center mb-6" role="alert">
    <span>{message}</span>
  </div>
));

export default ErrorState;
