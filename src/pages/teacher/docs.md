# KCAdashboard Frontend – Teacher Pages Documentation

## July 2025 UI/UX Overhaul

All teacher pages now use the full color system, accessibility, and modularity guidelines. See the main `docs.md` and `colour_scheme.md` for details.

- All dashboards, management, analytics, and quiz pages are fully responsive, accessible, and visually grouped.
- Section headers use icons and color tokens for clarity.
- All interactive elements have clear focus/hover states.

---

## Overview

### July 2025: Report Card Upload Bugfixes & Improvements

- Fixed bug where uploading a report card for a student would not update the UI or use the correct file URL.
- Now uses the server-generated filename and refreshes the student list after upload.
- Improved error and success feedback for teachers.
- Backend now logs errors and checks upload directory permissions.

The `teacher` folder under `pages` contains all top-level page components for teacher-facing features in the KCAdashboard application. These pages provide dashboards, batch and classroom management, quiz creation and management, grading, feedback, and analytics. They are designed to empower teachers with tools for managing classes, assignments, and student progress.

---

## File Structure


```
pages/teacher/
  BatchDetail.js                     # Shows details of a batch for teachers
  BatchManagement.js                 # Batch management page for teachers
  ClassroomDetail.js                 # Detailed classroom view for teachers
  ClassroomManagement.js             # Classroom management page for teachers
  GradingFeedback.js                 # Provides grading and feedback tools
  QuizCreator.js                     # Tool for creating quizzes
  QuizManagement.js                  # Manage quizzes as a teacher
  ReportsAnalytics.js                # Analytics and reports for teachers
  TeacherDashboard.js                # Dashboard for teacher users
  TeacherQuizLeaderboardPage.js      # View leaderboard for a specific quiz

components/teacher/
  AttendanceModal.js                 # Modal for marking attendance (see component docs)
  FeedbackModal.js                   # Modal for submitting feedback (see component docs)
  FeedbackHistoryModal.js            # Modal for viewing feedback history (see component docs)
  PerformanceModal.js                # Modal for viewing performance summary (see component docs)
```

---

## File Explanations

- **BatchDetail.js**  
  Displays detailed information about a specific batch, including enrolled students, schedule, and batch activities.

- **BatchManagement.js**  
  Interface for managing batches, including creation, editing, and assignment of students and subjects.

- **ClassroomDetail.js**  
  Detailed view of a classroom, showing members, assignments, and classroom resources.

- **ClassroomManagement.js**  
  Page for managing classrooms, including creation, editing, student/teacher assignments, and uploading materials. Prevents teachers from scheduling overlapping classes: if a teacher tries to schedule a class that overlaps with another of their sessions, the backend will reject the request and the frontend will display a user-friendly error. (As of July 2025, material upload now includes the required `type` field for backend compatibility.) Teachers can now upload multiple files at once as classroom materials. Each file is validated and creates a separate resource entry. UI shows selected file count and names.

- **GradingFeedback.js**  
  Tools for grading student submissions and providing feedback on assignments and quizzes.

- **QuizCreator.js**  
  Interface for creating new quizzes, adding questions, and setting quiz parameters.


- **QuizManagement.js**  
  Manage existing quizzes, view results, and edit quiz details. Now uses the new generic `QuizManagementPage` component (July 2025):
  - Unified, beautiful, and fully responsive UI for quiz management, shared with admin for consistency and maintainability
  - Strictly follows the design system (see `colour_scheme.md` and `tailwind.config.js`):
    - Responsive layouts, color tokens, spacing, and typography
    - Accessible: ARIA roles, keyboard navigation, focus/hover/active states
    - Handles all states (loading, error, empty, data) with modular components
  - Modular, single-responsibility components:
    - `QuizManagementPage`: Orchestrates quiz management UI
    - `QuizTableRow`: Renders quiz data and actions, fully accessible and responsive
    - `QuizLoadingSkeleton`: Loading spinner and message
    - `QuizErrorAlert`: Error message display
    - `DeleteQuizModal`: Accessible modal for quiz deletion
  - All components are memoized and optimized for performance (React.memo, useCallback, useMemo, code splitting)
  - Includes filters for difficulty and status, and a leaderboard button for each quiz
  - See `src/components/quiz/docs.md` for details and usage patterns.

- **ReportsAnalytics.js**  
  Analytics and reporting tools for tracking student performance and classroom metrics.

- **TeacherDashboard.js**  
  The main dashboard for teachers, summarizing upcoming classes, assignments, and recent activity.

- **TeacherQuizLeaderboardPage.js**  
  View the leaderboard for a specific quiz as a teacher.

---


## Features

- **Comprehensive Teacher Portal:** Dashboards, batch/classroom management, quizzes, grading, analytics, and beautiful modals for attendance, feedback, and performance.
- **Assignment & Quiz Tools:** Create, manage, and grade assignments and quizzes.
- **Progress Tracking:** Analytics and reports for monitoring student and class performance.
- **Seamless Navigation:** Pages are organized for easy access to all teacher features.
- **Modern Modals:** All modals are single-responsibility, accessible, responsive, and use the KCA color system. See `components/teacher/docs.md` for details.

---

## How These Pages Work

- Each page is mapped to a teacher route and orchestrates data fetching, state management, and UI rendering.
- Pages import and compose reusable components and hooks for modularity.
- Teacher navigation links to these pages for a smooth workflow.

---

## Example Usage

**Teacher Dashboard Route:**
```
import TeacherDashboard from './pages/teacher/TeacherDashboard';
<Route path="/teacher" element={<TeacherDashboard />} />
```

**Quiz Creator Route:**
```
import QuizCreator from './pages/teacher/QuizCreator';
<Route path="/teacher/quiz/create" element={<QuizCreator />} />
```

**Teacher Quiz Leaderboard Route:**
```
import TeacherQuizLeaderboardPage from './pages/teacher/TeacherQuizLeaderboardPage';
<Route path="/teacher/quiz/:quizId/leaderboard" element={<TeacherQuizLeaderboardPage />} />
```

---

## Best Practices

- Keep page components focused on orchestration; delegate UI and logic to child components and hooks.
- Validate all user input and handle errors gracefully.
- Use modular, reusable components for consistency and maintainability.
- Provide clear feedback and progress indicators for teachers.

---

## Troubleshooting

- **Page not loading:** Check route configuration and authentication/authorization logic.
- **Data not updating:** Verify API endpoints and state management in the page/component.
- **UI inconsistencies:** Ensure all teacher pages use shared components and styles.

---

## Quiz No-Retake Policy

- Students can only attempt each quiz once.
- No option to allow retakes or set a cooling period.
- Teachers should communicate this to students when assigning quizzes.
- See `README-quiz-no-retake-policy.md` for technical details.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
