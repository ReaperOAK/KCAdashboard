# Kolkata Chess Academy Dashboard

## ✨ July 2025 UI/UX Refactor

All student and teacher dashboard components have been refactored for a beautiful, modern, and accessible user experience:

## Overview

This project is a modern web dashboard for the Kolkata Chess Academy, built with React and Tailwind CSS. It features a beautiful, accessible, and highly responsive UI for managing tournaments, users, resources, and more.

## Features

- User authentication (student, teacher, admin roles)
- Tournament management (create, edit, view, delete)
- Resource center for chess materials
- Notifications and preferences
- Responsive sidebar and navigation
- Accessible UI with keyboard navigation and ARIA
- Theming with Tailwind CSS and custom color tokens
- Consistent iconography and visual feedback

## Recent UI/UX & Codebase Improvements

**(July 2025)**

**Admin Leave Requests & Support UI/UX Refactor**
- Refactored all admin leave requests components (`LeaveRequestsAdmin.js`, `LeaveRequestsTable.js`, `LeaveRequestRow.js`, `LeaveRequestsSkeleton.js`, `ErrorAlert.js`, `EmptyState.js`):
  - Beautiful, modern, and fully responsive UI using Tailwind color tokens and the design system (see `colour_scheme.md`)
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/loading/empty states
  - Performance: React.memo, useCallback, and modular field components
  - Single-responsibility: each file/component now does one job only
  - Consistent iconography (inline SVGs), animated transitions, and visual feedback
  - All components use the color system and are mobile-first responsive
  - Custom modal for leave approval/rejection comments (no browser prompt)
  - Odd row striping, hover/focus states, and clear action buttons
- Updated all relevant docs and ensured all support/leave requests components are registered and documented

**Batch Management UI/UX Refactor**
- Refactored all batch management components (`BatchManagement.js`, `CreateBatchForm.js`, `BatchTable.js`, and related modals):
  - Beautiful, modern, and fully responsive UI using Tailwind color tokens and the design system (see `colour_scheme.md`)
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/loading/empty states
  - Performance: React.memo, useCallback, useMemo, and modular field components
  - Single-responsibility: each file/component now does one job only
  - Consistent iconography (Lucide icons), animated transitions, and visual feedback
  - All components use the color system and are mobile-first responsive
- Updated all relevant docs and ensured all batch management components are registered and documented

**Admin Dashboard, User Management, and Tournament UI/UX Refactor**
- See previous entries for details on admin dashboard, user management, and tournament UI/UX improvements

**Attendance Settings UI/UX Refactor & Modularization**
- Refactored `AttendanceSettings.js` (admin) for:
  - Beautiful, modern, and fully responsive UI using Tailwind color tokens and design system
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/loading/success states
  - Performance: React.memo, useCallback, and modular stat/error/loading components
  - Single-responsibility: each file/component now does one job only
- Updated all relevant docs and ensured all components use the color system from `colour_scheme.md`.
- Added success feedback and improved error handling for settings update.
## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

## Design System

This project uses a custom color system defined in `colour_scheme.md` and `tailwind.config.js`. All UI components are built with Tailwind utility classes and follow the design system for consistency, accessibility, and visual clarity.

### Color Tokens

See `colour_scheme.md` for the full palette and usage guide.

### UI/UX Principles

- Responsive layouts for all screen sizes
- Accessible components (ARIA, keyboard navigation, visually hidden text)
- Consistent spacing, typography, and color usage
- Visual hierarchy and clarity
- Loading, error, and empty states handled in all major components
- Iconography for actions and statuses

## Contributing

See `CONTRIBUTING.md` for guidelines.

## Changelog

See `CHANGELOG.md` for release notes.


# Kolkata Chess Academy Dashboard

## ✨ July 2025 UI/UX Refactor

All student and teacher dashboard components have been refactored for a beautiful, modern, and accessible user experience:

- **Teacher Modals & Feedback:**
  - `AttendanceModal.js`, `FeedbackModal.js`, `FeedbackHistoryModal.js`, `PerformanceModal.js` (see `src/components/teacher/docs.md`)
  - All modals are single-responsibility, accessible, responsive, and use the KCA color system
  - Improved UI/UX, ARIA, keyboard navigation, and performance (React.memo)

See `CHANGELOG.md` for details and `colour_scheme.md` for the full color system.

This project is a modern, full-featured dashboard for the Kolkata Chess Academy. It features:

## [July 14, 2025] UI Support & Teacher Modals Refactor

### Summary
Refactored all support system and teacher modal UI components for strict adherence to the design system, accessibility, performance, and single responsibility. All components now use the custom Tailwind color tokens, are fully responsive, accessible, and have improved UI/UX. Each file now has a clear single responsibility and is documented with JSDoc-style comments.

