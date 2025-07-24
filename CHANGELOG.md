# Backend Session Management & Auth Robustness (2025-07-24)
- Fixed: All PHP session config includes now use absolute paths for reliability in all environments.
- Added: Output buffering and error suppression to all relevant PHP endpoints to prevent warnings from breaking JSON responses.
- Improved: Frontend JSON parsing logic to extract valid JSON even if PHP warnings are present in the response.
- Added: Fallback config and safe array access in PHP for session config loading.
- Docs: Updated README, session-management, and contributing docs to reflect these backend robustness improvements.

# [Unreleased] - July 2025

## Authentication UX: Show/Hide Password Toggle (2025-07-24)
- Added show/hide password toggle to Login, Register, and Reset Password forms for improved usability.
- Introduced reusable `PasswordInput` and `FormikPasswordField` components for consistent password field UX across the app.
- Updated docs and CONTRIBUTING.md to reflect the new components and UI pattern.

## Grading Workflow & Pending Grading Modal Fix (2025-07-24)
- Fixed: Pending grading modal now correctly disappears after feedback is submitted for a session.
- Feedback submission now includes session_id, linking feedback to the correct session.
- Backend query for pending grading now checks for session-specific feedback from the teacher.
- Improved UX: Teachers are only prompted to grade sessions that truly need feedback.
## Teacher Attendance Batch Selection is Now Automatic (2025-07-24)
- Teachers no longer need to manually select a batch before marking attendance for a student. The system now automatically determines the batch from the student being marked.
- Backend APIs for fetching students now always include the batch_id field.
- Improved UX and reduced errors for teacher attendance workflows.

## PGN Upload 50-Game Limit (2025-07-24)
- Added 50-game limit for PGN uploads to prevent performance issues and application hanging
- Frontend validation: PGN parser checks game count before processing and shows clear error messages
- Backend validation: Server-side validation in upload-pgn.php and validate-pgn.php enforces limit
- PGN viewer safety: Automatically limits display to first 50 games with warning message for large files
- Existing large PGN files are truncated to 50 games when viewed to prevent hanging
- Updated UI to show warning about 50-game limit in upload components
- Fixed issue where clicking on large PGN files (like 3K games) would hang the application

## Navbar User Menu Bugfix & Accessibility (2025-07-24)
- Fixed: Profile and Logout buttons in the user dropdown menu are now fully accessible and functional. The dropdown no longer closes prematurely, and all actions are handled inside the dropdown for clarity and accessibility.
- Removed duplicate logout button from the navbar for a cleaner UI.
- Updated docs and CONTRIBUTING.md to reflect the new user menu logic and accessibility improvements.
# [Unreleased] - July 2025

## Teacher Leave Requests UI/UX Overhaul (2025-07-24)
- Refactored MyLeaveRequests.js for a beautiful, modern, and accessible UI
- Added color-coded status badges, improved empty/cancelling states, and better date formatting
- Teachers now have a dedicated leave management experience in the Support Center
- Students no longer see leave request options

## Bugfix & Improvement: Quiz Chess Move Feedback (2025-07-23)
- Fixed: Chess quiz questions (both FEN and PGN modes) now immediately show feedback for incorrect moves. Wrong moves are highlighted and users are prompted to try again, instead of getting no response.
- All moves (correct and incorrect) are now reported to the quiz system for accurate scoring and analytics.

## Security: Registration & Role Management Update (2025-07-23)
- All new user registrations are now always created as students. Teacher/admin roles can only be assigned by an admin via the user management interface.
- Role selection removed from registration form; backend enforces student-only registration.
- Only admins can promote users to teacher/admin roles (API endpoints now require admin authentication for role changes).
- Updated all relevant docs and UI to clarify this policy.

## Major UI/UX & Codebase Refactors

### PGN Library UI/UX Overhaul & Role-Based Resource Categories (2025-07-22)
- Unified filter panel: Resource type (role-based) and game category filters are now dropdowns, side-by-side on desktop, stacked on mobile.
- Role-based resource categories:
  - Students: Public Resources
  - Teachers: Public Resources, My Private Resources, My Shared Resources (Private not visible in Shared)
  - Admins: Public Resources, Resources Categorised by Coach (restricted to selected admins with permission)
