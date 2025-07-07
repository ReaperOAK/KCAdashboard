# KCAdashboard API – Attendance Endpoints Documentation

## Overview

The `attendance` endpoints folder provides the backend API for all attendance-related features in KCAdashboard. These PHP files enable tracking, managing, exporting, and synchronizing attendance data for students, classes, and online sessions. The endpoints support both administrative and automated attendance workflows.

---

## File Structure

```
endpoints/attendance/
  export.php                # Export attendance records
  get-all.php               # Retrieve all attendance records
  get-settings.php          # Get attendance settings
  get-students-attendance.php # Fetch attendance for all students
  get-user-attendance.php   # Fetch attendance for a specific user
  mark-attendance.php       # Mark attendance for students
  send-reminders.php        # Send attendance reminders
  sync-online-class.php     # Sync attendance with online classes
  update-settings.php       # Update attendance settings
```

---

## File Explanations

- **export.php**  
  Exports attendance records, typically as CSV or Excel files, for reporting or archival purposes.

- **get-all.php**  
  Retrieves all attendance records in the system, supporting administrative review and analytics.

- **get-settings.php**  
  Gets the current attendance settings, such as policies, thresholds, or rules.

- **get-students-attendance.php**  
  Fetches attendance data for all students, useful for batch or class-level reporting.

- **get-user-attendance.php**  
  Fetches attendance records for a specific user, supporting individual review and reporting.

- **mark-attendance.php**  
  Marks attendance for students, either manually by teachers/admins or via automated processes.

- **send-reminders.php**  
  Sends reminders to students or teachers about attendance requirements or missing records.

- **sync-online-class.php**  
  Syncs attendance data with online class platforms, ensuring accurate records for virtual sessions.

- **update-settings.php**  
  Updates attendance settings and policies as needed by administrators.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data or downloadable files.
- The frontend calls these endpoints to manage, view, and report on attendance data.
- Access may be restricted based on user roles (admin, teacher, student).

---

## Example Usage

- Teachers mark attendance via the frontend, which calls `mark-attendance.php`.
- Admins export attendance data using `export.php` for compliance or reporting.
- Automated scripts or integrations use `sync-online-class.php` to keep records up to date.

---

## Best Practices

- Ensure only authorized users can modify or export attendance data.
- Regularly review attendance settings and policies for accuracy.
- Optimize endpoints for performance, especially when handling large datasets.

---

## Troubleshooting

- If attendance data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect sensitive data.

---

## Notifications for Attendance

- When a student is marked absent via `mark-attendance.php`, an in-app notification is sent to the student using the centralized `NotificationService`.
- The notification uses the `attendance` category, ensuring consistency with the rest of the notification system.
- This approach ensures that notification preferences, email delivery, and future extensibility are respected.

---

## Example Notification Logic

- When marking attendance, the backend will call:
  ```php
  $notificationService->sendCustom($student_id, 'Absence Recorded', "You were marked absent for today's class.", 'attendance');
  ```
- This ensures the notification is created using the same logic as all other notifications in the system.

---

## Best Practices (Notifications)

- Always use the `NotificationService` for sending notifications from attendance endpoints.
- Do not insert directly into the `notifications` table; this bypasses preferences and category validation.
- Document notification logic in both attendance and notification docs for clarity.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
