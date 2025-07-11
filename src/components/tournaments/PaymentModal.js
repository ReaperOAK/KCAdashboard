import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Payment modal for tournaments with focus trap and accessibility.
 */
const PaymentModal = ({ tournament, open, onClose, onSubmit, onFileChange, paymentLoading }) => {
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
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative focus:outline-none"
        tabIndex={-1}
        ref={modalRef}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1"
          aria-label="Close payment modal"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-primary">Payment for {tournament.title}</h2>
        <div className="mb-4 p-4 bg-gray-light rounded-lg">
          <p className="font-medium">Amount: ₹{tournament.entry_fee}</p>
          <p className="text-sm mt-2">Please make payment using UPI to:</p>
          <p className="font-bold mt-1">kca@upi</p>
          <div className="mt-4 flex justify-center">
            <img src="/qr-code-placeholder.png" alt="Payment QR Code" className="w-40 h-40 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-dark mb-2" htmlFor="payment-screenshot">Upload Payment Screenshot:</label>
            <input
              id="payment-screenshot"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Please upload a screenshot of your successful payment</p>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-dark bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
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
};

export default React.memo(PaymentModal);