- Added permission-based access control: `chess.manage_coach_resources` permission for admin access to coach resources
- Backend support for `resource_category` parameter with proper role-based filtering in get-games.php
- Removed redundant checkboxes for public/my games; filtering is now clear and non-redundant.
- Accessibility, responsiveness, and design system improvements (Tailwind, colour_scheme.md).
- All components follow single-responsibility principle and are modular.
- Removed ResourceCategories.js (logic merged into FilterPanel.js).
- Cleaned up unused state, props, and ESLint warnings in PGNLibrary.js.
- Updated FilterPanel.js for minimal, beautiful, and accessible UI.
- Updated docs.md and README.md to document new features and UI/UX improvements.

### Chess Dashboard, Student & Teacher Dashboard Overhaul
- Refactored all chess, student, and teacher dashboard components for modern, beautiful, and accessible UI/UX
- Full design system enforcement (see docs.md), accessibility improvements, and modular code
- Updated all relevant docs: docs.md, src/components/chess/docs.md, src/pages/student/docs.md, src/pages/teacher/docs.md, CONTRIBUTING.md

### Support & Admin UI/UX Refactor (2025-07-14)
- Refactored all support/admin components for leave requests and ticketing:
  - LeaveRequestsAdmin.js, LeaveRequestsTable.js, LeaveRequestRow.js, LeaveRequestsSkeleton.js, ErrorAlert.js, EmptyState.js, SupportSystem.js, TicketTable.js, TicketDetailModal.js, FaqModal.js, FaqCard.js
- Updated all relevant docs: src/components/support/docs.md, CONTRIBUTING.md

### Quiz Management UI/UX Refactor & Modularization
Refactored all quiz management components for both admin and teacher roles:
  - Unified, generic `QuizManagementPage` component for both admin and teacher quiz management
  - Modular subcomponents: `QuizTableRow`, `QuizLoadingSkeleton`, `QuizErrorAlert`, `DeleteQuizModal`
  - Fully responsive UI using Tailwind color tokens and design system
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
  - Performance: React.memo, useCallback, useMemo, and code splitting for heavy components
  - Single-responsibility: each file/component now does one job only
  - All states (loading, error, empty, data) handled beautifully and accessibly
  - Strict adherence to the design system (see `colour_scheme.md` and `tailwind.config.js`)
  - Improved documentation in `src/pages/admin/docs.md`, `src/pages/teacher/docs.md`, and `src/components/quiz/docs.md`

See [src/components/quiz/docs.md](src/components/quiz/docs.md), [src/pages/admin/docs.md](src/pages/admin/docs.md), and [src/pages/teacher/docs.md](src/pages/teacher/docs.md) for full details.

### Design System & Accessibility
- Enforced KCA color system and Tailwind design tokens across all UI
- Improved accessibility: ARIA, keyboard navigation, focus states, WCAG compliance
- See docs.md and CONTRIBUTING.md for standards

---

For full details, see the referenced documentation files.

# Changelog


## [Unreleased] – July 2025

### User Management UI/UX Refactor & Infinite Loop Fix
- Refactored all user management components (EditUserModal, UserDetailsForm, UserTable, UserTableRow, etc.) for:
  - Beautiful, modern, and fully responsive UI using Tailwind color tokens and design system
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
  - Performance: React.memo, useCallback, useMemo, and local state for modal editing
  - Single-responsibility: each file/component now does one job only
- Fixed "Maximum update depth exceeded" error in EditUserModal by decoupling modal state from parent and using functional setUser
- Improved error handling and removed all redundant/duplicate handlers
- Updated all handlers for editing, status/role change, and bulk actions for clarity and correctness
- Updated and expanded documentation for user management components and modals

### Major UI/UX Refactor
- Refactored all tournament-related components for:
  - Strict adherence to the design system (see `colour_scheme.md`)
  - Full use of Tailwind color tokens and utility classes
  - Beautiful, modern, and responsive layouts for all screen sizes
  - Accessibility: ARIA roles, keyboard navigation, focus management, and visually hidden text
  - Performance: React.memo, clean prop usage, and single-responsibility components
  - Consistent iconography (inline SVGs)
  - Clear loading, error, and empty states with animation and visual cues
- Updated documentation and code comments for clarity and maintainability

### Docs
- Updated `README.md` with new UI/UX and design system details
- All changes follow the guidelines in `CONTRIBUTING.md`
## [Unreleased] - 2025-07-14
### Admin Dashboard UI/UX Refactor & Modularization
- Refactored `AdminDashboard.js` for:
  - Beautiful, modern, and fully responsive UI using Tailwind color tokens and design system
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/loading states
  - Performance: React.memo, useCallback, useMemo, and modular stat/error/loading components
  - Single-responsibility: each file/component now does one job only
