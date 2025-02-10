import React, { useState, useEffect } from 'react';
import { FaChessBoard, FaVideo, FaChartLine } from 'react-icons/fa';

const iconMap = {
  'FaChessBoard': FaChessBoard,
  'FaVideo': FaVideo,
  'FaChartLine': FaChartLine
};

const Features = () => {
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/php/get_features.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setFeatures(data.data);
        } else {
          setError(data.message);
        }
      })
      .catch(err => {
        setError('Failed to load features');
        console.error('Error:', err);
      });
  }, []);

  if (error) {
    return <div className="text-[#af0505] text-center p-4">{error}</div>;
  }

  return (
    <section className="py-16 bg-[#f3f1f9]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#200e4a] text-center mb-12">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard 
              key={feature.id}
              icon={iconMap[feature.icon]} 
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: IconComponent, title, description }) => {
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gray-100 p-4 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="text-[#200e4a] w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold text-[#200e4a] mb-2 text-center">{title}</h3>
      <p className="text-[#3b3a52] text-sm text-center">{description}</p>
    </div>
  );
};

export default Features;