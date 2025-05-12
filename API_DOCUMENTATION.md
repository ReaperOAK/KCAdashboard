# Kolkata Chess Academy Dashboard - API Documentation

This document provides details about all available API endpoints in the KCA Dashboard application.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Batches](#batches)
- [Classroom](#classroom)
- [Chess](#chess)
- [Quiz](#quiz)
- [Resources](#resources)
- [Support](#support)
- [Notifications](#notifications)
- [Attendance](#attendance)
- [Analytics](#analytics)
- [PGN](#pgn)
- [Tournaments](#tournaments)
- [Grading](#grading)

---

## File Structure
```
└── 📁api
    └── 📁config
        └── cors.php
        └── Database.php
        └── init_db.php
        └── mail.php
    └── 📁endpoints
        └── 📁admin
            └── dashboard-stats.php
        └── 📁analytics
            └── debug.php
            └── export.php
            └── 📁exports
                └── attendance.php
                └── batch_comparison.php
                └── quiz_results.php
                └── student_performance.php
            └── get-stats.php
            └── student-performance.php
            └── teacher-stats.php
        └── 📁attendance
            └── export.php
            └── get-all.php
            └── get-students-attendance.php
            └── get-user-attendance.php
            └── mark-attendance.php
            └── send-reminders.php
            └── sync-online-class.php
            └── update-settings.php
        └── 📁auth
            └── login.php
            └── register.php
            └── request-reset.php
            └── reset-password.php
            └── update-profile.php
            └── verify-token.php
        └── 📁batches
            └── add-student.php
            └── create.php
            └── delete.php
            └── get-all.php
            └── get-details.php
            └── get-students.php
            └── remove-student.php
            └── update.php
        └── 📁chess
            └── challenge.php
            └── challenges.php
            └── create-practice.php
            └── create-simul.php
            └── create-study.php
            └── end-simul.php
            └── engine-analysis.php
            └── game.php
            └── games.php
            └── join-simul.php
            └── make-move.php
            └── online-players.php
            └── player-stats.php
            └── practice-positions.php
            └── respond-challenge.php
            └── save-result.php
            └── share-study.php
            └── shared-studies.php
            └── simul-games.php
            └── simul-move.php
            └── start-simul.php
            └── studies.php
            └── study.php
            └── update-study.php
        └── 📁classroom
            └── add-material.php
            └── add-session.php
            └── get-assignments.php
            └── get-available-classes.php
            └── get-classroom-details.php
            └── get-discussions.php
            └── get-materials.php
            └── get-session-students.php
            └── get-sessions.php
            └── get-student-classes.php
            └── get-teacher-classes.php
            └── post-discussion.php
            └── submit-assignment.php
            └── track-attendance.php
        └── 📁grading
            └── get-all-students.php
            └── get-batch-students.php
            └── get-student-feedback-history.php
            └── get-student-performance.php
            └── submit-feedback.php
        └── 📁notifications
            └── admin-sent.php
            └── delete.php
            └── get-preferences.php
            └── get.php
            └── mark-all-read.php
            └── mark-read.php
            └── send.php
            └── templates.php
            └── update-preferences.php
        └── 📁pgn
            └── delete.php
            └── get-pgn.php
            └── get-public-pgns.php
            └── get-share-users.php
            └── get-teacher-pgns.php
            └── get-teachers.php
            └── remove-share.php
            └── share.php
            └── update.php
            └── upload.php
        └── 📁quiz
            └── create.php
            └── delete.php
            └── get-all.php
            └── get-by-difficulty.php
            └── get-by-id.php
            └── get-latest-result.php
            └── get-leaderboard.php
            └── get-overall-leaderboard.php
            └── get-teacher-quizzes.php
            └── get-user-history.php
            └── submit-quiz.php
            └── update.php
            └── upload-question-image.php
        └── 📁resources
            └── bookmark.php
            └── download.php
            └── get-all.php
            └── get-bookmarks.php
            └── get-by-category.php
            └── get-by-id.php
            └── get-featured.php
            └── log-access.php
            └── search.php
            └── unbookmark.php
            └── upload.php
        └── 📁support
            └── 📁faqs
                └── create.php
                └── delete.php
                └── get-all.php
            └── 📁tickets
                └── get-all.php
        └── 📁tournaments
            └── cancel-registration.php
            └── create.php
            └── delete.php
            └── get-all.php
            └── get-by-status.php
            └── get-registrations.php
            └── get-tournament.php
            └── payment-initiate.php
            └── payment-verify.php
            └── register.php
            └── registration-status.php
            └── update.php
        └── 📁users
            └── activity-log.php
            └── delete.php
            └── get-all.php
            └── get-details.php
            └── get-teachers.php
            └── search-students.php
            └── update-permissions.php
            └── update-role.php
            └── update-status.php
            └── update.php
    └── 📁logs
        └── .htaccess
    └── 📁middleware
        └── auth.php
    └── 📁models
        └── Analytics.php
        └── Attendance.php
        └── Batch.php
        └── ChessChallenge.php
        └── ChessGame.php
        └── ChessPractice.php
        └── ChessSimul.php
        └── ChessStats.php
        └── ChessStudy.php
        └── Classroom.php
        └── Grading.php
        └── Notification.php
        └── NotificationPreference.php
        └── Permission.php
        └── PGN.php
        └── Quiz.php
        └── Resource.php
        └── Support.php
        └── Tournament.php
        └── User.php
    └── 📁services
        └── EmailService.php
        └── NotificationService.php
    └── 📁users
        └── get-teachers.php
    └── 📁utils
        └── authorize.php
        └── ChessHelper.php
        └── EmailService.php
        └── Mailer.php
        └── Stockfish.php
    └── .env
    └── composer.json
    └── composer.lock
    └── index.php
```

## Authentication

### `/api/endpoints/auth/login.php`
- **Method:** POST
- **Description:** Authenticates a user and returns a JWT token
- **Request Body:** Email and password
- **Response:** User data and authentication token

### `/api/endpoints/auth/register.php`
- **Method:** POST
- **Description:** Registers a new user
- **Request Body:** User registration details
- **Response:** Success/failure message

### `/api/endpoints/auth/request-reset.php`
- **Method:** POST
- **Description:** Sends a password reset email
- **Request Body:** User email
- **Response:** Success/failure message

### `/api/endpoints/auth/reset-password.php`
- **Method:** POST
- **Description:** Resets a user's password using a reset token
- **Request Body:** Reset token and new password
- **Response:** Success/failure message

### `/api/endpoints/auth/update-profile.php`
- **Method:** PUT
- **Description:** Updates user profile information
- **Request Body:** Updated profile data
- **Response:** Updated user data

### `/api/endpoints/auth/verify-token.php`
- **Method:** GET
- **Description:** Verifies if an authentication token is valid
- **Headers:** Authorization token
- **Response:** Token validity status

---

## Users

### `/api/endpoints/users/get-all.php`
- **Method:** GET
- **Description:** Gets a list of all users with optional filtering
- **Query Parameters:** filter, search
- **Response:** Array of user objects

### `/api/endpoints/users/get-details.php`
- **Method:** GET
- **Description:** Gets detailed information about a specific user
- **Query Parameters:** id
- **Response:** User details including permissions and recent activity

### `/api/endpoints/users/get-teachers.php`
- **Method:** GET
- **Description:** Gets a list of all active teachers
- **Response:** Array of teacher objects

### `/api/endpoints/users/search-students.php`
- **Method:** GET
- **Description:** Searches for students based on search term
- **Query Parameters:** q (search term)
- **Response:** Array of matching student objects

### `/api/endpoints/users/update.php`
- **Method:** PUT
- **Description:** Updates user details
- **Request Body:** Updated user data
- **Response:** Success/failure message

### `/api/endpoints/users/update-permissions.php`
- **Method:** PUT
- **Description:** Updates user permissions
- **Request Body:** User ID and permissions array
- **Response:** Success/failure message

### `/api/endpoints/users/update-role.php`
- **Method:** PUT
- **Description:** Updates a user's role
- **Request Body:** User ID and new role
- **Response:** Success/failure message

### `/api/endpoints/users/update-status.php`
- **Method:** PUT
- **Description:** Updates a user's status (active/inactive)
- **Request Body:** User ID and new status
- **Response:** Success/failure message

### `/api/endpoints/users/delete.php`
- **Method:** DELETE
- **Description:** Deletes a user account
- **Request Body:** User ID
- **Response:** Success/failure message

### `/api/endpoints/users/activity-log.php`
- **Method:** GET
- **Description:** Gets a user's activity log
- **Query Parameters:** id, limit
- **Response:** Array of activity log entries

---

## Batches

### `/api/endpoints/batches/get-all.php`
- **Method:** GET
- **Description:** Gets all batches for the authenticated teacher or admin
- **Response:** Array of batch objects

### `/api/endpoints/batches/get-details.php`
- **Method:** GET
- **Description:** Gets detailed information about a specific batch
- **Query Parameters:** id
- **Response:** Batch details including students

### `/api/endpoints/batches/get-students.php`
- **Method:** GET
- **Description:** Gets all students enrolled in a specific batch
- **Query Parameters:** batch_id
- **Response:** Array of student objects

### `/api/endpoints/batches/create.php`
- **Method:** POST
- **Description:** Creates a new batch
- **Request Body:** Batch details
- **Response:** New batch ID and details

### `/api/endpoints/batches/update.php`
- **Method:** PUT
- **Description:** Updates batch details
- **Request Body:** Updated batch data
- **Response:** Success/failure message

### `/api/endpoints/batches/delete.php`
- **Method:** DELETE
- **Description:** Deletes a batch
- **Request Body:** Batch ID
- **Response:** Success/failure message

### `/api/endpoints/batches/add-student.php`
- **Method:** POST
- **Description:** Adds a student to a batch
- **Request Body:** Batch ID and student ID
- **Response:** Success/failure message

### `/api/endpoints/batches/remove-student.php`
- **Method:** DELETE
- **Description:** Removes a student from a batch
- **Request Body:** Batch ID and student ID
- **Response:** Success/failure message

---

## Classroom

### `/api/endpoints/classroom/get-teacher-classes.php`
- **Method:** GET
- **Description:** Gets all classes taught by the authenticated teacher
- **Response:** Array of classroom objects with student counts

### `/api/endpoints/classroom/get-student-classes.php`
- **Method:** GET
- **Description:** Gets all classes in which the authenticated student is enrolled
- **Response:** Array of classroom objects

### `/api/endpoints/classroom/get-available-classes.php`
- **Method:** GET
- **Description:** Gets all available classes that the student can join
- **Response:** Array of available classroom objects

### `/api/endpoints/classroom/get-classroom-details.php`
- **Method:** GET
- **Description:** Gets detailed information about a specific classroom
- **Query Parameters:** id
- **Response:** Classroom details including teacher, schedule, and students

### `/api/endpoints/classroom/get-sessions.php`
- **Method:** GET
- **Description:** Gets all sessions for a specific classroom
- **Query Parameters:** classroom_id, start, end
- **Response:** Array of session objects

### `/api/endpoints/classroom/get-session-students.php`
- **Method:** GET
- **Description:** Gets all students present in a specific session
- **Query Parameters:** session_id
- **Response:** Array of student objects with attendance status

### `/api/endpoints/classroom/get-materials.php`
- **Method:** GET
- **Description:** Gets all materials for a specific classroom
- **Query Parameters:** classroom_id
- **Response:** Array of material objects

### `/api/endpoints/classroom/get-assignments.php`
- **Method:** GET
- **Description:** Gets all assignments for a specific classroom
- **Query Parameters:** classroom_id
- **Response:** Array of assignment objects

### `/api/endpoints/classroom/get-discussions.php`
- **Method:** GET
- **Description:** Gets discussion threads for a specific classroom
- **Query Parameters:** classroom_id
- **Response:** Array of discussion objects

### `/api/endpoints/classroom/add-material.php`
- **Method:** POST
- **Description:** Adds a new material to a classroom
- **Request Body:** Material details and classroom ID
- **Response:** New material ID and success message

### `/api/endpoints/classroom/add-session.php`
- **Method:** POST
- **Description:** Adds a new session to a classroom
- **Request Body:** Session details and classroom ID
- **Response:** New session ID and success message

### `/api/endpoints/classroom/post-discussion.php`
- **Method:** POST
- **Description:** Posts a new discussion message
- **Request Body:** Message content and classroom ID
- **Response:** New discussion ID and success message

### `/api/endpoints/classroom/submit-assignment.php`
- **Method:** POST
- **Description:** Submits an assignment for a student
- **Request Body:** Assignment ID and submission data
- **Response:** Submission ID and success message

### `/api/endpoints/classroom/track-attendance.php`
- **Method:** POST
- **Description:** Tracks student attendance for a session
- **Request Body:** Session ID and attendance data
- **Response:** Success/failure message

---

## Chess

### `/api/endpoints/chess/game.php`
- **Method:** GET
- **Description:** Gets details of a specific chess game
- **Query Parameters:** id
- **Response:** Game details including moves, players, and result

### `/api/endpoints/chess/games.php`
- **Method:** GET
- **Description:** Gets a list of chess games for the current user
- **Response:** Array of game objects

### `/api/endpoints/chess/make-move.php`
- **Method:** POST
- **Description:** Makes a move in a chess game
- **Request Body:** Game ID, move in algebraic notation, and resulting position
- **Response:** Updated game state

### `/api/endpoints/chess/save-result.php`
- **Method:** POST
- **Description:** Saves the result of a completed chess game
- **Request Body:** Game ID and result
- **Response:** Success/failure message

### `/api/endpoints/chess/player-stats.php`
- **Method:** GET
- **Description:** Gets chess statistics for a player
- **Query Parameters:** player_id (optional, defaults to current user)
- **Response:** Player chess statistics

### `/api/endpoints/chess/challenge.php`
- **Method:** POST
- **Description:** Creates a new chess challenge
- **Request Body:** Opponent ID and game parameters
- **Response:** Challenge ID and details

### `/api/endpoints/chess/challenges.php`
- **Method:** GET
- **Description:** Gets list of challenges for the current user
- **Response:** Array of challenge objects

### `/api/endpoints/chess/respond-challenge.php`
- **Method:** POST
- **Description:** Accepts or declines a chess challenge
- **Request Body:** Challenge ID and response (accept/decline)
- **Response:** Game ID if accepted or success message

### `/api/endpoints/chess/create-practice.php`
- **Method:** POST
- **Description:** Creates a new practice session
- **Request Body:** Practice parameters
- **Response:** Practice ID and details

### `/api/endpoints/chess/practice-positions.php`
- **Method:** GET
- **Description:** Gets chess practice positions
- **Query Parameters:** difficulty, type
- **Response:** Array of position objects

### `/api/endpoints/chess/engine-analysis.php`
- **Method:** POST
- **Description:** Analyzes a chess position using Stockfish
- **Request Body:** FEN string and analysis depth
- **Response:** Engine evaluation and suggested moves

### `/api/endpoints/chess/create-study.php`
- **Method:** POST
- **Description:** Creates a new chess study
- **Request Body:** Study details
- **Response:** Study ID and details

### `/api/endpoints/chess/studies.php`
- **Method:** GET
- **Description:** Gets all studies for the current user
- **Response:** Array of study objects

### `/api/endpoints/chess/study.php`
- **Method:** GET
- **Description:** Gets details of a specific study
- **Query Parameters:** id
- **Response:** Study details including chapters and positions

### `/api/endpoints/chess/update-study.php`
- **Method:** PUT
- **Description:** Updates a chess study
- **Request Body:** Updated study data
- **Response:** Success/failure message

### `/api/endpoints/chess/share-study.php`
- **Method:** POST
- **Description:** Shares a study with other users
- **Request Body:** Study ID and recipient IDs
- **Response:** Success/failure message

### `/api/endpoints/chess/shared-studies.php`
- **Method:** GET
- **Description:** Gets studies shared with the current user
- **Response:** Array of shared study objects

### `/api/endpoints/chess/create-simul.php`
- **Method:** POST
- **Description:** Creates a simultaneous exhibition
- **Request Body:** Simul details
- **Response:** Simul ID and details

### `/api/endpoints/chess/join-simul.php`
- **Method:** POST
- **Description:** Joins a simultaneous exhibition as a participant
- **Request Body:** Simul ID
- **Response:** Board ID and details

### `/api/endpoints/chess/start-simul.php`
- **Method:** POST
- **Description:** Starts a simultaneous exhibition
- **Request Body:** Simul ID
- **Response:** Success/failure message

### `/api/endpoints/chess/end-simul.php`
- **Method:** POST
- **Description:** Ends a simultaneous exhibition
- **Request Body:** Simul ID
- **Response:** Success/failure message

### `/api/endpoints/chess/simul-games.php`
- **Method:** GET
- **Description:** Gets all games in a simultaneous exhibition
- **Query Parameters:** simul_id
- **Response:** Array of game objects

### `/api/endpoints/chess/simul-move.php`
- **Method:** POST
- **Description:** Makes a move in a simultaneous exhibition game
- **Request Body:** Simul ID, board ID, move, and FEN
- **Response:** Updated game state

### `/api/endpoints/chess/online-players.php`
- **Method:** GET
- **Description:** Gets a list of currently online players
- **Response:** Array of online player objects

---

## Quiz

### `/api/endpoints/quiz/get-all.php`
- **Method:** GET
- **Description:** Gets all quizzes available to the current user
- **Response:** Array of quiz objects

### `/api/endpoints/quiz/get-by-id.php`
- **Method:** GET
- **Description:** Gets details of a specific quiz
- **Query Parameters:** id
- **Response:** Quiz details including questions

### `/api/endpoints/quiz/get-by-difficulty.php`
- **Method:** GET
- **Description:** Gets quizzes filtered by difficulty level
- **Query Parameters:** difficulty
- **Response:** Array of quiz objects

### `/api/endpoints/quiz/get-teacher-quizzes.php`
- **Method:** GET
- **Description:** Gets all quizzes created by a teacher
- **Query Parameters:** teacher_id (optional, defaults to current user)
- **Response:** Array of quiz objects

### `/api/endpoints/quiz/create.php`
- **Method:** POST
- **Description:** Creates a new quiz
- **Request Body:** Quiz details including questions and answers
- **Response:** New quiz ID and details

### `/api/endpoints/quiz/update.php`
- **Method:** PUT
- **Description:** Updates a quiz
- **Request Body:** Updated quiz data
- **Response:** Success/failure message

### `/api/endpoints/quiz/delete.php`
- **Method:** DELETE
- **Description:** Deletes a quiz
- **Request Body:** Quiz ID
- **Response:** Success/failure message

### `/api/endpoints/quiz/submit-quiz.php`
- **Method:** POST
- **Description:** Submits a completed quiz
- **Request Body:** Quiz ID and answers
- **Response:** Quiz score and feedback

### `/api/endpoints/quiz/get-user-history.php`
- **Method:** GET
- **Description:** Gets quiz attempt history for a user
- **Query Parameters:** user_id (optional, defaults to current user)
- **Response:** Array of quiz attempt objects

### `/api/endpoints/quiz/get-latest-result.php`
- **Method:** GET
- **Description:** Gets the most recent quiz result for a user
- **Query Parameters:** quiz_id, user_id (optional)
- **Response:** Latest quiz attempt details

### `/api/endpoints/quiz/get-leaderboard.php`
- **Method:** GET
- **Description:** Gets leaderboard for a specific quiz
- **Query Parameters:** quiz_id
- **Response:** Array of ranked user scores

### `/api/endpoints/quiz/get-overall-leaderboard.php`
- **Method:** GET
- **Description:** Gets overall quiz leaderboard across all quizzes
- **Response:** Array of ranked user scores

### `/api/endpoints/quiz/upload-question-image.php`
- **Method:** POST
- **Description:** Uploads an image for a quiz question
- **Request Body:** Image file
- **Response:** Image URL

---

## Resources

### `/api/endpoints/resources/get-all.php`
- **Method:** GET
- **Description:** Gets all educational resources
- **Response:** Array of resource objects

### `/api/endpoints/resources/get-by-id.php`
- **Method:** GET
- **Description:** Gets details of a specific resource
- **Query Parameters:** id
- **Response:** Resource details including bookmark status

### `/api/endpoints/resources/get-by-category.php`
- **Method:** GET
- **Description:** Gets resources filtered by category
- **Query Parameters:** category
- **Response:** Array of resource objects

### `/api/endpoints/resources/get-featured.php`
- **Method:** GET
- **Description:** Gets featured resources
- **Response:** Array of featured resource objects

### `/api/endpoints/resources/search.php`
- **Method:** GET
- **Description:** Searches resources based on keywords
- **Query Parameters:** q, category, type, difficulty
- **Response:** Array of matching resource objects

### `/api/endpoints/resources/get-bookmarks.php`
- **Method:** GET
- **Description:** Gets all bookmarked resources for the current user
- **Response:** Array of bookmarked resource objects

### `/api/endpoints/resources/bookmark.php`
- **Method:** POST
- **Description:** Bookmarks a resource
- **Request Body:** Resource ID
- **Response:** Success/failure message

### `/api/endpoints/resources/unbookmark.php`
- **Method:** POST
- **Description:** Removes a bookmark from a resource
- **Request Body:** Resource ID
- **Response:** Success/failure message

### `/api/endpoints/resources/upload.php`
- **Method:** POST
- **Description:** Uploads a new resource
- **Request Body:** Resource details and file
- **Response:** New resource ID and details

### `/api/endpoints/resources/download.php`
- **Method:** GET
- **Description:** Downloads a resource file
- **Query Parameters:** id
- **Response:** File download

### `/api/endpoints/resources/log-access.php`
- **Method:** POST
- **Description:** Logs access to a resource
- **Request Body:** Resource ID
- **Response:** Success/failure message

---

## Support

### `/api/endpoints/support/faqs/get-all.php`
- **Method:** GET
- **Description:** Gets all published FAQs
- **Response:** Array of FAQ objects

### `/api/endpoints/support/faqs/create.php`
- **Method:** POST
- **Description:** Creates a new FAQ
- **Request Body:** FAQ details (question, answer, category)
- **Response:** New FAQ ID and success message

### `/api/endpoints/support/faqs/delete.php`
- **Method:** DELETE
- **Description:** Deletes an FAQ
- **Request Body:** FAQ ID
- **Response:** Success/failure message

### `/api/endpoints/support/tickets/get-all.php`
- **Method:** GET
- **Description:** Gets all support tickets
- **Query Parameters:** status (optional)
- **Response:** Array of ticket objects

---

## Notifications

### `/api/endpoints/notifications/get.php`
- **Method:** GET
- **Description:** Gets notifications for the current user
- **Query Parameters:** limit, offset
- **Response:** Array of notification objects

### `/api/endpoints/notifications/mark-read.php`
- **Method:** PUT
- **Description:** Marks a notification as read
- **Request Body:** Notification ID
- **Response:** Success/failure message

### `/api/endpoints/notifications/mark-all-read.php`
- **Method:** PUT
- **Description:** Marks all notifications as read
- **Response:** Success/failure message

### `/api/endpoints/notifications/delete.php`
- **Method:** DELETE
- **Description:** Deletes a notification
- **Request Body:** Notification ID
- **Response:** Success/failure message

### `/api/endpoints/notifications/send.php`
- **Method:** POST
- **Description:** Sends a notification to users
- **Request Body:** Notification details and recipient IDs
- **Response:** Success/failure message

### `/api/endpoints/notifications/get-preferences.php`
- **Method:** GET
- **Description:** Gets notification preferences for the current user
- **Response:** Notification preference settings

### `/api/endpoints/notifications/update-preferences.php`
- **Method:** PUT
- **Description:** Updates notification preferences
- **Request Body:** Updated preference settings
- **Response:** Success/failure message

### `/api/endpoints/notifications/templates.php`
- **Method:** GET
- **Description:** Gets notification templates
- **Response:** Array of template objects

### `/api/endpoints/notifications/admin-sent.php`
- **Method:** GET
- **Description:** Gets all notifications sent by admins
- **Response:** Array of admin notification objects

---

## Attendance

### `/api/endpoints/attendance/get-all.php`
- **Method:** GET
- **Description:** Gets attendance records for a batch
- **Query Parameters:** batch_id, start_date, end_date
- **Response:** Array of attendance records

### `/api/endpoints/attendance/get-user-attendance.php`
- **Method:** GET
- **Description:** Gets attendance records for a specific user
- **Query Parameters:** user_id, batch_id
- **Response:** Array of user attendance records

### `/api/endpoints/attendance/get-students-attendance.php`
- **Method:** GET
- **Description:** Gets attendance for all students in a batch
- **Query Parameters:** batch_id, session_id
- **Response:** Array of student attendance records

### `/api/endpoints/attendance/mark-attendance.php`
- **Method:** POST
- **Description:** Marks attendance for students
- **Request Body:** Session ID and attendance data
- **Response:** Success/failure message

### `/api/endpoints/attendance/export.php`
- **Method:** GET
- **Description:** Exports attendance records to a file
- **Query Parameters:** batch_id, start_date, end_date, format
- **Response:** File download (CSV/PDF)

### `/api/endpoints/attendance/send-reminders.php`
- **Method:** POST
- **Description:** Sends attendance reminders to absent students
- **Request Body:** Session ID
- **Response:** Success/failure message

### `/api/endpoints/attendance/sync-online-class.php`
- **Method:** POST
- **Description:** Syncs attendance with online class platform
- **Request Body:** Session ID and platform data
- **Response:** Success/failure message

### `/api/endpoints/attendance/update-settings.php`
- **Method:** PUT
- **Description:** Updates attendance settings
- **Request Body:** Updated settings
- **Response:** Success/failure message

---

## Analytics

### `/api/endpoints/analytics/get-stats.php`
- **Method:** GET
- **Description:** Gets general analytics statistics
- **Query Parameters:** type, start_date, end_date
- **Response:** Statistics data

### `/api/endpoints/analytics/teacher-stats.php`
- **Method:** GET
- **Description:** Gets analytics statistics for a teacher
- **Query Parameters:** teacher_id (optional)
- **Response:** Teacher statistics data

### `/api/endpoints/analytics/student-performance.php`
- **Method:** GET
- **Description:** Gets performance analytics for students
- **Query Parameters:** batch_id, student_id
- **Response:** Student performance data

### `/api/endpoints/analytics/export.php`
- **Method:** POST
- **Description:** Exports analytics reports
- **Request Body:** Report type and filters
- **Response:** File download (PDF)

### `/api/endpoints/analytics/debug.php`
- **Method:** GET
- **Description:** Debug endpoint for analytics (development only)
- **Response:** Debug information

---

## PGN

### `/api/endpoints/pgn/get-pgn.php`
- **Method:** GET
- **Description:** Gets a specific PGN file
- **Query Parameters:** id
- **Response:** PGN content

### `/api/endpoints/pgn/get-public-pgns.php`
- **Method:** GET
- **Description:** Gets all public PGN files
- **Response:** Array of PGN objects

### `/api/endpoints/pgn/get-teacher-pgns.php`
- **Method:** GET
- **Description:** Gets all PGN files uploaded by a teacher
- **Query Parameters:** teacher_id
- **Response:** Array of PGN objects

### `/api/endpoints/pgn/upload.php`
- **Method:** POST
- **Description:** Uploads a new PGN file
- **Request Body:** PGN data and metadata
- **Response:** New PGN ID and details

### `/api/endpoints/pgn/update.php`
- **Method:** PUT
- **Description:** Updates a PGN file
- **Request Body:** Updated PGN data
- **Response:** Success/failure message

### `/api/endpoints/pgn/delete.php`
- **Method:** DELETE
- **Description:** Deletes a PGN file
- **Request Body:** PGN ID
- **Response:** Success/failure message

### `/api/endpoints/pgn/share.php`
- **Method:** POST
- **Description:** Shares a PGN file with other users
- **Request Body:** PGN ID and recipient IDs
- **Response:** Success/failure message

### `/api/endpoints/pgn/remove-share.php`
- **Method:** DELETE
- **Description:** Removes sharing for a PGN file
- **Request Body:** PGN ID and recipient ID
- **Response:** Success/failure message

### `/api/endpoints/pgn/get-share-users.php`
- **Method:** GET
- **Description:** Gets users with whom a PGN file is shared
- **Query Parameters:** pgn_id
- **Response:** Array of user objects

### `/api/endpoints/pgn/get-teachers.php`
- **Method:** GET
- **Description:** Gets all teachers for PGN sharing
- **Response:** Array of teacher objects

---

## Tournaments

### `/api/endpoints/tournaments/get-all.php`
- **Method:** GET
- **Description:** Gets all tournaments
- **Response:** Array of tournament objects

### `/api/endpoints/tournaments/get-tournament.php`
- **Method:** GET
- **Description:** Gets details of a specific tournament
- **Query Parameters:** id
- **Response:** Tournament details

### `/api/endpoints/tournaments/get-by-status.php`
- **Method:** GET
- **Description:** Gets tournaments filtered by status
- **Query Parameters:** status
- **Response:** Array of tournament objects

### `/api/endpoints/tournaments/create.php`
- **Method:** POST
- **Description:** Creates a new tournament
- **Request Body:** Tournament details
- **Response:** New tournament ID and details

### `/api/endpoints/tournaments/update.php`
- **Method:** PUT
- **Description:** Updates a tournament
- **Request Body:** Updated tournament data
- **Response:** Success/failure message

### `/api/endpoints/tournaments/delete.php`
- **Method:** DELETE
- **Description:** Deletes a tournament
- **Request Body:** Tournament ID
- **Response:** Success/failure message

### `/api/endpoints/tournaments/register.php`
- **Method:** POST
- **Description:** Registers a user for a tournament
- **Request Body:** Tournament ID and registration details
- **Response:** Registration ID and details

### `/api/endpoints/tournaments/registration-status.php`
- **Method:** GET
- **Description:** Gets registration status for a user
- **Query Parameters:** tournament_id, user_id
- **Response:** Registration status details

### `/api/endpoints/tournaments/cancel-registration.php`
- **Method:** POST
- **Description:** Cancels a tournament registration
- **Request Body:** Registration ID
- **Response:** Success/failure message

### `/api/endpoints/tournaments/get-registrations.php`
- **Method:** GET
- **Description:** Gets all registrations for a tournament
- **Query Parameters:** tournament_id
- **Response:** Array of registration objects

### `/api/endpoints/tournaments/payment-initiate.php`
- **Method:** POST
- **Description:** Initiates payment for tournament registration
- **Request Body:** Registration ID and payment details
- **Response:** Payment gateway URL and details

### `/api/endpoints/tournaments/payment-verify.php`
- **Method:** POST
- **Description:** Verifies payment for tournament registration
- **Request Body:** Payment reference and details
- **Response:** Payment verification result

---

## Grading

### `/api/endpoints/grading/get-all-students.php`
- **Method:** GET
- **Description:** Gets all students for grading
- **Response:** Array of student objects

### `/api/endpoints/grading/get-batch-students.php`
- **Method:** GET
- **Description:** Gets students in a specific batch for grading
- **Query Parameters:** batch_id
- **Response:** Array of student objects

### `/api/endpoints/grading/get-student-performance.php`
- **Method:** GET
- **Description:** Gets performance data for a student
- **Query Parameters:** student_id, batch_id
- **Response:** Student performance metrics

### `/api/endpoints/grading/get-student-feedback-history.php`
- **Method:** GET
- **Description:** Gets feedback history for a student
- **Query Parameters:** student_id
- **Response:** Array of feedback objects

### `/api/endpoints/grading/submit-feedback.php`
- **Method:** POST
- **Description:** Submits feedback for a student
- **Request Body:** Student ID and feedback data
- **Response:** Success/failure message

---

## Admin

### `/api/endpoints/admin/dashboard-stats.php`
- **Method:** GET
- **Description:** Gets statistics for admin dashboard
- **Response:** Dashboard statistics data

---

## Base URL

The base URL for all API endpoints is: `/api/endpoints/`

## Authentication

Most endpoints require authentication via JWT token which should be included in the request headers:

```
Authorization: Bearer {token}
```

## Error Handling

All endpoints return standardized error responses with the following format:

```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error information (if available)"
}
```

## Success Response Format

Successful responses typically follow this format:

```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}
```