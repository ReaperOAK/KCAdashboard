import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApiService from '../../utils/api';
import UploadUtils from '../../utils/uploadUtils';
import { toast } from 'react-hot-toast';

const TournamentRegistrations = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Use useCallback to memoize the fetchRegistrations function
    const fetchRegistrations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ApiService.get(`/tournaments/get-registrations.php?tournament_id=${id}`);
            setTournament(response.tournament);
            setRegistrations(response.registrations);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch registrations');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]); // Now fetchRegistrations is properly included in the dependency array

    const handleViewPayment = (paymentId, screenshotPath) => {        setSelectedPaymentId(paymentId);
        setSelectedImage(UploadUtils.getPaymentUrl(screenshotPath));
        setShowImageModal(true);
    };

    const handleVerifyPayment = async (status) => {
        try {
            await ApiService.post('/tournaments/payment-verify.php', {
                payment_id: selectedPaymentId,
                status: status
            });
            
            toast.success(`Payment ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
            setShowImageModal(false);
            // Now fetchRegistrations is properly defined in this scope
            fetchRegistrations();
        } catch (error) {
            toast.error('Failed to verify payment');
        }
    };

    const exportToCSV = () => {
        if (!registrations.length) return;
        
        const headers = ['Name', 'Email', 'Registration Date', 'Payment Status'];
        
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        registrations.forEach(reg => {
            const values = [
                `"${reg.full_name}"`,
                `"${reg.email}"`,
                `"${new Date(reg.registration_date).toLocaleString()}"`,
                `"${reg.payment_status}"`
            ];
            csvRows.push(values.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${tournament.title} - Registrations.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRegistrations = filterStatus === 'all' 
        ? registrations 
        : registrations.filter(reg => reg.payment_status === filterStatus);

    return (
        <div className="p-4">
            <div className="mb-4">
                <Link 
                    to="/admin/tournaments" 
                    className="text-[#461fa3] hover:underline flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Tournaments
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="spinner"></div>
                    <p className="mt-3">Loading registrations...</p>
                </div>
            ) : (
                <>
                    {tournament && (
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-[#200e4a]">{tournament.title} - Registrations</h1>
                            <div className="mt-2 text-gray-600">
                                <p>Date: {new Date(tournament.date_time).toLocaleString()}</p>
                                <p>Status: <span className={`px-2 py-1 rounded-full text-xs
                                    ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                    tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'}`}>{tournament.status}</span></p>
                                <p>Entry Fee: {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium">Filter by status:</label>
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        
                        <button 
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            disabled={registrations.length === 0}
                        >
                            Export to CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left">Name</th>
                                    <th className="py-3 px-4 text-left">Email</th>
                                    <th className="py-3 px-4 text-left">Registration Date</th>
                                    <th className="py-3 px-4 text-left">Payment Status</th>
                                    <th className="py-3 px-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistrations.map((registration) => (
                                    <tr key={`${registration.tournament_id}-${registration.user_id}`} className="border-t hover:bg-gray-50">
                                        <td className="py-3 px-4">{registration.full_name}</td>
                                        <td className="py-3 px-4">{registration.email}</td>
                                        <td className="py-3 px-4">
                                            {new Date(registration.registration_date).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs
                                                ${registration.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                registration.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}
                                            >
                                                {registration.payment_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {tournament.entry_fee > 0 && registration.payment && (
                                                <button 
                                                    onClick={() => handleViewPayment(registration.payment.id, registration.payment.screenshot_path)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                >
                                                    View Payment
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredRegistrations.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-gray-500">
                                            No registrations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Payment Screenshot Modal */}
            {showImageModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowImageModal(false)}></div>
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative z-10">
                        <h2 className="text-xl font-bold mb-4 text-[#200e4a]">Payment Screenshot</h2>
                        
                        <div className="mb-4">
                            <img src={selectedImage} alt="Payment Screenshot" className="w-full max-h-96 object-contain border" />
                        </div>
                        
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                            >
                                Close
                            </button>
                            
                            <div className="space-x-2">
                                <button
                                    onClick={() => handleVerifyPayment('rejected')}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerifyPayment('approved')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentRegistrations;
