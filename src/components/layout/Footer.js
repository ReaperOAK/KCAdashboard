import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

/**
 * Footer component with a modern design featuring links to policies, social media, and quick navigation.
 */
const Footer = () => {
  return (
    <footer className="bg-[#200e4a] text-[#e3e1f7] py-8">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          {/* Navigation Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#7646eb] text-[#e3e1f7]">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:underline text-[#e3e1f7]">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline text-[#e3e1f7]">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:underline text-[#e3e1f7]">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:underline text-[#e3e1f7]">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="font-bold text-lg mb-4">About Chess Codex</h3>
            <p className="text-gray-300 text-sm leading-6">
              Chess Codex is your ultimate platform for mastering the game of chess. Join us to learn strategies, connect with like-minded enthusiasts, and improve your skills with expert resources.
            </p>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#e3e1f7]">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#e3e1f7]">
                <FaTwitter className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#e3e1f7]">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#e3e1f7]">
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Information</h3>
            <p className="text-gray-300 text-sm leading-6">
              Email: <a href="mailto:support@chesscodex.com" className="hover:underline text-[#e3e1f7]">support@chesscodex.com</a><br />
              Phone: +1 (123) 456-7890<br />
              Address: 123 Chess Codex Lane, Chess City, CC 12345
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <p className="mb-4 md:mb-0">&copy; 2023 Chess Codex. All rights reserved.</p>
          <p>
            Designed with <span className="text-highlight">♥</span> by <a href="/" className="hover:underline text-[#e3e1f7]">Owais Khan</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;