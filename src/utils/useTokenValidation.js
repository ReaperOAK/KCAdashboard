import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to validate the user's session token.
 *
 * @param {function} setRole - Function to set the user's role.
 * @param {string} redirectPath - Path to redirect if session is invalid (default: '/login').
 * @returns {boolean} - Loading state indicating whether validation is ongoing.
 */
const useTokenValidation = (setRole, redirectPath = '/login') => {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch('/php/validate-token.php', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setRole(data.role);
          setPermissions({
            canAccessSimul: data.role === 'student' || data.role === 'teacher',
            canManageBatches: data.role === 'teacher' || data.role === 'admin',
            canViewAnalytics: data.role === 'teacher' || data.role === 'admin',
            canMarkAttendance: data.role === 'teacher' || data.role === 'admin',
            notificationPreferences: {
              missedClass: data.missed_class_notifications,
              assignmentDue: data.assignment_due_notifications
            }
          });

          // Redirect based on role if on generic pages
          if (location.pathname === '/dashboard') {
            navigate(`/${data.role}-dashboard`);
          }
        } else {
          setRole(null);
          if (!['/', '/signup', '/login'].includes(location.pathname)) {
            navigate(redirectPath);
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setRole(null);
        if (!['/', '/signup', '/login'].includes(location.pathname)) {
          navigate(redirectPath);
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [navigate, redirectPath, setRole, location.pathname]);

  return { loading, permissions };
};

export default useTokenValidation;