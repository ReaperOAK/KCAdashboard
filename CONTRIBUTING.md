Update all relevant docs after code changes. If you change quiz, chess move validation/feedback logic, or user menu/profile/logout dropdown logic, document it in README.md, CHANGELOG.md, and the relevant feature docs.
## User Menu & Dropdown Accessibility (July 2025)

- All user menu/profile/logout dropdown logic must be accessible (keyboard, ARIA, focus management).
- Only one set of profile/logout actions should be visible at a time (inside the dropdown).
- Dropdown must close on outside click or Escape, but remain open for menu actions.
- Update docs and changelog after any user menu or dropdown logic change.
# July 2025 UI/UX Overhaul

This project underwent a major UI/UX, accessibility, and modularity overhaul in July 2025. Please review the following before contributing:

- All UI must use the color tokens and design system in `colour_scheme.md` and Tailwind config. All leave request tables (teacher/admin) must use color-coded status badges, responsive layouts, and clear empty/cancelling states.
- Follow the accessibility, modularity, and performance guidelines in [docs.md](docs.md) (see the July 2025 summary section).
- Use semantic HTML, ARIA labels, and ensure all interactive elements are keyboard accessible.
- Deep-linking to Support Center tabs is supported via URL hashes (e.g., `/teacher/support#leave`).

## Contribution Guidelines


All code must be modular, single-responsibility, and follow the KCA color system and Tailwind config.
All components and pages must be fully accessible (ARIA, keyboard navigation, focus/hover/disabled states).
Responsive design is required for all UI.
Use pure, focused, reusable functional React components and Hooks.
Update all relevant docs after code changes. If you change quiz or chess move validation/feedback logic, document it in README.md, CHANGELOG.md, and the relevant feature docs.
No build artifacts or orphan files.
Register new files/components in the correct modules, routes, or parent components.

**Registration & Role Security Policy:**
- All new user registrations are created as students only. Teacher/admin roles can only be assigned by an admin via the user management interface. This is enforced in both frontend and backend.

Before submitting a pull request, please review all linked documentation and recent changelog entries to ensure compliance with project standards.

## See Also
- [UI/UX, Design System, Accessibility](docs.md)
- [Frontend Component Standards](src/components/docs.md)
- [Changelog](CHANGELOG.md)
- Strictly follow the design system and accessibility standards ([docs.md](docs.md), [colour_scheme.md](colour_scheme.md)).

## For Full Standards & Feature Details

- See [docs.md](docs.md) for UI/UX, design system, and accessibility standards.
- See feature docs in `src/components/` and `src/pages/` for details on each module.
- See [CHANGELOG.md](CHANGELOG.md) for recent changes and refactors.

---

# Chess Dashboard UI/UX Refactor (July 2025)

All chess dashboard pages and components are now modular, beautiful, and accessible. When contributing to chess dashboard components:
- Use pure, focused, reusable functional React components and Hooks.
- Follow the KCA color system in `colour_scheme.md` and Tailwind config.
- All styling must use TailwindCSS and design tokens (no inline styles).
- Ensure all components are single-responsibility, responsive, and accessible (ARIA, keyboard navigation, focus/hover/disabled states).
- Use animated transitions for interactive elements and modals.
- Optimize for performance: use React.memo, useCallback, useMemo where appropriate.
- Always handle loading, error, and empty states in UI.
- Document new or modified components in the relevant feature folder and main docs.
- Update the main README and CHANGELOG with any major UI/UX changes.

# Support/Admin UI/UX Refactor (July 2025)

All support and admin pages and components are now modular, beautiful, and accessible. When contributing to support or admin components:
- Use pure, focused, reusable functional React components and Hooks.
- Follow the KCA color system in `colour_scheme.md` and Tailwind config.
- All styling must use TailwindCSS and design tokens (no inline styles).
- Ensure all components are single-responsibility, responsive, and accessible (ARIA, keyboard navigation, focus/hover/disabled states).
- Optimize for performance: use React.memo, useCallback, useMemo where appropriate.
- Always handle loading, error, and empty states in UI.
- Document new or modified components in the relevant feature folder and main docs.
- Update the main README and CHANGELOG with any major UI/UX changes.

