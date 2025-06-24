import React from 'react';
import { useNavigate } from 'react-router-dom';

const PGNDatabase = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9] pt-16 sm:pt-20 px-2 sm:p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-[#200e4a] text-white p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold">PGN Database</h1>
                            <p className="text-sm sm:text-base text-[#e3e1f7] mt-1 sm:mt-2">
                                This feature is being rebuilt from scratch
                            </p>
                        </div>
                        <button
                            onClick={handleBack}
                            className="mt-4 sm:mt-0 bg-[#461fa3] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-[#7646eb] transition-colors text-sm sm:text-base flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L7.414 9H15a1 1 0 1 1 0 2H7.414l2.293 2.293a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </button>
                    </div>
                </div>

                <div className="p-8 sm:p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-6xl mb-6">🔧</div>
                        <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Under Construction</h2>
                        <p className="text-gray-600 mb-6">
                            The PGN database feature is currently being rebuilt from scratch. 
                            Please check back later for the new and improved version.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-2">Planned Features</h3>
                            <ul className="text-sm text-gray-600 text-left space-y-1">
                                <li>• Upload and manage PGN files</li>
                                <li>• Share games with students</li>
                                <li>• Game analysis tools</li>
                                <li>• Interactive chess viewer</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PGNDatabase;

