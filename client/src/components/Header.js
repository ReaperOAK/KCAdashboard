import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">EduPlatform</div>
      <nav className="hidden md:flex space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/contact" className="hover:underline">Contact Us</Link>
        <Link to="/login" className="hover:underline">Login/Sign-Up</Link>
      </nav>
      <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>
      {isOpen && (
        <nav className="absolute top-16 left-0 w-full bg-blue-600 text-white flex flex-col items-center md:hidden">
          <Link to="/" className="p-4 hover:underline" onClick={toggleMenu}>Home</Link>
          <Link to="/contact" className="p-4 hover:underline" onClick={toggleMenu}>Contact Us</Link>
          <Link to="/login" className="p-4 hover:underline" onClick={toggleMenu}>Login/Sign-Up</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;