# KCAdashboard API – Analytics Exports Endpoints Documentation

## Overview

The `exports` folder under `analytics` contains API endpoints dedicated to exporting various analytics datasets. These PHP files allow administrators and authorized users to download analytics data (such as attendance, batch comparisons, quiz results, and student performance) in formats suitable for offline analysis, reporting, or archival.

---

## File Structure

```
endpoints/analytics/exports/
  attendance.php           # Export attendance analytics data
  batch_comparison.php     # Export batch comparison analytics data
  quiz_results.php         # Export quiz results analytics data
  student_performance.php  # Export student performance analytics data
```

---

## File Explanations

- **attendance.php**  
  Exports attendance analytics data, typically as CSV or Excel files, for further analysis or record-keeping.

- **batch_comparison.php**  
  Exports analytics data comparing different batches, enabling cross-batch analysis and reporting.

- **quiz_results.php**  
  Exports quiz results analytics, allowing for offline review, grading, or sharing with stakeholders.

- **student_performance.php**  
  Exports analytics on student performance, supporting detailed performance reviews and academic reporting.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, usually returning downloadable files (CSV, Excel, etc.).
- The frontend or admin panel calls these endpoints when users request to export analytics data.
- Access is typically restricted to authorized users (admins, teachers, etc.).

---

## Example Usage

- An admin clicks "Export Attendance" in the dashboard, triggering a request to `/api/endpoints/analytics/exports/attendance.php` and receiving a downloadable file.
- Similar export actions are available for batch comparisons, quiz results, and student performance data.

---

## Best Practices

- Ensure only authorized users can access export endpoints to protect sensitive data.
- Clearly document the format and structure of exported files for end users.
- Optimize export scripts for performance, especially with large datasets.

---

## Troubleshooting

- If exports fail or files are incomplete, check for database connectivity issues or data formatting errors in the PHP scripts.
- Ensure proper headers are set in the PHP files to trigger file downloads in browsers.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
