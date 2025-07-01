import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
        <span className="mx-2 text-gray-dark" aria-hidden="true">/</span>
        <span className="text-gray-dark font-semibold focus:outline-none">
          {label}
        </span>
      </li>
    );
  }
  return (
    <li className="flex items-center">
      <span className="mx-2 text-gray-dark" aria-hidden="true">/</span>
      <Link
        to={to}
        className="text-secondary hover:text-accent focus:text-accent focus:outline-none transition-colors"
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
    <nav aria-label="Breadcrumb" className="bg-white dark:bg-background-dark p-4 rounded-lg shadow-sm mb-6">
      <ol className="flex flex-wrap items-center text-sm">
        <li>
          <Link
            to="/"
            className="text-secondary hover:text-accent focus:text-accent font-medium focus:outline-none transition-colors"
            tabIndex={0}
          >
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
