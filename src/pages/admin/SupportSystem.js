import React, { useState, useEffect, useCallback } from 'react';
import { SupportApi } from '../../api/support';
import LeaveRequestsAdmin from './LeaveRequestsAdmin';
import TabNav from '../../components/support/TabNav';
import SupportSkeleton from '../../components/support/SupportSkeleton';
import ErrorAlert from '../../components/support/ErrorAlert';
import TicketTable from '../../components/support/TicketTable';
import TicketDetailModal from '../../components/support/TicketDetailModal';
import FaqCard from '../../components/support/FaqCard';
import FaqModal from '../../components/support/FaqModal';

const SupportSystem = React.memo(function SupportSystem() {
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });

  const fetchTickets = useCallback(async () => {
    try {
      const response = await SupportApi.getTickets();
      setTickets(response.tickets);
    } catch (error) {
      setError('Failed to fetch tickets.');
    }
  }, []);

  const fetchFaqs = useCallback(async () => {
    try {
      const response = await SupportApi.getFaqs();
      setFaqs(response.faqs);
    } catch (error) {
      setError('Failed to fetch FAQs.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchTickets(), fetchFaqs()]).finally(() => {
      setLoading(false);
    });
  }, [fetchTickets, fetchFaqs]);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  const handleStatusChange = useCallback(async (ticketId, newStatus) => {
    try {
      await SupportApi.updateTicketStatus(ticketId, newStatus);
      fetchTickets();
    } catch (error) {
      setError('Failed to update ticket status.');
    }
  }, [fetchTickets]);

  const handleViewDetails = useCallback((ticket) => setSelectedTicket(ticket), []);
  const handleCloseDetails = useCallback(() => setSelectedTicket(null), []);

  const handleFaqSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await SupportApi.createFaq(newFaq);
      setShowFaqModal(false);
      setNewFaq({ question: '', answer: '', category: 'general' });
      fetchFaqs();
    } catch (error) {
      setError('Failed to create FAQ.');
    }
  }, [newFaq, fetchFaqs]);

  const handleFaqDelete = useCallback(async (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await SupportApi.deleteFaq(faqId);
        fetchFaqs();
      } catch (error) {
        setError('Failed to delete FAQ.');
      }
    }
  }, [fetchFaqs]);

  const handleFaqModalOpen = useCallback(() => setShowFaqModal(true), []);
  const handleFaqModalClose = useCallback(() => setShowFaqModal(false), []);

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-primary">Support System</h1>
          <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        {error && <ErrorAlert message={error} />}
        {loading ? (
          <SupportSkeleton />
        ) : activeTab === 'tickets' ? (
          <TicketTable tickets={tickets} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} />
        ) : activeTab === 'faqs' ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleFaqModalOpen}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Add New FAQ
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq) => (
                <FaqCard key={faq.id} faq={faq} onDelete={handleFaqDelete} />
              ))}
            </div>
          </div>
        ) : (
          <LeaveRequestsAdmin />
        )}
        {selectedTicket && (
          <TicketDetailModal ticket={selectedTicket} onClose={handleCloseDetails} onStatusChange={handleStatusChange} />
        )}
        <FaqModal open={showFaqModal} onClose={handleFaqModalClose} onSubmit={handleFaqSubmit} newFaq={newFaq} setNewFaq={setNewFaq} />
      </div>
    </div>
  );
});

export default SupportSystem;
