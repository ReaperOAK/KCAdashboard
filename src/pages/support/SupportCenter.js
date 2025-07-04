import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SupportTicketForm from './SupportTicketForm';
import FaqList from './FaqList';


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
          <button
            onClick={() => setActiveTab('ticket')}
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'ticket' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
            role="tab"
            aria-selected={activeTab === 'ticket'}
          >
            Raise a Ticket
          </button>
        )}
      </div>
      {activeTab === 'faqs' ? (
        <FaqList />
      ) : (
        !isAdmin && <SupportTicketForm />
      )}
    </div>
  );
};

export default SupportCenter;
