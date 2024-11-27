import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-4">
          <Link to="/privacy-policy" className="hover:underline mx-2">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:underline mx-2">Terms of Service</Link>
          <Link to="/contact" className="hover:underline mx-2">Contact Us</Link>
        </div>
        <div className="text-sm">&copy; 2023 EduPlatform. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;