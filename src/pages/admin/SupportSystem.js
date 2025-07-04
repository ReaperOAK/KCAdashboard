import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../utils/api';
import LeaveRequestsAdmin from './LeaveRequestsAdmin';

// Skeleton loader
const SupportSkeleton = React.memo(() => (
  <div className="py-8 animate-pulse" aria-busy="true" aria-label="Loading support system">
    <div className="bg-white rounded-xl shadow-lg h-32 mb-4" />
    <div className="bg-white rounded-xl shadow-lg h-32" />
  </div>
));

// Error alert
const ErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border-l-4 border-red-800 text-white px-6 py-4 rounded mb-6" role="alert" aria-live="assertive">
    {message}
  </div>
));

// Tab navigation
const TabNav = React.memo(({ activeTab, onTabChange }) => (
  <div className="flex space-x-4" role="tablist">
    <button
      onClick={() => onTabChange('tickets')}
      className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'tickets' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
      role="tab"
      aria-selected={activeTab === 'tickets'}
      tabIndex={0}
    >
      Tickets
    </button>
    <button
      onClick={() => onTabChange('faqs')}
      className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'faqs' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
      role="tab"
      aria-selected={activeTab === 'faqs'}
      tabIndex={0}
    >
      FAQs
    </button>
    <button
      onClick={() => onTabChange('leaves')}
      className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'leaves' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
      role="tab"
      aria-selected={activeTab === 'leaves'}
      tabIndex={0}
    >
      Leave Requests
    </button>
  </div>
));

// Ticket table
const TicketTable = React.memo(({ tickets, onStatusChange, onViewDetails }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-light" aria-label="Support tickets">
      <thead className="bg-primary">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">User</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Priority</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-light">
        {tickets.map((ticket) => (
          <tr key={ticket.id} tabIndex={0} className="focus:outline-accent">
            <td className="px-6 py-4 whitespace-nowrap">#{ticket.id}</td>
            <td className="px-6 py-4">{ticket.title}</td>
            <td className="px-6 py-4">{ticket.user_name}</td>
            <td className="px-6 py-4">
              <select
                value={ticket.status}
                onChange={e => onStatusChange(ticket.id, e.target.value)}
                className="rounded-md border-gray-300 focus:ring-secondary"
                aria-label={`Change status for ticket ${ticket.id}`}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {ticket.priority}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onViewDetails(ticket)}
                className="text-secondary hover:text-accent focus:outline-none focus:underline"
                aria-label={`View details for ticket ${ticket.id}`}
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

// Ticket detail modal
const TicketDetailModal = React.memo(({ ticket, onClose, onStatusChange }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
    <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-primary">Ticket Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close ticket details"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Ticket ID</span>
          <p>#{ticket.id}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Title</span>
          <p className="font-medium text-primary">{ticket.title}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Description</span>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Status</span>
            <select
              value={ticket.status}
              onChange={e => onStatusChange(ticket.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 focus:ring-secondary"
              aria-label={`Change status for ticket ${ticket.id}`}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Priority</span>
            <p className={`mt-1 px-2 py-1 rounded-full text-xs inline-block font-medium ${
              ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {ticket.priority}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Created By</span>
            <p>{ticket.user_name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Created At</span>
            <p>{new Date(ticket.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-light">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
));

// FAQ card
const FaqCard = React.memo(({ faq, onDelete }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-lg font-semibold text-primary mb-2">{faq.question}</h3>
    <p className="text-gray-dark">{faq.answer}</p>
    <div className="mt-4 flex justify-between items-center">
      <span className="text-sm text-gray-500">Category: {faq.category}</span>
      <button
        onClick={() => onDelete(faq.id)}
        className="text-red-600 hover:text-red-800 focus:outline-none"
        aria-label={`Delete FAQ ${faq.id}`}
      >
        Delete
      </button>
    </div>
  </div>
));

// FAQ modal
const FaqModal = React.memo(({ open, onClose, onSubmit, newFaq, setNewFaq }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewFaq((prev) => ({ ...prev, [name]: value }));
  }, [setNewFaq]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-primary mb-4">Add New FAQ</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="faq-question">Question</label>
            <input
              id="faq-question"
              name="question"
              type="text"
              value={newFaq.question}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="faq-answer">Answer</label>
            <textarea
              id="faq-answer"
              name="answer"
              value={newFaq.answer}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="faq-category">Category</label>
            <select
              id="faq-category"
              name="category"
              value={newFaq.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none"
            >
              Add FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

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
      const response = await ApiService.get('/support/tickets/get-all.php');
      setTickets(response.tickets);
    } catch (error) {
      setError('Failed to fetch tickets.');
    }
  }, []);

  const fetchFaqs = useCallback(async () => {
    try {
      const response = await ApiService.get('/support/faqs/get-all.php');
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
      await ApiService.post('/support/tickets/update-status.php', {
        ticket_id: ticketId,
        status: newStatus
      });
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
      await ApiService.post('/support/faqs/create.php', newFaq);
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
        await ApiService.delete(`/support/faqs/delete.php?id=${faqId}`);
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
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none"
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
