import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  const token = new URLSearchParams(window.location.search).get('token');
  const navigate = useNavigate();

  const validateToken = useCallback(async () => {
    try {
      const response = await fetch('/php/validate-reset-token.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (!data.valid) {
        setIsTokenValid(false);
        setError('Invalid or expired reset token');
      }
    } catch (err) {
      setIsTokenValid(false);
      setError('Error validating reset token');
    }
  }, [token]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    });
  };
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
    
    // Update password strength state
    setPasswordStrength(requirements);
    
    // Return true only if all requirements are met
    return Object.values(requirements).every(requirement => requirement === true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/php/reset-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: formData.password,
          token 
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        navigate('/login', { 
          state: { message: 'Password reset successful. Please login with your new password.' }
        });
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#200e4a] mb-4">Invalid Reset Link</h1>
          <p className="text-[#3b3a52] mb-4">{error}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-[#461fa3] hover:text-[#7646eb]"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#200e4a]">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  checkPasswordStrength(e.target.value);
                }}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <div className="mt-3 space-y-2">
              {Object.entries(passwordStrength).map(([key, valid]) => (
                <div key={key} className={`flex items-center text-sm ${valid ? 'text-green-500' : 'text-red-500'}`}>
                  {valid ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                  {key === 'length' ? 'At least 8 characters' :
                   key === 'uppercase' ? 'One uppercase letter' :
                   key === 'lowercase' ? 'One lowercase letter' :
                   'One number'}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[#3b3a52] text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>
          {error && <p className="text-[#af0505] text-sm mb-4">{error}</p>}
          <button
            className={`w-full bg-[#200e4a] hover:bg-[#461fa3] text-white font-bold py-3 rounded-lg transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;