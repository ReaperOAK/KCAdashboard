import React from 'react';

/**
 * ReportCardTable: Pure, focused report card table component.
 * - Beautiful, accessible, responsive UI
 * - Uses Tailwind color tokens, visual hierarchy, and animation
 * - Handles only report card table display (single responsibility)
 */
const ReportCardTable = React.memo(function ReportCardTable({ reportCards, className = '' }) {
  return (
    <section
      className={`bg-background-light dark:bg-background-dark rounded-2xl shadow-lg p-4 sm:p-6 overflow-x-auto transition-all duration-200  ${className}`}
      aria-label="Report Cards"
    >
      {/* Desktop/tablet table */}
      <table className="hidden md:table min-w-full divide-y divide-gray-light text-sm" aria-label="Report Cards Table">
        <thead className="bg-primary">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider rounded-tl-2xl">Uploaded At</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">Description</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider rounded-tr-2xl">File</th>
          </tr>
        </thead>
        <tbody className="bg-background-light dark:bg-background-dark divide-y divide-gray-light">
          {reportCards.map(card => (
            <tr key={card.id} className="hover:bg-gray-light dark:hover:bg-gray-dark transition-colors group">
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark dark:text-text-light group-hover:text-accent transition-colors">{new Date(card.uploaded_at).toLocaleString()}</td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark dark:text-text-light group-hover:text-accent transition-colors">{card.description || '-'}</td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:text-secondary focus:outline-none focus:ring-2 focus:ring-accent font-semibold transition-all duration-200"
                  aria-label={`View or download report card: ${card.description || 'file'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  View / Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile stacked cards */}
      <div className="block md:hidden mt-4 space-y-4">
        {reportCards.map(card => (
          <div key={card.id} className="bg-white dark:bg-background-dark rounded-xl shadow border border-gray-light flex flex-col gap-2 p-4 ">
            <div className="flex items-center gap-2 text-xs text-gray-dark">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {new Date(card.uploaded_at).toLocaleString()}
            </div>
            <div className="text-base font-semibold text-primary dark:text-text-light">{card.description || '-'}</div>
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:text-secondary focus:outline-none focus:ring-2 focus:ring-accent font-semibold w-fit transition-all duration-200"
              aria-label={`View or download report card: ${card.description || 'file'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              View / Download
            </a>
          </div>
        ))}
      </div>
    </section>
  );
});

export default ReportCardTable;
