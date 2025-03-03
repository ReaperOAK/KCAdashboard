import React, { useState } from 'react';
import ApiService from '../utils/api';

const ExportButton = ({ reportType = 'attendance', defaultFilters = {}, buttonText = 'Export', className = '' }) => {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleExport = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            
            console.log(`Exporting ${reportType} report with filters:`, defaultFilters);
            
            // Call the API to get the report
            const blob = await ApiService.exportReport(reportType, defaultFilters);
            
            // Verify we got a valid blob
            if (!blob || blob.size === 0) {
                throw new Error('Received empty file from server');
            }
            
            // Create a download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Set filename based on export type - use .pdf extension now
            let filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Export error:', error);
            let message = error.message || 'Unknown error occurred during export';
            
            // If there's a more detailed API error message, use that instead
            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            }
            
            setErrorMessage(message);
            // Show error message for 5 seconds
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleExport}
                disabled={loading}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
                {buttonText}
            </button>
            
            {errorMessage && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default ExportButton;
