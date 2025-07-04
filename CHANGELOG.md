# Changelog

## [Unreleased]
### Fixed
- Improved error handling in grading backend (get-pending.php) to log and return errors gracefully.
- Prevented duplicate API calls for pending grading/attendance in TeacherDashboard frontend.
### Added
- Teachers can now view the leaderboard for any quiz from the Quiz Management page. A new leaderboard page and route were added for teachers.
- Students are now prevented from uploading PGN files. The backend upload endpoint returns a 403 error if a student attempts to upload a PGN.


### Changed
- QuizManagement page now fetches all quizzes for admins (not just their own or public). Admins can view and manage all quizzes.
- QuizManagement page now includes a leaderboard button for each quiz (visible to teachers).

