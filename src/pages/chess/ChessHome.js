import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChessHome.css';

const ChessHome = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the Player vs Player page
    navigate('/chess/play');
  }, [navigate]);
  
  // This is just a fallback in case the redirect doesn't happen immediately
  return (
    <div className="chess-home-redirect">
      <h1>Chess Dashboard</h1>
      <p>Redirecting to chess player interface...</p>
    </div>
  );
};

export default ChessHome;
