# KCAdashboard Documentation
## Overview

KCAdashboard is a comprehensive platform for managing educational, chess, and administrative workflows. It is built with a modular PHP backend (API) and a modern JavaScript frontend (React). The backend is organized into logical folders for endpoints, models, services, and utilities, supporting a wide range of features for admins, teachers, students, and tournament organizers.

## Teacher Dashboard React Key Bugfix & List Rendering Robustness (July 2025)
- All React lists in the Teacher Dashboard now use robust, unique keys to prevent duplicate/empty key warnings and ensure stable UI updates.
- All mapped lists (modals, stats, activities) now have fallback keys for edge cases, eliminating React key warnings and improving dashboard reliability.
## File Structure

```
public/
  api/
    config/         # Configuration files (CORS, Database, Mail)
    endpoints/      # API endpoints grouped by feature (admin, analytics, attendance, etc.)
    middleware/     # Middleware for authentication/authorization
    migrations/     # Database migration scripts
    models/         # PHP models for data entities
    services/       # Service classes (email, notifications)
    users/          # User-related scripts
    utils/          # Utility scripts (authorization, chess helpers, email, uploads)
    composer.json   # PHP dependencies
    index.php       # API entry point
```

---


## Registration & Role Security Policy (July 2025)

## Session Management (July 2025)

- Users can manage their active sessions from the new Settings page in the dashboard UI.
- Session management features include viewing all active sessions, logging out from other devices, and monitoring session activity.
- See [`docs/session-management.md`](../../docs/session-management.md) for technical and user documentation.
All new user registrations are created as students only. Teacher/admin roles can only be assigned by an admin via the user management endpoints. This is enforced in both frontend and backend for security.

## Key Features

- **User Management:** Registration, login, profile updates, permissions, and bulk operations for users. Only admins can promote users to teacher/admin roles.
- **Attendance:** Marking, exporting, syncing, and reporting attendance for students and classes.
- **Batch & Classroom Management:** Create, update, and manage batches and classrooms, including assignments, materials, and sessions.
- **Chess Platform:** Challenge system, game management, engine analysis, PGN upload/view (limited to 50 games per file), and player statistics.
- **Quiz System:** Create, manage, and take quizzes, with leaderboards and result exports.
- **Notifications:** Send, receive, and manage notifications and preferences.
- **Resources:** Upload, bookmark, and share resources with students, batches, or classrooms.
- **Tournaments:** Register, manage, and track chess tournaments, including payment integration.
- **Support:** FAQ and ticketing system for user support.
- **Analytics:** Export and view analytics for attendance, performance, quizzes, and more.
- **Recurring Classes:** Teachers can bulk-schedule sessions based on batch schedule using the new `create-recurring-sessions.php` endpoint. See `endpoints/classroom/docs.md` and frontend docs for usage.
- **Enhanced Profile System:** New endpoints for FIDE ID, rating, and document upload/verification, with an admin document verification workflow. See `ENHANCED_PROFILE_DOCUMENTATION.md` for full details.
- **Classroom Materials:** Teachers can upload multiple files at once as classroom materials. Each file is validated and creates a separate resource entry. See `endpoints/classroom/add-material.php`.

- **Grading Workflow:** Pending grading sessions are now tracked per session. Feedback submission includes session_id, and the API only shows sessions that have not received feedback from the teacher.

---

## PHP Files and Their Roles

- **config/**: Core configuration (CORS, database, mail).
- **endpoints/**: Each subfolder contains PHP files for REST API endpoints, grouped by feature (e.g., `attendance/mark-attendance.php`, `chess/make-move.php`). Resource download endpoint now enforces resource-level access control.
- **middleware/auth.php**: Handles authentication and authorization for API requests.
- **models/**: PHP classes representing data entities (e.g., `User.php`, `Batch.php`, `ChessGame.php`).
- **services/**: Business logic for sending emails and notifications.
- **users/**: User-specific scripts (e.g., `get-teachers.php`).
- **utils/**: Helper scripts for authorization, chess logic, email, PGN parsing, uploads, and Stockfish integration.

---

## How to Use

- **API:** All backend features are exposed via RESTful endpoints under `public/api/endpoints/`. Each endpoint is documented in its respective folder's `docs.md`.
- **Frontend:** The React frontend (in `src/`) consumes these APIs to provide a user-friendly interface for all roles.

---

## Extending the Platform

- Add new features by creating new endpoint files in the appropriate folder.
- Update or add models and services as needed for new business logic.
- Use the `utils/` folder for reusable helper functions.

---

## For More Details

See the `docs.md` files in each folder for a breakdown of individual files and their responsibilities.
