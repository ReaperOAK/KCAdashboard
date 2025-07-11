# Quiz Components Documentation

## Modular Quiz Components (July 2025)

The following modular, single-responsibility components are used in the Quiz Management UI:

- **QuizLoadingSkeleton**: Displays a loading spinner and message while quizzes are being fetched.
- **QuizErrorAlert**: Shows an error message if quiz data fails to load.
- **DeleteQuizModal**: Modal dialog for confirming quiz deletion, with accessible ARIA roles and keyboard navigation.
- **QuizTableRow**: Renders a single row in the quiz table, including actions for edit, publish, and delete, with proper color tokens and ARIA labels.

All components are located in `src/components/quiz/` and are imported into `src/pages/admin/QuizManagement.js`.

### Design & Accessibility
- All components use Tailwind CSS with project color tokens and spacing.
- Interactive elements have focus, hover, and disabled states.
- All modals and alerts use semantic HTML and ARIA attributes for accessibility.
- Components are fully responsive and tested on all major device sizes.

### Usage Example
See `src/pages/admin/QuizManagement.js` for usage patterns and prop documentation.

---

## Changelog
- **July 2025**: Extracted all quiz UI subcomponents for modularity and maintainability. Updated QuizManagement.js to use these imports. Updated docs and changelog.
