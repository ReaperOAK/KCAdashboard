import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

/**
 * Footer component that displays links to privacy policy, terms of service, and social media.
 */
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-4">
          <Link to="/privacy-policy" className="hover:underline mx-2">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:underline mx-2">Terms of Service</Link>
          <Link to="/contact" className="hover:underline mx-2">Contact Us</Link>
        </div>
        <div className="mb-4">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="mx-2">
            <FaFacebook className="w-6 h-6 inline-block" />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="mx-2">
            <FaTwitter className="w-6 h-6 inline-block" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="mx-2">
            <FaInstagram className="w-6 h-6 inline-block" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="mx-2">
            <FaLinkedin className="w-6 h-6 inline-block" />
          </a>
        </div>
        <div className="text-sm">&copy; 2023 EduPlatform. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;