## [Unreleased] - 2025-07-14
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

