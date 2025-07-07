## Tournament Start Notification Integration

- The `NotificationService` is now used by the tournament update endpoint (`tournaments/update.php`) to send notifications in bulk to all registered users when an online tournament is started.
- This ensures all tournament start notifications are consistent, respect user preferences, and can be extended to email or other channels.
- See the endpoint code for details on how notifications are triggered for tournament start.
## Tournament Payment Notification Integration

- The `NotificationService` is now used by the tournament payment verification endpoint (`tournaments/payment-verify.php`) to notify users when their payment is approved or rejected.
- This ensures all payment notifications are consistent, respect user preferences, and can be extended to email or other channels.
- See the endpoint code for details on how notifications are triggered for payment verification.
## Notification Deletion Integration

- The `NotificationService` is now used by the notifications delete endpoint (`notifications/delete.php`) to handle notification deletion for users.
- This ensures all notification deletion logic is consistent, respects user permissions, and can be extended to new channels or audit requirements.
- See the endpoint code for details on how notifications are deleted for users.
## Admin-Sent Notifications Listing Integration

- The `NotificationService` is now used by the notifications admin-sent endpoint (`notifications/admin-sent.php`) to retrieve and group admin-sent notifications for audit and review.
- This ensures all notification listing logic is consistent, respects user preferences, and can be extended to new channels or grouping logic.
- See the endpoint code for details on how notifications are retrieved and grouped for admin review.
## Student Feedback Notification Integration

- The `NotificationService` is now used by the grading feedback endpoint (`grading/submit-feedback.php`) to notify students when new feedback is submitted by a teacher.
- This ensures all feedback notifications are consistent, respect user preferences, and can be extended to email or other channels.
- See the endpoint code for details on how notifications are triggered when submitting feedback.
## Classroom Assignment Submission Notification Integration

- The `NotificationService` is now used by the classroom assignment submission endpoint (`classroom/submit-assignment.php`) to notify the classroom teacher when a new assignment submission is made.
- This ensures all assignment submission notifications are consistent, respect user preferences, and can be extended to email or other channels.
- See the endpoint code for details on how notifications are triggered when submitting assignments.
## Classroom Discussion Notification Integration

- The `NotificationService` is now used by the classroom discussion endpoint (`classroom/post-discussion.php`) to send notifications: when a user replies to a post, the parent post owner is notified; when a new topic is started, the classroom teacher is notified.
- This ensures all discussion notifications are consistent, respect user preferences, and can be extended to email or other channels.
- See the endpoint code for details on how notifications are triggered when posting or replying to discussions.
## Classroom Assignment Grading Notification Integration

- The `NotificationService` is now used by the classroom assignment grading endpoint (`classroom/grade-assignment.php`) to send notifications to students when their assignments are graded.
- This ensures all assignment grading notifications are consistent, respect user preferences, and can be extended to email or other channels.
- See the endpoint code for details on how notifications are triggered when grading assignments.

# KCAdashboard API – Services Documentation

## July 2025 Notification System Refactor

- All notification-related service logic is now centralized in NotificationService.
- All user IDs, emails, and input data are sanitized and validated for security.
- NotificationService is required for all notification logic in endpoints (send, delete, update, list).
- See CONTRIBUTING.md for notification coding standards and requirements.

## Overview

The `services` folder contains PHP classes that encapsulate business logic for sending emails and notifications in KCAdashboard. Service classes are used by endpoints and other backend components to perform complex operations that go beyond simple data access, such as composing and sending emails or managing notification delivery.

---

## File Structure

```
services/
  EmailService.php         # Handles sending emails and email-related logic
  NotificationService.php  # Manages sending notifications to users
```

---

## File Explanations

- **EmailService.php**  
  Provides methods for composing, sending, and logging emails. Used for user registration, password resets, notifications, and other email-based features.

- **NotificationService.php**  
  Manages the creation and delivery of notifications to users, supporting in-app, email, or other notification channels. All notification and email logic is now secure, standardized, and fully documented.

---

## How Services Work

- Service classes are instantiated and used by endpoint files or other backend components.
- They encapsulate reusable business logic, making the codebase more modular and maintainable.
- Services may interact with models, configuration files, and external APIs (e.g., SMTP servers).

---

## Example Usage

- When a user registers, `EmailService.php` is used to send a verification email.
- When an event occurs (e.g., new assignment, notification), `NotificationService.php` is used to alert users.

---

## Best Practices

- Always use NotificationService for all notification logic (send, delete, update, list).
- Sanitize and validate all user IDs, emails, and input data in services and endpoints.
- Keep service logic focused and reusable; avoid duplicating code across endpoints.
- Handle errors and logging within services for better traceability.
- Regularly review and update service logic as business requirements evolve.

---

## Troubleshooting

- If emails or notifications are not delivered, check the service logic and external service configurations (SMTP, etc.).
- Ensure services are properly included and instantiated in endpoint files.

---

## Attendance Notification Integration

- The `NotificationService` is now used by the attendance marking endpoint (`mark-attendance.php`) to send absence notifications.
- This ensures all notifications (including attendance) are consistent, respect user preferences, and can be extended to email or other channels.
- See `attendance/docs.md` for details on how attendance endpoints use the notification service.

---

## Chess Challenge Notification Integration

- The `NotificationService` is now used by the chess challenge endpoint (`chess/challenge.php`) to send challenge notifications to recipients.
- This ensures chess challenge notifications are consistent with the rest of the system and respect user preferences.
- See the endpoint code for details on how notifications are triggered when a challenge is created.

---

## Chess Game Auto-Resign Notification Integration

- The `NotificationService` is now used by the chess game cleanup endpoint (`chess/cleanup-inactive-games.php`) to send notifications to both players when a game is auto-resigned due to inactivity.
- This ensures all game-related notifications are consistent and respect user preferences.
- See the endpoint code for details on how notifications are triggered during cleanup.

---

## Chess Game Resign Notification Integration

- The `NotificationService` is now used by the chess resign endpoint (`chess/resign-game.php`) to send notifications to both players when a game is resigned.
- This ensures all resign-related notifications are consistent and respect user preferences.
- See the endpoint code for details on how notifications are triggered during resignation.

---

## Chess Challenge Response Notification Integration

- The `NotificationService` is now used by the chess challenge response endpoint (`chess/respond-challenge.php`) to send notifications to the challenger when a challenge is accepted or declined.
- This ensures all challenge response notifications are consistent and respect user preferences.
- See the endpoint code for details on how notifications are triggered during challenge response.

---

## Chess Game Result Notification Integration

- The `NotificationService` is now used by the chess save-result endpoint (`chess/save-result.php`) to send notifications to both players when a game result is saved.
- This ensures all result-related notifications are consistent and respect user preferences.
- See the endpoint code for details on how notifications are triggered when saving results.

---

## Classroom Material Notification Integration

- The `NotificationService` is now used by the classroom add-material endpoint (`classroom/add-material.php`) to send notifications to all students in the classroom when new material is added.
- This ensures all classroom material notifications are consistent and respect user preferences.
- See the endpoint code for details on how notifications are triggered when adding material.

---

## Classroom Session Notification Integration

- The `NotificationService` is now used by the classroom add-session endpoint (`classroom/add-session.php`) to send notifications to all students in the classroom when a new class session is scheduled.
- This ensures all class session notifications are consistent and respect user preferences.
- See the endpoint code for details on how notifications are triggered when adding a session.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
