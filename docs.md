# KCAdashboard – UI/UX & Accessibility Overhaul (July 2025)

## PGN Library Filters & UI (July 2025)

- Unified filter panel: Resource type (role-based) and game category filters are now dropdowns, side-by-side on desktop, stacked on mobile.
- Role-based resource categories:
  - Students: Public Resources
  - Teachers: Public Resources, My Private Resources, My Shared Resources (Private Resources won't be visible in Shared)
  - Admins: Public Resources, Resources Categorised by Coach (restricted to selected admins with specific permission)
- Permission-based access control: Admin access to "Resources Categorised by Coach" requires the `chess.manage_coach_resources` permission
- Removed redundant checkboxes for public/my games; filtering is now clear and non-redundant.
- Backend support for `resource_category` parameter with proper role-based filtering
- Accessibility, responsiveness, and design system improvements (Tailwind, colour_scheme.md).
- All components follow single-responsibility principle and are modular.

## Summary of Major Changes


### July 2025: Authentication & Session Management Backend Robustness

- All authentication forms now include a show/hide password toggle for better usability and accessibility.
- Introduced reusable `PasswordInput` and `FormikPasswordField` components (see `src/components/common/`).
- Backend session management and authentication endpoints now use absolute config paths, output buffering, and error suppression to ensure reliable JSON output even if PHP warnings occur. Frontend can extract valid JSON from such responses.


### July 2025: Teacher Leave Requests UI/UX Overhaul

- Refactored teacher leave requests table (`MyLeaveRequests.js`) for a beautiful, modern, and accessible UI.
- Added color-coded status badges, improved empty/cancelling states, and responsive design.
- Teachers now have a dedicated leave management experience in the Support Center.
- Students no longer see leave request options.

### July 2025: Report Card Upload Bugfixes & Improvements

- Fixed report card upload for both new and existing students: now uses the server-generated filename and refreshes the student list after upload.
- Improved error handling and user feedback for upload success/failure.
- Added backend logging and directory permission checks for uploads.
- Updated frontend to use the correct API and handle all edge cases.
- See also: `src/pages/teacher/docs.md`, `public/api/endpoints/grading/docs.md`, and `src/components/reportcard/docs.md` for details.

### July 2025: Classroom Materials Multiple File Upload

- Teachers can now upload multiple files at once as classroom materials.
- Each file is validated and creates a separate resource entry.
- UI shows selected file count and names, and supports mixed uploads (files + video links).
- See `material-upload-fix-summary.md` for full details.

### July 2025: Grading Workflow & Pending Grading Modal Fix


### July 2025: Class Scheduling & Timezone Improvements
- Past date scheduling is now blocked in both UI and backend.

### 1. UI/UX Modernization & Design System Enforcement

#### Registration & Role Security Policy (July 2025)
- All new user registrations are created as students only. Teacher/admin roles can only be assigned by an admin via the user management interface. This is enforced in both frontend and backend for security.
- Tournament management (create, edit, view, delete)
- Resource center for chess materials
- Quiz system (create, manage, take quizzes, leaderboards)
- Notifications and preferences
- Responsive sidebar and navigation
- Accessible UI with keyboard navigation and ARIA
- Theming with Tailwind CSS and custom color tokens
- Consistent iconography and visual feedback

#### UI/UX Principles
  - All leave request tables (teacher/admin) use color-coded status badges, responsive layouts, and clear empty/cancelling states.
- Consistent use of gradients, shadows, rounded corners, and spacing
- All interactive elements (buttons, tabs, table rows) have clear hover, focus, and active states
- Section headers include icons for clarity and visual hierarchy
- All cards, panels, and tables are fully responsive and visually grouped

#### Accessibility & Semantic HTML
- ARIA labels, roles, and improved keyboard navigation for all major components
- Semantic HTML elements (`main`, `section`, `header`, etc.) for better structure and accessibility
- Improved color contrast and focus indicators for WCAG compliance

#### Recent UI/UX & Codebase Improvements
- All chess-related pages and components refactored for a beautiful, modern, and accessible user experience

For more details on individual features, see the relevant docs in `src/components/docs.md` and subfolders.

---

## Teacher Leave Requests (July 2025)

- Teachers can view, track, and cancel their leave requests in a beautiful, modern, and accessible table with color-coded status badges and responsive design.
- Students do not see leave request options in the Support Center.

### 2. Accessibility & Semantic HTML
- Added ARIA labels, roles, and improved keyboard navigation for all major components.
- Used semantic HTML elements (`main`, `section`, `header`, etc.) for better structure and accessibility.
- Improved color contrast and focus indicators for WCAG compliance.

### 3. Performance & Modularity
- All major components are memoized with `React.memo` and use hooks for state and effects.
- Each file/component does one job only; no orphan or unreferenced files.
- Code-splitting and lazy loading for large pages.

### 4. New Features & UX Improvements
- Teacher Dashboard: Added prominent "Request Leave" button (deep-links to Support Center tab).
- Support Center: Tab selection now syncs with URL hash for deep-linking and browser navigation.
- Student Management: Report card upload/view UI is grouped, accessible, and visually clear.
- Quiz Management/Creator: All forms, tables, and sharing controls are visually grouped, accessible, and responsive.
- Analytics: All charts, stats, and export controls are visually grouped, accessible, and responsive.

### 5. File Moves & Refactors
- `SharingControls` moved to `components/quiz/` for reusability and modularity.
- All teacher pages/components updated for design system, accessibility, and modularity.

## How to Use
- All UI is fully responsive and accessible.
- Use the dashboard and management pages as before; all features are now more beautiful and user-friendly.
- Deep-link to Support Center tabs using URL hashes (e.g., `/teacher/support#leave`).

## See Also
- `colour_scheme.md` for color tokens and design system.
- `CONTRIBUTING.md` for coding and UI/UX guidelines.

---

# July 2025: UI/UX Refactor – Classroom, Quiz, Analytics, Leaderboard, Admin Dashboard

## Analytics Dashboard & Components (July 2025)

All analytics dashboard UI is now built from modular, single-responsibility React components in `src/components/analytics/` and `src/pages/admin/PlatformAnalytics.js`.

### Components
- PlatformAnalytics.js: Main analytics dashboard page, lazy-loads all analytics components, handles loading/error/empty states, and is fully responsive and accessible.
- AnalyticsSkeleton.js: Beautiful, responsive loading skeleton for analytics dashboards. Uses shimmer animation, color tokens, and ARIA roles for accessibility.
- ErrorAlert.js: Accessible, visually distinct error alert with icon, accent border, and retry button. Handles error, loading, and empty states.
- TimeRangeSelect.js: Accessible, beautiful select dropdown for time range filtering. Features accent border, dropdown icon, and smooth transitions.
- UserGrowthChart.js: Responsive, accessible line chart for user growth. Uses color tokens, improved legend, and ARIA roles.
- UserActivityChart.js: Responsive, accessible bar chart for user activity. Uses color tokens, improved legend, and ARIA roles.
- PerformanceMetricsChart.js: Responsive, accessible pie chart for performance metrics. Uses color tokens, improved legend, and ARIA roles.

All components use color tokens, are fully responsive, and follow accessibility best practices. See `src/components/analytics/docs.md` for details.

### UI/UX Patterns
- Modular, single-responsibility components for maintainability
- Consistent use of color tokens and spacing
- Loading skeletons, error/empty states, and micro-interactions
- Responsive layouts for all screen sizes
- ARIA labels and keyboard navigation for accessibility
- Lazy loading for performance

See each feature folder's README or docs for details and usage examples.

---


## Student Attendance UI Components (July 2025)

All student attendance UI is now built from modular, single-responsibility React components in `src/components/attendance/` and `src/pages/admin/StudentAttendanceList.js`.

### Components
- StudentAttendanceList.js: Container component for attendance list page. Handles data fetching, state, and business logic only.
- StudentAttendanceListView.js: Presentational component for attendance list page. Handles all UI rendering, receives all data and callbacks as props.
- StudentAttendanceTable.js: Beautiful, responsive table for student attendance summary. Alternating row backgrounds, status icons, color tokens, and accessibility improvements.
- StudentAttendanceSkeleton.js: Modern shimmer skeleton for attendance data loading.
- SearchAndBatchFilter.js: Search input and batch select, fully accessible and responsive.

All components use color tokens, are fully responsive, and follow accessibility best practices. See `src/components/attendance/docs.md` for details.

### UI/UX Patterns
- Modular, single-responsibility components for maintainability
- Consistent use of color tokens and spacing
- Loading skeletons, error/empty states, and micro-interactions
- Responsive layouts for all screen sizes
- ARIA labels and keyboard navigation for accessibility
- Lazy loading for performance

See each feature folder's README or docs for details and usage examples.

---

## Admin Dashboard UI Components (July 2025)

All admin dashboard UI is now built from modular, single-responsibility React components in `src/components/admin/`.

### Components
- StatCard.js: Animated, accessible stat card for dashboard statistics.
- LoadingState.js: Accessible loading state for admin pages.
- ErrorState.js: Error state with icon and message for admin pages.

All components use color tokens, are fully responsive, and follow accessibility best practices. See `src/components/admin/docs.md` for details.

All classroom, quiz, analytics, and leaderboard UIs are now built from modular, single-responsibility React components in their respective folders (e.g., `src/components/classroom/`, `src/components/analytics/`, `src/components/chess/`).

### Key Components
- **Classroom:** LoadingSkeleton, ErrorAlert, ClassroomCard, ViewSwitcher, ModalOverlay, ClassroomDetailLoading, ClassroomDetailError, ClassroomNotFound
- **Quiz:** TagInput, MultipleChoiceEditor, ChessQuestionEditor, SharingControls
- **Analytics:** ChartCard, QuickStats, ExportModal, LoadingSkeleton, ErrorAlert
- **Leaderboard:** LeaderboardTable, LoadingSkeleton

All components use color tokens from `colour_scheme.md`, are fully responsive, and follow accessibility best practices (ARIA, keyboard navigation, focus/hover states).

#### UI/UX Patterns
- Modular, single-responsibility components for maintainability
- Consistent use of color tokens and spacing
- Loading skeletons, error/empty states, and micro-interactions
- Responsive layouts for all screen sizes
- ARIA labels and keyboard navigation for accessibility

See each feature folder's README or docs for details and usage examples.
## Tournaments UI Components (July 2025)

All tournament-related UI is now built from modular, single-responsibility React components in `src/components/tournaments/`.

### Components
- LoadingSpinner.js: Accessible loading spinner for tournament pages.
- ErrorState.js: Error state with icon and message.
- TournamentFilterBar.js: Filter bar for tournament status, keyboard accessible.
- RegistrationButton.js: Handles registration/payment states and actions.
- TournamentCard.js: Card for displaying tournament details and actions.
- PaymentModal.js: Accessible modal for payment upload.

All components use color tokens, are fully responsive, and follow accessibility best practices. See `src/components/tournaments/README.md` for details.
# KCAdashboard Frontend – README & Documentation

## [2025-07-05] PvP Chess Timer Fix


## Overview

The KCAdashboard frontend is a modern React application that delivers a seamless experience for students, teachers, and administrators. The codebase is organized into logical folders for UI components, pages, hooks, routes, and utilities, supporting a wide range of educational, chess, and administrative features. This documentation provides a high-level overview of the structure, features, and the role of each major file and folder.


## File Structure

## User Menu & Dropdown (July 2025)

The top navigation bar features a user menu with a dropdown containing "Profile" and "Logout" actions. The dropdown is fully accessible (keyboard, ARIA, focus management), and only appears when clicking the user avatar. All actions are handled inside the dropdown for clarity and accessibility. The dropdown closes on outside click or Escape, but remains open for menu actions.

```
src/
  components/      # Reusable UI components, grouped by feature (batches, chess, classroom, etc.)
  hooks/           # Custom React hooks for shared logic
  pages/           # Top-level pages for each route and user role
  routes/          # Route definitions for different user roles
  utils/           # Utility functions and helpers
  App.js           # Main React application component
  index.js         # Entry point for the React app
  App.css, index.css # Global and app-specific styles
  setupTests.js, App.test.js # Testing setup and main app tests
  logo.svg         # Application logo asset
  reportWebVitals.js # Performance monitoring
  ...              # Other supporting files (assets, configs, etc.)
```


## Key Features



## JavaScript Files and Their Roles



## How to Use



## Extending the Platform



## For More Details

See the `docs.md` files in each folder for a breakdown of individual files and their responsibilities.


## Chess PGN Upload & Management (2025 Update)

- **PGN Upload** now supports advanced visibility controls:
  - Public (all users)
- Admins can edit/delete any PGN; teachers can edit/delete their own.
- New backend endpoints:
  - `/api/endpoints/chess/edit-pgn.php` – Edit PGN metadata and visibility
  - `/api/endpoints/chess/set-pgn-visibility.php` – Change visibility after upload
- Frontend upload form updated to allow visibility selection and batch/student assignment.
- All changes are reflected in the PGN metadata for flexible access control.

- **hooks/**: Custom hooks for authentication (`useAuth.js`), PGN viewing (`usePGNView.js`), and more.
- **pages/**: Top-level pages for each route and user role (e.g., `admin/AdminDashboard.js`, `student/StudentDashboard.js`).
- **routes/**: Route definitions for admin, chess, student, and teacher sections.
- **utils/**: Utility modules for API calls, chess engine integration, permissions, PGN handling, uploads, etc.
- **App.js**: Main application component, sets up routing and layout.
- **index.js**: Entry point, renders the React app.
- **App.css, index.css**: Global and app-specific styles.
- **setupTests.js, App.test.js**: Testing setup and main app tests.
- **logo.svg**: Application logo asset.
- **reportWebVitals.js**: Performance monitoring.

---

## How to Use

- **Run the App:** Start the React development server to launch the frontend.
- **Navigation:** Use the sidebar and top navbar to access different features based on your role.
- **API Integration:** All features interact with the backend via RESTful APIs defined in the `utils/api.js` module.

---

## Extending the Platform

- Add new features by creating new components and pages in the appropriate folders.
- Use the `utils/` folder for reusable logic and API integrations.
- Define new routes in the `routes/` folder as needed.

---

## For More Details

See the `docs.md` files in each folder for a breakdown of individual files and their responsibilities.

---

## Teacher Dashboard Modal Components

The following modal components have been extracted from `StudentManagement.js` and are now located in `src/components/teacher/`:

- **AttendanceModal**: Handles marking attendance for students. Accepts `open`, `student`, `sessions`, `onSubmit`, `onClose`, and `loading` props.
- **FeedbackModal**: Allows teachers to submit feedback for students. Accepts `open`, `student`, `feedback`, `setFeedback`, `onClose`, and `onSubmit` props.
- **FeedbackHistoryModal**: Displays a student's feedback history. Accepts `open`, `student`, `feedbackHistory`, `onClose`, `formatDate`, and `getRatingColor` props.
- **PerformanceModal**: Shows a student's performance summary. Accepts `open`, `student`, `performanceData`, `selectedTimeframe`, `onTimeframeChange`, `onClose`, `formatDate`, and `getRatingColor` props.

All modals are accessible, responsive, and follow the project's UI/UX and accessibility guidelines. See `src/components/teacher/README.md` for more details.

---

# User Management Refactor

- `BulkActionsBar` and `PermissionsModal` have been split into their own files under `src/components/user-management/` for improved modularity, maintainability, and clarity.
- `UserManagement.js` now imports these components instead of defining them inline.
- All props, accessibility, and memoization features are preserved.

_Last updated: 2024-06-11_

### Recurring Classes & Batch Schedule Automation (July 2025)
- Teachers can now schedule recurring classes based on batch schedule (days, time, duration)
- RecurringClassModal UI for previewing and generating multiple sessions at once
- Backend API endpoint for bulk session creation with conflict detection and notifications
- See `src/components/classroom/docs.md` for full details

## Enhanced Profile System (July 2025)
- FIDE ID integration, rating management, and mandatory document uploads
- Admin document verification workflow
- See ENHANCED_PROFILE_DOCUMENTATION.md for full details

## PGN Sharing Feature (July 2025)

- Teachers and admins can share PGN studies with any user (students or teachers).
- Students cannot share PGNs, but can view those shared with them in the "Shared with Me" category.
- Sharing is available via a modal with user search, batch selection, and permission level (view/edit).
- Backend enforces role and ownership checks for security.
- See `PGN_SHARING_FEATURE.md` for full details and API endpoints.

## PGN Sharing Enhancement (July 2025)

- PGNs can be shared with entire batches or students from other batches.
- Share modal allows selection of batches and cross-batch students for easy distribution.
- Backend enforces batch membership and permissions.
- See `PGN_SHARING_FEATURE.md` for details.
