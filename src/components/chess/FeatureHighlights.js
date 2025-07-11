import React from 'react';

/**
 * FeatureHighlights - Highlights PGN features for the management page
 * Uses design tokens and is fully responsive.
 */
const FeatureHighlights = React.memo(() => (
  <section aria-label="Feature highlights" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-background-light dark:bg-background-dark border border-gray-light p-4 sm:p-6 rounded-lg transition-all duration-200">
      <h3 className="font-semibold text-primary mb-2 text-base sm:text-lg">Advanced PGN Support</h3>
      <p className="text-sm sm:text-base text-accent">Handle complex PGNs with multiple games, variations, comments, and NAGs</p>
    </div>
    <div className="bg-background-light dark:bg-background-dark border border-gray-light p-4 sm:p-6 rounded-lg transition-all duration-200">
      <h3 className="font-semibold text-primary mb-2 text-base sm:text-lg">Interactive Analysis</h3>
      <p className="text-sm sm:text-base text-highlight">Navigate through games with autoplay, annotations, and variation exploration</p>
    </div>
    <div className="bg-background-light dark:bg-background-dark border border-gray-light p-4 sm:p-6 rounded-lg transition-all duration-200">
      <h3 className="font-semibold text-primary mb-2 text-base sm:text-lg">Game Management</h3>
      <p className="text-sm sm:text-base text-secondary">Organize, search, and share your chess game collection</p>
    </div>
  </section>
));

export default FeatureHighlights;
