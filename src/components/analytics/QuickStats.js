import React from 'react';
import ChartCard from './ChartCard';
import { Users, CalendarCheck2, BarChart2, Percent } from 'lucide-react';

// Enhanced QuickStats: beautiful, responsive, accessible, and focused
const statsConfig = [
  {
    label: 'Average Attendance',
    valueKey: 'avgAttendance',
    icon: <Percent className="w-5 h-5 text-accent" aria-hidden="true" />,
    suffix: '%',
    bg: 'bg-accent/10',
    border: 'border-accent',
  },
  {
    label: 'Active Students',
    valueKey: 'activeStudents',
    icon: <Users className="w-5 h-5 text-secondary" aria-hidden="true" />,
    bg: 'bg-secondary/10',
    border: 'border-secondary',
  },
  {
    label: 'Avg Quiz Score',
    valueKey: 'avgQuizScore',
    icon: <BarChart2 className="w-5 h-5 text-highlight" aria-hidden="true" />,
    suffix: '%',
    bg: 'bg-highlight/10',
    border: 'border-highlight',
  },
  {
    label: 'Classes This Month',
    valueKey: 'classesThisMonth',
    icon: <CalendarCheck2 className="w-5 h-5 text-primary" aria-hidden="true" />,
    bg: 'bg-primary/10',
    border: 'border-primary',
  },
];

const QuickStats = React.memo(function QuickStats({ summaryStats }) {
  return (
    <ChartCard title="Quick Stats">
      <section
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        aria-label="Quick Stats"
      >
        {statsConfig.map((stat, idx) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-xl border ${stat.bg} ${stat.border} shadow-sm transition-all duration-200`}
            tabIndex={0}
            aria-label={stat.label}
          >
            <span className="mb-1 flex items-center justify-center">{stat.icon}</span>
            <p className="text-xs sm:text-sm text-gray-dark dark:text-text-light mb-1">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-primary dark:text-text-light">
              {summaryStats?.[stat.valueKey] ?? 0}
              {stat.suffix || ''}
            </p>
          </div>
        ))}
      </section>
    </ChartCard>
  );
});

export default QuickStats;
