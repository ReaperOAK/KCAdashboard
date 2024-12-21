import React from 'react';
import { Link } from 'react-router-dom';

/**
 * MainBanner component redesigned with a sleek, dynamic layout and improved styling.
 */
const MainBanner = () => {
  return (
    <section
      className="relative bg-cover bg-center text-white py-24 z-10"
      style={{
        backgroundImage: 'url(/path/to/your/background-image.jpg)',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 opacity-75"></div>

      <div className="relative z-20 max-w-4xl mx-auto text-center px-6">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          Elevate Your Learning with Chess Codex
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl font-light mb-8">
          Simplify class management, track attendance, and boost productivity with our all-in-one platform.
        </p>

        {/* Call-to-action button */}
        <Link to="/signup">
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold text-lg rounded-full shadow-lg hover:bg-gray-100 transition duration-300">
            Get Started
          </button>
        </Link>
      </div>
    </section>
  );
};

export default MainBanner;