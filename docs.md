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
