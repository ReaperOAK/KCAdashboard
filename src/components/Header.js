import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import useTokenValidation from '../utils/useTokenValidation'; // Import the useTokenValidation hook

/**
 * Header component that displays the navigation bar and handles user login state.
 */
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const loading = useTokenValidation(setRole);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Clear the session on the server
    fetch('/php/logout.php', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setRole(null);
      navigate('/login');
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link to="/">Chess Codextform</Link>
      </div>
      <nav className="hidden md:flex space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/contact" className="hover:underline">Contact Us</Link>
        {role ? (
          <button onClick={handleLogout} className="hover:underline">Logout</button>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Sign-Up</Link>
          </>
        )}
      </nav>
      <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu}>
        {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>
      {isOpen && (
        <nav className="absolute top-16 left-0 w-full bg-blue-600 text-white flex flex-col items-center md:hidden">
          <Link to="/" className="p-4 hover:underline" onClick={toggleMenu}>Home</Link>
          <Link to="/contact" className="p-4 hover:underline" onClick={toggleMenu}>Contact Us</Link>
          {role ? (
            <button onClick={() => { handleLogout(); toggleMenu(); }} className="p-4 hover:underline">Logout</button>
          ) : (
            <>
              <Link to="/login" className="p-4 hover:underline" onClick={toggleMenu}>Login</Link>
              <Link to="/signup" className="p-4 hover:underline" onClick={toggleMenu}>Sign-Up</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;