# KCAdashboard Frontend – Admin Pages Documentation

## Overview

The `admin` folder under `pages` contains all top-level page components for administrative features in the KCAdashboard application. These pages provide dashboards, analytics, user and batch management, attendance tracking, tournament management, support, and more. They are designed for use by administrators and staff to oversee and manage the platform's core operations.

---

## File Structure

```
pages/admin/
  AdminDashboard.js            # Main dashboard for admin users
  AttendanceSettings.js        # Admin interface for attendance settings
  AttendanceSystem.js          # Admin attendance management system
  BatchManagement.js           # Admin batch management page
  NotificationManagement.js    # Admin notification management
  PlatformAnalytics.js         # Analytics dashboard for the platform
  QuizManagement.js           # Admin quiz management page (view and manage all quizzes)
  AdminQuizEditor.js          # Admin quiz editing page
  StudentAttendanceHistory.js  # View student attendance history (refactored July 2025: beautiful, accessible, responsive, modular, handles loading/error/empty states)
  StudentAttendanceList.js     # List of student attendance records
  SupportSystem.js             # Admin support system page
  TournamentManagement.js      # Admin tournament management
  TournamentRegistrations.js   # Manage tournament registrations (modular, imports subcomponents)
  UserActivity.js              # View user activity logs
  UserActivityPage.js          # Detailed user activity page
  UserAttendanceReport.js      # Attendance report for users
  UserManagement.js            # Admin user management page
```

---

## File Explanations

- **AdminDashboard.js**  
  The main landing page for admin users, providing quick access to key metrics, recent activity, and navigation to other admin features.

- **AttendanceSettings.js**  
  Interface for configuring attendance rules, thresholds, and policies for the platform.

- **AttendanceSystem.js**  
  Centralized attendance management, allowing admins to view, edit, and audit attendance records.
  - **2025-07**: Major UI/UX and responsive overhaul. Heading, batch select, and export controls now stack or wrap at all breakpoints (desktop, mobile, tablet, 8:9, half-screen, etc.).
  - BatchSelect is now fully accessible, with visible label and improved dropdown.
  - All controls and tables use color tokens, focus/hover/active states, and are keyboard/ARIA accessible.
  - All logic and UI are modular and single-responsibility for performance and maintainability.


- **BatchManagement.js**  
  Manage student batches, including creation, editing, and assignment of students and teachers.
  - **2025-07**: Major UI/UX and responsive overhaul. All batch management components now use the design system, color tokens, and Lucide icons. All forms and tables are fully accessible, animated, and mobile-first responsive. Each file/component is single-responsibility and optimized for performance.

- **NotificationManagement.js**  
  Admin interface for sending, scheduling, and managing platform notifications.

- **PlatformAnalytics.js**  
  Dashboard for viewing analytics and reports on platform usage, engagement, and performance.

- **QuizManagement.js**  

  Admin quiz management page, now fully refactored for beauty, performance, and modularity (July 2025):
  - Uses a new generic `QuizManagementPage` component for both admin and teacher quiz management, ensuring DRY code and consistent UI/UX.
  - **Admins** can view, edit, delete, and publish all quizzes; **Teachers** can manage their own quizzes with the same beautiful interface.
  - All UI is strictly compliant with the design system (see `colour_scheme.md` and `tailwind.config.js`):
    - Responsive layouts for all screen sizes
    - Consistent use of color tokens, spacing, and typography
    - Accessible: ARIA roles, keyboard navigation, focus/hover/active states
    - Modular, single-responsibility components:
      - `QuizManagementPage`: Orchestrates quiz management UI, handles all states (loading, error, empty, data)
      - `QuizTableRow`: Renders quiz data and actions, fully accessible and responsive
      - `QuizLoadingSkeleton`: Loading spinner and message
      - `QuizErrorAlert`: Error message display
      - `DeleteQuizModal`: Accessible modal for quiz deletion
  - All components are memoized and optimized for performance (React.memo, useCallback, useMemo, code splitting)
  - Includes filters for difficulty and status, and a leaderboard button for each quiz
  - See `src/components/quiz/docs.md` for details and usage patterns.

- **AdminQuizEditor.js**  
  Admin quiz editing page, allows admins to edit any quiz using the same interface as teachers. Uses the same component as teacher quiz editor for consistency.

- **StudentAttendanceHistory.js**  
  View detailed attendance history for individual students.

- **StudentAttendanceList.js**  
  List and filter attendance records for all students.

- **SupportSystem.js**  
  Admin support and ticketing system for handling user queries and issues.

- **TournamentManagement.js**  
  Manage chess tournaments, including creation, scheduling, and results.

-- **TournamentRegistrations.js**  
  View and manage registrations for tournaments. Now fully modular:
  - Imports and composes the following from `src/components/tournaments/`:
    - `RegistrationsSkeleton.js`: Loading spinner and message
    - `ErrorAlert.js`: Error message display
    - `TournamentInfo.js`: Tournament info card
    - `FilterExportBar.js`: Filter and export controls
    - `RegistrationsTable.js`: Table of registrations
    - `PaymentModal.js`: Accessible modal for payment screenshot/approval
  - Each subcomponent is single-responsibility, memoized, and uses the color system.
  - All UI is responsive, accessible, and beautiful.
  - See `src/components/tournaments/docs.md` for details and usage patterns.

- **UserActivity.js**  
  View recent activity logs for users, including actions and events.

- **UserActivityPage.js**  
  Detailed view of a specific user's activity and audit trail.

- **UserAttendanceReport.js**  
  Generate and view attendance reports for users or groups.

- **UserManagement.js**  
  Comprehensive user management, including search, filtering, editing, and permissions.

---

## Features

- **Comprehensive Admin Tools:** Dashboards, analytics, and management interfaces for all core platform entities.
- **Role-Based Access:** Pages are protected and only accessible to admin users.
- **Data-Driven UI:** Fetches and displays real-time data for attendance, users, tournaments, and more.
- **Bulk Actions:** Support for batch operations (e.g., attendance, user management).
- **Audit & Reporting:** Activity logs and reports for transparency and compliance.

---

## How These Pages Work

- Each page is mapped to an admin route and orchestrates data fetching, state management, and UI rendering.
- Pages import and compose reusable components, hooks, and modals for a modular architecture.
- Admin navigation links to these pages for seamless workflow.

---

## Example Usage

**Admin Dashboard Route:**
```
import AdminDashboard from './pages/admin/AdminDashboard';
<Route path="/admin" element={<AdminDashboard />} />
```

**User Management Route:**
```
import UserManagement from './pages/admin/UserManagement';
<Route path="/admin/users" element={<UserManagement />} />
```

---

## Best Practices

- Keep page components focused on orchestration; delegate UI and logic to child components and hooks.
- Use clear, role-based navigation and access control.
- Validate all user input and handle errors gracefully.
- Use modular, reusable components for consistency and maintainability.

---

## Troubleshooting

- **Page not loading:** Check route configuration and authentication/authorization logic.
- **Data not updating:** Verify API endpoints and state management in the page/component.
- **UI inconsistencies:** Ensure all admin pages use shared components and styles.

---

## Quiz No-Retake Policy

- All quizzes are now single-attempt only for students.
- No admin override for retakes or cooling time.
- Policy is enforced at both backend and frontend.
- See `README-quiz-no-retake-policy.md` for more info.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
