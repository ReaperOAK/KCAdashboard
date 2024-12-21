import React from 'react';
import MainBanner from '../../components/MainBanner';
import Features from '../../components/Features';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <MainBanner />
        <Features />
        <section className="bg-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Dashboard Navigation</h2>
            <p className="mb-8">Use the links below to navigate to different sections of the dashboard.</p>
            <div className="space-y-4">
              <Link to="/student-dashboard" className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Student Dashboard
              </Link>
              <Link to="/teacher-dashboard" className="block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Teacher Dashboard
              </Link>
              <Link to="/admin-dashboard" className="block bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Admin Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;