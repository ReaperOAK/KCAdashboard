import React from 'react';
import { Link } from 'react-router-dom';

const MainBanner = () => {
  return (
    <section
      className="relative bg-cover bg-center text-white py-24 z-10"
      style={{
        backgroundImage: 'linear-gradient(rgba(32, 14, 74, 0.9), rgba(70, 31, 163, 0.9)), url("/images/chess-bg.jpg")'
      }}
    >
      <div className="relative z-20 max-w-4xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-[#e3e1f7]">
          Welcome to Chess Academy Dashboard
        </h1>
        <p className="text-lg md:text-xl font-light mb-8 text-[#c2c1d3]">
          Master Chess with interactive lessons, live simul games, and professional guidance
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login">
            <button className="px-8 py-3 bg-[#7646eb] text-[#e3e1f7] font-semibold text-lg rounded-lg hover:bg-[#461fa3] transition-all">
              Student Login
            </button>
          </Link>
          <Link to="/teacher-login">
            <button className="px-8 py-3 border-2 border-[#e3e1f7] text-[#e3e1f7] font-semibold text-lg rounded-lg hover:bg-[#461fa3] transition-all">
              Teacher Login
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MainBanner;