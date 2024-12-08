import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Sidebar component that renders navigation links based on user role.
 * @param {Object} props - Component props.
 * @param {string} props.role - The role of the user (student, teacher, admin).
 */
const Sidebar = ({ role }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold">Dashboard</div>
      <nav className="flex-grow">
        <ul>
          {role === 'student' && (
            <>
              <li className="p-4 hover:bg-gray-700"><Link to="/student-dashboard">Student Dashboard</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/student-attendance">Student Attendance</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/resources">Resources</Link></li>
            </>
          )}
          {role === 'teacher' && (
            <>
              <li className="p-4 hover:bg-gray-700"><Link to="/teacher-dashboard">Teacher Dashboard</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/teacher-attendance">Teacher Attendance</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/batch-management">Batch Management</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/grading-feedback">Grading & Feedback</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/resources">Resources</Link></li>
            </>
          )}
          {role === 'admin' && (
            <>
              <li className="p-4 hover:bg-gray-700"><Link to="/admin-dashboard">Admin Dashboard</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/admin-attendance">Admin Attendance</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/batch-management">Batch Management</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/analytics-reporting">Analytics & Reporting</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/manage-users">User Management</Link></li>
              <li className="p-4 hover:bg-gray-700"><Link to="/support">Support</Link></li>
            </>
          )}
          <li className="p-4 hover:bg-gray-700"><Link to="/settings">Settings</Link></li>
          <li className="p-4 hover:bg-gray-700"><Link to="/support">Support</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;