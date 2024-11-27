import React from 'react';

const StudentDashboard = () => {
  return (
    <div className="min-h-screen flex">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Current Class Schedule</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Next Class: Math 101</p>
            <p>Time: 10:00 AM - 11:00 AM</p>
            <p>Link: <a href="https://zoom.us" className="text-blue-500 hover:underline">Join via Zoom</a></p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Summary</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Attendance Percentage: 85%</p>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {/* Example of color-coded calendar */}
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              {/* Add more days as needed */}
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Homework</h3>
              <p>Access your homework assignments.</p>
              <a href="/homework" className="text-blue-500 hover:underline">Go to Homework</a>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Study Materials</h3>
              <p>Download notes and study materials.</p>
              <a href="/study-materials" className="text-blue-500 hover:underline">Go to Study Materials</a>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Resources</h3>
              <p>Access additional resources and links.</p>
              <a href="/resources" className="text-blue-500 hover:underline">Go to Resources</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;