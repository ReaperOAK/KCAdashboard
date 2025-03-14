import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const LichessCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUser } = useAuth();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Parse the query string for code and state
                const queryParams = new URLSearchParams(location.search);
                const code = queryParams.get('code');
                const state = queryParams.get('state');
                const error = queryParams.get('error');
                
                if (error) {
                    throw new Error(`Lichess authorization error: ${error}`);
                }
                
                if (!code) {
                    throw new Error('No authorization code received from Lichess');
                }
                
                // Verify state parameter to prevent CSRF attacks
                const savedState = localStorage.getItem('lichess_oauth_state');
                
                if (!savedState || state !== savedState) {
                    throw new Error('OAuth state mismatch. Authorization attempt may have been compromised.');
                }
                
                // Clear the stored state
                localStorage.removeItem('lichess_oauth_state');
                
                // Exchange the code for an access token
                const response = await ApiService.post('/user/connect-lichess.php', { 
                    code: code,
                    code_verifier: localStorage.getItem('lichess_code_verifier')
                });
                
                // Clear the stored code verifier
                localStorage.removeItem('lichess_code_verifier');
                
                if (!response.success) {
                    throw new Error(response.message || 'Failed to connect Lichess account');
                }
                
                // Update user context if needed
                await updateUser();
                
                // Show success briefly before redirecting
                setTimeout(() => {
                    navigate('/student/profile', { 
                        state: { 
                            lichessConnected: true,
                            lichessUsername: response.username
                        }
                    });
                }, 1500);
                
            } catch (err) {
                console.error('Lichess OAuth Error:', err);
                setError(err.message);
                setProcessing(false);
            }
        };

        handleOAuthCallback();
    }, [location.search, navigate, updateUser]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#f3f1f9] flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                    <div className="text-red-600 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-semibold text-lg">Error</span>
                    </div>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/student/profile')}
                        className="w-full py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                    >
                        Back to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f1f9] flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                <div className="flex justify-center">
                    <img src="https://lichess.org/assets/logo/lichess-favicon-32.png" alt="Lichess Logo" className="w-16 h-16 mb-4" />
                </div>
                {processing ? (
                    <>
                        <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Connecting to Lichess</h2>
                        <p className="text-gray-600 mb-4">Please wait while we complete the connection...</p>
                        <div className="flex justify-center">
                            <div className="w-12 h-12 border-t-4 border-[#461fa3] border-solid rounded-full animate-spin"></div>
                        </div>
                    </>
                ) : (
                    <>
                        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Successfully Connected!</h2>
                        <p className="text-gray-600 mb-4">Your Lichess account has been connected.</p>
                        <p className="text-gray-600 mb-4">Redirecting to your profile...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default LichessCallback;
