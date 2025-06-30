# KCAdashboard API – Batches Endpoints Documentation

## Overview

The `batches` endpoints folder provides the backend API for all batch management features in KCAdashboard. These PHP files enable the creation, updating, deletion, and management of student batches, as well as the assignment and removal of students from batches. The endpoints support both administrative and teacher workflows for organizing students into groups.

---

## File Structure

```
endpoints/batches/
  add-student.php        # Add a student to a batch
  create.php             # Create a new batch
  delete.php             # Delete a batch
  get-all.php            # Retrieve all batches
  get-classroom-id.php   # Get the classroom ID for a batch
  get-details.php        # Get details of a batch
  get-students.php       # Get students in a batch
  remove-student.php     # Remove a student from a batch
  update.php             # Update batch information
```

---

## File Explanations

- **add-student.php**  
  Adds a student to a specific batch, updating the batch membership records.

- **create.php**  
  Creates a new batch, specifying details such as batch name, schedule, and assigned teachers.

- **delete.php**  
  Deletes a batch and removes all associated records.

- **get-all.php**  
  Retrieves a list of all batches in the system, supporting administrative overview and reporting.

- **get-classroom-id.php**  
  Gets the classroom ID associated with a given batch, supporting integration with classroom management features.

- **get-details.php**  
  Retrieves detailed information about a specific batch, including students, schedule, and teachers.

- **get-students.php**  
  Gets a list of students assigned to a specific batch.

- **remove-student.php**  
  Removes a student from a batch, updating membership records accordingly.

- **update.php**  
  Updates batch information, such as name, schedule, or assigned teachers.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data.
- The frontend calls these endpoints to manage batches, assign students, and update batch details.
- Access may be restricted based on user roles (admin, teacher).

---

## Example Usage

- Admins or teachers create new batches using `create.php`.
- Students are assigned or removed from batches using `add-student.php` and `remove-student.php`.
- Batch details and student lists are fetched for display and management.

---

## Best Practices

- Ensure only authorized users can modify batch data.
- Validate input data to prevent errors and maintain data integrity.
- Regularly review batch membership and details for accuracy.

---

## Troubleshooting

- If batch data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect sensitive data.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
