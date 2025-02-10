import React, { useState, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Pie } from 'react-chartjs-2';

const SupportSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState({
    pending: 0,
    resolved: 0,
    total: 0
  });
  const [faqs, setFaqs] = useState([]);
  const [automationSettings, setAutomationSettings] = useState({
    autoReply: true,
    smartRouting: true,
    responseDelay: 30
  });
  const [automationRules, setAutomationRules] = useState({
    autoAssign: true,
    priorityBasedRouting: true,
    responseTemplates: true
  });

  useEffect(() => {
    fetchTickets();
    fetchFaqs();
    fetchTicketStats();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/php/support/get_tickets.php');
      const result = await response.json();
      if (result.success) {
        setTickets(result.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/php/support/get_faqs.php');
      const result = await response.json();
      if (result.success) {
        setFaqs(result.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const fetchTicketStats = async () => {
    try {
      const response = await fetch('/php/support/get_ticket_stats.php');
      const result = await response.json();
      if (result.success) {
        setTicketStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
    }
  };

  const handleTicketAutomation = async (settings) => {
    try {
      const response = await fetch('/php/support/update_automation.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const result = await response.json();
      if (result.success) {
        // Show success message or update UI
      }
    } catch (error) {
      console.error('Error updating automation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Support System</h1>

      {/* Ticket Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#461fa3]">Pending Tickets</h3>
          <p className="text-3xl font-bold text-[#200e4a]">{ticketStats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#461fa3]">Resolved Tickets</h3>
          <p className="text-3xl font-bold text-[#200e4a]">{ticketStats.resolved}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#461fa3]">Total Tickets</h3>
          <p className="text-3xl font-bold text-[#200e4a]">{ticketStats.total}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Active Tickets</h2>
          <div className="overflow-auto max-h-96">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border-b border-[#c2c1d3] p-4">
                <h3 className="font-medium">{ticket.subject}</h3>
                <p className="text-[#3b3a52] text-sm">{ticket.description}</p>
                <div className="flex justify-between mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'Pending' ? 'bg-[#7646eb] text-white' : 'bg-green-500 text-white'
                  }`}>
                    {ticket.status}
                  </span>
                  <button className="text-[#461fa3] hover:text-[#7646eb]">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Automation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">FAQ Automation</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Auto-Reply</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={automationSettings.autoReply}
                  onChange={e => setAutomationSettings(prev => ({
                    ...prev,
                    autoReply: e.target.checked
                  }))}/>
                <span className="slider round"></span>
              </label>
            </div>
            {/* Add more automation controls */}
          </div>
        </div>
      </div>

      {/* Automation Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Support Automation</h2>
        <div className="space-y-4">
          {/* Add automation controls */}
        </div>
      </div>
    </div>
  );
};

export default SupportSystem;