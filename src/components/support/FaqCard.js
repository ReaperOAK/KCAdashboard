
import React from 'react';

/**
 * FaqCard component: Shows a beautiful, accessible, responsive FAQ card UI.
 * Only responsibility: Display FAQ question, answer, category, and delete action.
 *
 * Props:
 *   - faq: { id, question, answer, category } (required)
 *   - onDelete: function (required)
 */
const FaqCard = React.memo(function FaqCard({ faq, onDelete }) {
  return (
    <article
      className="bg-background-light dark:bg-background-dark p-5 sm:p-6 rounded-2xl border border-gray-light shadow-md hover:shadow-lg transition-all duration-200  w-full max-w-2xl mx-auto mb-4"
      tabIndex={0}
      aria-label={`FAQ: ${faq.question}`}
    >
      <header className="flex items-center mb-2 gap-2">
        <svg className="w-6 h-6 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M12 10h.01M16 10h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
        <h3 className="text-lg sm:text-xl font-semibold text-primary leading-tight">{faq.question}</h3>
      </header>
      <p className="text-text-dark text-base sm:text-lg mb-3 break-words">{faq.answer}</p>
      <footer className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2">
        <span className="inline-block bg-gray-light text-primary font-medium rounded-full px-3 py-1 text-xs sm:text-sm">Category: {faq.category}</span>
        <button
          onClick={() => onDelete(faq.id)}
          className="flex items-center gap-1 text-error hover:text-white bg-error/10 hover:bg-error transition-all duration-200 px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 text-sm font-medium"
          aria-label={`Delete FAQ ${faq.id}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          Delete
        </button>
      </footer>
    </article>
  );
});

export default FaqCard;
