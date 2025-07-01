
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function RegisterForm({ onSubmit, onChange, values, error }) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit} aria-label="Register form">
      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={values.full_name}
            onChange={onChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent"
            aria-required="true"
            aria-label="Full Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
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
            required
            value={values.password}
            onChange={onChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent"
            aria-required="true"
            aria-label="Password"
          />
        </div>
        <div>
          <label htmlFor="role" className="text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            value={values.role}
            onChange={onChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent"
            aria-required="true"
            aria-label="Role"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          aria-label="Sign up"
        >
          Sign up
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

function RegisterLinks() {
  return (
    <div className="text-center mt-4">
      <Link to="/login" className="text-secondary hover:text-accent focus:underline" tabIndex={0}>
        Already have an account? Sign in
      </Link>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
  });
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  }, [formData, register, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg" role="main" aria-label="Register panel">
        <h2 className="text-3xl font-extrabold text-primary mt-2 mb-4">Create your account</h2>
        <RegisterForm onSubmit={handleSubmit} onChange={handleChange} values={formData} error={error} />
        <RegisterLinks />
      </div>
    </div>
  );
}

export default React.memo(Register);
