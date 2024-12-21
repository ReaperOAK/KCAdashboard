import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaCogs, FaSignOutAlt, FaChartBar, FaUsers, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';

/**
 * Sidebar component that renders navigation links based on user role.
 * @param {Object} props - Component props.
 * @param {string} props.role - The role of the user (student, teacher, admin).
 */
const Sidebar = ({ role }) => {
  const menuItems = {
    student: [
      { label: 'Dashboard', to: '/student-dashboard', icon: <FaHome /> },
      { label: 'Attendance', to: '/student-attendance', icon: <FaCalendarAlt /> },
      { label: 'Resources', to: '/resources', icon: <FaBook /> },
    ],
    teacher: [
      { label: 'Dashboard', to: '/teacher-dashboard', icon: <FaHome /> },
      { label: 'Attendance', to: '/teacher-attendance', icon: <FaCalendarAlt /> },
      { label: 'Batch Management', to: '/batch-management', icon: <FaUsers /> },
      { label: 'Grading & Feedback', to: '/grading-feedback', icon: <FaChalkboardTeacher /> },
      { label: 'Resources', to: '/resources', icon: <FaBook /> },
    ],
    admin: [
      { label: 'Dashboard', to: '/admin-dashboard', icon: <FaHome /> },
      { label: 'Attendance', to: '/admin-attendance', icon: <FaCalendarAlt /> },
      { label: 'Batch Management', to: '/batch-management', icon: <FaUsers /> },
      { label: 'Analytics & Reporting', to: '/analytics-reporting', icon: <FaChartBar /> },
      { label: 'User Management', to: '/manage-users', icon: <FaUsers /> },
    ],
  };

  const commonItems = [
    { label: 'Settings', to: '/settings', icon: <FaCogs /> },
    { label: 'Support', to: '/support', icon: <FaSignOutAlt /> },
  ];

  const renderMenu = (items) =>
    items.map((item) => (
      <li key={item.to} className="p-3 hover:bg-gray-700">
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded ${
              isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'
            }`
          }
        >
          {item.icon} <span>{item.label}</span>
        </NavLink>
      </li>
    ));

  return (
    <aside className="w-64 bg-gray-800 text-gray-300 flex flex-col h-screen">
      <div className="p-4 text-2xl font-bold text-white">Dashboard</div>
      <nav className="flex-grow">
        <ul>{role && renderMenu(menuItems[role])}</ul>
        <hr className="my-4 border-gray-700" />
        <ul>{renderMenu(commonItems)}</ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
