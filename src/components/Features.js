import React from 'react';
import { FaChalkboardTeacher, FaClipboardList, FaGraduationCap, FaBook } from 'react-icons/fa';

/**
 * Features component that displays the main features of the platform.
 */
const Features = () => {
  return (
    <section className="py-16 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-8">Features</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FaChalkboardTeacher className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold mb-2">Live Classes</h3>
          <p>Join live classes with integrated Zoom/Google Meet links.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FaClipboardList className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2">Attendance</h3>
          <p>Track attendance with detailed summaries and notifications.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FaGraduationCap className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Grading</h3>
          <p>Submit grades and feedback for student assignments.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FaBook className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold mb-2">Resources</h3>
          <p>Access downloadable notes, videos, and multimedia materials.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;