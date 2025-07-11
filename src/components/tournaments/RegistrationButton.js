import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Registration button/status for tournaments.
 * Handles all registration/payment states.
 */
const RegistrationButton = ({ tournament, registrationStatus, onRegister, onCancel, loading }) => {
  if (registrationStatus === 'pending') {
    return (
      <div className="space-y-2">
        <span className="block text-sm text-amber-600 font-medium flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> Payment verification pending</span>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-highlight hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          disabled={loading}
        >
          Cancel Registration
        </button>
      </div>
    );
  } else if (registrationStatus === 'completed') {
    return <span className="block text-sm text-success font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Registration confirmed</span>;
  } else if (registrationStatus === 'refunded') {
    return <span className="block text-sm text-gray-dark font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Registration cancelled (refunded)</span>;
  } else {
    return (
      <button
        type="button"
        onClick={onRegister}
        className="w-full py-2 px-4 rounded-md text-sm font-semibold text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-md"
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null} Register Now
      </button>
    );
  }
};

export default React.memo(RegistrationButton);