### User Management UI/UX Refactor (July 2025)
- All user management UI is now modular, beautiful, and accessible. When contributing to user management components:
  - Use pure, focused, reusable functional React components and Hooks.
  - Use local state for modal editing; do not mutate parent state directly from modals.
  - All styling must use TailwindCSS and design tokens (no inline styles).
  - Ensure all components are single-responsibility, responsive, and accessible (ARIA, keyboard navigation, focus/hover/disabled states).
  - Optimize for performance: use React.memo, useCallback, useMemo where appropriate.
  - Always handle loading, error, and empty states in UI.
  - Document new or modified components in the relevant feature folder and main docs.
  - Update the main README and CHANGELOG with any major UI/UX changes.
- After any major refactor or feature addition, update:
  - `README.md` with new features and improvements
  - `CHANGELOG.md` with a summary of changes
  - Any relevant `docs.md` files for affected features or components (including leave requests UI/UX)
  - For classroom, quiz, analytics, leaderboard, and leave requests UI/UX changes, document all new/updated components and patterns in the relevant feature folder and main docs.
# Classroom, Quiz, Analytics, Leaderboard, and Attendance UI/UX Refactor (July 2025)
- All classroom, quiz, analytics, leaderboard, and attendance UIs must use modular, single-responsibility React components in their respective folders.
- All new or updated classroom components (e.g., LoadingSkeleton, LoadingSpinner, ModalOverlay, StatusBadge, ViewSwitcher, ErrorAlert, ErrorState, MaterialCard, etc.) are now documented in the relevant feature folder and `docs.md`.
- All interactive elements are accessible, responsive, and use color tokens, dark mode, and icons as per the design system in `colour_scheme.md`.
- All skeleton/loading components use shimmer blocks for a modern loading experience.
- All tables, forms, and controls use correct color tokens, icons, and improved layouts.
- All select elements with custom icons use appearance-none to avoid double icons.
- All components are optimized for performance (React.memo, minimal re-renders).
- After any major UI/UX change, update the main `README.md` and `CHANGELOG.md`.
## Tournaments UI Modularity & Documentation (July 2025)
- All tournament-related UI must use modular, single-responsibility React components in `src/components/tournaments/`.
- All new or updated tournament UI components must be documented in `src/components/tournaments/README.md` and `docs.md`.
- Ensure all interactive elements are accessible, responsive, and use color tokens and icons as per the design system.
- After any major tournaments UI change, update the main `README.md` and `CHANGELOG.md`.
# Notification System Coding Standards (July 2025)

- All notification-related backend endpoints must use NotificationService for sending, deleting, and managing notifications. Do not insert directly into the notifications table or call models directly for notification logic.
- All user IDs, emails, and input data must be sanitized and validated in endpoints, NotificationService, and Mailer.
- NotificationPreference and Notification model logic must be robust, channel-safe, and enforce user ownership for deletion.
- All notification endpoints must set CORS and JSON headers, and log errors for easier debugging.
- Notification categories must be standardized and all logic must respect user preferences.
- All changes to notification logic must be documented in notifications/docs.md, services/docs.md, and models/docs.md.
-  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads and in-browser viewing must go through the backend API, which enforces authentication and authorization. Use the `SecureFileViewer` React component for secure inline viewing of PDF and image resources. Update docs and tests accordingly.
  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads and in-browser viewing must go through the backend API, which enforces authentication and authorization. Use the `/uploads/view/:resourceId?type=pdf|img` route and the `SecureFileViewer` React component for secure inline viewing. Update docs and tests accordingly.
-  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads must go through the backend API, which enforces authentication and authorization. Update docs and tests accordingly.
  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads and in-browser viewing must go through the backend API, which enforces authentication and authorization. Use the `SecureFileViewer` React component for secure inline viewing of PDF and image resources. Update docs and tests accordingly.
- When updating resource download logic, ensure resource-level access control is enforced: only owners, admins, or users with whom the resource is shared (directly, via batch, or classroom) can download. Update docs and tests accordingly.
  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads must go through the backend API, which enforces authentication and authorization. Update docs and tests accordingly.

# Contributing

## UI/UX & Frontend Coding Standards (June 2024)
## UI/UX & Component Guidelines (July 2025)

- All UI components must use the design system (see `colour_scheme.md`)
- Use Tailwind CSS for all styling
- Ensure accessibility: semantic HTML, ARIA, keyboard navigation
- Components must be mobile-first and responsive
- Each file/component should have a single responsibility
- Use React.memo for pure components
- Document all new components and update relevant docs
- Register all new files in their parent modules/routes
- Do not modify build/output directories

---
_Last updated: July 2025_

