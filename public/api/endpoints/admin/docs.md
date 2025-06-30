# KCAdashboard API – Admin Endpoints Documentation

## Overview

The `admin` endpoints folder provides the backend API for all administrative features in KCAdashboard. These PHP files expose data and statistics needed by platform administrators to monitor, manage, and report on key aspects of the system, such as attendance, batch performance, and overall platform health.

---

## File Structure

```
endpoints/admin/
  attendance-overview.php   # Attendance statistics overview for admins
  batch-stats.php           # Batch-related statistics
  dashboard-stats.php       # Key metrics for the admin dashboard
```

---

## File Explanations

- **attendance-overview.php**  
  Returns a summary of attendance data across all batches and classrooms. Used by admins to monitor trends, spot irregularities, and ensure compliance with attendance policies.

- **batch-stats.php**  
  Provides detailed statistics for each batch, including student counts, performance metrics, and activity levels. Enables admins to compare batches and identify areas needing attention.

- **dashboard-stats.php**  
  Supplies aggregated metrics and KPIs (Key Performance Indicators) for the admin dashboard. This includes user activity, system health, and other high-level indicators for quick decision-making.

---

## How These Endpoints Work

- These PHP files are RESTful API endpoints, typically returning JSON data.
- They are called by the frontend admin dashboard to display real-time statistics and overviews.
- All endpoints are secured and should only be accessible to users with admin privileges (enforced via authentication middleware).

---

## Example Usage

- The frontend dashboard makes a GET request to `/api/endpoints/admin/attendance-overview.php` to fetch attendance data for display.
- Batch statistics and dashboard KPIs are fetched similarly for admin reporting and analytics.

---

## Best Practices

- Restrict access to these endpoints to authorized admin users only.
- Regularly review and update the data returned to ensure it meets the evolving needs of administrators.
- Extend these endpoints as new admin features or reporting requirements arise.
- Ensure responses are well-structured and documented for frontend integration.

---

## Troubleshooting

- If data appears incorrect or missing, check the underlying database queries in each PHP file.
- Ensure authentication middleware is properly configured to prevent unauthorized access.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