### Affected Files
- `src/components/support/EmptyState.js`
- `src/components/support/ErrorAlert.js`
- `src/components/support/FaqCard.js`
- `src/components/support/FaqModal.js`
- `src/components/support/LeaveRequestRow.js`
- `src/components/support/LeaveRequestsSkeleton.js`
- `src/components/support/LeaveRequestsTable.js`
- `src/components/support/SupportSkeleton.js`
- `src/components/support/TabNav.js`
- `src/components/support/TicketDetailModal.js`
- `src/components/support/TicketTable.js`
- `src/components/teacher/AttendanceModal.js`
- `src/components/teacher/FeedbackModal.js`
- `src/components/teacher/FeedbackHistoryModal.js`
- `src/components/teacher/PerformanceModal.js`

### Improvements
- All components now use the custom color palette and Tailwind tokens.
- Accessibility: ARIA roles, keyboard navigation, focus management, and live regions added.
- UI/UX: Sticky headers, skeleton loaders, empty/error states, semantic HTML, and beautiful, modern layouts.
- Responsiveness: Mobile-first, flex/grid layouts, and adaptive spacing.
- Performance: All components wrapped in `React.memo` where appropriate.
- Single Responsibility: Each file does one job only, with clear prop interfaces and JSDoc comments.

See also: `src/components/support/docs.md` and `src/components/teacher/docs.md` for component usage and API details.

## Getting Started

1. Install dependencies:
## Color System

See [`colour_scheme.md`](./colour_scheme.md) for the full Tailwind color token system and usage guide. All UI components use these tokens for consistent theming and accessibility.
## Component Docs

- [Leaderboard Components](./src/components/leaderboard/docs.md)
- Quiz and related UI components are documented inline and follow the same design and accessibility standards.
- All batch and classroom schedule displays now use a unified formatting utility (`formatSchedule`) for clear, user-friendly output (see [`src/utils/formatSchedule.js`](./src/utils/formatSchedule.js)).
## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines.
## Changelog

- July 2025: Major UI/UX refactor for all quiz and leaderboard components. Improved accessibility, responsiveness, and visual polish. All code now follows KCA React and Tailwind guidelines. See [Leaderboard Components Docs](./src/components/leaderboard/docs.md) for details.
## License

MIT

# July 2025: Major UI/UX Refactor – Classroom, Quiz, Analytics, Leaderboard, Resource Center


### Beautiful, Modular UI for Classroom, Quiz, Analytics, Leaderboard, and Resource Center
- All classroom, quiz, analytics, leaderboard, and resource center UIs are now built from modular, single-responsibility React components in their respective folders (e.g., `src/components/classroom/`, `src/components/analytics/`, `src/components/chess/`, `src/components/resourcecenter/`).
- Fully responsive, accessible, and visually polished with color tokens, dark mode, icons, ARIA roles, and beautiful transitions.
- All classroom subcomponents (e.g., LoadingSkeleton, LoadingSpinner, ModalOverlay, StatusBadge, ViewSwitcher, ErrorAlert, ErrorState, MaterialCard, etc.) are now extracted, documented, and use the design system.
- All interactive elements have proper focus/hover/disabled states and are accessible.
- Error, loading, and empty states now feature icons, animation, and improved clarity.
- See each feature folder's README or docs for details.
-
#### Resource Center UI/UX Refactor (July 2025)
- All resource center UI is now modular, beautiful, and accessible. Components are single-responsibility, responsive, and use the KCA color system from `colour_scheme.md`.
- Major components: CategoryTabs, DetailsBody, DetailsHeader, EmptyState, ErrorState, FeaturedResources, LoadingSpinner, ResourceCard, ResourceDetailsEmptyState, ResourceDetailsErrorState, SearchBar, UploadResourceForm, VideoEmbed.
- All components use Tailwind color tokens, are fully responsive, accessible, and feature improved error/loading/empty states.
- See [`src/components/resourcecenter/docs.md`](./src/components/resourcecenter/docs.md) for details.


### Recent Improvements
- **Classroom Management, Quiz Creator, Analytics, and Leaderboard UIs refactored:**
  - Modularized all classroom subcomponents for single responsibility, maintainability, and performance (React.memo, composable structure).
  - Improved color usage, spacing, and visual hierarchy using the color system in `colour_scheme.md`.
  - Added dark mode, ARIA labels, keyboard navigation, and responsive layouts for accessibility.
  - Upgraded all skeletons, spinners, modals, badges, alerts, and view switchers for a modern, beautiful, and accessible UI.
  - Error, loading, and empty states now feature icons, animation, and improved clarity.
  - Updated all relevant docs and changelogs.
# Tournaments UI Refactor (July 2025)

