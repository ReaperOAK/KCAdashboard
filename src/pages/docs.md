## July 2025 Student UI/UX Overhaul
- All student-facing pages (dashboard, classroom, feedback, leaderboard, quiz, report card, resource center, tournaments) have been refactored for:
  - Strict adherence to the KCA color system and Tailwind config (see `../../colour_scheme.md`)
  - Modular, single-responsibility, and fully accessible design
  - Responsive layouts and semantic HTML
  - ARIA roles, keyboard navigation, and color contrast
  - Animated transitions for interactive elements
  - Consistent use of cards, panels, tables, and badges
  - All states (loading, error, empty, data) handled beautifully and accessibly

# Admin Support & Ticketing UI/UX Refactor (2025-07-14)
#
# See `src/components/support/docs.md` for full details on the support/admin UI/UX refactor, including leave requests, ticketing, FAQ, and modal improvements.
## Student Attendance Page (Admin)

- **StudentAttendanceList.js** (admin/):
  - Container component for the admin student attendance page. Handles data fetching, state, and business logic only. Delegates all UI rendering to `StudentAttendanceListView.js`.
  - Uses React.memo, useCallback, and useMemo for performance.
  - Handles loading, error, and empty states with clear feedback and retry option.
  - All color classes use design tokens from `colour_scheme.md` and `tailwind.config.js`.
  - Follows single-responsibility and performance best practices.

- **StudentAttendanceListView.js** (components/attendance/):
  - Presentational component for the admin student attendance page. Handles all UI rendering, receives all data and callbacks as props. No business logic or data fetching.
  - Fully responsive, accessible, and beautiful. Uses color tokens, ARIA, and keyboard navigation.
  - Handles all UI states (loading, error, empty, data) with clear, modern visuals.
  - Follows single-responsibility and performance best practices.

- **StudentAttendanceTable.js** (components/attendance/):
  - Beautiful, responsive table for student attendance summary. Alternating row backgrounds, status icons, color tokens, and accessibility improvements.
  - Props: `students` (array of student objects)

- **StudentAttendanceSkeleton.js** (components/attendance/):
  - Modern shimmer skeleton for attendance data loading.
  - Props: none

- **SearchAndBatchFilter.js** (components/attendance/):
  - Search input and batch select, fully accessible and responsive.
  - Props: `searchTerm`, `onSearch`, `selectedBatch`, `onBatchChange`, `batches`

All components use color tokens, are fully responsive, and follow accessibility best practices. See `src/components/attendance/docs.md` for details.
# Chess PGN Management Page Refactor (2025-07-11)

- Modularized `PGNManagementPage.js` by extracting:
  - `FeatureHighlights` (now in `components/chess/FeatureHighlights.js`)
  - `TabNav` (now in `components/chess/TabNav.js`)
  - `QuickActions` (now in `components/chess/QuickActions.js`)
  - `UploadHelpSection` (now in `components/chess/UploadHelpSection.js`)
- Updated all color classes to use design tokens from `colour_scheme.md` and `tailwind.config.js`.
- Improved accessibility, responsiveness, and UI/UX polish for all subcomponents.
- All interactive elements now have clear focus, hover, and active states.
- Updated documentation and changelog accordingly.

# KCAdashboard Frontend – Pages Documentation

## Overview

The `pages` folder contains all top-level page components for the KCAdashboard frontend. Each file or subfolder represents a distinct route or section of the application, such as authentication, user profile, admin dashboard, chess features, notifications, and role-specific dashboards for students and teachers. Pages are responsible for orchestrating data fetching, state management, and rendering the appropriate UI components for each section.

---

## File Structure

```
pages/
  Profile.js           # User profile page
  admin/               # Admin dashboard and management pages
  auth/                # Authentication pages (login, register, reset, verify)
  chess/               # Chess-related pages (game area, PGN management, etc.)
  notifications/       # Notification preferences and management
  student/             # Student dashboard, quizzes, resources, reports, etc.
  teacher/             # Teacher dashboard, batch/classroom management, grading, etc.
```

