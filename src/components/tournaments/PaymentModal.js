
import React, { useRef, useEffect } from 'react';

/**
 * PaymentModal: Beautiful, accessible modal for tournament payments.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const PaymentModal = React.memo(function PaymentModal({ tournament, open, onClose, onSubmit, onFileChange, paymentLoading, className = '' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!open || !tournament) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div
        className={[
          'bg-background-light rounded-2xl p-4 sm:p-8 w-full max-w-md shadow-2xl relative focus:outline-none animate-fade-in',
          className,
        ].join(' ')}
        tabIndex={-1}
        ref={modalRef}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1.5 transition-colors"
          aria-label="Close payment modal"
        >
          {/* Close icon (SVG, no external dep) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-primary text-center">Payment for {tournament.title}</h2>
        <div className="mb-4 p-4 bg-gray-light/40 rounded-lg">
          <p className="font-medium text-text-dark">Amount: <span className="text-primary font-bold">₹{tournament.entry_fee}</span></p>
          <p className="text-sm mt-2 text-gray-dark">Please make payment using UPI to:</p>
          <p className="font-bold mt-1 text-accent">kca@upi</p>
          <div className="mt-4 flex justify-center">
            <img src="/qr-code-placeholder.png" alt="Payment QR Code" className="w-32 h-32 sm:w-40 sm:h-40 border border-gray-light rounded-lg bg-white object-contain" />
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2" htmlFor="payment-screenshot">Upload Payment Screenshot:</label>
            <input
              id="payment-screenshot"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full border border-gray-light rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-white file:font-semibold file:cursor-pointer"
              required
            />
            <p className="text-xs text-gray-dark mt-1">Please upload a screenshot of your successful payment</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-light rounded-md text-sm font-medium text-gray-dark bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
              disabled={paymentLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-md text-sm font-semibold text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-md"
              disabled={paymentLoading}
            >
              {paymentLoading ? 'Processing...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default PaymentModal;
