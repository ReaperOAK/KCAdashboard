import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const attendanceData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Attendance Percentage',
      data: [85, 90, 80, 75, 95, 85, 90],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
  ],
};

const gradesData = {
  labels: ['Math', 'Science', 'History', 'English', 'Art'],
  datasets: [
    {
      label: 'Average Grades',
      data: [85, 90, 80, 75, 95],
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
    },
  ],
};

/**
 * AnalyticsReporting component displays analytics data and provides export options.
 */
const AnalyticsReporting = () => {
  /**
   * Handles export functionality.
   * @param {string} format - Export format (PDF or Excel)
   */
  const handleExport = (format) => {
    // Implement export functionality here
    alert(`Exporting data to ${format}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Trends</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Line data={attendanceData} />
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Student Grades</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Line data={gradesData} />
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
          <h2 className="text-2xl font-bold mb-4">Additional Analytics</h2>
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