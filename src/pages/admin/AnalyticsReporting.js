import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * AnalyticsReporting component displays analytics data and provides export options.
 */
const AnalyticsReporting = () => {
  const [attendanceData, setAttendanceData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Attendance Percentage',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  });
  const [gradesData, setGradesData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Average Grades',
        data: [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch analytics data from the server
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('/php/get-analytics-data.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAttendanceData({
          labels: data.attendanceTrends.map(item => item.month),
          datasets: [
            {
              label: 'Attendance Percentage',
              data: data.attendanceTrends.map(item => item.average),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        });
        setGradesData({
          labels: data.gradesData.map(item => item.subject),
          datasets: [
            {
              label: 'Average Grades',
              data: data.gradesData.map(item => item.average),
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
            },
          ],
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  /**
   * Handles export functionality.
   * @param {string} format - Export format (PDF or Excel)
   */
  const handleExport = (format) => {
    // Implement export functionality here
    alert(`Exporting data to ${format}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1f9] p-8">
      <main className="flex-grow">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Attendance Trends</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Line data={attendanceData} />
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Student Grades</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Line data={gradesData} />
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Export Options</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <button
              className="bg-[#200e4a] hover:bg-[#461fa3] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
              onClick={() => handleExport('PDF')}
            >
              Export to PDF
            </button>
            <button
              className="bg-[#32CD32] hover:bg-[#228B22] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => handleExport('Excel')}
            >
              Export to Excel
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Additional Analytics</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Additional analytics and insights will be displayed here.</p>
            {/* Placeholder for additional analytics content */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AnalyticsReporting;