import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SupportTicketForm from './SupportTicketForm';
import FaqList from './FaqList';
import LeaveRequestForm from './LeaveRequestForm';
import MyLeaveRequests from './MyLeaveRequests';


const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-6">Support Center</h1>
      <div className="flex space-x-4 mb-6" role="tablist">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'faqs' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
          role="tab"
          aria-selected={activeTab === 'faqs'}
        >
          FAQs
        </button>
        {!isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'ticket' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
              role="tab"
              aria-selected={activeTab === 'ticket'}
            >
              Raise a Ticket
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'leave' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
              role="tab"
              aria-selected={activeTab === 'leave'}
            >
              Request Leave
            </button>
            <button
              onClick={() => setActiveTab('my-leaves')}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'my-leaves' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
              role="tab"
              aria-selected={activeTab === 'my-leaves'}
            >
              My Leave Requests
            </button>
          </>
        )}
      </div>
      {activeTab === 'faqs' ? (
        <FaqList />
      ) : activeTab === 'ticket' ? (
        !isAdmin && <SupportTicketForm />
      ) : activeTab === 'leave' ? (
        !isAdmin && <LeaveRequestForm />
      ) : (
        !isAdmin && <MyLeaveRequests />
      )}
    </div>
  );
};

export default SupportCenter;
