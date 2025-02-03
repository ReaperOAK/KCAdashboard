import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    profile_picture: null,
    missed_class_notifications: true,
    assignment_due_notifications: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await fetch('/php/register.php', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#200e4a]">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">Name</label>
            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">Email</label>
            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">Password</label>
            <div className="relative">
              <input
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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
          </div>

          <div>
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({...formData, profile_picture: e.target.files[0]})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
            />
          </div>

          <div>
            <label className="block text-[#3b3a52] text-sm font-bold mb-2">Role</label>
            <select
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.missed_class_notifications}
                onChange={(e) => setFormData({...formData, missed_class_notifications: e.target.checked})}
                className="mr-2"
              />
              <span className="text-[#3b3a52] text-sm">Receive missed class notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.assignment_due_notifications}
                onChange={(e) => setFormData({...formData, assignment_due_notifications: e.target.checked})}
                className="mr-2"
              />
              <span className="text-[#3b3a52] text-sm">Receive assignment due notifications</span>
            </label>
          </div>

          {error && <p className="text-[#af0505] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#200e4a] hover:bg-[#461fa3] text-white py-3 rounded-lg transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" /> Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>

          <p className="text-center text-[#3b3a52] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#461fa3] hover:text-[#7646eb]">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;