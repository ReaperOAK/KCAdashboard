import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import useTokenValidation from '../../utils/useTokenValidation'; // Import the useTokenValidation hook

/**
 * Header component that displays the navigation bar and handles user login state.
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const loading = useTokenValidation(setRole);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await fetch('/php/logout.php', {
      method: 'POST',
      credentials: 'include',
    });
    setRole(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-16 bg-blue-600 text-white">Loading...</div>;
  }

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto p-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/">Chess Codex</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/contact" className="hover:underline">Contact Us</Link>
          {role ? (
            <button
              onClick={handleLogout}
              className="hover:underline focus:outline-none"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/signup" className="hover:underline">Sign-Up</Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="bg-blue-700 md:hidden">
          <ul className="flex flex-col items-center">
            <li className="p-4 w-full text-center hover:bg-blue-600">
              <Link to="/" onClick={toggleMenu}>Home</Link>
            </li>
            <li className="p-4 w-full text-center hover:bg-blue-600">
              <Link to="/contact" onClick={toggleMenu}>Contact Us</Link>
            </li>
            {role ? (
              <li className="p-4 w-full text-center hover:bg-blue-600">
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="focus:outline-none"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li className="p-4 w-full text-center hover:bg-blue-600">
                  <Link to="/login" onClick={toggleMenu}>Login</Link>
                </li>
                <li className="p-4 w-full text-center hover:bg-blue-600">
                  <Link to="/signup" onClick={toggleMenu}>Sign-Up</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
