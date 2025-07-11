import React, { useCallback } from 'react';

const FaqModal = React.memo(({ open, onClose, onSubmit, newFaq, setNewFaq }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewFaq((prev) => ({ ...prev, [name]: value }));
  }, [setNewFaq]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-background-light rounded-xl border border-gray-light shadow-md p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-primary mb-4">Add New FAQ</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-dark" htmlFor="faq-question">Question</label>
            <input
              id="faq-question"
              name="question"
              type="text"
              value={newFaq.question}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary text-text-dark"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-dark" htmlFor="faq-answer">Answer</label>
            <textarea
              id="faq-answer"
              name="answer"
              value={newFaq.answer}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary text-text-dark"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-dark" htmlFor="faq-category">Category</label>
            <select
              id="faq-category"
              name="category"
              value={newFaq.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary text-text-dark"
            >
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="classes">Classes</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-accent rounded-md shadow-sm text-sm font-medium text-accent hover:bg-accent hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
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
