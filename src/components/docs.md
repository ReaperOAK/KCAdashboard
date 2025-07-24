# KCAdashboard Frontend – Components Folder Documentation

## Analytics UI Refactor (2024)
All analytics-related UI components have been refactored for beauty, performance, accessibility, and responsiveness. See `analytics/docs.md` for details on each analytics component, their design, and usage.



## July 2025 Student UI/UX Overhaul

## July 2025: Teacher Dashboard React Key Bugfix & List Rendering Robustness
- All React lists in the Teacher Dashboard now use robust, unique keys to prevent duplicate/empty key warnings and ensure stable UI updates.
- All mapped lists (modals, stats, activities) now have fallback keys for edge cases, eliminating React key warnings and improving dashboard reliability.
  - Strict adherence to the KCA color system and Tailwind config (see `../../colour_scheme.md`)
  - Modular, single-responsibility, and fully accessible design


## Registration & Role Security Policy (July 2025)
All new user registrations are created as students only. Teacher/admin roles can only be assigned by an admin via the user management interface. This is enforced in both frontend and backend for security.

## Feature Overview


### July 2025: Settings Page, Session Management & Backend Robustness

- **Settings Page**: Centralized place for users to manage account security and active sessions.
- **Session Management UI**: Users can view and manage all their active login sessions from the Settings page.
- **Backend Robustness**: Session management and authentication endpoints now use absolute config paths, output buffering, and error suppression to ensure reliable JSON output even if PHP warnings occur. Frontend can extract valid JSON from such responses.

## July 2025: Common Password Input Components

- Added `PasswordInput` (for React state forms) and `FormikPasswordField` (for Formik forms) to `components/common/`.
- Both provide accessible, reusable password fields with show/hide toggle and Heroicons.
- Used in Login, Register, and Reset Password forms for consistent UX.

KCAdashboard includes modular, single-responsibility React components for:
- Chess dashboard and gameplay (see `chess/`)
- Quiz management and participation (see `quiz/`)
- Tournaments (see `tournaments/`)
- User management (see `user-management/`)
- Classroom management (see `classroom/`)
- Resource center (see `resourcecenter/`)
- Notifications (see `../NotificationBell.js` and `../../pages/notifications/`)

All components are:
- Pure, focused, and reusable
- Strictly follow the KCA color system and Tailwind config
- Fully accessible (ARIA, keyboard navigation, focus/hover/disabled states)
- Responsive and visually grouped

For details on each feature, see the subfolder docs and the main `docs.md`.
  - Responsive layouts and semantic HTML
  - ARIA roles, keyboard navigation, and color contrast
  - Animated transitions for interactive elements
  - Consistent use of cards, panels, tables, and badges
  - All states (loading, error, empty, data) handled beautifully and accessibly

## Design System
- All components use TailwindCSS and the project's color tokens (see `../../colour_scheme.md`).
- Components are modular, single-responsibility, and fully accessible.
- Responsive layouts and semantic HTML are standard.
- All classroom UI components (skeletons, spinners, modals, badges, alerts, view switchers, etc.) have been refactored for strict design system adherence, dark mode, accessibility, and responsiveness (July 2025).

## Overview

The `components` folder contains reusable React UI components that form the building blocks of the KCAdashboard frontend. Components are organized by feature and responsibility, making it easy to maintain and extend the user interface. This folder includes both general-purpose UI elements and feature-specific components, grouped into subfolders for clarity.

---

## July 2025: Grading Modal & Feedback UX

- Pending grading modal now updates in real-time after feedback is submitted.
- Feedback forms now include session context when accessed from the dashboard modal.
- All grading-related components updated for session-specific feedback logic.

## File Structure

```
components/
  Breadcrumbs.js         # Navigation breadcrumbs
  ErrorBoundary.js       # Error boundary for catching UI errors
  ExportButton.js        # Button for exporting data
  NotificationBell.js    # Notification bell icon and logic
  ResourcePreview.js     # Resource preview UI
  Sidebar.js             # Sidebar navigation
  TopNavbar.js           # Top navigation bar
  ...                   # Feature-specific subfolders (batches, chess, classroom, etc.)
```

---

## File Explanations

- **Breadcrumbs.js**  
  Displays navigation breadcrumbs to help users understand their location in the app.

- **ErrorBoundary.js**  
  Catches and displays errors in the UI, preventing the entire app from crashing.

- **ExportButton.js**  
  Provides a button for exporting data (e.g., CSV, Excel) from tables or reports.

**NotificationBell.js**  
Displays a modern, responsive notification bell icon with a beautiful dropdown panel for alerts and messages. The panel features:
  - Glassmorphism and gradient backgrounds for a visually appealing look
  - Animated, rounded notification cards with category badges and icons
  - Responsive layout for all screen sizes (mobile, tablet, desktop)
  - Category tabs for filtering notifications
  - Mark all as read, delete, and quick navigation to notification settings
  - Accessibility and keyboard navigation improvements
  - Animated notification badge and smooth transitions
See the notifications documentation for more details on usage and features.

- **ResourcePreview.js**  
  Previews resources (documents, images, etc.) in the UI before download or sharing.

- **Sidebar.js**  
  Renders the sidebar navigation menu for quick access to main sections.

- **TopNavbar.js**  
  Displays the top navigation bar with links, user info, and actions.

---

## How Components Work

- Components are imported and used in pages and other components to build the UI.
- Feature-specific components are grouped in subfolders (e.g., `batches/`, `chess/`, `classroom/`).
- Components are designed to be reusable and composable for a consistent user experience.

---

## Example Usage

- The main layout uses `Sidebar.js` and `TopNavbar.js` for navigation.
- Pages use `Breadcrumbs.js` for navigation context and `ErrorBoundary.js` for error handling.
- Data tables and reports use `ExportButton.js` for exporting data.

---


## Best Practices

- Keep components focused and reusable.
- Use subfolders to organize feature-specific components.
- All classroom UI components now use color tokens, dark mode, ARIA labels, and accessible states.
- Use React.memo for performance and single responsibility.
- Document component props and usage for maintainability.

---

For more details on feature-specific components, see the `docs.md` files in each subfolder.

---

## July 2025: Admin Leave Requests & Support UI/UX Refactor

- All admin leave requests and support components (`LeaveRequestsAdmin.js`, `LeaveRequestsTable.js`, `LeaveRequestRow.js`, `LeaveRequestsSkeleton.js`, `ErrorAlert.js`, `EmptyState.js`) have been refactored for a beautiful, modern, and accessible UI/UX.
- See `components/support/docs.md` for full documentation and usage details.

---

## PGN to Quiz Integration (July 2025)

- Create quizzes from PGN games (single or batch) via modals in the Chess Library.
- See `chess/pgnlibrary/CreateQuizModal.js`, `BatchCreateQuizModal.js`, and `usePGNQuizIntegration.js` for details.

---

## Recurring Class Sessions (July 2025)

- **RecurringClassModal.js**: Modal for creating recurring class sessions based on batch schedule. See `classroom/docs.md` for full usage and API details.

## Enhanced Profile System (July 2025)
- FIDE ID, rating, and document upload UI for students and teachers
- Admin document verification workflow
- See ENHANCED_PROFILE_DOCUMENTATION.md for full details

## Classroom Material Upload (July 2025)
- Classroom material upload now supports multiple files at once, with real-time feedback and validation.
