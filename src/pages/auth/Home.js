import React from 'react';
import MainBanner from '../../components/MainBanner';
import Features from '../../components/Features';
import { Link } from 'react-router-dom';
import { FaChess, FaChalkboardTeacher, FaChartLine, FaUserGraduate } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1f9]">
      <main className="flex-grow">
        <MainBanner />
        <Features />

        {/* Dashboard Navigation Section */}
        <section className="py-20 bg-gradient-to-b from-[#200e4a] to-[#461fa3]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold text-[#e3e1f7] mb-6">Access Your Dashboard</h2>
            <p className="text-lg text-[#c2c1d3] mb-12">
              Personalized learning experience tailored to your role
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DashboardLink
                to="/student-dashboard"
                title="Student Dashboard"
                description="Access interactive lessons, simul games, and track your progress"
                icon={<FaUserGraduate className="w-8 h-8 mb-4" />}
                color="bg-[#7646eb]"
              />
              <DashboardLink
                to="/teacher-dashboard"
                title="Teacher Dashboard"
                description="Manage classes, monitor student progress, and create content"
                icon={<FaChalkboardTeacher className="w-8 h-8 mb-4" />}
                color="bg-[#461fa3]"
              />
              <DashboardLink
                to="/admin-dashboard"
                title="Admin Dashboard"
                description="Platform management and analytics"
                icon={<FaChartLine className="w-8 h-8 mb-4" />}
                color="bg-[#200e4a]"
              />
            </div>
          </div>
        </section>

        {/* Chess Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-[#200e4a] mb-12">
              Advanced Chess Learning Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FaChess className="w-12 h-12" />}
                title="Interactive Board"
                description="Practice with our integrated Lichess.org board"
              />
              {/* Add more feature cards */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const DashboardLink = ({ to, title, description, icon, color }) => {
  return (
    <Link
      to={to}
      className={`block p-6 rounded-lg shadow-lg text-white ${color} hover:opacity-90 transition duration-300`}
    >
      <div className="flex flex-col items-center">
        {icon}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </Link>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col items-center text-[#200e4a]">
        {icon}
        <h3 className="text-xl font-bold mt-4 mb-2">{title}</h3>
        <p className="text-[#3b3a52] text-center">{description}</p>
      </div>
    </div>
  );
};

export default Home;