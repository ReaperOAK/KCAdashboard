# KCAdashboard API – Resources Endpoints Documentation

## Overview

The `resources` endpoints folder provides the backend API for all resource management features in KCAdashboard. These PHP files enable uploading, sharing, searching, bookmarking, and downloading educational resources for students, teachers, and admins. The endpoints support workflows for resource discovery, access control, and sharing across batches and classrooms.

---

## File Structure

```
endpoints/resources/
  bookmark.php            # Bookmark a resource for a user
  download.php            # Handle resource downloads
  get-all.php             # Retrieve all resources
  get-bookmarks.php       # Get all bookmarked resources for a user
  get-by-category.php     # Get resources by category
  get-by-id.php           # Get a resource by its ID
  get-featured.php        # Get featured resources
  log-access.php          # Log access to a resource
  search.php              # Search for resources
  share-with-batch.php    # Share a resource with a batch
  share-with-classroom.php # Share a resource with a classroom
  share-with-student.php  # Share a resource with a student
  unbookmark.php          # Remove a bookmark from a resource
  upload.php              # Upload a new resource
```

---

## File Explanations

- **bookmark.php**  
  Bookmarks a resource for a user, allowing quick access later.

- **download.php**  
  Handles downloading of resource files by authorized users.

- **get-all.php**  
  Retrieves all resources available in the system.

- **get-bookmarks.php**  
  Gets all resources bookmarked by a user.

- **get-by-category.php**  
  Gets resources filtered by category (e.g., subject, type).

- **get-by-id.php**  
  Gets detailed information about a specific resource by its ID.

- **get-featured.php**  
  Gets a list of featured resources highlighted for users.

- **log-access.php**  
  Logs when a resource is accessed, supporting analytics and auditing.

- **search.php**  
  Searches for resources based on keywords, filters, or tags.

- **share-with-batch.php**  
  Shares a resource with all students in a batch.

- **share-with-classroom.php**  
  Shares a resource with all students in a classroom.

- **share-with-student.php**  
  Shares a resource with a specific student.

- **unbookmark.php**  
  Removes a bookmark from a resource for a user.

- **upload.php**  
  Uploads a new resource file to the system.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data or handling file uploads/downloads.
- The frontend calls these endpoints to manage, search, and share resources.
- Access may be restricted based on user roles (student, teacher, admin).

---

## Example Usage

- Teachers upload and share resources with their classes or batches.
- Students bookmark and download resources for study.
- Admins review resource access logs for analytics.

---

## Best Practices

- Ensure only authorized users can upload, share, or download resources.
- Validate all uploaded files for security and compliance.
- Regularly review resource metadata and access logs for quality and usage.

---

## Troubleshooting

- If resources are missing or inaccessible, check the underlying database queries and file storage.
- Ensure proper authentication and authorization checks are in place to protect resource integrity.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
