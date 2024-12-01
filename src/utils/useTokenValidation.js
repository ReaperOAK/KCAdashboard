import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to validate the user's session token.
 *
 * @param {function} setRole - Function to set the user's role.
 * @param {string} redirectPath - Path to redirect if session is invalid (default: '/login').
 * @returns {boolean} - Loading state indicating whether validation is ongoing.
 */
const useTokenValidation = (setRole, redirectPath = '/login') => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch('/php/validate-session.php', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401 || !response.ok) {
          navigate(redirectPath);
          return;
        }

        const data = await response.json();
        if (data.success) {
          setRole(data.role);
        } else {
          navigate(redirectPath);
        }
      } catch (error) {
        console.error('Error validating session:', error);
        navigate(redirectPath);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [navigate, redirectPath, setRole]);

  return loading;
};

export default useTokenValidation;
