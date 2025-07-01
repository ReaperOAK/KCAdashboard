
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function LoginForm({ onSubmit, onChange, values, error }) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit} aria-label="Login form">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={values.email}
            onChange={onChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent"
            aria-required="true"
            aria-label="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={onChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent"
            aria-required="true"
            aria-label="Password"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          aria-label="Sign in"
        >
          Sign in
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}

function LoginLinks() {
  return (
    <div className="text-center space-y-2 mt-4">
      <Link to="/register" className="text-secondary hover:text-accent block focus:underline" tabIndex={0}>
        Don't have an account? Sign up
      </Link>
      <Link to="/reset-password" className="text-secondary hover:text-accent block focus:underline" tabIndex={0}>
        Forgot your password?
      </Link>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }, [formData, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg" role="main" aria-label="Login panel">
        <h2 className="text-3xl font-extrabold text-primary mt-2 mb-4">Sign in to your account</h2>
        <LoginForm onSubmit={handleSubmit} onChange={handleChange} values={formData} error={error} />
        <LoginLinks />
      </div>
    </div>
  );
}

export default React.memo(Login);