- Created new modular components in `src/components/admin/`:
  - `StatCard.js`: Animated, accessible stat card for dashboard statistics
  - `LoadingState.js`: Accessible, visually clear loading state
  - `ErrorState.js`: Accessible, visually distinct error state
- Updated all relevant docs and ensured all components use the color system from `colour_scheme.md`.
### Schedule Display Refactor & Utility Addition
- Added `formatSchedule` utility to `src/utils/formatSchedule.js` for converting schedule JSON strings/objects to user-friendly strings.
- Updated all batch and classroom schedule displays to use `formatSchedule` for consistent, readable formatting (e.g., `Mon, Wed, Fri, 09:00 for 60 min` instead of raw JSON).
- Updated `src/utils/docs.md` with documentation and usage examples for `formatSchedule`.

### Major UI/UX Refactor & Improvements
- Refactored all student dashboard components for:
  - Beautiful, modern, and responsive UI using Tailwind and design tokens
  - Accessibility, keyboard navigation, and ARIA labels
  - Performance optimizations with React.memo, useCallback, useMemo
  - Single Responsibility Principle: extracted focused subcomponents
  - Consistent use of color tokens and design system
  - Animated states, clear feedback, and improved empty/loading/error states
  - No inline styles; all styling via Tailwind
- Components updated:
  - `ClassRating.js`: Star rating, feedback, and submission UI
  - `ClassroomAssignmentsTab.js`: Assignment cards, submission, grading, and empty state
  - `ClassroomDiscussionsTab.js`: Discussion and reply cards, new discussion UI, empty state
  - `ClassroomMaterialsTab.js`: Material cards, open button, empty state
  - `ClassroomOverviewTab.js`: Overview cards for schedule, about, instructor, next session
  - `QuizCard.js`: Quiz card, difficulty badge, meta info, start button


# July 2025: Teacher Modals & Feedback UI/UX Refactor

All teacher modal and feedback UI components are now modular, beautiful, and accessible. Components are single-responsibility, responsive, and use the KCA color system from `colour_scheme.md`.

**Key Improvements:**
- Modular, single-responsibility React components for all teacher modal/feedback features
- Fully responsive layouts (mobile-first, grid/flex)
- Accessible: ARIA roles, keyboard navigation, focus/hover/disabled states
- All interactive elements have transitions and clear states
- Error, loading, and empty states feature icons and improved clarity
- All components use Tailwind color tokens and spacing

**Components:**
AttendanceModal, FeedbackModal, FeedbackHistoryModal, PerformanceModal

See [`src/components/teacher/docs.md`](./src/components/teacher/docs.md) for details.

All resource center UI is now modular, beautiful, and accessible. Components are single-responsibility, responsive, and use the KCA color system from `colour_scheme.md`.

**Key Improvements:**
- Modular, single-responsibility React components for all resource center features
- Fully responsive layouts (mobile-first, grid/flex)
- Accessible: ARIA roles, keyboard navigation, focus/hover/disabled states
- All interactive elements have transitions and clear states
- Error, loading, and empty states feature icons and improved clarity
- All components use Tailwind color tokens and spacing

**Components:**
CategoryTabs, DetailsBody, DetailsHeader, EmptyState, ErrorState, FeaturedResources, LoadingSpinner, ResourceCard, ResourceDetailsEmptyState, ResourceDetailsErrorState, SearchBar, UploadResourceForm, VideoEmbed

See [`src/components/resourcecenter/docs.md`](./src/components/resourcecenter/docs.md) for details.

# 2025-07-11
- Refactored `PGNManagementPage.js` for modularity and single responsibility.
- Extracted subcomponents: `FeatureHighlights`, `TabNav`, `QuickActions`, `UploadHelpSection`.
- Updated all color classes to use Tailwind color tokens.
- Improved accessibility, responsiveness, and UI/UX polish.
# 2025-07-11 (cont'd)
- Refactored `PGNGameView.js` for color token usage, beautiful UI, accessibility, and responsiveness.
# [Unreleased] - July 2025

### Classroom UI/UX Refactor (July 2025)
- Refactored all classroom-related components for strict design system adherence (color tokens, dark mode, spacing, typography)
- Upgraded all skeletons, spinners, modals, badges, alerts, and view switchers for modern, beautiful, and accessible UI
- Improved responsiveness and mobile experience for all classroom UIs
- Added ARIA labels, keyboard navigation, and focus/hover/disabled states for accessibility
- Ensured single responsibility and modularity for all components (React.memo, composable structure)
- Updated error, loading, and empty states with icons and animation
- No build artifacts or orphan files; all new files registered and imported
- Updated all relevant docs and changelogs

