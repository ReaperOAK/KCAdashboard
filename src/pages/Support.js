import React, { useState } from 'react';

const faqs = [
  { question: 'How do I reset my password?', answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.' },
  { question: 'How do I contact support?', answer: 'You can contact support by submitting a ticket through the support page.' },
  // Add more FAQs as needed
];

const Support = () => {
  const [ticket, setTicket] = useState({ subject: '', description: '' });
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticket.subject || !ticket.description) {
      setError('All fields are required');
      return;
    }
    setTickets([...tickets, { ...ticket, id: tickets.length + 1, status: 'Pending' }]);
    setTicket({ subject: '', description: '' });
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Submit a Support Ticket</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <form onSubmit={handleSubmitTicket}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                  Subject
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="subject"
                  type="text"
                  name="subject"
                  value={ticket.subject}
                  onChange={handleTicketChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="description"
                  name="description"
                  rows="5"
                  value={ticket.description}
                  onChange={handleTicketChange}
                ></textarea>
              </div>
              {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Your Tickets</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {tickets.length === 0 ? (
              <p>No tickets submitted yet.</p>
            ) : (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Subject</th>
                    <th className="py-2 px-4 border-b">Description</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="py-2 px-4 border-b">{ticket.subject}</td>
                      <td className="py-2 px-4 border-b">{ticket.description}</td>
                      <td className="py-2 px-4 border-b">{ticket.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Support;