
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

// Capitalize and format a breadcrumb segment
function formatBreadcrumb(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const BreadcrumbItem = React.memo(function BreadcrumbItem({ to, label, isLast }) {
  if (isLast) {
    return (
      <li className="flex items-center" aria-current="page">
        <ChevronRightIcon className="w-4 h-4 mx-1 text-gray-light" aria-hidden="true" />
        <span className="text-gray-dark font-semibold focus:outline-none text-base">{label}</span>
      </li>
    );
  }
  return (
    <li className="flex items-center">
      <ChevronRightIcon className="w-4 h-4 mx-1 text-gray-light" aria-hidden="true" />
      <Link
        to={to}
        className="text-secondary hover:text-accent focus:text-accent focus:outline-none transition-colors text-base font-medium"
        tabIndex={0}
      >
        {label}
      </Link>
    </li>
  );
});


function Breadcrumbs() {
  const location = useLocation();
  const pathnames = useMemo(
    () => location.pathname.split('/').filter(Boolean),
    [location.pathname]
  );

  // Accessibility: nav with aria-label, ol with role, Home always first
  return (
    <nav aria-label="Breadcrumb" className="sticky top-16 z-10 bg-white/80 backdrop-blur p-3 rounded-lg shadow mb-6 transition-all">
      <ol className="flex flex-wrap items-center text-base">
        <li>
          <Link
            to="/"
            className="flex items-center text-secondary hover:text-accent focus:text-accent font-medium focus:outline-none transition-colors"
            tabIndex={0}
          >
            <HomeIcon className="w-5 h-5 mr-1 text-accent" />
            Home
          </Link>
        </li>
        {pathnames.map((name, idx) => {
          const routeTo = `/${pathnames.slice(0, idx + 1).join('/')}`;
          return (
            <BreadcrumbItem
              key={routeTo}
              to={routeTo}
              label={formatBreadcrumb(name)}
              isLast={idx === pathnames.length - 1}
            />
          );
        })}
      </ol>
    </nav>
  );
}

export default React.memo(Breadcrumbs);
