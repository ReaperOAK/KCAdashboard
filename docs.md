# KCAdashboard Frontend – README & Documentation

## [2025-07-05] PvP Chess Timer Fix

- The per-move countdown timer in PvP chess games is now fully synchronized between players. The timer updates immediately after each move, providing a fair and accurate countdown for both sides.
- See `src/pages/chess/InteractiveBoard.js` and chess documentation for details.

## Overview

The KCAdashboard frontend is a modern React application that delivers a seamless experience for students, teachers, and administrators. The codebase is organized into logical folders for UI components, pages, hooks, routes, and utilities, supporting a wide range of educational, chess, and administrative features. This documentation provides a high-level overview of the structure, features, and the role of each major file and folder.

---

## File Structure

```
src/
  components/      # Reusable UI components, grouped by feature (batches, chess, classroom, etc.)
  hooks/           # Custom React hooks for shared logic
  pages/           # Top-level pages for each route and user role
  routes/          # Route definitions for different user roles
  utils/           # Utility functions and helpers
  App.js           # Main React application component
  index.js         # Entry point for the React app
  App.css, index.css # Global and app-specific styles
  setupTests.js, App.test.js # Testing setup and main app tests
  logo.svg         # Application logo asset
  reportWebVitals.js # Performance monitoring
  ...              # Other supporting files (assets, configs, etc.)
```

---

## Key Features

- **User Authentication:** Login, registration, password reset, and email verification.
- **User Management:** Admin and teacher interfaces for managing users, roles, and permissions.
- **Attendance:** Mark, view, and report attendance for students and classes.
- **Batch & Classroom Management:** Create, update, and manage batches, classrooms, assignments, and materials.
- **Chess Platform:** Play chess, challenge others, analyze games, upload/view PGN files, and track player stats.
- **Quiz System:** Take, create, and manage quizzes with leaderboards and results.
- **Notifications:** Receive and manage notifications and preferences.
- **Resources:** Access, bookmark, and share educational resources.
- **Tournaments:** Register for and manage chess tournaments.
- **Support:** Access support system and FAQs.
- **Analytics:** View platform analytics and reports.

---

## JavaScript Files and Their Roles

- **components/**: Contains reusable UI components, organized by feature (e.g., `chess/ChessBoard.js`, `batches/BatchList.js`).
- **hooks/**: Custom hooks for authentication (`useAuth.js`), PGN viewing (`usePGNView.js`), and more.
- **pages/**: Top-level pages for each route and user role (e.g., `admin/AdminDashboard.js`, `student/StudentDashboard.js`).
- **routes/**: Route definitions for admin, chess, student, and teacher sections.
- **utils/**: Utility modules for API calls, chess engine integration, permissions, PGN handling, uploads, etc.
- **App.js**: Main application component, sets up routing and layout.
- **index.js**: Entry point, renders the React app.
- **App.css, index.css**: Global and app-specific styles.
- **setupTests.js, App.test.js**: Testing setup and main app tests.
- **logo.svg**: Application logo asset.
- **reportWebVitals.js**: Performance monitoring and reporting.

---

## How to Use

- **Run the App:** Start the React development server to launch the frontend.
- **Navigation:** Use the sidebar and top navbar to access different features based on your role.
- **API Integration:** All features interact with the backend via RESTful APIs defined in the `utils/api.js` module.

---

## Extending the Platform

- Add new features by creating new components and pages in the appropriate folders.
- Use the `utils/` folder for reusable logic and API integrations.
- Define new routes in the `routes/` folder as needed.

---

## For More Details

See the `docs.md` files in each folder for a breakdown of individual files and their responsibilities.

---

## Chess PGN Upload & Management (2025 Update)

- **PGN Upload** now supports advanced visibility controls:
  - Public (all users)
  - Private (only uploader)
  - Batch (select one or more batches)
  - Specific Students (select students)
- Visibility can be set during upload and changed later by the owner or admin.
- Admins can edit/delete any PGN; teachers can edit/delete their own.
- New backend endpoints:
  - `/api/endpoints/chess/edit-pgn.php` – Edit PGN metadata and visibility
  - `/api/endpoints/chess/delete-pgn.php` – Delete a PGN (admin/owner only)
  - `/api/endpoints/chess/set-pgn-visibility.php` – Change visibility after upload
- Frontend upload form updated to allow visibility selection and batch/student assignment.
- All changes are reflected in the PGN metadata for flexible access control.

---

## JavaScript Files and Their Roles

- **components/**: Contains reusable UI components, organized by feature (e.g., `chess/ChessBoard.js`, `batches/BatchList.js`).
- **hooks/**: Custom hooks for authentication (`useAuth.js`), PGN viewing (`usePGNView.js`), and more.
- **pages/**: Top-level pages for each route and user role (e.g., `admin/AdminDashboard.js`, `student/StudentDashboard.js`).
- **routes/**: Route definitions for admin, chess, student, and teacher sections.
- **utils/**: Utility modules for API calls, chess engine integration, permissions, PGN handling, uploads, etc.
- **App.js**: Main application component, sets up routing and layout.
- **index.js**: Entry point, renders the React app.
- **App.css, index.css**: Global and app-specific styles.
- **setupTests.js, App.test.js**: Testing setup and main app tests.
- **logo.svg**: Application logo asset.
- **reportWebVitals.js**: Performance monitoring.

---

## How to Use

- **Run the App:** Start the React development server to launch the frontend.
- **Navigation:** Use the sidebar and top navbar to access different features based on your role.
- **API Integration:** All features interact with the backend via RESTful APIs defined in the `utils/api.js` module.

---

## Extending the Platform

- Add new features by creating new components and pages in the appropriate folders.
- Use the `utils/` folder for reusable logic and API integrations.
- Define new routes in the `routes/` folder as needed.

---

## For More Details

See the `docs.md` files in each folder for a breakdown of individual files and their responsibilities.
