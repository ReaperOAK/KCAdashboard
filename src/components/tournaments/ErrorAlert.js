import React from 'react';

const ErrorAlert = React.memo(({ message }) => (
  <div className="bg-error border-l-4 border-error text-white px-6 py-4 rounded mb-6" role="alert" aria-live="assertive">
    {message}
  </div>
));

export default ErrorAlert;
