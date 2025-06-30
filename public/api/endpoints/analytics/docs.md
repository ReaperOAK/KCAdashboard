# KCAdashboard API – Analytics Endpoints Documentation

## Overview

The `analytics` endpoints folder provides the backend API for all analytics and reporting features in KCAdashboard. These PHP files expose data and insights for students, teachers, and administrators, enabling data-driven decisions and performance tracking across the platform.

---

## File Structure

```
endpoints/analytics/
  attendance.php                # Attendance analytics
  batch-comparison.php          # Batch comparison analytics
  export.php                    # Export analytics data
  get-stats.php                 # General analytics statistics
  quiz-results.php              # Quiz results analytics
  student-dashboard-stats.php   # Student dashboard analytics
  student-performance.php       # Student performance analytics
  student-progress.php          # Student progress analytics
  teacher-dashboard-stats.php   # Teacher dashboard analytics
  teacher-stats.php             # Teacher performance analytics
```

---

## File Explanations

- **attendance.php**  
  Provides detailed analytics on attendance records, trends, and summaries for classes, batches, or the entire platform.

- **batch-comparison.php**  
  Compares analytics data between different batches, helping identify strengths, weaknesses, and trends across groups.

- **export.php**  
  Handles exporting of analytics data in various formats (e.g., CSV, Excel) for offline analysis or reporting.

- **get-stats.php**  
  Retrieves a variety of general analytics statistics, serving as a catch-all for platform-wide metrics.

- **quiz-results.php**  
  Provides analytics and breakdowns of quiz results, including scores, participation, and trends.

- **student-dashboard-stats.php**  
  Supplies analytics data specifically for student dashboards, such as progress, achievements, and activity.

- **student-performance.php**  
  Analyzes individual or group student performance, highlighting strengths, weaknesses, and improvement areas.

- **student-progress.php**  
  Tracks and reports on student progress over time, supporting personalized learning and intervention.

- **teacher-dashboard-stats.php**  
  Supplies analytics for teacher dashboards, including class performance, engagement, and teaching effectiveness.

- **teacher-stats.php**  
  Provides analytics on teacher performance, participation, and outcomes.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data for use in dashboards and reports.
- The frontend calls these endpoints to display analytics and visualizations for students, teachers, and admins.
- Access may be restricted based on user roles to ensure privacy and data security.

---

## Example Usage

- The frontend dashboard makes a GET request to `/api/endpoints/analytics/attendance.php` to fetch attendance analytics for display.
- Batch comparison, quiz results, and performance analytics are fetched similarly for reporting and insights.

---

## Best Practices

- Ensure analytics endpoints are optimized for performance, especially when processing large datasets.
- Restrict access to sensitive analytics data based on user roles.
- Regularly review and update analytics logic to reflect evolving reporting needs.
- Provide clear and well-structured JSON responses for easy frontend integration.

---

## Troubleshooting

- If analytics data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect sensitive data.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
