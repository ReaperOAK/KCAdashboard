
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function RegisterForm({ onSubmit, onChange, values, error }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <motion.form
      className="mt-8 space-y-6"
      onSubmit={onSubmit}
      aria-label="Register form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <UserIcon className="w-4 h-4 text-accent" /> Full Name
          </label>
          <div className="relative">
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              value={values.full_name}
              onChange={onChange}
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent pr-10"
              aria-required="true"
              aria-label="Full Name"
            />
            <UserIcon className="w-5 h-5 text-gray-300 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <EnvelopeIcon className="w-4 h-4 text-accent" /> Email address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={values.email}
              onChange={onChange}
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent pr-10"
              aria-required="true"
              aria-label="Email address"
            />
            <EnvelopeIcon className="w-5 h-5 text-gray-300 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <LockClosedIcon className="w-4 h-4 text-accent" /> Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={values.password}
              onChange={onChange}
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent pr-20"
              aria-required="true"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
            <LockClosedIcon className="w-5 h-5 text-gray-300 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>
        {/* Role is automatically set to student - no selection needed */}
        <div className="hidden">
          <input
            id="role"
            name="role"
            type="hidden"
            value={values.role}
            readOnly
          />
        </div>
        
        {/* Info message about account type */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-blue-500" />
            <span>All new accounts are created as <strong>Student</strong> accounts. Contact your administrator if you need teacher access.</span>
          </div>
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
          aria-label="Sign up"
        >
          Sign up
        </button>
      </div>
      {error && (
        <motion.div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2"
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}
    </motion.form>
  );
}

function RegisterLinks() {
  return (
    <div className="text-center mt-4">
      <Link to="/login" className="text-secondary hover:text-accent focus:underline transition-colors" tabIndex={0}>
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
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg" role="main" aria-label="Register panel">
        <h2 className="text-3xl font-extrabold text-primary mt-2 mb-4">Create your account</h2>
        <RegisterForm onSubmit={handleSubmit} onChange={handleChange} values={formData} error={error} />
        <RegisterLinks />
      </div>
    </motion.div>
  );
}

export default React.memo(Register);
