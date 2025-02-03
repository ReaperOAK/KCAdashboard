import React from 'react';
import { FaChessBoard, FaVideo, FaChartLine } from 'react-icons/fa';

/**
 * Features component redesigned with a sleek, modern card design and improved usability.
 */
const Features = () => {
  const features = [
    {
      icon: <FaChessBoard className="text-[#200e4a] w-10 h-10" />,
      title: "Interactive Learning",
      description: "Practice with our integrated Lichess.org board"
    },
    {
      icon: <FaVideo className="text-[#461fa3] w-10 h-10" />,
      title: "Live Classes",
      description: "Join real-time sessions with chess masters"
    },
    {
      icon: <FaChartLine className="text-[#7646eb] w-10 h-10" />,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics"
    },
    // ...more features based on todo list
  ];

  return (
    <section className="py-16 bg-[#f3f1f9]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#200e4a] text-center mb-12">
          Features
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
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
      <h3 className="text-lg font-bold text-[#200e4a] mb-2 text-center">{title}</h3>
      {/* Description */}
      <p className="text-[#3b3a52] text-sm text-center">{description}</p>
    </div>
  );
};

export default Features;