## [Unreleased] - June 2024
### Major React Frontend Refactor & UI/UX Modernization
  - `App.js`, `Sidebar.js`, `TopNavbar.js`, `Breadcrumbs.js`, `NotificationBell.js`
  - Auth pages: `Login.js`, `Register.js`, `ResetPassword.js`, `VerifyEmail.js`
  - Dashboards: `Profile.js`, `StudentDashboard.js`, `TeacherDashboard.js`, `AdminDashboard.js`
  - Feature pages: `UploadsViewerPage.js`, `NotificationPreferences.js`

### Leave Management System
### Changed
### Added
### Changed
### Added

## Chess Dashboard UI/UX Refactor (July 2025)
- Refactored all chess-related pages and components for a beautiful, modern, and accessible user experience
- All student and teacher dashboard components refactored for modern UI/UX, accessibility, and responsiveness
- See `docs.md` and feature docs for details
### Changed
### Added
### Changed
### Added
### Changed
### Added
### Changed
### Added
### Changed
### Added
### Changed
### Added

# Changelog
## [Unreleased]
### Added

### Changed

## [Unreleased]
### Fixed
### Security

### Fixed
### Added

### Changed

## [Unreleased]
### Added

### Changed

### Fixed
## [Unreleased]
- Refactored `PlayerVsPlayer.js` into modular subcomponents: `TabButton`, `LoadingState`, `ErrorState`, `ComputerSettings`, `StatsPanel` (all in `src/components/chess/`).
- Updated documentation for new modular structure and usage.

## [Unreleased] – July 2025

### Attendance Settings UI/UX Refactor & Modularization
- Refactored `AttendanceSettings.js` (admin) for:
  - Beautiful, modern, and fully responsive UI using Tailwind color tokens and design system
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/loading/success states
  - Performance: React.memo, useCallback, and modular stat/error/loading components
  - Single-responsibility: each file/component now does one job only
- Updated all relevant docs and ensured all components use the color system from `colour_scheme.md`.
- Added success feedback and improved error handling for settings update.

### Analytics Dashboard & Components UI/UX Refactor
- Refactored all analytics dashboard and related components (`PlatformAnalytics.js`, `AnalyticsSkeleton.js`, `ErrorAlert.js`, `TimeRangeSelect.js`, `UserGrowthChart.js`, `UserActivityChart.js`, `PerformanceMetricsChart.js`) for:
  - Beautiful, modern, and fully responsive UI using Tailwind color tokens and design system (see `colour_scheme.md`)
  - Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/loading/empty states
  - Performance: React.memo, useCallback, useMemo, lazy loading, and modular field components
  - Single-responsibility: each file/component now does one job only
  - Consistent iconography (Lucide icons), animated transitions, and visual feedback
  - All components use the color system and are mobile-first responsive
- Updated all relevant docs and ensured all analytics components are registered and documented
- Improved documentation in `docs.md`, `src/components/analytics/docs.md`, and `README.md` to reflect new UI/UX, performance, and accessibility standards

## [Unreleased] - 2025-07-23
### Fixed
- Quizzes created from PGNs in the Chess Library now default to public visibility, ensuring they are visible to students when published.
- Batch PGN-to-quiz creation also defaults to public visibility.

### Recurring Classes & Batch Schedule Automation (2025-07-23)
- Teachers can now schedule recurring classes based on batch schedule (days, time, duration)
- New RecurringClassModal UI for previewing and generating multiple sessions at once
- Backend API endpoint for bulk session creation with conflict detection and notifications
- Updated ClassroomCard and ClassroomManagement for new workflow
- See `src/components/classroom/docs.md` and API docs for full details

## Enhanced Profile System (2025-07-24)
- Added FIDE ID field with validation and profile linking
- Added FIDE and national rating fields
- Mandatory profile picture upload for all users
- Mandatory date of birth certificate upload for students
- Admin document verification workflow for uploads
- Role-based profile fields for students and teachers/coaches
- See ENHANCED_PROFILE_DOCUMENTATION.md for full details

# [Unreleased] - July 2025

## Classroom Materials: Multiple File Upload (2025-07-24)
- Teachers can now upload multiple files at once as classroom materials.
- Each file is validated and creates a separate resource entry.
- UI shows selected file count and names, and supports mixed uploads (files + video links).
- Improved error handling and user feedback for uploads.
- Updated backend and frontend logic, docs, and configuration.

