
# KCAdashboard Frontend – Routes Documentation

## Overview

The `routes` folder contains route definition files for the KCAdashboard frontend. Each file organizes and exports route configurations for a specific section or user role (admin, student, teacher, chess). These route files are used to set up navigation and access control throughout the application, ensuring that users are directed to the correct pages based on their role and the feature area.

---

## File Structure

```
routes/
  adminRoutes.js     # Defines routes for admin pages
  chessRoutes.js     # Defines routes for chess-related pages
  studentRoutes.js   # Defines routes for student pages
  teacherRoutes.js   # Defines routes for teacher pages
```

---

## File Explanations

- **adminRoutes.js**  
  Exports an array or object of route definitions for all admin-related pages (dashboard, user management, analytics, etc.). Handles route protection and layout for admin users.

- **chessRoutes.js**  
  Defines routes for chess features, such as game area, PGN management, and player-vs-player modes. Organizes chess-related navigation and access.

- **studentRoutes.js**  
  Contains route definitions for student-facing pages, including dashboard, classrooms, quizzes, resources, and tournaments. Ensures students have access to the correct features.

- **teacherRoutes.js**  
  Exports routes for teacher pages, such as dashboard, batch/classroom management, grading, and quiz management. Handles navigation and access control for teacher users.

---

## Features

- **Role-Based Routing:** Each file organizes routes by user role or feature area for clarity and maintainability.
- **Centralized Configuration:** All route definitions are kept in one place for each section, making updates and access control easier.
- **Integration with React Router:** Route files are imported into the main router setup to build the application's navigation structure.
- **Access Control:** Route files can include logic for protecting routes based on authentication and user roles.

---

## How These Files Work

- Each route file exports route definitions (arrays or objects) for its section.
- The main router (e.g., in `App.js`) imports these files and maps them to `<Route />` components.
- Route definitions can include path, component, layout, and access control metadata.

---

## Example Usage

**Importing and Using Routes:**
```
import adminRoutes from './routes/adminRoutes';
import studentRoutes from './routes/studentRoutes';

// In App.js or main router file
adminRoutes.forEach(route => (
  <Route key={route.path} {...route} />
));
```

---

## Best Practices

- Keep route definitions modular and organized by role or feature area.
- Use route metadata for access control and layout decisions.
- Document each route's purpose and any special requirements.
- Update route files when adding or removing pages to keep navigation consistent.

---

## Troubleshooting

- **Route not found:** Check that the route is defined and imported into the main router.
- **Access issues:** Ensure route protection logic is correct and user roles are checked.
- **Navigation errors:** Verify that paths and component imports are accurate.

---

For more details on routing and navigation, see the main `docs.md` in the `src` folder.
