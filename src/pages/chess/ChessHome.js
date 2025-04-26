import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChessHome = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the Player vs Player page
    navigate('/chess/play');
  }, [navigate]);
  
  // This is just a fallback in case the redirect doesn't happen immediately
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-2xl font-bold text-indigo-900 mb-4">Chess Dashboard</h1>
      <p className="text-lg text-gray-600">Redirecting to chess player interface...</p>
    </div>
  );
};

export default ChessHome;
