# Kolkata Chess Academy Dashboard

KCAdashboard is a full-featured platform for managing educational, chess, and administrative workflows. It combines a modular PHP backend (API) and a modern React frontend, supporting a wide range of features for admins, teachers, students, and tournament organizers.

---

## 🌟 Key Features

### User & Role Management
- Registration, login, profile updates, and password reset
- Bulk operations for users and teachers
- Role-based access and permissions (admin, teacher, student)

### Attendance & Classroom Management
- Mark, export, sync, and report attendance for students and classes
- Create, update, and manage batches and classrooms
- Assignments, materials, and session management

### Chess Platform
- Challenge system, game management, and engine analysis (Stockfish & custom engines)
- PGN upload/view, interactive boards, and player statistics
- Practice sessions, tournaments, and leaderboard

### Quiz & Analytics
- Create, manage, and take quizzes with leaderboards and result exports
- Export and view analytics for attendance, performance, quizzes, and more

### Notifications & Resources
- Send, receive, and manage notifications and preferences (in-app, email, etc.)
- Upload, bookmark, and share resources with students, batches, or classrooms

### Tournaments & Support
- Register, manage, and track chess tournaments (with payment integration)
- FAQ and ticketing system for user support

---

## 🖥️ Frontend Highlights

- **Reusable Components:** Navigation, error boundaries, export buttons, notification bell, resource previews, sidebar, and top navbar
- **Custom Hooks:** Centralized authentication, token management, password reset, and PGN view analytics
- **Role-Specific Dashboards:** Separate pages and navigation for admin, teacher, and student experiences
- **Form Handling:** Robust validation using Formik and Yup
- **Route-Based Organization:** Clean, maintainable routing with access control

---

## ⚙️ Backend & API

- **RESTful Endpoints:** Modular endpoints for all features, grouped by domain (admin, analytics, attendance, chess, etc.)
- **Models:** PHP classes for analytics, users, attendance, chess games, quizzes, notifications, resources, tournaments, and more
- **Services:** Business logic for sending emails and notifications
- **Middleware:** Authentication and authorization for protected endpoints
- **Utilities:** Helper scripts for authorization, chess logic, PGN parsing, file uploads, and Stockfish integration

---

## ♟️ Chess Engine Integration

- Minimal Stockfish implementation for chess analysis (auto-setup)
- Custom chess engine and online engine support
- PGN file handling and analysis

---

## 📊 Analytics & Reporting

- Attendance, performance, and quiz analytics
- Export data in various formats (CSV, Excel)

---

## 📚 Extensibility

- Add new features by creating new endpoint files and updating models/services
- Reusable frontend components and hooks for rapid development
- Utility modules for API, chess, permissions, PGN, and uploads

---

## 🛠️ Troubleshooting & Best Practices

- Centralized error handling and logging
- Modular, maintainable codebase with clear separation of concerns
- Regularly review and update authentication, authorization, and business logic

---

## Prerequisites

- Node.js version 20.17.0 or higher
- npm version 10.0.0 or higher

## Environment Setup

```bash
# Using nvm (recommended)
nvm install 20.17.0
nvm use 20.17.0

# Or update Node.js directly from nodejs.org
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Chess Engine

This project uses a minimal Stockfish implementation for chess analysis. The implementation is automatically set up during installation.

To test if the chess engine is working:
1. Start the development server
2. Navigate to `/stockfish/test.html` in your browser
3. Click the "Test Stockfish" button

## Troubleshooting

If you experience issues with the chess engine:

```bash
# Manually run the setup script
npm run setup-stockfish
```

## License

Copyright © 2023-2024 Kolkata Chess Academy. All rights reserved.