## Beautiful, Modular Tournaments UI
- All tournament UI is now built from modular, single-responsibility React components in `src/components/tournaments/`.
- Fully responsive, accessible, and visually polished with color tokens, icons, and ARIA roles.
- Includes: LoadingSpinner, ErrorState, TournamentFilterBar, RegistrationButton, TournamentCard, PaymentModal.
- See `src/components/tournaments/README.md` for details.

## Recent Improvements
- **Tournaments UI refactored:** All tournament-related UI is now modular, beautiful, and accessible. See `src/components/tournaments/`.
## Secure Uploads Viewer Route

Direct links to `/uploads/...` are now blocked. To view a file, redirect users to `/uploads/view/:resourceId?type=pdf|img`, which renders the secure React viewer. Update all frontend usages and links accordingly.
## Secure File Viewer

Use the `SecureFileViewer` React component (`src/components/common/SecureFileViewer.js`) to display PDF and image resources securely. It fetches files via the backend API with authentication and supports inline viewing for authorized users.
## Security: Uploads Directory

Direct access to files in the `uploads/` directory is now blocked at the web server level. All file downloads must go through the backend API, which enforces authentication and authorization. A `web.config` file in the `uploads/` directory returns HTTP 403 Forbidden for any direct access attempts.
# Kolkata Chess Academy Dashboard

## Analytics UI Refactor (2024)

### Overview
All analytics-related UI components have been refactored for beauty, performance, accessibility, and responsiveness. The new design system uses TailwindCSS, a custom color palette (see `colour_scheme.md`), and modular, single-responsibility React components. Charts use Chart.js (react-chartjs-2) and Lucide icons for a modern, accessible experience.

### Key Improvements
- **Beautiful, accessible UI:** All analytics components use color tokens, semantic HTML, ARIA roles, and are fully keyboard navigable.
- **Performance:** Components are memoized where appropriate, and heavy charts are code-split for faster load times.
- **Responsiveness:** All layouts are mobile-first and adapt to all screen sizes.
- **Single-responsibility:** Each file does one job only and is imported where needed.
- **Consistent design:** Accent borders, shadows, and iconography unify the analytics experience.

### Refactored Analytics Components
- AnalyticsSkeleton
- ChartCard
- ErrorAlert
- ExportModal
- LoadingSkeleton
- PerformanceMetricsChart
- QuickStats
- TimeRangeSelect
- UserActivityChart
- UserGrowthChart

See `src/components/analytics/docs.md` for details on each component.

### Design System
- **Colors:** See `colour_scheme.md` for the full palette and usage guidelines.
- **UI/UX:** All interactive elements have hover, focus, and active states. Loading, error, and empty states are handled throughout.
- **Accessibility:** All components use semantic HTML, ARIA labels, and are keyboard accessible.

### Documentation
- Analytics component documentation: `src/components/analytics/docs.md`
- Component structure and philosophy: `src/components/docs.md`

---

KCAdashboard is a full-featured platform for managing educational, chess, and administrative workflows. It combines a modular PHP backend (API) and a modern React frontend, supporting a wide range of features for admins, teachers, students, and tournament organizers.

---

## 🌟 Key Features

### User & Role Management
- Registration, login, profile updates, and password reset
- Bulk operations for users and teachers
- Role-based access and permissions (admin, teacher, student)

### Attendance & Classroom Management
- Mark, export, sync, and report attendance for students and classes
- Create, update, and manage batches and classrooms
- Assignments, materials, and session management
- Teachers cannot schedule overlapping classes: the backend prevents a teacher from scheduling more than one class at the same time across all their classrooms. The frontend displays a user-friendly error if this occurs.
- Teacher material upload now includes the required `type` field for backend compatibility (July 2025)

### Chess Platform
- Challenge system, game management, and engine analysis (Stockfish & custom engines)
- PGN upload/view, interactive boards, and player statistics
- Practice sessions, tournaments, and leaderboard




### Quiz & Analytics
- Create, manage, and take quizzes with leaderboards and result exports
- **Admins can now view and manage all quizzes from the Quiz Management page.**
- Teachers can now view the leaderboard for any quiz from the Quiz Management page. Click the leaderboard icon next to a quiz to see detailed rankings for that quiz.
- Export and view analytics for attendance, performance, quizzes, and more
- **Admins can now edit any quiz using the new /admin/quizzes/edit/:id page.**
-
#### Modular Quiz Components (July 2025)
- All quiz UI is now built from modular, single-responsibility React components in `src/components/quiz/`:
  - `QuizLoadingSkeleton`: Loading spinner and message
  - `QuizErrorAlert`: Error message display
  - `DeleteQuizModal`: Accessible modal for quiz deletion
  - `QuizTableRow`: Table row for quiz data and actions
- See `src/components/quiz/docs.md` for details and usage patterns.


### Recent Improvements
- **Major React UI/UX Refactor (June 2024):**
  - Complete modernization of all main navigation, app shell, authentication, dashboard, and directly routed components.
  - Unified design tokens, color schemes, and spacing for a consistent, accessible, and highly responsive experience.
  - Added Heroicons, Framer Motion animations, and improved error, loading, and empty states throughout the app.
  - Upgraded forms, tables, and toggles for accessibility and keyboard navigation.
  - All directly imported/routed components in `App.js` are now modernized and compliant with project standards.
- Improved error handling in grading backend (get-pending.php) for better diagnostics and reliability.
- Prevented duplicate API calls for pending grading/attendance in TeacherDashboard frontend.

### Notifications & Resources
- Send, receive, and manage notifications and preferences (in-app, email, etc.)
- Upload, bookmark, and share resources with students, batches, or classrooms

### Tournaments & Support
- Register, manage, and track chess tournaments (with payment integration)
- FAQ and ticketing system for user support

---


## 🖥️ Frontend Highlights

- **Modernized UI/UX:** All navigation, dashboards, authentication, and routed pages refactored for a beautiful, modern, and accessible experience.
- **Reusable Components:** Navigation, error boundaries, export buttons, notification bell, resource previews, sidebar, and top navbar
- **Custom Hooks:** Centralized authentication, token management, password reset, and PGN view analytics
- **Role-Specific Dashboards:** Separate pages and navigation for admin, teacher, and student experiences
- **Form Handling:** Robust validation using Formik and Yup
- **Route-Based Organization:** Clean, maintainable routing with access control
- **Animations & Icons:** Framer Motion and Heroicons used throughout for a polished, interactive feel.
- **Accessibility:** All forms, tables, and navigation are keyboard accessible and screen reader friendly.
- **Design Tokens:** Consistent color, spacing, and typography tokens applied across the app.
- **Documentation:** All major UI/UX changes are now documented in the README, changelog, and feature docs.

---

## ⚙️ Backend & API

- **RESTful Endpoints:** Modular endpoints for all features, grouped by domain (admin, analytics, attendance, chess, etc.)
- **Models:** PHP classes for analytics, users, attendance, chess games, quizzes, notifications, resources, tournaments, and more
- **Services:** Business logic for sending emails and notifications
- **Middleware:** Authentication and authorization for protected endpoints
- **Utilities:** Helper scripts for authorization, chess logic, PGN parsing, file uploads, and Stockfish integration

---

## ♟️ Chess Engine Integration

- Minimal Stockfish implementation for chess analysis (auto-setup)
- Custom chess engine and online engine support
- PGN file handling and analysis

---

## 📊 Analytics & Reporting

- Attendance, performance, and quiz analytics
- Export data in various formats (CSV, Excel)

---

## 📚 Extensibility

- Add new features by creating new endpoint files and updating models/services
- Reusable frontend components and hooks for rapid development
- Utility modules for API, chess, permissions, PGN, and uploads

---

## 🛠️ Troubleshooting & Best Practices

- Centralized error handling and logging
- Modular, maintainable codebase with clear separation of concerns
- Regularly review and update authentication, authorization, and business logic

---

# Leave Management System (July 2025)

- The leave management system allows teachers to submit leave requests, and admins to approve or reject them.
- Backend endpoints:
  - `/leave/request` (POST): Teachers submit leave requests.
  - `/leave/requests` (GET): Admins see all requests, teachers see their own.
  - `/leave/approve` (POST): Admins approve/reject requests with comments.
- Table: `leave_requests` (see `database_schema.md`)
- All endpoints now include CORS headers for frontend compatibility.
- See also: `public/api/models/LeaveRequest.php`, `public/api/endpoints/leave/`.

## Usage
- Teachers use the leave request form in the support section.
- Admins manage requests in the admin panel.

## API
- See `src/utils/api.js` for API usage in React frontend.

---

## Prerequisites

- Node.js version 20.17.0 or higher
- npm version 10.0.0 or higher

## Environment Setup

```bash
# Using nvm (recommended)
nvm install 20.17.0
nvm use 20.17.0

# Or update Node.js directly from nodejs.org
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Chess Engine

This project uses a minimal Stockfish implementation for chess analysis. The implementation is automatically set up during installation.

To test if the chess engine is working:
1. Start the development server
2. Navigate to `/stockfish/test.html` in your browser
3. Click the "Test Stockfish" button

## Troubleshooting

If you experience issues with the chess engine:

```bash
# Manually run the setup script
npm run setup-stockfish
```

## Notes

- Students are not allowed to upload PGN files. The backend and frontend both enforce this restriction.

## License

Copyright © 2023-2024 Kolkata Chess Academy. All rights reserved.
