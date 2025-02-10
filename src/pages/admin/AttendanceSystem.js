import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const AttendanceSystem = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [zoomIntegration, setZoomIntegration] = useState({
    enabled: false,
    autoSync: false
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedBatch]);

  const fetchAttendanceData = async () => {
    try {
      const url = `/php/attendance.php${selectedBatch ? `?batchId=${selectedBatch}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const handleZoomSync = async () => {
    try {
      const response = await fetch('/php/attendance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'syncZoom',
          batchId: selectedBatch 
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('Attendance synced successfully');
        fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error syncing attendance:', error);
      alert('Failed to sync attendance');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Attendance System</h1>
      
      {/* Zoom Integration Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Zoom Integration</h2>
        <div className="flex items-center gap-4 mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-[#7646eb]"
              checked={zoomIntegration.enabled}
              onChange={(e) => setZoomIntegration(prev => ({
                ...prev,
                enabled: e.target.checked
              }))}
            />
            <span className="ml-2">Enable Zoom Integration</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-[#7646eb]"
              checked={zoomIntegration.autoSync}
              onChange={(e) => setZoomIntegration(prev => ({
                ...prev,
                autoSync: e.target.checked
              }))}
            />
            <span className="ml-2">Auto-sync Attendance</span>
          </label>
          <button
            onClick={handleZoomSync}
            className="bg-[#461fa3] text-white px-4 py-2 rounded hover:bg-[#7646eb]"
          >
            Sync Now
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={attendanceData}
          height="auto"
        />
      </div>
    </div>
  );
};

export default AttendanceSystem;