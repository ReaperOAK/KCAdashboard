
# KCAdashboard Frontend – Notifications Pages Documentation

## Overview

The `notifications` folder under `pages` contains page components for managing user notification preferences in the KCAdashboard application. These pages allow users to customize how they receive notifications (in-app and email) for different categories, providing a personalized and user-friendly notification experience.

---

## File Structure

```
pages/notifications/
  NotificationPreferences.js   # Page for managing user notification preferences
```

---

## File Explanations

- **NotificationPreferences.js**  
  Provides a comprehensive interface for users to view and update their notification preferences. Users can enable or disable in-app and email notifications for various categories (general, class, tournament, assignment, attendance, announcements, achievements). Includes bulk enable/disable controls and saves preferences via API.

---

## Features

- **Category-Based Preferences:** Users can set notification preferences for each category separately.
- **In-App & Email Controls:** Toggle in-app and email notifications independently.
- **Bulk Actions:** Enable or disable all in-app or email notifications with one click.
- **Persistent Settings:** Preferences are fetched from and saved to the backend API.
- **User Feedback:** Success and error messages are shown using toast notifications.
- **Responsive UI:** Table layout adapts to different screen sizes.

---

## How This Page Works

- On mount, fetches current preferences from the API and maps them to the UI state.
- Users can toggle individual preferences or use bulk actions.
- On save, preferences are formatted and sent to the API for persistence.
- UI provides loading and saving indicators for better user experience.

---

## Example Usage

**Notification Preferences Route:**
```
import NotificationPreferences from './pages/notifications/NotificationPreferences';
<Route path="/notifications/preferences" element={<NotificationPreferences />} />
```

---

## Best Practices

- Always fetch preferences from the backend to ensure accuracy.
- Provide clear feedback for all actions (success, error, loading).
- Use memoization and callbacks to optimize performance in large tables.
- Validate API responses and handle errors gracefully.

---

## Troubleshooting

- **Preferences not loading:** Check API connectivity and error logs.
- **Changes not saving:** Ensure the API endpoint is reachable and request format is correct.
- **UI not updating:** Verify state updates and re-render logic.

---

For more details on notification features and integration, see the main `docs.md` in the `src` folder.
