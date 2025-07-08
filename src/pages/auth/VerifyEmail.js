

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthApi } from '../../api/auth';

const getStatusColor = status => {
  switch (status) {
    case 'success':
      return 'text-green-700';
    case 'error':
      return 'text-red-700';
    default:
      return 'text-gray-dark';
  }
};

const MessageBanner = React.memo(function MessageBanner({ status, message }) {
  const colorClass = getStatusColor(status);
  return (
    <div className={`my-6 text-base font-medium ${colorClass}`} role="status" aria-live="polite">
      {message}
    </div>
  );
});

const GoToLoginLink = React.memo(function GoToLoginLink() {
  return (
    <a
      href="/login"
      className="inline-block mt-4 text-accent underline font-semibold focus:outline-none focus:ring-2 focus:ring-accent rounded"
      tabIndex={0}
      aria-label="Go to Login"
    >
      Go to Login
    </a>
  );
});

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Verifying your email...');

  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  const verify = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }
    try {
      const data = await AuthApi.verifyEmail(token);
      setStatus('success');
      setMessage(data.message || 'Email verified successfully! You may now log in.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification failed.');
    }
  }, [token]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border border-gray-light rounded-xl bg-white shadow-md text-center" role="form" aria-labelledby="verify-email-title">
      <h2 id="verify-email-title" className="text-2xl font-bold text-primary mb-2">Email Verification</h2>
      <MessageBanner status={status} message={message} />
      {status === 'success' && <GoToLoginLink />}
    </div>
  );
}

export default React.memo(VerifyEmail);
