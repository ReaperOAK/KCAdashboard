# KCAdashboard Frontend – Components Folder Documentation

## Analytics UI Refactor (2024)
All analytics-related UI components have been refactored for beauty, performance, accessibility, and responsiveness. See `analytics/docs.md` for details on each analytics component, their design, and usage.

## Design System
- All components use TailwindCSS and the project's color tokens (see `../../colour_scheme.md`).
- Components are modular, single-responsibility, and fully accessible.
- Responsive layouts and semantic HTML are standard.

## Overview

The `components` folder contains reusable React UI components that form the building blocks of the KCAdashboard frontend. Components are organized by feature and responsibility, making it easy to maintain and extend the user interface. This folder includes both general-purpose UI elements and feature-specific components, grouped into subfolders for clarity.

---

## File Structure

```
components/
  Breadcrumbs.js         # Navigation breadcrumbs
  ErrorBoundary.js       # Error boundary for catching UI errors
  ExportButton.js        # Button for exporting data
  NotificationBell.js    # Notification bell icon and logic
  ResourcePreview.js     # Resource preview UI
  Sidebar.js             # Sidebar navigation
  TopNavbar.js           # Top navigation bar
  ...                   # Feature-specific subfolders (batches, chess, classroom, etc.)
```

---

## File Explanations

- **Breadcrumbs.js**  
  Displays navigation breadcrumbs to help users understand their location in the app.

- **ErrorBoundary.js**  
  Catches and displays errors in the UI, preventing the entire app from crashing.

- **ExportButton.js**  
  Provides a button for exporting data (e.g., CSV, Excel) from tables or reports.

**NotificationBell.js**  
Displays a modern, responsive notification bell icon with a beautiful dropdown panel for alerts and messages. The panel features:
  - Glassmorphism and gradient backgrounds for a visually appealing look
  - Animated, rounded notification cards with category badges and icons
  - Responsive layout for all screen sizes (mobile, tablet, desktop)
  - Category tabs for filtering notifications
  - Mark all as read, delete, and quick navigation to notification settings
  - Accessibility and keyboard navigation improvements
  - Animated notification badge and smooth transitions
See the notifications documentation for more details on usage and features.

- **ResourcePreview.js**  
  Previews resources (documents, images, etc.) in the UI before download or sharing.

- **Sidebar.js**  
  Renders the sidebar navigation menu for quick access to main sections.

- **TopNavbar.js**  
  Displays the top navigation bar with links, user info, and actions.

---

## How Components Work

- Components are imported and used in pages and other components to build the UI.
- Feature-specific components are grouped in subfolders (e.g., `batches/`, `chess/`, `classroom/`).
- Components are designed to be reusable and composable for a consistent user experience.

---

## Example Usage

- The main layout uses `Sidebar.js` and `TopNavbar.js` for navigation.
- Pages use `Breadcrumbs.js` for navigation context and `ErrorBoundary.js` for error handling.
- Data tables and reports use `ExportButton.js` for exporting data.

---

## Best Practices

- Keep components focused and reusable.
- Use subfolders to organize feature-specific components.
- Document component props and usage for maintainability.

---

For more details on feature-specific components, see the `docs.md` files in each subfolder.
