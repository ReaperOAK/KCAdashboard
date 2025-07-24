import React, { useState, useEffect, useCallback } from 'react';
import { SupportApi } from '../../api/support';
import SupportSkeleton from '../../components/support/SupportSkeleton';
import ErrorAlert from '../../components/support/ErrorAlert';
import TicketTable from '../../components/support/TicketTable';
import TicketDetailModal from '../../components/support/TicketDetailModal';
import FaqCard from '../../components/support/FaqCard';
import SupportTicketForm from '../support/SupportTicketForm';
import LeaveRequestForm from '../support/LeaveRequestForm';
import MyLeaveRequests from '../support/MyLeaveRequests';

const TeacherSupportSystem = React.memo(function TeacherSupportSystem() {
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('manage-tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);

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

  const teacherTabOptions = [
    { id: 'manage-tickets', label: 'Manage Tickets', icon: '🎫' },
    { id: 'create-ticket', label: 'Create Ticket', icon: '✏️' },
    { id: 'request-leave', label: 'Request Leave', icon: '📅' },
    { id: 'my-leaves', label: 'My Leave Requests', icon: '📋' },
    { id: 'faqs', label: 'FAQs', icon: '❓' },
  ];

  const TeacherTabNav = ({ activeTab, onTabChange }) => (
    <div className="flex flex-wrap gap-2 bg-background-light p-2 rounded-lg border border-gray-light">
      {teacherTabOptions.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === tab.id
              ? 'bg-secondary text-white shadow-sm'
              : 'text-gray-dark hover:bg-gray-light/50 focus:outline-none focus:ring-2 focus:ring-accent'
          }`}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Teacher Support Center</h1>
            <p className="text-gray-dark mt-1">Manage student tickets and create your own support requests</p>
          </div>
          <TeacherTabNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        
        {error && <ErrorAlert message={error} />}
        
        {loading ? (
          <SupportSkeleton />
        ) : activeTab === 'manage-tickets' ? (
          <div>
            <div className="bg-white rounded-lg border border-gray-light p-4 mb-6">
              <h2 className="text-lg font-semibold text-primary mb-2">Student Support Tickets</h2>
              <p className="text-gray-dark text-sm">
                View and respond to support tickets submitted by students. You can update ticket status and add replies.
              </p>
            </div>
            <TicketTable 
              tickets={tickets} 
              onStatusChange={handleStatusChange} 
              onViewDetails={handleViewDetails} 
            />
          </div>
        ) : activeTab === 'create-ticket' ? (
          <div>
            <div className="bg-white rounded-lg border border-gray-light p-4 mb-6">
              <h2 className="text-lg font-semibold text-primary mb-2">Create Support Ticket</h2>
              <p className="text-gray-dark text-sm">
                Need help with something? Create a support ticket and administrators will assist you.
              </p>
            </div>
            <SupportTicketForm />
          </div>
        ) : activeTab === 'request-leave' ? (
          <div>
            <div className="bg-white rounded-lg border border-gray-light p-4 mb-6">
              <h2 className="text-lg font-semibold text-primary mb-2">Request Leave</h2>
              <p className="text-gray-dark text-sm">
                Submit a leave request to administrators for approval.
              </p>
            </div>
            <LeaveRequestForm />
          </div>
        ) : activeTab === 'my-leaves' ? (
          <div>
            <div className="bg-white rounded-lg border border-gray-light p-4 mb-6">
              <h2 className="text-lg font-semibold text-primary mb-2">My Leave Requests</h2>
              <p className="text-gray-dark text-sm">
                View and manage your submitted leave requests and their approval status.
              </p>
            </div>
            <MyLeaveRequests />
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg border border-gray-light p-4 mb-6">
              <h2 className="text-lg font-semibold text-primary mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-dark text-sm">
                Browse common questions and answers to help students with common issues.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.length === 0 ? (
                <div className="col-span-2 text-center text-gray-dark py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No FAQs available</p>
                </div>
              ) : (
                faqs.map((faq) => (
                  <FaqCard key={faq.id} faq={faq} />
                ))
              )}
            </div>
          </div>
        )}
        
        {selectedTicket && (
          <TicketDetailModal 
            ticket={selectedTicket} 
            onClose={handleCloseDetails} 
            onStatusChange={handleStatusChange} 
          />
        )}
      </div>
    </div>
  );
});

export default TeacherSupportSystem;
