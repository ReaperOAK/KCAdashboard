import React, { useState, useEffect, useCallback } from 'react';
import { SupportApi } from '../../api/support';
import TicketTable from '../../components/support/TicketTable';
import TicketDetailModal from '../../components/support/TicketDetailModal';
import SupportSkeleton from '../../components/support/SupportSkeleton';
import ErrorAlert from '../../components/support/ErrorAlert';

const MyTickets = React.memo(function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchMyTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await SupportApi.getMyTickets();
      setTickets(response.tickets);
    } catch (err) {
      setError('Failed to fetch your tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const handleViewDetails = useCallback((ticket) => setSelectedTicket(ticket), []);
  const handleCloseDetails = useCallback(() => setSelectedTicket(null), []);

  // Students can't change status, so we provide a no-op function
  const handleStatusChange = useCallback(() => {}, []);

  if (loading) {
    return <SupportSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-light p-4">
        <h2 className="text-lg font-semibold text-primary mb-2">My Support Tickets</h2>
        <p className="text-gray-dark text-sm">
          Track the status of your support requests and view responses from our support team.
        </p>
      </div>
      
      {error && <ErrorAlert message={error} />}

      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-light p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2 2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-dark mb-2">No tickets yet</h3>
          <p className="text-gray-dark mb-4">You haven't created any support tickets yet.</p>
          <button
            onClick={() => window.location.hash = 'ticket'}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all duration-200"
          >
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <TicketTable 
          tickets={tickets} 
          onStatusChange={handleStatusChange} 
          onViewDetails={handleViewDetails} 
          hideStatusColumn={true} // Hide status change for students
        />
      )}

      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket} 
          onClose={handleCloseDetails} 
          onStatusChange={handleStatusChange}
          isReadOnly={true} // Make it read-only for students
        />
      )}
    </div>
  );
});

export default MyTickets;
