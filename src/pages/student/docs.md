
# KCAdashboard Frontend – Student Pages Documentation

## Overview

The `student` folder under `pages` contains all top-level page components for student-facing features in the KCAdashboard application. These pages provide dashboards, classroom and resource access, quizzes, feedback, leaderboards, report cards, and tournament participation. They are designed to deliver a comprehensive and engaging experience for student users.

---

## File Structure

```
pages/student/
  ClassroomDetails.js    # Shows details of a classroom for students
  ClassroomPage.js       # Main classroom page for students
  FeedbackHistory.js     # Displays feedback history for students (see teacher modals for details)
  LeaderboardPage.js     # Shows leaderboard for students
  QuizDetailPage.js      # Detailed view of a quiz
  QuizHistoryPage.js     # Shows quiz history for a student
  QuizPage.js            # Main quiz page for students
  QuizResultsPage.js     # Displays quiz results
  ReportCard.js          # Shows student report card
  ResourceCenter.js      # Resource center for students
  ResourceDetails.js     # Detailed view of a resource
  StudentDashboard.js    # Dashboard for student users
  TournamentsPage.js     # Page for student tournaments
```

---

## File Explanations

- **ClassroomDetails.js**  
  Displays detailed information about a specific classroom, including members, schedule, and resources.

- **ClassroomPage.js**  
  The main classroom interface for students, showing announcements, assignments, and classroom activities.

- **FeedbackHistory.js**  
  Shows a history of feedback received by the student from teachers or the system. See `components/teacher/FeedbackHistoryModal.js` for modal UI details.

- **LeaderboardPage.js**  
  Displays student rankings and achievements within a class, batch, or the platform.

- **QuizDetailPage.js**  
  Provides a detailed view of a specific quiz, including instructions, rules, and start options.

- **QuizHistoryPage.js**  
  Shows a list of quizzes attempted by the student, with scores and attempt details.

- **QuizPage.js**  
  The main interface for taking quizzes, handling question navigation, timing, and submission.

- **QuizResultsPage.js**  
  Displays results and analytics for completed quizzes, including correct answers and explanations.

- **ReportCard.js**  
  Shows the student's academic performance, grades, and progress over time.

- **ResourceCenter.js**  
  Central hub for accessing study materials, documents, and resources.

- **ResourceDetails.js**  
  Detailed view of a specific resource, with download and preview options.

- **StudentDashboard.js**  
  The main dashboard for students, summarizing upcoming events, recent activity, and quick links.

- **TournamentsPage.js**  
  Interface for viewing and joining chess tournaments, with schedules and results.

---

## Features

- **Comprehensive Student Portal:** Dashboards, classrooms, quizzes, resources, and tournaments in one place.
- **Progress Tracking:** Leaderboards, report cards, and quiz history for self-assessment.
- **Interactive Learning:** Access to resources, feedback, and classroom activities.
- **Seamless Navigation:** Pages are organized for easy access to all student features.

---

## How These Pages Work

- Each page is mapped to a student route and orchestrates data fetching, state management, and UI rendering.
- Pages import and compose reusable components and hooks for modularity.
- Student navigation links to these pages for a smooth workflow.

---

## Example Usage

**Student Dashboard Route:**
```
import StudentDashboard from './pages/student/StudentDashboard';
<Route path="/student" element={<StudentDashboard />} />
```

**Quiz Page Route:**
```
import QuizPage from './pages/student/QuizPage';
<Route path="/student/quiz/:quizId" element={<QuizPage />} />
```

---

## Best Practices

- Keep page components focused on orchestration; delegate UI and logic to child components and hooks.
- Validate all user input and handle errors gracefully.
- Use modular, reusable components for consistency and maintainability.
- Provide clear feedback and progress indicators for students.

---

## Troubleshooting

- **Page not loading:** Check route configuration and authentication/authorization logic.
- **Data not updating:** Verify API endpoints and state management in the page/component.
- **UI inconsistencies:** Ensure all student pages use shared components and styles.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
