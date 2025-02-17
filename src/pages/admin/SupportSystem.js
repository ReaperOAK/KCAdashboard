import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';

const SupportSystem = () => {
    const [tickets, setTickets] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });

    const fetchTickets = useCallback(async () => {
        try {
            const response = await ApiService.get('/support/tickets/get-all.php');
            setTickets(response.tickets);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        }
    }, []);

    const fetchFaqs = useCallback(async () => {
        try {
            const response = await ApiService.get('/support/faqs/get-all.php');
            setFaqs(response.faqs);
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchTickets(), fetchFaqs()]).finally(() => {
            setLoading(false);
        });
    }, [fetchTickets, fetchFaqs]);

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await ApiService.post('/support/tickets/update-status.php', {
                ticket_id: ticketId,
                status: newStatus
            });
            fetchTickets();
        } catch (error) {
            console.error('Failed to update ticket status:', error);
        }
    };

    const handleFaqSubmit = async (e) => {
        e.preventDefault();
        try {
            await ApiService.post('/support/faqs/create.php', newFaq);
            setShowFaqModal(false);
            setNewFaq({ question: '', answer: '', category: 'general' });
            fetchFaqs();
        } catch (error) {
            console.error('Failed to create FAQ:', error);
        }
    };

    const handleFaqDelete = async (faqId) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await ApiService.delete(`/support/faqs/delete.php?id=${faqId}`);
                fetchFaqs(); // Refresh FAQs list after deletion
            } catch (error) {
                console.error('Failed to delete FAQ:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Support System</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === 'tickets' 
                                    ? 'bg-[#461fa3] text-white' 
                                    : 'bg-white text-[#461fa3]'
                            }`}
                        >
                            Tickets
                        </button>
                        <button
                            onClick={() => setActiveTab('faqs')}
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === 'faqs' 
                                    ? 'bg-[#461fa3] text-white' 
                                    : 'bg-white text-[#461fa3]'
                            }`}
                        >
                            FAQs
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : activeTab === 'tickets' ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">#{ticket.id}</td>
                                        <td className="px-6 py-4">{ticket.title}</td>
                                        <td className="px-6 py-4">{ticket.user_name}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                className="rounded-md border-gray-300 focus:ring-[#461fa3]"
                                            >
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
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
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="text-[#461fa3] hover:text-[#7646eb]"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowFaqModal(true)}
                                className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                            >
                                Add New FAQ
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {faqs.map((faq) => (
                                <div key={faq.id} className="bg-white p-6 rounded-xl shadow-lg">
                                    <h3 className="text-lg font-semibold text-[#200e4a] mb-2">{faq.question}</h3>
                                    <p className="text-gray-600">{faq.answer}</p>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Category: {faq.category}</span>
                                        <button
                                            onClick={() => handleFaqDelete(faq.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ticket Detail Modal */}
                {selectedTicket && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-[#200e4a]">Ticket Details</h2>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="text-gray-400 hover:text-gray-500"
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
                                    <p>#{selectedTicket.id}</p>
                                </div>
                                
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Title</span>
                                    <p className="font-medium text-[#200e4a]">{selectedTicket.title}</p>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-500">Description</span>
                                    <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Status</span>
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#461fa3]"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Priority</span>
                                        <p className={`mt-1 px-2 py-1 rounded-full text-xs inline-block ${
                                            selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                            selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                            selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {selectedTicket.priority}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Created By</span>
                                        <p>{selectedTicket.user_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Created At</span>
                                        <p>{new Date(selectedTicket.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="w-full px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAQ Modal */}
                {showFaqModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Add New FAQ</h2>
                            <form onSubmit={handleFaqSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Question</label>
                                    <input
                                        type="text"
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Answer</label>
                                    <textarea
                                        value={newFaq.answer}
                                        onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        value={newFaq.category}
                                        onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
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
                                        onClick={() => setShowFaqModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                    >
                                        Add FAQ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportSystem;
