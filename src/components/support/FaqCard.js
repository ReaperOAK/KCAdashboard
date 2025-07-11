import React from 'react';

const FaqCard = React.memo(({ faq, onDelete }) => (
  <div className="bg-background-light p-6 rounded-xl border border-gray-light shadow-md">
    <h3 className="text-lg font-semibold text-primary mb-2">{faq.question}</h3>
    <p className="text-text-dark">{faq.answer}</p>
    <div className="mt-4 flex justify-between items-center">
      <span className="text-sm text-gray-dark">Category: {faq.category}</span>
      <button
        onClick={() => onDelete(faq.id)}
        className="text-error hover:text-white bg-error/10 hover:bg-error transition-all duration-200 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-error"
        aria-label={`Delete FAQ ${faq.id}`}
      >
        Delete
      </button>
    </div>
  </div>
));

export default FaqCard;
