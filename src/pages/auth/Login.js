import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { FaGoogle, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/php/firebase-login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('role', data.role);
        handleRoleBasedRedirect(data.role);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleBasedRedirect = (role) => {
    switch (role) {
      case 'student': navigate('/student-dashboard'); break;
      case 'teacher': navigate('/teacher-dashboard'); break;
      case 'admin': navigate('/admin-dashboard'); break;
      default: navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('role', data.role);
        handleRoleBasedRedirect(data.role);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#200e4a]">Welcome Back</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">
              Email
            </label>
            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">
              Password
            </label>
            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {error && (
            <div className="text-[#af0505] text-sm">{error}</div>
          )}

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[#461fa3] hover:text-[#7646eb] text-sm">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#200e4a] hover:bg-[#461fa3] text-white py-3 rounded-lg transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" /> Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#c2c1d3]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#3b3a52]">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-[#c2c1d3] p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaGoogle className="text-[#461fa3]" />
            <span className="text-[#3b3a52]">Google</span>
          </button>
        </div>

        <p className="mt-6 text-center text-[#3b3a52]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#461fa3] hover:text-[#7646eb]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;