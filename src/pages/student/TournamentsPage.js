import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const TournamentsPage = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [registrations, setRegistrations] = useState({});
    const [paymentModal, setPaymentModal] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    
    // Call useAuth without destructuring to avoid empty object pattern warning
    useAuth(); // We keep useAuth for authentication state

    const filters = [
        { id: 'all', label: 'All Tournaments' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'ongoing', label: 'Ongoing' },
        { id: 'completed', label: 'Completed' }
    ];

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                setLoading(true);
                const endpoint = activeFilter === 'all' 
                    ? '/tournaments/get-all.php'
                    : `/tournaments/get-by-status.php?status=${activeFilter}`;
                
                const response = await ApiService.get(endpoint);
                setTournaments(response.tournaments);
                
                // Fetch all registrations in one call
                await fetchRegistrationStatus();
                
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch tournaments');
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [activeFilter]);

    const fetchRegistrationStatus = async () => {
        try {
            const response = await ApiService.get('/tournaments/registration-status.php');
            const registrationMap = {};
            
            response.registrations.forEach(reg => {
                registrationMap[reg.tournament_id] = reg;
            });
            
            setRegistrations(registrationMap);
        } catch (error) {
            console.error('Error fetching registration status:', error);
        }
    };

    const handleRegister = async (tournament) => {
        try {
            // If tournament has entry fee, show payment modal first
            if (tournament.entry_fee > 0) {
                setSelectedTournament(tournament);
                setPaymentModal(true);
            } else {
                // For free tournaments, directly register
                await ApiService.post('/tournaments/register.php', { tournament_id: tournament.id });
                await fetchRegistrationStatus();
            }
        } catch (error) {
            setError('Failed to register for tournament');
        }
    };

    const handleCancelRegistration = async (tournamentId) => {
        try {
            await ApiService.post('/tournaments/cancel-registration.php', { tournament_id: tournamentId });
            await fetchRegistrationStatus();
        } catch (error) {
            setError('Failed to cancel registration');
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        
        if (!paymentScreenshot) {
            setError("Please upload payment screenshot");
            return;
        }
        
        try {
            setPaymentLoading(true);
            const formData = new FormData();
            formData.append('tournament_id', selectedTournament.id);
            formData.append('payment_screenshot', paymentScreenshot);
            
            await ApiService.postFormData('/tournaments/payment-initiate.php', formData);
            setPaymentModal(false);
            setSelectedTournament(null);
            setPaymentScreenshot(null);
            await fetchRegistrationStatus();
            
            setPaymentLoading(false);
        } catch (error) {
            setError('Failed to process payment');
            setPaymentLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentScreenshot(e.target.files[0]);
        }
    };

    const getRegistrationStatus = (tournamentId) => {
        if (!registrations[tournamentId]) return null;
        return registrations[tournamentId].payment_status;
    };

    const renderRegistrationButton = (tournament) => {
        const registrationStatus = getRegistrationStatus(tournament.id);
        
        if (registrationStatus === 'pending') {
            return (
                <div className="space-y-2">
                    <span className="block text-sm text-amber-600 font-medium">Payment verification pending</span>
                    <button 
                        onClick={() => handleCancelRegistration(tournament.id)}
                        className="w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                        Cancel Registration
                    </button>
                </div>
            );
        } else if (registrationStatus === 'completed') {
            return (
                <span className="block text-sm text-green-600 font-medium">
                    Registration confirmed ✓
                </span>
            );
        } else if (registrationStatus === 'refunded') {
            return (
                <span className="block text-sm text-gray-600 font-medium">
                    Registration cancelled (refunded)
                </span>
            );
        } else {
            return (
                <button 
                    onClick={() => handleRegister(tournament)}
                    className="w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                >
                    Register Now
                </button>
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Chess Tournaments</h1>
                    <div className="flex space-x-4">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${activeFilter === filter.id
                                        ? 'bg-[#461fa3] text-white'
                                        : 'bg-white text-[#461fa3] hover:bg-[#461fa3] hover:text-white'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((tournament) => (
                            <div
                                key={tournament.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-[#461fa3]">
                                            {tournament.title}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs
                                            ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                            tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                        >
                                            {tournament.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4">{tournament.description}</p>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <p>📅 {new Date(tournament.date_time).toLocaleString()}</p>
                                        <p>📍 {tournament.location || 'Online'}</p>
                                        <p>💰 Entry Fee: {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
                                        <p>🏆 Prize Pool: ₹{tournament.prize_pool}</p>
                                        <p>👥 Participants: {tournament.participant_count || 0} {tournament.max_participants ? `/ ${tournament.max_participants}` : ''}</p>
                                        <p>👤 Organizer: {tournament.organizer_name}</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t">
                                    {tournament.status === 'upcoming' && renderRegistrationButton(tournament)}
                                    {tournament.status === 'ongoing' && tournament.type === 'online' && getRegistrationStatus(tournament.id) === 'completed' && (
                                        <a 
                                            href={`https://lichess.org/tournament/${tournament.lichess_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                        >
                                            Join Tournament
                                        </a>
                                    )}
                                    {tournament.status === 'completed' && (
                                        <a 
                                            href={`/student/tournament/${tournament.id}/results`}
                                            className="block w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-[#461fa3] bg-white border-[#461fa3] hover:bg-[#f3f1f9]"
                                        >
                                            View Results
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {paymentModal && selectedTournament && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-[#200e4a]">
                            Payment for {selectedTournament.title}
                        </h2>
                        
                        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                            <p className="font-medium">Amount: ₹{selectedTournament.entry_fee}</p>
                            <p className="text-sm mt-2">Please make payment using UPI to:</p>
                            <p className="font-bold mt-1">kca@upi</p>
                            
                            <div className="mt-4 flex justify-center">
                                <img 
                                    src="/qr-code-placeholder.png" 
                                    alt="Payment QR Code" 
                                    className="w-40 h-40 border border-gray-300"
                                />
                            </div>
                        </div>
                        
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Payment Screenshot:
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Please upload a screenshot of your successful payment
                                </p>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentModal(false);
                                        setSelectedTournament(null);
                                        setPaymentScreenshot(null);
                                    }}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    disabled={paymentLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                    disabled={paymentLoading || !paymentScreenshot}
                                >
                                    {paymentLoading ? 'Processing...' : 'Submit Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentsPage;
