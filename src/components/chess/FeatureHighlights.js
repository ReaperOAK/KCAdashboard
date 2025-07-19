import React from 'react';

// Optional: pass icons as props for each feature
const features = [
  {
    title: 'Advanced PGN Support',
    description: 'Handle complex PGNs with multiple games, variations, comments, and NAGs',
    color: 'text-accent',
    icon: <span aria-hidden="true" className="inline-block text-accent text-2xl">♟️</span>,
  },
  {
    title: 'Interactive Analysis',
    description: 'Navigate through games with autoplay, annotations, and variation exploration',
    color: 'text-highlight',
    icon: <span aria-hidden="true" className="inline-block text-highlight text-2xl">🔍</span>,
  },
  {
    title: 'Game Management',
    description: 'Organize, search, and share your chess game collection',
    color: 'text-secondary',
    icon: <span aria-hidden="true" className="inline-block text-secondary text-2xl">📚</span>,
  },
];

const FeatureHighlights = React.memo(() => (
  <section
    aria-label="Feature highlights"
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 px-2"
  >
    {features.map((feature, idx) => (
      <div
        key={feature.title}
        className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-5 sm:p-7 flex flex-col items-center justify-center text-center transition-all duration-200 h-full"
        tabIndex={0}
        aria-label={feature.title}
      >
        <div className="mb-3">{feature.icon}</div>
        <h3 className="font-semibold text-primary mb-2 text-lg sm:text-xl leading-tight">{feature.title}</h3>
        <p className={`text-sm sm:text-base font-medium ${feature.color}`}>{feature.description}</p>
      </div>
    ))}
  </section>
));

export default FeatureHighlights;
