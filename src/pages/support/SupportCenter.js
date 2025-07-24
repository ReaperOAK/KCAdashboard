import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SupportTicketForm from './SupportTicketForm';
import FaqList from './FaqList';
import MyTickets from './MyTickets';
import TeacherSupportSystem from '../teacher/TeacherSupportSystem';



const hashToTab = (hash) => {
  switch ((hash || '').replace('#', '').toLowerCase()) {
    case 'ticket':
      return 'ticket';
    case 'my-tickets':
      return 'my-tickets';
    default:
      return 'faqs';
  }
};

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState(() => hashToTab(window.location.hash));
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';
  const isTeacher = user && user.role === 'teacher';

  // Listen for hash changes to update the tab
  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(hashToTab(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // If teacher, show the teacher support system
  if (isTeacher) {
    return <TeacherSupportSystem />;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-6">Support Center</h1>
      <div className="flex space-x-4 mb-6" role="tablist">
        <button
          onClick={() => {
            setActiveTab('faqs');
            window.location.hash = '';
          }}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'faqs' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
          role="tab"
          aria-selected={activeTab === 'faqs'}
        >
          FAQs
        </button>
        {!isAdmin && !isTeacher && (
          <>
            <button
              onClick={() => {
                setActiveTab('ticket');
                window.location.hash = 'ticket';
              }}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'ticket' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
              role="tab"
              aria-selected={activeTab === 'ticket'}
            >
              Create Ticket
            </button>
            <button
              onClick={() => {
                setActiveTab('my-tickets');
                window.location.hash = 'my-tickets';
              }}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${activeTab === 'my-tickets' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
              role="tab"
              aria-selected={activeTab === 'my-tickets'}
            >
              My Tickets
            </button>
          </>
        )}
      </div>
      {activeTab === 'faqs' ? (
        <FaqList />
      ) : activeTab === 'ticket' ? (
        !isAdmin && !isTeacher && <SupportTicketForm />
      ) : activeTab === 'my-tickets' ? (
        !isAdmin && !isTeacher && <MyTickets />
      ) : null}
    </div>
  );
};

export default SupportCenter;
