import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }
    fetch(`/api/endpoints/auth/verify-email.php?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You may now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('An error occurred while verifying your email.');
      });
  }, [searchParams]);

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <div style={{ margin: '24px 0', color: status === 'success' ? 'green' : status === 'error' ? 'red' : '#333' }}>
        {message}
      </div>
      {status === 'success' && (
        <a href="/login" style={{ color: '#1976d2', textDecoration: 'underline' }}>Go to Login</a>
      )}
    </div>
  );
};

export default VerifyEmail;
