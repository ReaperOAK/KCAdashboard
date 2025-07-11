import React from 'react';

const ErrorState = React.memo(({ message }) => (
  <div className="p-6 text-center text-white bg-error border border-error rounded shadow-md flex flex-col items-center gap-2" role="alert">
    <span className="text-lg font-semibold">{message}</span>
  </div>
));

export default ErrorState;
