### Security & Standardization
- All notification-related backend endpoints now use NotificationService for sending, deleting, and managing notifications.
- All user IDs, emails, and input data are sanitized and validated for security in endpoints, NotificationService, and Mailer.
- NotificationPreference and Notification model logic improved for robust, secure operations.
- All notification endpoints set CORS and JSON headers, and log errors for easier debugging.
- Notification categories are standardized and all logic respects user preferences.
- Documentation updated in notifications/docs.md, services/docs.md, models/docs.md, and src/pages/notifications/docs.md to reflect new security, standardization, and best practices for notifications.
### Changed
- Tournament update endpoint now uses the centralized NotificationService to send notifications in bulk to all registered users when an online tournament is started. This ensures all tournament notifications are consistent, respect user preferences, and are future-proof.
### Added
- Updated documentation in `tournaments/docs.md` and `services/docs.md` to reflect NotificationService usage for tournament start notifications.
### Changed
- Tournament payment-verify endpoint now uses the centralized NotificationService to notify users when their payment is approved or rejected. This ensures all payment notifications are consistent, respect user preferences, and are future-proof.
### Added
- Updated documentation in `tournaments/docs.md` and `services/docs.md` to reflect NotificationService usage for tournament payment notifications.
### Changed
- Notifications delete endpoint now uses the centralized NotificationService for notification deletion logic. This ensures all notification deletion is consistent, respects user permissions, and is future-proof.
### Added
- Updated documentation in `notifications/docs.md` and `services/docs.md` to reflect NotificationService usage for notification deletion.
### Changed
- Notifications admin-sent endpoint now uses the centralized NotificationService to retrieve and group admin-sent notifications for audit and review. This ensures all notification listing logic is consistent, respects user preferences, and is future-proof.
### Added
- Updated documentation in `notifications/docs.md` and `services/docs.md` to reflect NotificationService usage for admin-sent notification listing.
### Changed
- Grading submit-feedback endpoint now uses the centralized NotificationService to notify students when new feedback is submitted by a teacher. This ensures all notifications are consistent, respect user preferences, and are future-proof.
### Added
- Updated documentation in `grading/docs.md` and `services/docs.md` to reflect NotificationService usage for feedback notifications.
### Changed
- Classroom submit-assignment endpoint now uses the centralized NotificationService to notify the classroom teacher when a new assignment submission is made. This ensures all notifications are consistent, respect user preferences, and are future-proof.
### Added
- Updated documentation in `classroom/docs.md` and `services/docs.md` to reflect NotificationService usage for assignment submission notifications.
### Changed
- Classroom post-discussion endpoint now uses the centralized NotificationService to send notifications: when a user replies to a post, the parent post owner is notified; when a new topic is started, the classroom teacher is notified. This ensures all notifications are consistent, respect user preferences, and are future-proof.
### Added
- Updated documentation in `classroom/docs.md` and `services/docs.md` to reflect NotificationService usage for classroom discussion notifications.
### Changed
- Classroom grade-assignment endpoint now uses the centralized NotificationService to send notifications to students when their assignments are graded. This ensures all notifications are consistent, respect user preferences, and are future-proof.
### Added
- Updated documentation in `classroom/docs.md` and `services/docs.md` to reflect NotificationService usage for assignment grading notifications.
### Changed
- Direct links to `/uploads/...` are now blocked. All file viewing is routed through `/uploads/view/:resourceId?type=pdf|img` and the secure React viewer. Update all frontend usages and links accordingly.
- Attendance marking now uses the centralized NotificationService to send absence notifications to students. This ensures all notifications are consistent, respect user preferences, and are future-proof.
- Chess challenge endpoint now uses the centralized NotificationService to send challenge notifications to recipients, ensuring consistency and future extensibility.
- Chess game cleanup endpoint now uses the centralized NotificationService to send auto-resign notifications to both players, ensuring consistency and future extensibility.
- Chess challenge response endpoint now uses the centralized NotificationService to send notifications to the challenger when a challenge is accepted or declined, ensuring consistency and future extensibility.
- Chess save-result endpoint now uses the centralized NotificationService to send notifications to both players when a game result is saved, ensuring consistency and future extensibility.
- Classroom add-material endpoint now uses the centralized NotificationService to send notifications to all students in the classroom when new material is added, ensuring consistency and future extensibility.
- Classroom add-session endpoint now uses the centralized NotificationService to send notifications to all students in the classroom when a new class session is scheduled, ensuring consistency and future extensibility.
### Added
- Teachers can no longer schedule more than one class at the same time. The backend now prevents overlapping sessions for the same teacher across all classrooms. If an overlap is detected, the API returns an error and the session is not created. The frontend now displays a user-friendly error message if this occurs.
- `SecureFileViewer` React component for secure inline viewing of PDF and image resources. Fetches files via the backend API with authentication.

# Changelog
## [Unreleased]
### Added
- Modern, responsive NotificationBell component with glassmorphism, gradients, and smooth animations for a beautiful notification experience on all devices.
- Notification panel now features category tabs, accessibility improvements, and a wider, more usable layout.
- Documentation updated for NotificationBell and notifications system to reflect new UI/UX and usage.

### Changed
- NotificationBell dropdown panel and notification list are now fully responsive and visually enhanced for clarity and usability.

## [Unreleased]
### Fixed
### Security
- Direct access to files in the `uploads/` directory is now blocked at the web server level (HTTP 403). All downloads must go through the backend API, which enforces authentication and authorization. Documentation updated.
- Resource downloads continue to enforce resource-level access control. Only the resource owner, admins, or users with whom the resource is shared (directly, via batch, or classroom) can download files. Unauthorized users receive a 403 Forbidden error.
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
- Attendance marking now uses the centralized NotificationService to send absence notifications to students. This ensures all notifications are consistent, respect user preferences, and are future-proof.
- Chess challenge endpoint now uses the centralized NotificationService to send challenge notifications to recipients, ensuring consistency and future extensibility.
- Chess game cleanup endpoint now uses the centralized NotificationService to send auto-resign notifications to both players, ensuring consistency and future extensibility.
- Chess resign endpoint now uses the centralized NotificationService to send resign notifications to both players, ensuring consistency and future extensibility.
- Chess challenge response endpoint now uses the centralized NotificationService to send notifications to the challenger when a challenge is accepted or declined, ensuring consistency and future extensibility.
- Chess save-result endpoint now uses the centralized NotificationService to send notifications to both players when a game result is saved, ensuring consistency and future extensibility.
- Classroom add-material endpoint now uses the centralized NotificationService to send notifications to all students in the classroom when new material is added, ensuring consistency and future extensibility.
- Classroom add-session endpoint now uses the centralized NotificationService to send notifications to all students in the classroom when a new class session is scheduled, ensuring consistency and future extensibility.
- Updated documentation in `attendance/docs.md`, `services/docs.md`, and `classroom/docs.md` to reflect these changes.

