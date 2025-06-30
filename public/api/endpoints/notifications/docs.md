# KCAdashboard API – Notifications Endpoints Documentation

## Overview

The `notifications` endpoints folder provides the backend API for all notification-related features in KCAdashboard. These PHP files enable sending, receiving, managing, and customizing notifications for users and admins. The endpoints support workflows for real-time alerts, preference management, and notification templates.

---

## File Structure

```
endpoints/notifications/
  admin-sent.php         # List notifications sent by admin
  delete.php             # Delete a notification
  get-preferences.php    # Get user notification preferences
  get.php                # Retrieve notifications
  mark-all-read.php      # Mark all notifications as read
  mark-read.php          # Mark a notification as read
  send.php               # Send a notification
  templates.php          # Manage notification templates
  update-preferences.php # Update notification preferences
```

---

## File Explanations

- **admin-sent.php**  
  Lists all notifications sent by admin users, supporting audit and review.

- **delete.php**  
  Deletes a specific notification for a user.

- **get-preferences.php**  
  Retrieves the current notification preferences for a user (e.g., email, SMS, in-app).

- **get.php**  
  Retrieves all notifications for a user, supporting inbox and alert features.

- **mark-all-read.php**  
  Marks all notifications as read for a user, clearing notification badges.

- **mark-read.php**  
  Marks a specific notification as read.

- **send.php**  
  Sends a new notification to one or more users.

- **templates.php**  
  Manages notification templates for consistent messaging.

- **update-preferences.php**  
  Updates a user's notification preferences.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data.
- The frontend calls these endpoints to send, receive, and manage notifications and preferences.
- Access may be restricted based on user roles (admin, user).

---

## Example Usage

- Admins send notifications to users using `send.php`.
- Users manage their notification preferences and mark notifications as read.
- Notification templates ensure consistent communication.

---

## Best Practices

- Ensure only authorized users can send or delete notifications.
- Allow users to customize their notification preferences.
- Use templates for consistent and professional messaging.

---

## Troubleshooting

- If notifications are not delivered, check the notification service configuration and delivery logs.
- Ensure proper authentication and authorization checks are in place to protect user privacy.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
