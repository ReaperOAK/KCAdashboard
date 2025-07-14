
import React, { useCallback, useRef, useEffect } from 'react';

/**
 * FaqModal component: Shows a beautiful, accessible, responsive modal for adding FAQ.
 * Only responsibility: Display modal and handle FAQ form submission.
 *
 * Props:
 *   - open: boolean (required)
 *   - onClose: function (required)
 *   - onSubmit: function (required)
 *   - newFaq: { question, answer, category } (required)
 *   - setNewFaq: function (required)
 */
const FaqModal = React.memo(function FaqModal({ open, onClose, onSubmit, newFaq, setNewFaq }) {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Focus trap and ESC close
  useEffect(() => {
    if (open && firstInputRef.current) {
      firstInputRef.current.focus();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('input, textarea, select, button');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewFaq((prev) => ({ ...prev, [name]: value }));
  }, [setNewFaq]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 "
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-modal-title"
      ref={modalRef}
    >
      <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-gray-light shadow-2xl p-6 sm:p-8 max-w-lg w-full relative ">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-dark hover:text-accent bg-gray-light/30 hover:bg-accent/10 rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Close modal"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 id="faq-modal-title" className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center gap-2">
          <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M12 10h.01M16 10h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
          Add New FAQ
        </h2>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="faq-question">Question</label>
            <input
              id="faq-question"
              name="question"
              type="text"
              value={newFaq.question}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-light bg-white dark:bg-background-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-secondary text-text-dark px-3 py-2 text-base transition-all duration-200"
              required
              ref={firstInputRef}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="faq-answer">Answer</label>
            <textarea
              id="faq-answer"
              name="answer"
              value={newFaq.answer}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-light bg-white dark:bg-background-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-secondary text-text-dark px-3 py-2 text-base transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="faq-category">Category</label>
            <select
              id="faq-category"
              name="category"
              value={newFaq.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-light bg-white dark:bg-background-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-secondary text-text-dark px-3 py-2 text-base transition-all duration-200"
            >
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="classes">Classes</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-accent rounded-lg shadow-sm text-sm font-medium text-accent hover:bg-accent hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Add FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default FaqModal;
