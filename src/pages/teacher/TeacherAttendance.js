import React, { useState, useEffect } from 'react';

const TeacherAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/php/get-students.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStudents(data);
        const initialAttendance = data.reduce((acc, student) => {
          acc[student.id] = { present: false, absent: false };
          return acc;
        }, {});
        setAttendance(initialAttendance);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAttendanceChange = (studentId, type) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        present: type === 'present' ? !prev[studentId].present : false,
        absent: type === 'absent' ? !prev[studentId].absent : false,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    setAttendance((prev) =>
      Object.keys(prev).reduce((acc, studentId) => {
        acc[studentId] = { present: true, absent: false };
        return acc;
      }, {})
    );
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
          <h2 className="text-2xl font-bold mb-4">Attendance Marking</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
              onClick={handleMarkAllPresent}
            >
              Mark All Present
            </button>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Student Name</th>
                  <th className="py-2 px-4 border-b">Present</th>
                  <th className="py-2 px-4 border-b">Absent</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="py-2 px-4 border-b">{student.name}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <input
                        type="checkbox"
                        checked={attendance[student.id]?.present || false}
                        onChange={() => handleAttendanceChange(student.id, 'present')}
                      />
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <input
                        type="checkbox"
                        checked={attendance[student.id]?.absent || false}
                        onChange={() => handleAttendanceChange(student.id, 'absent')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Attendance Analytics</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p>Graphical representation of attendance trends will be here.</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4">
              Generate Report
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
      </main>
    </div>
  );
};

export default TeacherAttendance;