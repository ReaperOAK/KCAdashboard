# KCAdashboard API – Classroom Endpoints Documentation

## Overview

The `classroom` endpoints folder provides the backend API for all classroom management features in KCAdashboard. These PHP files enable the creation, management, and participation in classrooms, including assignments, materials, sessions, discussions, and attendance. The endpoints support workflows for students, teachers, and administrators.

---

## File Structure

```
endpoints/classroom/
  add-material.php            # Add material to a classroom
  add-session.php             # Add a session to a classroom
  add-student.php             # Add a student to a classroom
  check-enrollment.php        # Check if a student is enrolled
  create-assignment.php       # Create a classroom assignment
  enroll.php                  # Enroll a student in a classroom
  get-assignment-submissions.php # Get submissions for an assignment
  get-assignments.php         # Retrieve classroom assignments
  get-available-classes.php   # List available classes
  get-classroom-details.php   # Get details of a classroom
  get-discussions.php         # Retrieve classroom discussions
  get-materials.php           # Get classroom materials
  get-session-students.php    # Get students in a session
  get-sessions.php            # List classroom sessions
  get-student-batches.php     # Get batches for a student
  get-student-classes.php     # Get classes for a student
  get-teacher-assignments.php # Get assignments for a teacher
  get-teacher-classes.php     # Get classes for a teacher
  grade-assignment.php        # Grade a classroom assignment
  post-discussion.php         # Post a discussion in a classroom
  quick-enroll.php            # Quickly enroll a student
  resolve-id.php              # Resolve classroom IDs
  rate-class.php              # Rate a class attended by a student
  submit-assignment.php       # Submit an assignment
  sync-batch-classroom.php    # Sync batch and classroom data
  track-attendance.php        # Track classroom attendance
  create-recurring-sessions.php # Create recurring sessions for a classroom
```

---

## File Explanations

- **add-material.php**  
  Adds new learning materials to a classroom for student access.  
  **July 2025:** Now supports multiple file uploads in a single request. Each file is validated and creates a separate resource entry. Mixed uploads (files + video links) are supported.

- **add-session.php**  
  Adds a new session (class/meeting) to a classroom schedule. Prevents a teacher from scheduling more than one class at the same time (overlapping sessions) across all their classrooms. If an overlap is detected, the API returns an error and the session is not created.

- **add-student.php**  
  Adds a student to a classroom, updating enrollment records.

- **check-enrollment.php**  
  Checks if a student is currently enrolled in a classroom.

- **create-assignment.php**  
  Creates a new assignment for classroom students.

- **enroll.php**  
  Enrolls a student in a classroom, supporting both manual and quick enrollment.

- **get-assignment-submissions.php**  
  Retrieves all submissions for a specific assignment.

- **get-assignments.php**  
  Retrieves all assignments for a classroom.

- **get-available-classes.php**  
  Lists all available classes for enrollment.

- **get-classroom-details.php**  
  Gets detailed information about a classroom, including students, sessions, and materials.

- **get-discussions.php**  
  Retrieves all discussions and posts in a classroom.

- **get-materials.php**  
  Gets all learning materials for a classroom.

- **get-session-students.php**  
  Gets a list of students in a specific session.

- **get-sessions.php**  
  Lists all sessions (classes/meetings) for a classroom.

- **get-student-batches.php**  
  Gets all batches a student is part of.

- **get-student-classes.php**  
  Gets all classes a student is enrolled in.

- **get-teacher-assignments.php**  
  Gets all assignments created by a teacher.

- **get-teacher-classes.php**  
  Gets all classes assigned to a teacher.

- **grade-assignment.php**  
  Allows teachers to grade student assignments. When a submission is graded, the endpoint uses the centralized NotificationService to send a notification to the student about their grade. This ensures all notifications are consistent, respect user preferences, and are future-proof. Do not insert directly into the notifications table; always use NotificationService for assignment grading notifications.

- **post-discussion.php**  
  Posts a new discussion or message in a classroom. Uses the centralized NotificationService to send notifications: when a user replies to a post, the parent post owner is notified; when a new topic is started, the classroom teacher is notified. Do not insert directly into the notifications table; always use NotificationService for discussion notifications.

- **quick-enroll.php**  
  Quickly enrolls a student in a classroom.

- **resolve-id.php**  
  Resolves classroom IDs for integration or lookup.

- **rate-class.php**  
  Allows students to rate a class they attended. Validates eligibility and saves the rating and comment. Requires CORS and returns JSON responses for success or error.

- **submit-assignment.php**  
  Allows students to submit assignments for grading. Uses the centralized NotificationService to notify the classroom teacher when a new assignment submission is made. Do not insert directly into the notifications table; always use NotificationService for assignment submission notifications.

- **sync-batch-classroom.php**  
  Syncs batch and classroom data for consistency.

- **track-attendance.php**  
  Tracks attendance for classroom sessions.

- **create-recurring-sessions.php**  
  Bulk-creates recurring class sessions for a classroom based on the batch schedule. Accepts a schedule, date range, and template for session titles/descriptions. Skips conflicts and notifies all students. See frontend docs for usage and UI details.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data.
- The frontend calls these endpoints to manage classrooms, assignments, sessions, and discussions.
- Access may be restricted based on user roles (student, teacher, admin).

---

## Example Usage

- Teachers create assignments and sessions, and manage classroom materials.
- Students enroll in classes, submit assignments, and participate in discussions.
- Admins track attendance and sync batch/classroom data for reporting.

---

## Best Practices

- Ensure only authorized users can modify classroom data.
- Validate input data to prevent errors and maintain data integrity.
- Regularly review classroom membership, assignments, and materials for accuracy.

---

## Troubleshooting

- If classroom data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect sensitive data.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
