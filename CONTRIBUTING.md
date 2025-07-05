# Contributing


## New Feature: Admin Quiz Management

- Admins can now view and manage all quizzes from the Quiz Management page. When adding or updating quiz management features, ensure that admin users have access to all quizzes, not just their own or public ones.
- When making changes to quiz management, update both backend (Quiz.php, endpoints) and frontend (QuizManagement.js) to reflect admin access.

- When adding new quiz-related features, ensure both students and teachers have access to relevant analytics and leaderboards.
- Teacher leaderboard pages should use the same API endpoints as student leaderboard pages for consistency.
- When adding a new teacher page, update `src/pages/teacher/docs.md` and the main `README.md`.

## Error Handling & API Best Practices
- When modifying backend endpoints, always add error handling and logging for diagnostics.
- For frontend API calls, ensure duplicate requests are prevented and errors are handled gracefully in the UI.
- Add new routes to `src/routes/teacherRoutes.js` and test navigation from the Quiz Management page.
- When making changes to upload or permissions logic, ensure that restrictions (such as preventing students from uploading PGNs) are enforced in both backend and frontend, and update documentation accordingly.
- When updating classroom material upload, always include the required `type` field in frontend requests to match backend requirements (see July 2025 fix).
- When adding or updating classroom endpoints (such as rate-class.php), ensure CORS is included and the endpoint is documented in the appropriate docs.md file.

See the codebase and documentation for more details.
