# Changelog

## [Unreleased]
### Fixed
- Countdown timer in PvP chess now resets and synchronizes correctly after each move. The timer is updated immediately from the backend response, ensuring accurate per-move timing for both players.
- Teacher material upload now includes the required `type` field in the request, resolving backend errors for missing required fields. Frontend and backend are now fully compatible for classroom material uploads.
- CORS and 404 issues for classroom/rate-class.php endpoints.

### Fixed
- Improved error handling in grading backend (get-pending.php) to log and return errors gracefully.
- Prevented duplicate API calls for pending grading/attendance in TeacherDashboard frontend.
### Added
- Teachers can now view the leaderboard for any quiz from the Quiz Management page. A new leaderboard page and route were added for teachers.
- Students are now prevented from uploading PGN files. The backend upload endpoint returns a 403 error if a student attempts to upload a PGN.
- CORS header and require_once for CORS in both public and build classroom/rate-class.php endpoints to resolve CORS and 404 issues.
- Documented rate-class.php endpoint in classroom docs.md for both public and build folders.
- Admins can now edit any quiz using the new /admin/quizzes/edit/:id route and AdminQuizEditor page (reuses teacher quiz editor for consistency).

### Changed
- QuizManagement page now fetches all quizzes for admins (not just their own or public). Admins can view and manage all quizzes.
- QuizManagement page now includes a leaderboard button for each quiz (visible to teachers).
- Admins can now update any quiz via the API. Backend permission logic in Quiz.php and update.php was updated to allow admin role to edit all quizzes.

