import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './getCookie';

const useTokenValidation = (setRole) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      try {
        const decodedPayload = JSON.parse(atob(token.split('.')[1])); // Parsing only payload part
        setRole(decodedPayload.role);
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/login'); // Redirect to login page if token is invalid
      }
    }
  }, [navigate, setRole]);
};

export default useTokenValidation;