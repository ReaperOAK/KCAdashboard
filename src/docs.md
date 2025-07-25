# Quiz Management UI/UX Refactor (July 2025)

All quiz management components (admin and teacher) have been refactored for a beautiful, modern, and accessible user experience:

- Unified, generic `QuizManagementPage` component for both admin and teacher quiz management
- **NEW: Drag & Drop Question Reordering** - Teachers can now drag and drop questions to reorder them in quiz creation/editing, just like a PDF editor
- **NEW: Strict No-Retake Policy** - Once a quiz is submitted, students cannot retake it. This ensures fair assessment and prevents gaming the system.
- Fully responsive UI using Tailwind color tokens and design system
- Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
- Performance: React.memo, useCallback, useMemo, and code splitting for heavy components
- Single-responsibility: each file/component now does one job only
- Modular subcomponents: `QuizTableRow`, `QuizLoadingSkeleton`, `QuizErrorAlert`, `DeleteQuizModal`, `SortableQuestionsList`, `DraggableQuestionCard`, `QuizAlreadyAttempted`
- Strict adherence to the design system (see `colour_scheme.md` and `tailwind.config.js`)
- All states (loading, error, empty, data) handled beautifully and accessibly
- Improved documentation in `src/pages/admin/docs.md`, `src/pages/teacher/docs.md`, and `src/components/quiz/docs.md`

## No-Retake Policy (July 2025)

Implemented strict "once submitted, no retakes" policy for all quizzes:

### Features:
- **Backend Validation**: Quiz submission API checks if user has already attempted the quiz
- **Frontend Prevention**: Quiz detail page shows "already attempted" message if user tries to access a quiz they've completed
- **UI Updates**: Removed all "Try Again" and "Retry" buttons from result pages and history
- **Clear Communication**: Updated quiz instructions to clearly state the no-retake policy
- **Error Handling**: Proper error messages if someone tries to circumvent the restriction

### Components:
- `QuizAlreadyAttempted`: New component shown when user tries to access an already attempted quiz
- Updated `Quiz.php` model with `hasUserAttempted()` method
- Updated `ResultCard` component to remove retry functionality
- Updated `HistoryTable` component to remove retry buttons
- Updated quiz instructions to clearly communicate the policy

### Database Changes:
- Added index on `quiz_attempts` table for efficient attempt checking: `idx_user_quiz_attempt (user_id, quiz_id)`
- Quiz attempts table now enforces the one-attempt-per-quiz rule

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
- Quizzes created from PGNs now default to public visibility, so students can see them when published.
- Batch selection and quiz creation modals included.
- Quiz Creator auto-loads PGN data for seamless quiz authoring.

## PGN Sharing (July 2025)

- Teachers/admins can share PGN studies with any user via a dedicated modal.
- Students see a "Shared with Me" category in the PGN Library for easy access to shared content.
- Share button is only visible to teachers/admins.
- All sharing actions are role-checked and validated on backend.
- See `PGN_SHARING_FEATURE.md` for details.

# User Management UI/UX Refactor (July 2025)

All user management components have been refactored for a beautiful, modern, and accessible user experience:

- Fully responsive UI using Tailwind color tokens and design system
- Accessibility: ARIA roles, keyboard navigation, focus management, and clear error/empty/loading states
- Performance: React.memo, useCallback, useMemo, and local state for modal editing
- Single-responsibility: each file/component now does one job only
- Fixed "Maximum update depth exceeded" error in EditUserModal by decoupling modal state from parent and using functional setUser
- Improved error handling and removed all redundant/duplicate handlers
- Updated all handlers for editing, status/role change, and bulk actions for clarity and correctness
