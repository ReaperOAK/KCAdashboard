import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to validate the user's session token.
 *
 * @param {function} setRole - Function to set the user's role.
 */
const useTokenValidation = (setRole) => {
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch('/php/validate-session.php', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
          setRole(data.role);
        } else {
          navigate('/login'); // Redirect to login page if session is invalid
        }
      } catch (error) {
        console.error('Error validating session:', error);
        navigate('/login'); // Redirect to login page if an error occurs
      }
    };

    validateSession();
  }, [navigate, setRole]);
};

export default useTokenValidation;