import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import useTokenValidation from '../../utils/useTokenValidation'; // Import the useTokenValidation hook

/**
 * Header component that displays the navigation bar and handles user login state.
 */
const Header = ({ toggleSidebar }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  useTokenValidation(setRole); // Just use the hook without loading state

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await fetch('/php/logout.php', {
      method: 'POST',
      credentials: 'include',
    });
    setRole(null);
    navigate('/login');
  };

  return (
    <header className="bg-[#200e4a] shadow-lg fixed top-0 left-0 right-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex justify-between items-center h-16">
          {/* Logo - adjusted spacing */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#e3e1f7] hover:text-[#7646eb] transition-colors duration-200">
                Chess Codex
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - adjusted spacing and alignment */}
          <nav className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="text-[#e3e1f7] hover:text-[#7646eb] transition-colors duration-200 px-3 py-2">
              Home
            </Link>
            <Link to="/about" className="text-[#e3e1f7] hover:text-[#7646eb] transition-colors duration-200 px-3 py-2">
              About Us
            </Link>
            <Link to="/contact" className="text-[#e3e1f7] hover:text-[#7646eb] transition-colors duration-200 px-3 py-2">
              Contact Us
            </Link>
            {role ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 rounded-md bg-[#7646eb] text-white hover:bg-[#461fa3] transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-[#e3e1f7] hover:text-[#7646eb] transition-colors duration-200">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-md bg-[#7646eb] text-white hover:bg-[#461fa3] transition-colors duration-200">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button - adjusted positioning */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-[#e3e1f7] hover:bg-[#461fa3] transition-colors duration-200"
            >
              <FaBars className="w-6 h-6" />
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-[#e3e1f7] hover:bg-[#461fa3] transition-colors duration-200"
            >
              {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - simplified */}
        {isMenuOpen && (
          <nav className="md:hidden py-2 border-t border-[#461fa3]">
            <div className="flex flex-col space-y-1">
              <Link 
                to="/" 
                onClick={toggleMenu}
                className="px-4 py-2 text-[#e3e1f7] hover:bg-[#461fa3] rounded-md transition-colors duration-200"
              >
                Home
              </Link>
              <Link 
                to="/about" 
                onClick={toggleMenu}
                className="px-4 py-2 text-[#e3e1f7] hover:bg-[#461fa3] rounded-md transition-colors duration-200"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                onClick={toggleMenu}
                className="px-4 py-2 text-[#e3e1f7] hover:bg-[#461fa3] rounded-md transition-colors duration-200"
              >
                Contact Us
              </Link>
              {role ? (
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="px-4 py-2 text-left text-[#e3e1f7] hover:bg-[#461fa3] rounded-md transition-colors duration-200"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={toggleMenu}
                    className="px-4 py-2 text-[#e3e1f7] hover:bg-[#461fa3] rounded-md transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={toggleMenu}
                    className="px-4 py-2 text-[#e3e1f7] hover:bg-[#461fa3] rounded-md transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;