-  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads and in-browser viewing must go through the backend API, which enforces authentication and authorization. Use the `SecureFileViewer` React component for secure inline viewing of PDF and image resources. Update docs and tests accordingly.
  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads and in-browser viewing must go through the backend API, which enforces authentication and authorization. Use the `/uploads/view/:resourceId?type=pdf|img` route and the `SecureFileViewer` React component for secure inline viewing. Update docs and tests accordingly.
-  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads must go through the backend API, which enforces authentication and authorization. Update docs and tests accordingly.
  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads and in-browser viewing must go through the backend API, which enforces authentication and authorization. Use the `SecureFileViewer` React component for secure inline viewing of PDF and image resources. Update docs and tests accordingly.
- When updating resource download logic, ensure resource-level access control is enforced: only owners, admins, or users with whom the resource is shared (directly, via batch, or classroom) can download. Update docs and tests accordingly.
  - Direct access to files in the `uploads/` directory must be blocked at the web server level (HTTP 403). All downloads must go through the backend API, which enforces authentication and authorization. Update docs and tests accordingly.
# Contributing


## New Feature: Admin Quiz Management

- Admins can now view and manage all quizzes from the Quiz Management page. When adding or updating quiz management features, ensure that admin users have access to all quizzes, not just their own or public ones.
- When making changes to quiz management, update both backend (Quiz.php, endpoints) and frontend (QuizManagement.js) to reflect admin access.

- When adding new quiz-related features, ensure both students and teachers have access to relevant analytics and leaderboards.
- Teacher leaderboard pages should use the same API endpoints as student leaderboard pages for consistency.
- When adding a new teacher page, update `src/pages/teacher/docs.md` and the main `README.md`.

- When adding or updating quiz editing features, ensure both admin and teacher editors are consistent and update documentation and routes accordingly.

- When updating backend quiz permissions, ensure admin users can update any quiz, not just their own. See Quiz.php and update.php for logic.

## Error Handling & API Best Practices
- When modifying backend endpoints, always add error handling and logging for diagnostics.
- For frontend API calls, ensure duplicate requests are prevented and errors are handled gracefully in the UI.
- Add new routes to `src/routes/teacherRoutes.js` and test navigation from the Quiz Management page.
- When making changes to upload or permissions logic, ensure that restrictions (such as preventing students from uploading PGNs) are enforced in both backend and frontend, and update documentation accordingly.
- When updating resource download logic, ensure resource-level access control is enforced: only owners, admins, or users with whom the resource is shared (directly, via batch, or classroom) can download. Update docs and tests accordingly.
- When updating classroom material upload, always include the required `type` field in frontend requests to match backend requirements (see July 2025 fix).
- When adding or updating classroom endpoints (such as rate-class.php), ensure CORS is included and the endpoint is documented in the appropriate docs.md file.

See the codebase and documentation for more details.
