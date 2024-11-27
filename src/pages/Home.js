import React from 'react';
import MainBanner from '../components/MainBanner';
import Features from '../components/Features';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <MainBanner />
        <Features />
      </main>
    </div>
  );
};

export default Home;