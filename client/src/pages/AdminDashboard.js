import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Platform Analytics</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Active Users: 120</p>
            <p>Attendance Trends: 85% average attendance</p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Manage user roles, permissions, and batch assignments.</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Manage Users
            </button>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">System Configurations</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Manage tickets, FAQ automation, and system configurations.</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Manage System
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;