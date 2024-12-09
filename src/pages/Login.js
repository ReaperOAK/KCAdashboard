import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const navigate = useNavigate();

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      const res = await fetch('/php/google-login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('role', data.role); // Use sessionStorage
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch the Google Client ID from the server
    const fetchGoogleClientId = async () => {
      try {
        const response = await fetch('/php/get-env.php');
        const data = await response.json();
        setGoogleClientId(data.GOOGLE_CLIENT_ID);
      } catch (error) {
        console.error('Error fetching Google Client ID:', error);
      }
    };

    fetchGoogleClientId();
  }, []);

  useEffect(() => {
    if (googleClientId) {
      const initializeGoogleSignIn = () => {
        /* global google */
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline', size: 'large' }
        );
      };

      if (window.google) {
        initializeGoogleSignIn();
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.body.appendChild(script);
      }
    }
  }, [googleClientId, handleGoogleResponse]);

  // Validate email format
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!isValidEmail(email)) {
      setError('Invalid email format');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('role', data.role); // Use sessionStorage
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {!isValidEmail(email) && email && (
              <p className="text-red-500 text-xs italic">Invalid email format</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4" aria-live="assertive">{error}</p>}
          <div className="mb-4 text-right">
            <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot password?</Link>
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p>Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link></p>
        </div>
        <div className="mt-4 text-center">
          <p>Or login with:</p>
          <div id="googleSignInButton"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;