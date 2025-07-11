import React from 'react';

const ReportCardTable = React.memo(({ reportCards }) => (
  <div className="bg-white dark:bg-background-dark rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto transition-all duration-200">
    {/* Desktop/tablet table */}
    <table className="hidden md:table min-w-full divide-y divide-gray-light text-sm" aria-label="Report Cards Table">
      <thead className="bg-gray-light">
        <tr>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Uploaded At</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Description</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">File</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-background-dark divide-y divide-gray-light">
        {reportCards.map(card => (
          <tr key={card.id} className="hover:bg-background-light dark:hover:bg-gray-dark transition-colors">
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark dark:text-text-light">{new Date(card.uploaded_at).toLocaleString()}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark dark:text-text-light">{card.description || '-'}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
                aria-label={`View or download report card: ${card.description || 'file'}`}
              >
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
        <div key={card.id} className="bg-background-light dark:bg-background-dark rounded-lg shadow p-4 border border-gray-light flex flex-col gap-2">
          <div className="text-xs text-gray-dark">{new Date(card.uploaded_at).toLocaleString()}</div>
          <div className="text-base font-medium text-primary">{card.description || '-'}</div>
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent w-fit"
            aria-label={`View or download report card: ${card.description || 'file'}`}
          >
            View / Download
          </a>
        </div>
      ))}
    </div>
  </div>
));

export default ReportCardTable;
