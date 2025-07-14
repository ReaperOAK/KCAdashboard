

# Quiz Management UI/UX Refactor (July 2025)

All quiz management components (admin and teacher) have been refactored for a beautiful, modern, and accessible user experience:

- Unified, generic `QuizManagementPage` component for both admin and teacher quiz management
- Fully responsive UI using Tailwind color tokens and design system
- Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
- Performance: React.memo, useCallback, useMemo, and code splitting for heavy components
- Single-responsibility: each file/component now does one job only
- Modular subcomponents: `QuizTableRow`, `QuizLoadingSkeleton`, `QuizErrorAlert`, `DeleteQuizModal`
- Strict adherence to the design system (see `colour_scheme.md` and `tailwind.config.js`)
- All states (loading, error, empty, data) handled beautifully and accessibly
- Improved documentation in `src/pages/admin/docs.md`, `src/pages/teacher/docs.md`, and `src/components/quiz/docs.md`

# User Management UI/UX Refactor (July 2025)

All user management components have been refactored for a beautiful, modern, and accessible user experience:

- Fully responsive UI using Tailwind color tokens and design system
- Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
- Performance: React.memo, useCallback, useMemo, and local state for modal editing
- Single-responsibility: each file/component now does one job only
- Fixed "Maximum update depth exceeded" error in EditUserModal by decoupling modal state from parent and using functional setUser
- Improved error handling and removed all redundant/duplicate handlers
- Updated all handlers for editing, status/role change, and bulk actions for clarity and correctness
