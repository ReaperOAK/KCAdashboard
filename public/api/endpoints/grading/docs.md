# KCAdashboard API – Grading Endpoints Documentation

## Overview

The `grading` endpoints folder provides the backend API for all grading and feedback features in KCAdashboard. These PHP files enable teachers and admins to manage student grading, feedback, and report cards, supporting both individual and batch-level assessment workflows.

---

## File Structure

```
endpoints/grading/
  get-all-students.php           # Retrieve all students for grading
  get-batch-students.php         # Get students in a batch for grading
  get-student-feedback-history.php # Get feedback history for a student
  get-student-performance.php    # Get performance data for a student
  get-student-report-cards.php   # Retrieve student report cards
  submit-feedback.php            # Submit feedback for a student
  upload-report-card.php         # Upload a report card for a student
```

---

## File Explanations

- **get-all-students.php**  
  Retrieves a list of all students available for grading, supporting administrative and teacher workflows.

  Gets students in a specific batch for batch-level grading and assessment.

  Retrieves the feedback history for a student, supporting longitudinal assessment and review.

  Gets detailed performance data for a student, including grades, participation, and progress.

  Retrieves report cards for students, supporting official record-keeping and parent communication.

  Allows teachers to submit feedback for a student, supporting formative assessment and improvement. Uses the centralized NotificationService to notify the student when new feedback is submitted. Do not insert directly into the notifications table; always use NotificationService for feedback notifications.

**July 2025 Update:**
- Feedback submission now requires and stores session_id when grading from the dashboard modal.
- get-pending.php now only returns sessions that have not received feedback from the teacher for that session.
- Fixes issue where sessions remained "pending" even after feedback was submitted.

**upload-report-card.php**  
  Uploads a report card document for a student, supporting digital record-keeping.
  
  **July 2025 Update:**
  - Fixed bug where uploading a report card for a student would not update the UI or use the correct file URL.
  - Now returns the server-generated filename and logs errors for failed uploads or directory issues.
  - Improved error handling and directory permission checks.


## How These Endpoints Work
- Each PHP file acts as a RESTful API endpoint, typically returning JSON data or handling file uploads.
- The frontend calls these endpoints to manage grading, feedback, and report cards.
- Access may be restricted based on user roles (teacher, admin).

---

## Example Usage

- Teachers retrieve students for grading and submit feedback using these endpoints.
- Admins upload and manage report cards for official records.

---

## Best Practices

- Ensure only authorized users can access and modify grading data.
- Validate input data to maintain grading integrity and prevent errors.
- Regularly review feedback and report card records for completeness and accuracy.

---


## Troubleshooting

- If grading data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect sensitive data.
- If you encounter a 500 error from `get-pending.php`, check the PHP error logs for details. The endpoint now logs errors and returns a JSON error message for diagnostics.

---

## Recent Improvements
- Error handling and logging added to `get-pending.php` for better diagnostics and reliability.
