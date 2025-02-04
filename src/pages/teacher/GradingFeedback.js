import React, { useState } from 'react';

const initialAssignments = [
  { id: 1, title: 'Opening Analysis: Sicilian Defense', type: 'pgn', status: 'Pending' },
  { id: 2, title: 'Endgame Study: King and Pawn', type: 'puzzle', status: 'Graded' },
  { id: 3, title: 'Tournament Performance Review', type: 'analysis', status: 'Pending' }
];

const initialStudents = [
  { id: 1, name: 'John Doe', rating: 1200 },
  { id: 2, name: 'Jane Smith', rating: 1450 }
];

const GradingFeedback = () => {
  const [assignments] = useState(initialAssignments);
  const [students] = useState(initialStudents);
  const [grades, setGrades] = useState({});
  const [comments, setComments] = useState({});
  const [feedback, setFeedback] = useState('');

  const handleGradeChange = (studentId, value) => {
    // Validate chess rating changes (0-3000 range)
    const rating = parseInt(value);
    if (isNaN(rating) || rating < 0 || rating > 3000) return;
    setGrades({ ...grades, [studentId]: rating });
  };

  const handleCommentChange = (studentId, value) => {
    setComments({ ...comments, [studentId]: value });
  };

  const handleSubmitGrades = () => {
    // Implement grade submission functionality here
    console.log('Grades submitted:', grades);
    console.log('Comments submitted:', comments);
    alert('Grades and comments submitted successfully');
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    // Implement feedback submission functionality here
    console.log('Feedback submitted:', feedback);
    alert('Feedback submitted successfully');
    setFeedback('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Chess Assignments</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Assignment</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td className="py-2 px-4 border-b">{assignment.title}</td>
                    <td className="py-2 px-4 border-b">{assignment.type}</td>
                    <td className="py-2 px-4 border-b">{assignment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Student Performance</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Student</th>
                  <th className="py-2 px-4 border-b">Current Rating</th>
                  <th className="py-2 px-4 border-b">New Rating</th>
                  <th className="py-2 px-4 border-b">Analysis</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="py-2 px-4 border-b">{student.name}</td>
                    <td className="py-2 px-4 border-b">{student.rating}</td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        min="0"
                        max="3000"
                        className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="New Rating"
                        value={grades[student.id] || ''}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Game analysis and improvement areas..."
                        value={comments[student.id] || ''}
                        onChange={(e) => handleCommentChange(student.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="bg-[#200e4a] hover:bg-[#461fa3] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={handleSubmitGrades}
            >
              Update Ratings
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Game Analysis Feedback</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-4">
                <textarea
                  id="feedback"
                  rows="5"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Provide detailed game analysis, opening improvements, tactical opportunities..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>
              <button
                className="bg-[#200e4a] hover:bg-[#461fa3] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Submit Analysis
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GradingFeedback;