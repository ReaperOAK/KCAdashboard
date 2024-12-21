import React from 'react';
import { FaChalkboardTeacher, FaClipboardList, FaGraduationCap, FaBook } from 'react-icons/fa';

/**
 * Features component redesigned with a sleek, modern card design and improved usability.
 */
const Features = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-12">
          Explore Our Features
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<FaChalkboardTeacher className="text-blue-600 w-10 h-10" />}
            title="Live Classes"
            description="Participate in real-time classes with seamless integrations to Zoom and Google Meet."
          />
          <FeatureCard
            icon={<FaClipboardList className="text-green-600 w-10 h-10" />}
            title="Attendance"
            description="Keep track of attendance with detailed reports and automated notifications."
          />
          <FeatureCard
            icon={<FaGraduationCap className="text-red-600 w-10 h-10" />}
            title="Grading"
            description="Efficiently evaluate and provide feedback for assignments and exams."
          />
          <FeatureCard
            icon={<FaBook className="text-yellow-600 w-10 h-10" />}
            title="Resources"
            description="Access a vast library of downloadable notes, videos, and interactive materials."
          />
        </div>
      </div>
    </section>
  );
};

/**
 * Reusable FeatureCard component with a modern, interactive design.
 */
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      {/* Icon */}
      <div className="bg-gray-100 p-4 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">{title}</h3>
      {/* Description */}
      <p className="text-gray-600 text-sm text-center">{description}</p>
    </div>
  );
};

export default Features;