---

## File Explanations

- **Profile.js**  
  The user profile page. Allows users to view and update their personal information (name, email) using a form powered by Formik and Yup for validation. Integrates with the authentication context to update user data.

- **admin/**  
  Contains all admin-facing pages, including dashboards, analytics, user management, attendance, tournaments, and support systems.

- **auth/**  
  Handles authentication flows: login, registration, password reset, and email verification.

- **chess/**  
  Chess features such as playing games, viewing PGN files, and interactive boards.

- **notifications/**  
  Pages for managing notification preferences and viewing notifications.

- **student/**  
  Student dashboard, classroom pages, quizzes, resources, leaderboard, report cards, and tournament participation.

- **teacher/**  
  Teacher dashboard, batch and classroom management, quiz creation, grading, and analytics.

- **AttendanceSettings.js (admin/)**  
  The admin attendance settings page. Orchestrates state, loading, error, and success feedback for attendance settings. Uses modular components (`SettingsForm`, `ErrorAlert`, `AttendanceSettingsSkeleton`) for a beautiful, accessible, and responsive UI. All color classes use design tokens from `colour_scheme.md` and `tailwind.config.js`. Follows single-responsibility and performance best practices.
  - **2025-07**: AttendanceSystem, StudentAttendanceHistory, and related components now feature a fully modular, beautiful, and responsive UI. Controls and headings stack or wrap at all breakpoints, including half-screen and 8:9 aspect ratios. StudentAttendanceHistory now handles loading, error, and empty states with clear feedback and retry. All UI uses the design system and is optimized for performance and accessibility.

---

## Features

- **Route-Based Organization:** Each file or subfolder maps to a route in the application.
- **Role-Specific Pages:** Separate folders for admin, student, and teacher experiences.
- **Form Handling:** Uses Formik and Yup for robust form validation and state management (e.g., Profile.js).
- **Modular Structure:** Pages import and compose reusable components and hooks.
- **Separation of Concerns:** Pages handle orchestration, while components handle UI and logic.

---

## How Pages Work

- Each page is typically mapped to a route using React Router.
- Pages fetch data, manage state, and render the appropriate UI for their section.
- Subfolders group related pages for each user role or feature area.

---

## Example Usage

**Profile Page:**
```
import Profile from './pages/Profile';
<Route path="/profile" element={<Profile />} />
```

**Admin Dashboard:**
```
import AdminDashboard from './pages/admin/AdminDashboard';
<Route path="/admin" element={<AdminDashboard />} />
```

---

## Best Practices

- Keep page components focused on orchestration; delegate UI and logic to child components and hooks.
- Use subfolders to organize pages by user role or feature area for maintainability.
- Validate all user input in forms and handle errors gracefully.
- Use React Router for clean, maintainable routing.

---

## Troubleshooting

- **Page not rendering:** Check route configuration and file/component exports.
- **Form errors:** Ensure Formik and Yup schemas are correctly set up and error messages are displayed.
- **Data not loading:** Verify data fetching logic and API endpoints.

---

# [2025-07-11] PGNGameView UI/UX & Accessibility Refactor

- Refactored `PGNGameView.js` for beautiful, accessible, and responsive UI.
- All color classes now use design tokens from `colour_scheme.md` and `tailwind.config.js`.
- Improved error, loading, and button states for clarity and accessibility.
- Added ARIA labels and focus states for navigation and feedback.
- File remains single-responsibility and optimized for performance.

---

---

## July 2025: Admin Leave Requests & Support UI/UX Refactor

- All admin leave requests and support pages/components (`LeaveRequestsAdmin.js`, `LeaveRequestsTable.js`, `LeaveRequestRow.js`, `LeaveRequestsSkeleton.js`, `ErrorAlert.js`, `EmptyState.js`) have been refactored for a beautiful, modern, and accessible UI/UX.
- See `components/support/docs.md` for full documentation and usage details.

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
