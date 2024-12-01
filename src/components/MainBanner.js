import React from 'react';
import { Link } from 'react-router-dom';

/**
 * MainBanner component that displays a welcome message and a call-to-action button.
 */
const MainBanner = () => {
  return (
    <section className="bg-blue-500 text-white text-center py-20" style={{ backgroundImage: 'url(/path/to/your/background-image.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-blue-500 bg-opacity-75 py-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to EduPlatform</h1>
        <p className="mb-8">A comprehensive solution for managing classes, assignments, and attendance.</p>
        <Link to="/signup">
          <button className="bg-white text-blue-500 px-6 py-2 rounded-full font-semibold hover:bg-gray-200">Get Started</button>
        </Link>
      </div>
    </section>
  );
};

export default MainBanner;