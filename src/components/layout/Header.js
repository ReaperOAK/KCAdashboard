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
    return <div className="flex justify-center items-center h-16 bg-primary text-white">Loading...</div>;
  }

  return (
    <header className="bg-[#200e4a] text-[#e3e1f7] fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto p-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/" className="text-[#e3e1f7]">Chess Codex</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-[#7646eb] text-[#e3e1f7]">Home</Link>
          <Link to="/about" className="hover:text-[#7646eb] text-[#e3e1f7]">About Us</Link>
          <Link to="/contact" className="hover:text-[#7646eb] text-[#e3e1f7]">Contact Us</Link>
          {role ? (
            <button
              onClick={handleLogout}
              className="hover:underline focus:outline-none text-[#e3e1f7]"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:underline text-[#e3e1f7]">Login</Link>
              <Link to="/signup" className="hover:underline text-[#e3e1f7]">Sign-Up</Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            className="focus:outline-none mr-4"
            onClick={toggleSidebar}
          >
            <FaBars className="w-6 h-6" />
          </button>
          <button
            className="focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="bg-primary md:hidden">
          <ul className="flex flex-col items-center">
            <li className="p-4 w-full text-center hover:bg-gray-700">
              <Link to="/" onClick={toggleMenu} className="text-white">Home</Link>
            </li>
            <li className="p-4 w-full text-center hover:bg-gray-700">
              <Link to="/about" onClick={toggleMenu} className="text-white">About Us</Link>
            </li>
            <li className="p-4 w-full text-center hover:bg-gray-700">
              <Link to="/contact" onClick={toggleMenu} className="text-white">Contact Us</Link>
            </li>
            {role ? (
              <li className="p-4 w-full text-center hover:bg-gray-700">
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="focus:outline-none text-white"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li className="p-4 w-full text-center hover:bg-gray-700">
                  <Link to="/login" onClick={toggleMenu} className="text-white">Login</Link>
                </li>
                <li className="p-4 w-full text-center hover:bg-gray-700">
                  <Link to="/signup" onClick={toggleMenu} className="text-white">Sign-Up</Link>
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