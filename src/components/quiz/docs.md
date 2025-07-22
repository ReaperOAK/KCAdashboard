# July 2025 UI/UX Overhaul

All quiz-related components now follow the Kolkata Chess Academy color system, accessibility, and modularity guidelines. See the main `docs.md` and `colour_scheme.md` for details.

- All forms, tables, and sharing controls are visually grouped, accessible, and responsive.
- Section headers use icons and color tokens for clarity.
- All interactive elements have clear focus/hover states.

---

# Quiz Components Documentation

## Modular Quiz Components & Generic QuizManagementPage (July 2025)

The following modular, single-responsibility components are used in the Quiz Management UI for both admin and teacher roles:

- **QuizManagementPage**: Generic, orchestrating component for quiz management. Handles all states (loading, error, empty, data), filters, and actions. Used by both admin and teacher quiz management pages for a unified, beautiful, and maintainable UI.
- **QuizTableRow**: Renders a single row in the quiz table, including actions for edit, publish, delete, and leaderboard. Fully accessible, responsive, and uses color tokens.
- **QuizLoadingSkeleton**: Displays a loading spinner and message while quizzes are being fetched.
- **QuizErrorAlert**: Shows an error message if quiz data fails to load.
- **DeleteQuizModal**: Modal dialog for confirming quiz deletion, with accessible ARIA roles and keyboard navigation.

## Drag & Drop Quiz Question Reordering (July 2025)

New components for enabling teachers to drag and drop questions to reorder them:

- **SortableQuestionsList**: Main container component that wraps all questions in a drag-and-drop context. Features:
  - Visual instructions for users ("Drag & Drop to Reorder")
  - Status indicators for unsaved changes
  - Save button for persisting question order changes
  - Keyboard accessibility with arrow key navigation
  - Beautiful drag overlay animations

- **DraggableQuestionCard**: Wrapper component for individual questions that provides:
  - Drag handle (⋮) with hover effects and grab cursor
  - Question header with number and type badges
  - Delete button integrated into the card header
  - Visual feedback during dragging (shadows, scaling, rotation)
  - Accessibility labels and ARIA support

### Usage Example:
```jsx
<SortableQuestionsList
  questions={quiz.questions}
  onQuestionsReorder={handleQuestionsReorder}
  onSaveQuestionOrder={handleSaveQuestionOrder}
  showSaveButton={true}
>
  {(question, questionIndex, isDragDisabled) => (
    <DraggableQuestionCard
      key={question.id || question.tempId}
      question={question}
      questionIndex={questionIndex}
      handleRemoveQuestion={handleRemoveQuestion}
      isDragDisabled={isDragDisabled}
    >
      <QuestionCard question={question} questionIndex={questionIndex} {...handlers} />
    </DraggableQuestionCard>
  )}
</SortableQuestionsList>
```

### Technical Implementation:
- Built with @dnd-kit/core and @dnd-kit/sortable for modern, accessible drag and drop
- Uses framer-motion for smooth animations and transitions
- Persists changes via `QuizApi.reorderQuestions()` endpoint
- Database support through `order_index` column in `quiz_questions` table

All components are located in `src/components/quiz/` and are imported into both `src/pages/admin/QuizManagement.js` and `src/pages/teacher/QuizManagement.js`.

### Design & Accessibility
- All components use Tailwind CSS with project color tokens and spacing.
- Interactive elements have focus, hover, and disabled states.
- All modals and alerts use semantic HTML and ARIA attributes for accessibility.
- Components are fully responsive and tested on all major device sizes.
- Strictly follow the design system (see `colour_scheme.md` and `tailwind.config.js`).

### Usage Example
See `src/pages/admin/QuizManagement.js` and `src/pages/teacher/QuizManagement.js` for usage patterns and prop documentation.

---

## Changelog
- **July 2025**: Extracted all quiz UI subcomponents for modularity and maintainability. Created generic `QuizManagementPage` for both admin and teacher. Updated docs and changelog.
