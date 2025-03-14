import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import LichessApi from '../../utils/lichessApi';

const LichessConnectPage = () => {
    const navigate = useNavigate();
    const [connected, setConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user already has a connected Lichess account
        const checkConnection = async () => {
            try {
                const response = await ApiService.get('/user/lichess-status.php');
                if (response.success && response.connected) {
                    setConnected(true);
                    setUsername(response.username);
                }
            } catch (error) {
                console.error('Error checking Lichess connection:', error);
                setError('Failed to check Lichess connection status');
            } finally {
                setLoading(false);
            }
        };

        checkConnection();
    }, []);

    const handleConnect = () => {
        // Generate a random state string for security
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('lichess_oauth_state', state);

        // Generate code verifier and challenge for PKCE
        const codeVerifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('lichess_code_verifier', codeVerifier);

        // In a real implementation, you should compute the code challenge using SHA-256
        // For simplicity, we're using the verifier as the challenge here
        const codeChallenge = codeVerifier;

        // Define OAuth parameters
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: 'kca_dashboard',
            redirect_uri: `${window.location.origin}/lichess-callback`,
            scope: 'preference:read email:read challenge:read challenge:write puzzle:read',
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'plain' // In production, use 'S256'
        });

        // Redirect to Lichess OAuth page
        window.location.href = `https://lichess.org/oauth?${params.toString()}`;
    };

    const handleDisconnect = async () => {
        try {
            setLoading(true);
            const response = await ApiService.post('/user/disconnect-lichess.php');
            if (response.success) {
                setConnected(false);
                setUsername('');
            } else {
                setError(response.message || 'Failed to disconnect Lichess account');
            }
        } catch (error) {
            console.error('Error disconnecting Lichess:', error);
            setError('Failed to disconnect Lichess account');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f3f1f9]">
                <div className="p-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <h1 className="text-3xl font-bold text-[#200e4a] mb-6">Lichess Integration</h1>

                {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center mb-6">
                        <img src="https://lichess.org/assets/logo/lichess-favicon-32.png" alt="Lichess Logo" className="w-12 h-12 mr-4" />
                        <div>
                            <h2 className="text-xl font-semibold text-[#461fa3]">Lichess.org</h2>
                            <p className="text-gray-600">Connect your Lichess account to access all features</p>
                        </div>
                    </div>

                    {connected ? (
                        <div>
                            <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg mb-6">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div>
                                    <p className="font-medium">Connected as {username}</p>
                                    <p className="text-sm">Your account is successfully linked with Lichess</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <a 
                                    href={`https://lichess.org/@/${username}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#461fa3] hover:text-[#7646eb] font-medium"
                                >
                                    View Lichess Profile →
                                </a>
                                <button 
                                    onClick={handleDisconnect}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Disconnect Account
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-6">
                                Connecting your Lichess account allows you to:
                            </p>
                            <ul className="list-disc pl-6 mb-6 space-y-2">
                                <li>Participate in online tournaments directly from the dashboard</li>
                                <li>Access your Lichess games history</li>
                                <li>Join simul events with coaches</li>
                                <li>Sync your puzzle progress</li>
                                <li>Access your Lichess studies</li>
                            </ul>
                            <button 
                                onClick={handleConnect}
                                className="w-full py-3 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors font-medium"
                            >
                                Connect Lichess Account
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-[#461fa3] mb-4">Privacy Information</h3>
                    <p className="text-gray-600 mb-4">
                        When connecting your Lichess account, we request only the minimum permissions required to provide 
                        functionality within our platform. We do not store your Lichess password or have the ability to modify 
                        your Lichess account settings.
                    </p>
                    <p className="text-gray-600">
                        You can disconnect your account at any time, which will revoke all access permissions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LichessConnectPage;
