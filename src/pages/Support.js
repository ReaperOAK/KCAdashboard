import React, { useState, useEffect } from 'react';

const faqs = [
  { question: 'How do I reset my password?', answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.' },
  { question: 'How do I contact support?', answer: 'You can contact support by submitting a ticket through the support page.' },
  // Add more FAQs as needed
];

const Support = () => {
  const [ticket, setTicket] = useState({ subject: '', description: '' });
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/php/get-tickets.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticket.subject || !ticket.description) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('/php/submit-ticket.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket),
      });
      const data = await response.json();
      if (data.success) {
        setTickets([...tickets, { ...ticket, id: data.id, status: 'Pending' }]);
        setTicket({ subject: '', description: '' });
        setError('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An error occurred while submitting the ticket.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1f9]">
      <main className="flex-grow p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Frequently Asked Questions</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-[#c2c1d3]">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h3 className="text-xl font-semibold mb-2 text-[#461fa3]">{faq.question}</h3>
                <p className="text-[#3b3a52]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Submit a Support Ticket</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-[#c2c1d3]">
            <form onSubmit={handleSubmitTicket}>
              <div className="mb-4">
                <label className="block text-[#200e4a] text-sm font-bold mb-2" htmlFor="subject">
                  Subject
                </label>
                <input
                  className="shadow appearance-none border border-[#c2c1d3] rounded w-full py-2 px-3 text-[#3b3a52] leading-tight focus:outline-none focus:border-[#7646eb] focus:ring-1 focus:ring-[#7646eb]"
                  id="subject"
                  type="text"
                  name="subject"
                  value={ticket.subject}
                  onChange={handleTicketChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-[#200e4a] text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="shadow appearance-none border border-[#c2c1d3] rounded w-full py-2 px-3 text-[#3b3a52] leading-tight focus:outline-none focus:border-[#7646eb] focus:ring-1 focus:ring-[#7646eb]"
                  id="description"
                  name="description"
                  rows="5"
                  value={ticket.description}
                  onChange={handleTicketChange}
                ></textarea>
              </div>
              {error && <p className="text-[#af0505] text-xs italic mb-4">{error}</p>}
              <button
                className="bg-[#461fa3] hover:bg-[#7646eb] text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb] focus:ring-opacity-50 transition duration-300"
                type="submit"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Your Tickets</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-[#c2c1d3]">
            {tickets.length === 0 ? (
              <p className="text-[#3b3a52]">No tickets submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-[#f3f1f9]">
                      <th className="py-3 px-4 border-b border-[#c2c1d3] text-left text-[#200e4a] font-semibold">Subject</th>
                      <th className="py-3 px-4 border-b border-[#c2c1d3] text-left text-[#200e4a] font-semibold">Description</th>
                      <th className="py-3 px-4 border-b border-[#c2c1d3] text-left text-[#200e4a] font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-[#f3f1f9] transition-colors">
                        <td className="py-3 px-4 border-b border-[#c2c1d3] text-[#3b3a52]">{ticket.subject}</td>
                        <td className="py-3 px-4 border-b border-[#c2c1d3] text-[#3b3a52]">{ticket.description}</td>
                        <td className="py-3 px-4 border-b border-[#c2c1d3]">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            ticket.status === 'Pending' 
                              ? 'bg-[#461fa3] text-white' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Support;