import React, { useState, useEffect } from 'react';

/**
 * AdminAttendance component handles attendance policies and reporting.
 */
const AdminAttendance = () => {
  const [policies, setPolicies] = useState({ threshold: 75, reminder: 3 });
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch attendance policies and reports on component mount
    const fetchAttendanceData = async () => {
      try {
        const policiesResponse = await fetch('/php/get-attendance-policies.php');
        const reportsResponse = await fetch('/php/get-batch-attendance-reports.php');
        const overviewResponse = await fetch('/php/get-attendance-overview.php');

        if (!policiesResponse.ok || !reportsResponse.ok || !overviewResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const policiesData = await policiesResponse.json();
        const reportsData = await reportsResponse.json();
        const overviewData = await overviewResponse.json();

        setPolicies(policiesData);
        setAttendanceReports(reportsData);
        setAttendanceOverview(overviewData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleSavePolicies = async () => {
    try {
      const response = await fetch('/php/save-attendance-policies.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policies),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        alert('Policies saved successfully');
      } else {
        alert('Error saving policies: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving policies:', error);
      alert('An error occurred while saving policies.');
    }
  };

  const handleExport = (format) => {
    // Implement export functionality here
    alert(`Exporting attendance data to ${format}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Policies</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Configure attendance thresholds and reminders.</p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="threshold">
                Attendance Threshold (%)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="threshold"
                type="number"
                value={policies.threshold}
                onChange={(e) => setPolicies({ ...policies, threshold: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reminder">
                Reminder Days
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="reminder"
                type="number"
                value={policies.reminder}
                onChange={(e) => setPolicies({ ...policies, reminder: e.target.value })}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={handleSavePolicies}
            >
              Save Policies
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Batch-Wide Attendance Reports</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>View and export attendance for classes, students, or teachers.</p>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Batch Name</th>
                  <th className="py-2 px-4 border-b">Attendance Percentage</th>
                </tr>
              </thead>
              <tbody>
                {attendanceReports.map((report) => (
                  <tr key={report.batchId}>
                    <td className="py-2 px-4 border-b">{report.batchName}</td>
                    <td className="py-2 px-4 border-b">{report.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={() => handleExport('PDF')}
            >
              Export Report
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Export Options</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
              onClick={() => handleExport('PDF')}
            >
              Export to PDF
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => handleExport('Excel')}
            >
              Export to Excel
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Overview</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>View attendance statistics and trends.</p>
            <div className="mt-4">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Month</th>
                    <th className="py-2 px-4 border-b">Average Attendance (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceOverview.map((overview) => (
                    <tr key={overview.month}>
                      <td className="py-2 px-4 border-b">{overview.month}</td>
                      <td className="py-2 px-4 border-b">{overview.average}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminAttendance;