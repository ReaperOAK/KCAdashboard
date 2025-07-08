
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TournamentsApi } from '../../api/tournaments';
import UploadUtils from '../../utils/uploadUtils';
import { toast } from 'react-hot-toast';


// --- Skeleton Loader ---
const RegistrationsSkeleton = React.memo(() => (
  <div className="text-center py-10" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-3" />
    <p className="mt-3 text-gray-dark">Loading registrations...</p>
  </div>
));

// --- Error Alert ---
const ErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border border-red-800 text-white px-4 py-3 rounded mb-4" role="alert">
    <span className="font-semibold">Error:</span> {message}
  </div>
));

// --- Tournament Info Card ---
const TournamentInfo = React.memo(({ tournament }) => (
  <section className="mb-6" aria-labelledby="tournament-title">
    <h1 id="tournament-title" className="text-2xl font-bold text-primary">{tournament.title} - Registrations</h1>
    <div className="mt-2 text-gray-dark">
      <p>Date: {new Date(tournament.date_time).toLocaleString()}</p>
      <p>
        Status: <span className={
          `px-2 py-1 rounded-full text-xs font-medium ` +
          (tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
            'bg-gray-light text-primary')
        }>{tournament.status}</span>
      </p>
      <p>Entry Fee: {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
    </div>
  </section>
));

// --- Filter & Export Controls ---
const FilterExportBar = React.memo(({ filterStatus, onFilterChange, onExport, exportDisabled }) => (
  <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-4">
    <div className="flex items-center gap-2">
      <label htmlFor="filter-status" className="text-sm font-medium">Filter by status:</label>
      <select
        id="filter-status"
        value={filterStatus}
        onChange={onFilterChange}
        className="border border-gray-light rounded-md px-2 py-1 focus:ring-2 focus:ring-accent focus:outline-none"
        aria-label="Filter registrations by payment status"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="refunded">Refunded</option>
      </select>
    </div>
    <button
      type="button"
      onClick={onExport}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:bg-gray-dark disabled:text-gray-light"
      disabled={exportDisabled}
      aria-disabled={exportDisabled}
    >
      Export to CSV
    </button>
  </div>
));

// --- Registrations Table ---
const RegistrationsTable = React.memo(({ registrations, tournament, onViewPayment }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md" aria-label="Tournament registrations">
      <thead className="bg-primary text-white text-sm uppercase">
        <tr>
          <th className="py-3 px-4 text-left">Name</th>
          <th className="py-3 px-4 text-left">Email</th>
          <th className="py-3 px-4 text-left">Registration Date</th>
          <th className="py-3 px-4 text-left">Payment Status</th>
          <th className="py-3 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {registrations.length > 0 ? registrations.map((registration) => (
          <tr
            key={`${registration.tournament_id}-${registration.user_id}`}
            className="border-b border-gray-dark odd:bg-background-light hover:bg-gray-light focus-within:bg-gray-light"
            tabIndex={0}
          >
            <td className="py-3 px-4">{registration.full_name}</td>
            <td className="py-3 px-4">{registration.email}</td>
            <td className="py-3 px-4">{new Date(registration.registration_date).toLocaleString()}</td>
            <td className="py-3 px-4">
              <span className={
                `px-2 py-1 rounded-full text-xs font-medium ` +
                (registration.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                  registration.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  registration.payment_status === 'refunded' ? 'bg-gray-light text-primary' :
                  'bg-red-100 text-red-800')
              }>
                {registration.payment_status}
              </span>
            </td>
            <td className="py-3 px-4">
              {tournament.entry_fee > 0 && registration.payment && (
                <button
                  type="button"
                  onClick={() => onViewPayment(registration.payment.id, registration.payment.screenshot_path)}
                  className="px-3 py-1 bg-accent text-white rounded-md hover:bg-secondary focus:ring-2 focus:ring-accent"
                  aria-label={`View payment screenshot for ${registration.full_name}`}
                >
                  View Payment
                </button>
              )}
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan={5} className="py-6 text-center text-gray-dark">No registrations found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
));

// --- Payment Screenshot Modal ---
const PaymentModal = React.memo(({ isOpen, imageUrl, onClose, onApprove, onReject }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Payment Screenshot Modal">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} tabIndex={-1} aria-hidden="true" />
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative z-10 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-primary">Payment Screenshot</h2>
        <div className="mb-4">
          <img src={imageUrl} alt="Payment Screenshot" className="w-full max-h-96 object-contain border" />
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-light rounded-md text-gray-dark hover:bg-gray-light focus:ring-2 focus:ring-accent"
          >
            Close
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-600"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-600"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- Main Component ---
const TournamentRegistrations = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch registrations (memoized)
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await TournamentsApi.getRegistrations(id);
      setTournament(response.tournament);
      setRegistrations(response.registrations);
    } catch (err) {
      setError('Failed to fetch registrations');
      toast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Payment modal open handler
  const handleViewPayment = useCallback((paymentId, screenshotPath) => {
    setSelectedPaymentId(paymentId);
    setSelectedImage(UploadUtils.getPaymentUrl(screenshotPath));
    setShowImageModal(true);
  }, []);

  // Payment verify handler
  const handleVerifyPayment = useCallback(async (status) => {
    try {
      await TournamentsApi.verifyPayment(selectedPaymentId, status);
      toast.success(`Payment ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowImageModal(false);
      fetchRegistrations();
    } catch (err) {
      toast.error('Failed to verify payment');
    }
  }, [selectedPaymentId, fetchRegistrations]);

  // Export to CSV handler
  const handleExportToCSV = useCallback(() => {
    if (!registrations.length || !tournament) return;
    const headers = ['Name', 'Email', 'Registration Date', 'Payment Status'];
    const csvRows = [headers.join(',')];
    registrations.forEach(reg => {
      const values = [
        `"${reg.full_name}"`,
        `"${reg.email}"`,
        `"${new Date(reg.registration_date).toLocaleString()}"`,
        `"${reg.payment_status}"`
      ];
      csvRows.push(values.join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${tournament.title} - Registrations.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [registrations, tournament]);

  // Filtered registrations (memoized)
  const filteredRegistrations = useMemo(() => {
    if (filterStatus === 'all') return registrations;
    return registrations.filter(reg => reg.payment_status === filterStatus);
  }, [registrations, filterStatus]);

  // Filter change handler
  const handleFilterChange = useCallback((e) => {
    setFilterStatus(e.target.value);
  }, []);

  // Modal close handler
  const handleCloseModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedPaymentId(null);
  }, []);

  // Modal approve/reject handlers
  const handleApprove = useCallback(() => handleVerifyPayment('approved'), [handleVerifyPayment]);
  const handleReject = useCallback(() => handleVerifyPayment('rejected'), [handleVerifyPayment]);

  return (
    <div className="p-4">
      <nav className="mb-4" aria-label="Breadcrumb">
        <Link
          to="/admin/tournaments"
          className="text-secondary hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent rounded"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tournaments
        </Link>
      </nav>

      {error && <ErrorAlert message={error} />}
      {loading ? (
        <RegistrationsSkeleton />
      ) : (
        <>
          {tournament && <TournamentInfo tournament={tournament} />}
          <FilterExportBar
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            onExport={handleExportToCSV}
            exportDisabled={registrations.length === 0}
          />
          <RegistrationsTable
            registrations={filteredRegistrations}
            tournament={tournament || { entry_fee: 0 }}
            onViewPayment={handleViewPayment}
          />
        </>
      )}

      <PaymentModal
        isOpen={showImageModal}
        imageUrl={selectedImage}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default React.memo(TournamentRegistrations);
