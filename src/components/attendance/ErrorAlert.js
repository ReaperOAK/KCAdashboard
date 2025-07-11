import React from 'react';
import PropTypes from 'prop-types';

const ErrorAlert = React.memo(function ErrorAlert({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 p-4 bg-error text-white border border-error rounded-lg" role="alert">
      {error}
    </div>
  );
});

ErrorAlert.propTypes = {
  error: PropTypes.string,
};

export default ErrorAlert;
