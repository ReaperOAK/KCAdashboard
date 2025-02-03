import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaCogs, FaSignOutAlt, FaChartBar, FaUsers, FaChalkboardTeacher, FaCalendarAlt, FaBars, FaTimes, FaChess, FaChessBoard, FaGamepad, FaQuestionCircle, FaTrophy, FaComments, FaDatabase, FaCalendarCheck, FaChartLine, FaLifeRing, FaVideo, FaChartPie } from 'react-icons/fa';

/**
 * Sidebar component that renders navigation links based on user role.
 * @param {Object} props - Component props.
 * @param {string} props.role - The role of the user (student, teacher, admin).
 */
const Sidebar = ({ role, isSidebarOpen, toggleSidebar }) => {
  const menuItems = {
    student: [
      { label: 'Dashboard', to: '/student-dashboard', icon: <FaHome /> },
      { label: 'Attendance', to: '/student-attendance', icon: <FaCalendarAlt /> },
      { label: 'Resources', to: '/resources', icon: <FaBook /> },
      { label: 'Simul Games', to: '/simul-games', icon: <FaChess /> },
      { label: 'Classroom', to: '/classroom', icon: <FaChalkboardTeacher /> },
      { label: 'Studies', to: '/studies', icon: <FaBook /> },
      { label: 'Interactive Board', to: '/interactive-board', icon: <FaChessBoard /> },
      { label: 'Game Area', to: '/game-area', icon: <FaGamepad /> },
      { label: 'Quiz Page', to: '/quiz-page', icon: <FaQuestionCircle /> },
      { label: 'Tournaments Page', to: '/tournaments-page', icon: <FaTrophy /> },
      { label: 'Chat Page', to: '/chat-page', icon: <FaComments /> },
      { label: 'Live Classes', to: '/live-classes', icon: <FaVideo /> },
      { label: 'Performance', to: '/performance', icon: <FaChartLine /> },
      { label: 'Practice', to: '/practice', icon: <FaChessBoard /> },
      { label: 'Resources', to: '/resources', icon: <FaBook /> },
    ],
    teacher: [
      { label: 'Dashboard', to: '/teacher-dashboard', icon: <FaHome /> },
      { label: 'Attendance', to: '/teacher-attendance', icon: <FaCalendarAlt /> },
      { label: 'Batch Management', to: '/batch-management', icon: <FaUsers /> },
      { label: 'Grading & Feedback', to: '/grading-feedback', icon: <FaChalkboardTeacher /> },
      { label: 'Reports & Analytics', to: '/reports-analytics', icon: <FaChartBar /> },
      { label: 'PGN Database', to: '/pgn-database', icon: <FaDatabase /> },
      { label: 'Classroom Management', to: '/classroom-management', icon: <FaChalkboardTeacher /> },
      { label: 'Live Sessions', to: '/live-sessions', icon: <FaVideo /> },
      { label: 'Student Progress', to: '/student-progress', icon: <FaChartLine /> },
      { label: 'Resource Management', to: '/resource-management', icon: <FaBook /> },
    ],
    admin: [
      { label: 'Dashboard', to: '/admin-dashboard', icon: <FaHome /> },
      { label: 'Attendance', to: '/admin-attendance', icon: <FaCalendarAlt /> },
      { label: 'Batch Management', to: '/batch-management', icon: <FaUsers /> },
      { label: 'Analytics & Reporting', to: '/analytics-reporting', icon: <FaChartBar /> },
      { label: 'User Management', to: '/manage-users', icon: <FaUsers /> },
      { label: 'Attendance System', to: '/attendance-system', icon: <FaCalendarCheck /> },
      { label: 'Platform Analytics', to: '/platform-analytics', icon: <FaChartLine /> },
      { label: 'Support System', to: '/support-system', icon: <FaLifeRing /> },
      { label: 'System Settings', to: '/system-settings', icon: <FaCogs /> },
      { label: 'User Analytics', to: '/user-analytics', icon: <FaChartPie /> },
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
              isActive ? 'bg-accent text-white' : 'text-gray-300 hover:text-white'
            }`
          }
        >
          {item.icon} <span>{item.label}</span>
        </NavLink>
      </li>
    ));

  return (
    <>
      <button
        className={`md:hidden fixed top-16 ${isSidebarOpen ? 'left-64' : 'left-0'} p-4 focus:outline-none z-50 transition-transform duration-300 ease-in-out`}
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>
      <aside className={`fixed top-16 left-0 h-full bg-[#200e4a] text-[#e3e1f7] flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-64 z-40`}>
        <nav className="flex-grow pt-16 md:pt-0"> {/* Add padding to the top only in mobile view */}
          <ul>{role && renderMenu(menuItems[role])}</ul>
          <ul>{renderMenu(commonItems)}</ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;