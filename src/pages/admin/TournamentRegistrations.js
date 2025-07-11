

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TournamentsApi } from '../../api/tournaments';
import UploadUtils from '../../utils/uploadUtils';
import { toast } from 'react-hot-toast';
import RegistrationsSkeleton from '../../components/tournaments/RegistrationsSkeleton';
import ErrorAlert from '../../components/tournaments/ErrorAlert';
import TournamentInfo from '../../components/tournaments/TournamentInfo';
import FilterExportBar from '../../components/tournaments/FilterExportBar';
import RegistrationsTable from '../../components/tournaments/RegistrationsTable';
import PaymentModal from '../../components/tournaments/PaymentModal';

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
