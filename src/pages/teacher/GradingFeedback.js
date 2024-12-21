import React, { useState } from 'react';

const initialAssignments = [
  { id: 1, title: 'Math Assignment 1', status: 'Pending' },
  { id: 2, title: 'Science Project', status: 'Graded' },
  // Add more assignments as needed
];

const initialStudents = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  // Add more students as needed
];

const GradingFeedback = () => {
  const [assignments] = useState(initialAssignments);
  const [students] = useState(initialStudents);
  const [grades, setGrades] = useState({});
  const [comments, setComments] = useState({});
  const [feedback, setFeedback] = useState('');

  const handleGradeChange = (studentId, value) => {
    setGrades({ ...grades, [studentId]: value });
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
          <h2 className="text-2xl font-bold mb-4">Assignments</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Assignment Title</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td className="py-2 px-4 border-b">{assignment.title}</td>
                    <td className="py-2 px-4 border-b">{assignment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Grade Submission</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Student Name</th>
                  <th className="py-2 px-4 border-b">Grade</th>
                  <th className="py-2 px-4 border-b">Comments</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="py-2 px-4 border-b">{student.name}</td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Grade"
                        value={grades[student.id] || ''}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Comments"
                        value={comments[student.id] || ''}
                        onChange={(e) => handleCommentChange(student.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={handleSubmitGrades}
            >
              Submit Grades
            </button>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Feedback Form</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feedback">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  rows="5"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Provide personalized feedback here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GradingFeedback;