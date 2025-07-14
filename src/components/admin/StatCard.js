import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

// Color map for border and icon color tokens
const colorMap = {
  primary: 'border-primary text-primary dark:text-accent',
  secondary: 'border-secondary text-secondary dark:text-accent',
  accent: 'border-accent text-accent',
  highlight: 'border-highlight text-highlight',
};

// Beautiful, animated, accessible stat card for dashboards
const StatCard = React.memo(function StatCard({ title, value, Icon, color = 'primary', className = '' }) {
  const borderClass = colorMap[color] || colorMap.primary;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className={`relative bg-white dark:bg-background-dark p-6 sm:p-7 rounded-2xl shadow-lg border-l-4 ${borderClass} flex flex-col gap-2 min-h-[120px] focus-within:ring-2 focus-within:ring-accent transition-all duration-200 group ${className}`}
      role="region"
      aria-label={title}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-secondary dark:text-text-light group-hover:text-accent transition-colors duration-200">{title}</h2>
        {Icon && <Icon className="h-7 w-7 text-primary dark:text-accent group-hover:text-accent transition-colors duration-200" aria-hidden="true" />}
      </div>
      <p className="text-3xl font-bold text-primary dark:text-accent group-hover:text-accent transition-colors duration-200">{value}</p>
    </motion.section>
  );
});

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  Icon: PropTypes.elementType,
  color: PropTypes.oneOf(['primary', 'secondary', 'accent', 'highlight']),
  className: PropTypes.string,
};

export default StatCard;
