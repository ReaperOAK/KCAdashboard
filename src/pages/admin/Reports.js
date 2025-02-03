import React, { useState } from 'react';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0]
  });

  const generateCustomReport = async () => {
    try {
      const response = await fetch('/api/admin/custom-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType, dateRange })
      });
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Reports Generator</h1>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="p-2 border rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="attendance">Attendance Report</option>
            <option value="performance">Performance Report</option>
            <option value="engagement">Engagement Report</option>
            <option value="system">System Usage Report</option>
          </select>
          <input
            type="date"
            className="p-2 border rounded"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              start: e.target.value
            }))}
          />
          <button
            onClick={generateCustomReport}
            className="bg-[#461fa3] text-white px-4 py-2 rounded hover:bg-[#7646eb]"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Add report visualization based on reportData */}
        </div>
      )}
    </div>
  );
};

export default Reports;