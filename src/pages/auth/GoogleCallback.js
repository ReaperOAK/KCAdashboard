import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleResponse = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code || !state) {
        setError('Invalid authentication response');
        return;
      }

      try {
        const res = await fetch('/php/google-login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        if (!res.ok) throw new Error('Authentication failed');

        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem('role', data.role);
          // Role-based redirect
          switch (data.role) {
            case 'student':
              navigate('/student-dashboard');
              break;
            case 'teacher':
              navigate('/teacher-dashboard');
              break;
            case 'admin':
              navigate('/admin-dashboard');
              break;
            default:
              navigate('/');
          }
        } else {
          setError(data.message || 'Login failed');
        }
      } catch (error) {
        setError('Authentication failed. Please try again.');
      }
    };

    handleGoogleResponse();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
      {error ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-[#af0505] mb-4">{error}</div>
          <button 
            onClick={() => navigate('/login')}
            className="text-[#461fa3] hover:text-[#7646eb]"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#461fa3]"></div>
          <p className="mt-4 text-[#3b3a52]">Authenticating...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleCallback;