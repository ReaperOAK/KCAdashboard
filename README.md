# July 2025: Major UI/UX Refactor – Classroom, Quiz, Analytics, Leaderboard

### Beautiful, Modular UI for Classroom, Quiz, Analytics, and Leaderboard
- All classroom, quiz, analytics, and leaderboard UIs are now built from modular, single-responsibility React components in their respective folders (e.g., `src/components/classroom/`, `src/components/analytics/`, `src/components/chess/`).
- Fully responsive, accessible, and visually polished with color tokens, icons, ARIA roles, and beautiful transitions.
- All subcomponents (e.g., LoadingSkeleton, ErrorAlert, ViewSwitcher, ChartCard, QuickStats, ExportModal, TagInput, LeaderboardTable) are now extracted and documented.
- All interactive elements have proper focus/hover states and are accessible.
- See each feature folder's README or docs for details.

### Recent Improvements
- **Classroom Management, Quiz Creator, Analytics, and Leaderboard UIs refactored:**
  - Modularized all subcomponents for single responsibility and maintainability.
  - Improved color usage, spacing, and visual hierarchy using the color system in `colour_scheme.md`.
  - Added ARIA labels, keyboard navigation, and responsive layouts for accessibility.
  - Added loading skeletons, error/empty states, and micro-interactions for a beautiful, production-ready UI.
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