- After any major refactor or feature addition, update:
  - `README.md` with new features and improvements
  - `CHANGELOG.md` with a summary of changes
  - Any relevant `docs.md` files for affected features or components


## Scheduling Overlap Prevention
- Teachers cannot schedule more than one class at the same time. The backend checks for overlapping sessions for the same teacher and rejects any new session that conflicts. The frontend displays a clear error message if this occurs. Update tests and documentation to reflect this rule.


## New Feature: Admin Quiz Management

- Admins can now view and manage all quizzes from the Quiz Management page. When adding or updating quiz management features, ensure that admin users have access to all quizzes, not just their own or public ones.
- When making changes to quiz management, update both backend (Quiz.php, endpoints) and frontend (QuizManagement.js) to reflect admin access.

- When adding new quiz-related features, ensure both students and teachers have access to relevant analytics and leaderboards.
- Teacher leaderboard pages should use the same API endpoints as student leaderboard pages for consistency.
- When adding a new teacher page, update `src/pages/teacher/docs.md` and the main `README.md`.

- When adding or updating quiz editing features, ensure both admin and teacher editors are consistent and update documentation and routes accordingly.

- When updating backend quiz permissions, ensure admin users can update any quiz, not just their own. See Quiz.php and update.php for logic.

## Error Handling & API Best Practices
- When modifying backend endpoints, always add error handling and logging for diagnostics.
- For frontend API calls, ensure duplicate requests are prevented and errors are handled gracefully in the UI.
- Add new routes to `src/routes/teacherRoutes.js` and test navigation from the Quiz Management page.
- When making changes to upload or permissions logic, ensure that restrictions (such as preventing students from uploading PGNs) are enforced in both backend and frontend, and update documentation accordingly.
- When updating resource download logic, ensure resource-level access control is enforced: only owners, admins, or users with whom the resource is shared (directly, via batch, or classroom) can download. Update docs and tests accordingly.
- When updating classroom material upload, always include the required `type` field in frontend requests to match backend requirements (see July 2025 fix).
- When adding or updating classroom endpoints (such as rate-class.php), ensure CORS is included and the endpoint is documented in the appropriate docs.md file.

- When adding or updating attendance endpoints, always use the NotificationService for sending notifications (e.g., for absences). Do not insert directly into the notifications table; this ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both attendance/docs.md and services/docs.md.

- When adding or updating chess endpoints (e.g., challenge, respond-challenge), always use the NotificationService for sending notifications. This ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both the relevant endpoint docs and services/docs.md.

- When adding or updating chess game logic (e.g., auto-resign, cleanup), always use the NotificationService for sending notifications to players. This ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both the relevant endpoint docs and services/docs.md.

- When adding or updating chess resign logic, always use the NotificationService for sending notifications to players. This ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both the relevant endpoint docs and services/docs.md.

- When adding or updating chess challenge response logic, always use the NotificationService for sending notifications to the challenger. This ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both the relevant endpoint docs and services/docs.md.

- When adding or updating chess game result logic, always use the NotificationService for sending notifications to players. This ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both the relevant endpoint docs and services/docs.md.

- When adding or updating classroom material logic, always use the NotificationService for sending notifications to students. This ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both the relevant endpoint docs and services/docs.md.

- When adding or updating classroom session logic, always use the NotificationService for sending notifications to students. This ensures category validation, user preferences, and future extensibility.
- Document any changes to notification logic in both the relevant endpoint docs and services/docs.md.

## Leave Management System

- Added `leave_requests` table to database schema for teacher leave requests (see `database_schema.md`).
- Implemented backend logic in `LeaveRequest.php` for creating, listing, and updating leave requests.
- All leave endpoints now include CORS headers for frontend compatibility.
- Updated endpoints: `/leave/request`, `/leave/requests`, `/leave/approve`.
- Frontend and backend now fully integrated for leave management.
- Teachers can now view and cancel their own leave requests from the Support Center (see `MyLeaveRequests.js`).
- Backend endpoint `/leave/my-requests.php` supports secure cancellation by teachers (see `LeaveRequest.php`).
- Please update tests and documentation if you add new leave features.

## Enhanced Profile System (July 2025)
- All changes to user profile, identity, or document upload logic must be documented in ENHANCED_PROFILE_DOCUMENTATION.md, README.md, and API docs.
- Test all FIDE ID, rating, and document upload features for both students and teachers.
- Admin verification workflow for documents must be tested and documented.

See the codebase and documentation for more details.
