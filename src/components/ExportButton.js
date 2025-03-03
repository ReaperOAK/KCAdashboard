import React, { useState } from 'react';
import ApiService from '../utils/api';

const ExportButton = ({ reportType = 'attendance', defaultFilters = {}, buttonText = 'Export', className = '' }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            
            console.log(`Exporting ${reportType} report with filters:`, defaultFilters);
            
            // Call the API to get the report
            const blob = await ApiService.exportReport(reportType, defaultFilters);
            
            // Create a download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Set filename based on export type
            let filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Export error:', error);
            alert(`Export failed: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center ${className}`}
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
    );
};

export default ExportButton;
