import React from 'react';

const TeacherDashboard = () => {
  return (
    <div className="min-h-screen flex">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Stats</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Upcoming Class: Math 101</p>
            <p>Time: 10:00 AM - 11:00 AM</p>
            <p>Pending Attendance: 5 students</p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Batch Schedule</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Batch: Math 101</p>
            <p>Time: 10:00 AM - 11:00 AM</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Mark Attendance
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4">
              Assign Grades
            </button>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Upload Materials</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Upload study materials, assignments, and feedback.</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Upload
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;