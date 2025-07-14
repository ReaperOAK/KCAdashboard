# KCAdashboard Frontend – Classroom Components Documentation

## Overview

The `classroom` subfolder under `components` contains React components related to classroom management and participation in KCAdashboard. These components support workflows for teachers and students to manage assignments, attendance, schedules, and classroom materials.

---

## File Structure


```
components/classroom/
  AssignmentsView.js     # Displays classroom assignments
  AttendanceModal.js     # Modal for managing classroom attendance
  ClassroomCalendar.js   # Calendar for classroom events and sessions
  MaterialsView.js       # Shows classroom materials
  LoadingSkeleton.js     # Animated loading skeleton for classroom pages
  LoadingSpinner.js      # Beautiful, accessible loading spinner for classroom pages
  ModalOverlay.js        # Modal overlay with focus trap and escape close
  StatusBadge.js         # Status badge for classroom items (active, upcoming, etc.)
  ViewSwitcher.js        # Switches between classroom views (calendar, materials, assignments)
  ErrorAlert.js          # Error alert with icon and color tokens
  ErrorState.js          # General error state display with icon and animation
  MaterialCard.js        # Card for displaying classroom material info
```

---


## File Explanations

- **AssignmentsView.js**  
  Displays a list of assignments for a classroom, supporting submission and grading workflows.

- **AttendanceModal.js**  
  Modal dialog for marking and viewing classroom attendance.

- **ClassroomCalendar.js**  
  Calendar component for displaying classroom events, sessions, and schedules. If a teacher attempts to schedule a class that overlaps with another of their sessions, the backend will reject the request and the frontend will display a user-friendly error message.

- **MaterialsView.js**  
  Shows learning materials and resources available to the classroom.

- **LoadingSkeleton.js**  
  Animated loading skeleton for classroom management pages. Uses color tokens, dark mode, and improved accessibility.

- **LoadingSpinner.js**  
  Beautiful, accessible loading spinner for classroom pages. Uses color tokens, dark mode, and responsive layout.

- **ModalOverlay.js**  
  Modal overlay for dialogs, with focus trap and escape close. Uses color tokens, dark mode, and backdrop blur for a modern look.

- **StatusBadge.js**  
  Status badge for classroom items (active, upcoming, etc.). Uses color tokens, dark mode, and Lucide icons for clarity and accessibility.

- **ViewSwitcher.js**  
  Switches between classroom views (calendar, materials, assignments). Uses color tokens, dark mode, and accessible button states.

- **ErrorAlert.js**  
  Error alert with icon, color tokens, and animation. Accessible and responsive.

- **ErrorState.js**  
  General error state display with icon, color tokens, and animation. Accessible and responsive.

- **MaterialCard.js**  
  Card for displaying classroom material info. Uses color tokens, dark mode, and responsive layout.

---


## How These Components Work

- Components are imported and used in classroom management pages or other components.
- All subcomponents are modular, single-responsibility, and optimized with React.memo.
- They interact with the backend via API calls to fetch, update, or display classroom data.
- All use the color system in `../../../../colour_scheme.md` and support dark mode.
- All interactive elements are accessible (ARIA, keyboard nav, focus/hover/disabled states).
- Designed to be reusable and composable for classroom-related workflows.

---


## Example Usage

- Teachers use `AssignmentsView.js` to manage assignments and `AttendanceModal.js` to mark attendance.
- Students view classroom schedules with `ClassroomCalendar.js` and access materials with `MaterialsView.js`.
- All classroom pages now use `LoadingSkeleton.js` and `LoadingSpinner.js` for loading states, `ErrorAlert.js` and `ErrorState.js` for error/empty states, and `ModalOverlay.js` for dialogs.
- `StatusBadge.js` and `ViewSwitcher.js` are used for status indication and view switching in classroom UIs.

---


## Best Practices

- Keep components focused and reusable.
- Use color tokens and dark mode for all UI elements.
- Ensure all interactive elements are accessible and responsive.
- Use React.memo for performance and single responsibility.
- Document component props and usage for maintainability.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
