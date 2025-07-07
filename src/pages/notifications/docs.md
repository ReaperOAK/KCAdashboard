
# KCAdashboard Frontend – Notifications Pages Documentation

## July 2025 Notification System Refactor

- All notification-related backend endpoints now use NotificationService for sending, deleting, and managing notifications.
- All notification and email logic is now secure, standardized, and fully documented.
- Notification preferences and notification panel features are fully supported by the backend API.

## Overview

The `notifications` folder under `pages` contains page components for managing user notification preferences in the KCAdashboard application. These pages allow users to customize how they receive notifications (in-app and email) for different categories, providing a personalized and user-friendly notification experience.

---

## File Structure


```
pages/notifications/
  NotificationPreferences.js   # Page for managing user notification preferences
```
components/
  NotificationBell.js          # Notification bell icon and dropdown panel (alerts/messages)

---


## File Explanations

- **NotificationPreferences.js**  
  Provides a comprehensive interface for users to view and update their notification preferences. Users can enable or disable in-app and email notifications for various categories (general, class, tournament, assignment, attendance, announcements, achievements). Includes bulk enable/disable controls and saves preferences via API.

- **NotificationBell.js**  
  Displays a modern, responsive notification bell icon with a dropdown panel for alerts and messages. The panel features:
    - Glassmorphism and gradient backgrounds for a visually appealing look
    - Animated, rounded notification cards with category badges and icons
    - Responsive layout for all screen sizes (mobile, tablet, desktop)
    - Category tabs for filtering notifications
    - Mark all as read, delete, and quick navigation to notification settings
    - Accessibility and keyboard navigation improvements
    - Animated notification badge and smooth transitions

---


## Features

- **Modern Notification Panel:** Beautiful glassmorphism/gradient panel with smooth animations and transitions.
- **Category-Based Preferences:** Users can set notification preferences for each category separately.
- **In-App & Email Controls:** Toggle in-app and email notifications independently.
- **Bulk Actions:** Enable or disable all in-app or email notifications with one click.
- **Persistent Settings:** Preferences are fetched from and saved to the backend API.
- **User Feedback:** Success and error messages are shown using toast notifications.
- **Responsive UI:** Notification panel and table layout adapt to all screen sizes.
- **Accessibility:** Keyboard navigation and ARIA labels for improved usability.

---


## How Notifications Work

- The notification bell in the top navigation shows a badge for unread notifications.
- Clicking the bell opens a responsive dropdown panel with all notifications, filterable by category.
- Users can mark notifications as read, delete them, or go to notification settings.
- The panel is fully responsive and accessible, with smooth transitions and a modern look.
- Notification preferences are managed on a separate page, with bulk and per-category controls.

---

## Example Usage


**Notification Bell Usage:**
```
import NotificationBell from '../components/NotificationBell';
// ...
<NotificationBell />
```

**Notification Preferences Route:**
```
import NotificationPreferences from './pages/notifications/NotificationPreferences';
<Route path="/notifications/preferences" element={<NotificationPreferences />} />
```

---


## Best Practices

- Always fetch preferences and notifications from the backend to ensure accuracy.
- All notification and preference API endpoints now sanitize and validate user IDs and input data.
- Provide clear feedback for all actions (success, error, loading).
- Use memoization and callbacks to optimize performance in large tables and lists.
- Validate API responses and handle errors gracefully.
- Ensure the notification panel is accessible and responsive for all users.

---

## Troubleshooting

- **Preferences not loading:** Check API connectivity and error logs.
- **Changes not saving:** Ensure the API endpoint is reachable and request format is correct.
- **UI not updating:** Verify state updates and re-render logic.

---

For more details on notification features and integration, see the main `docs.md` in the `src` folder.
