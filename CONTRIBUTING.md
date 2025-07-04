# Contributing

## New Feature: Teacher Quiz Leaderboard

- When adding new quiz-related features, ensure both students and teachers have access to relevant analytics and leaderboards.
- Teacher leaderboard pages should use the same API endpoints as student leaderboard pages for consistency.
- When adding a new teacher page, update `src/pages/teacher/docs.md` and the main `README.md`.
- Add new routes to `src/routes/teacherRoutes.js` and test navigation from the Quiz Management page.
- When making changes to upload or permissions logic, ensure that restrictions (such as preventing students from uploading PGNs) are enforced in both backend and frontend, and update documentation accordingly.

See the codebase and documentation for more details.
