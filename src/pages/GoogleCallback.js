import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleResponse = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (code && state) {
        try {
          const res = await fetch('/php/google-login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state }),
          });

          if (!res.ok) throw new Error('Network response was not ok');

          const data = await res.json();
          if (data.success) {
            sessionStorage.setItem('role', data.role); // Use sessionStorage
            navigate('/');
            window.location.reload();
          } else {
            console.error('Error:', data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    handleGoogleResponse();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default GoogleCallback;