import React from 'react';

const MainBanner = () => {
  return (
    <section className="bg-blue-500 text-white text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to EduPlatform</h1>
      <p className="mb-8">A comprehensive solution for managing classes, assignments, and attendance.</p>
      <button className="bg-white text-blue-500 px-6 py-2 rounded-full font-semibold">Get Started</button>
    </section>
  );
};

export default MainBanner;