import React from 'react';
import MainBanner from '../../components/MainBanner';
import Features from '../../components/Features';
import { Link } from 'react-router-dom';

/**
 * Redesigned Home component with an updated layout and design.
 */
const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        {/* Main Banner */}
        <MainBanner />

        {/* Features Section */}
        <Features />

        {/* Dashboard Navigation Section */}
        <section className="py-20 bg-gradient-to-b from-blue-100 via-gray-100 to-blue-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-6">Dashboard Navigation</h2>
            <p className="text-lg text-gray-600 mb-12">
              Access your personalized dashboard to manage tasks, view resources, and stay on top of your progress.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DashboardLink
                to="/student-dashboard"
                title="Student Dashboard"
                description="Manage assignments, track attendance, and view grades."
                color="bg-blue-500"
              />
              <DashboardLink
                to="/teacher-dashboard"
                title="Teacher Dashboard"
                description="Submit grades, upload resources, and monitor attendance."
                color="bg-green-500"
              />
              <DashboardLink
                to="/admin-dashboard"
                title="Admin Dashboard"
                description="Oversee platform operations and manage users efficiently."
                color="bg-red-500"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

/**
 * Reusable DashboardLink component for individual dashboard navigation cards.
 */
const DashboardLink = ({ to, title, description, color }) => {
  return (
    <Link
      to={to}
      className={`block p-6 rounded-lg shadow-lg text-white ${color} hover:bg-opacity-90 transition duration-300`}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </Link>
  );
};

export default Home;
