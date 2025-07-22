# Quiz Management UI/UX Refactor (July 2025)

All quiz management components (admin and teacher) have been refactored for a beautiful, modern, and accessible user experience:

- Unified, generic `QuizManagementPage` component for both admin and teacher quiz management
- **NEW: Drag & Drop Question Reordering** - Teachers can now drag and drop questions to reorder them in quiz creation/editing, just like a PDF editor
- Fully responsive UI using Tailwind color tokens and design system
- Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
- Performance: React.memo, useCallback, useMemo, and code splitting for heavy components
- Single-responsibility: each file/component now does one job only
- Modular subcomponents: `QuizTableRow`, `QuizLoadingSkeleton`, `QuizErrorAlert`, `DeleteQuizModal`, `SortableQuestionsList`, `DraggableQuestionCard`
- Strict adherence to the design system (see `colour_scheme.md` and `tailwind.config.js`)
- All states (loading, error, empty, data) handled beautifully and accessibly
- Improved documentation in `src/pages/admin/docs.md`, `src/pages/teacher/docs.md`, and `src/components/quiz/docs.md`

## Drag & Drop Question Reordering (July 2025)

Teachers can now reorder quiz questions by dragging and dropping them, similar to PDF editors or document management systems:

### Features:
- **Visual Drag Handles**: Each question card has a grip handle (⋮) that teachers can grab to drag questions
- **Live Preview**: Questions show visual feedback during dragging with shadows and highlighting
- **Auto-save**: Question order is automatically saved to the database when reordering
- **Accessible**: Keyboard navigation support with arrow keys and screen reader compatibility
- **Visual Indicators**: Clear numbering (Question 1, 2, 3...) that updates as you drag
- **Smooth Animations**: Powered by @dnd-kit with smooth transitions and momentum

### Components:
- `SortableQuestionsList`: Main drag-and-drop container with instructions and save functionality
- `DraggableQuestionCard`: Individual draggable question wrapper with drag handle and delete button
- Backend support via `QuizApi.reorderQuestions()` and `/api/quiz/reorder-questions.php`

### Database Changes:
- Added `order_index` column to `quiz_questions` table for persistent ordering
- Questions are now ordered by `order_index ASC, id ASC` instead of just `id`

## PGN to Quiz Integration (July 2025)

- Teachers/admins can convert PGN games to quiz questions directly from the Chess Library (single or batch).
- Batch selection and quiz creation modals included.
- Quiz Creator auto-loads PGN data for seamless quiz authoring.

- Teachers/admins can convert PGN games to quiz questions directly from the Chess Library (single or batch).
- Batch selection and quiz creation modals included.
- Quiz Creator auto-loads PGN data for seamless quiz authoring.

# User Management UI/UX Refactor (July 2025)

All user management components have been refactored for a beautiful, modern, and accessible user experience:

- Fully responsive UI using Tailwind color tokens and design system
- Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
- Performance: React.memo, useCallback, useMemo, and local state for modal editing
- Single-responsibility: each file/component now does one job only
- Fixed "Maximum update depth exceeded" error in EditUserModal by decoupling modal state from parent and using functional setUser
- Improved error handling and removed all redundant/duplicate handlers
- Updated all handlers for editing, status/role change, and bulk actions for clarity and correctness
