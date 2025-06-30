# KCAdashboard API – Users Endpoints Documentation

## Overview

The `users` endpoints folder provides the backend API for all user management features in KCAdashboard. These PHP files enable the creation, updating, deletion, and management of user accounts, roles, permissions, and activity logs. The endpoints support workflows for admins, teachers, and user management automation.

---

## File Structure

```
endpoints/users/
  activity-log.php         # Retrieve user activity logs
  bulk-delete.php          # Delete multiple users at once
  bulk-update-status.php   # Update status for multiple users
  delete.php               # Delete a user
  get-all.php              # Retrieve all users
  get-details.php          # Get details of a user
  get-shareable-users.php  # Get users that can be shared with
  get-teachers.php         # Get all teachers
  search-students.php      # Search for students
  update-permissions.php   # Update user permissions
  update-role.php          # Update user role
  update-status.php        # Update user status
  update.php               # Update user details
```

---

## File Explanations

- **activity-log.php**  
  Retrieves logs of user activities for auditing and monitoring.

- **bulk-delete.php**  
  Deletes multiple users in a single operation, supporting administrative efficiency.

- **bulk-update-status.php**  
  Updates the status (active, inactive, etc.) for multiple users at once.

- **delete.php**  
  Deletes a single user account from the system.

- **get-all.php**  
  Retrieves a list of all users in the system.

- **get-details.php**  
  Gets detailed information about a specific user.

- **get-shareable-users.php**  
  Gets a list of users that can be shared with (e.g., for resource sharing).

- **get-teachers.php**  
  Gets a list of all teachers in the system.

- **search-students.php**  
  Searches for students based on criteria such as name, batch, or status.

- **update-permissions.php**  
  Updates the permissions assigned to a user.

- **update-role.php**  
  Updates the role (admin, teacher, student, etc.) of a user.

- **update-status.php**  
  Updates the status (active, suspended, etc.) of a user.

- **update.php**  
  Updates user details such as name, email, or profile information.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data.
- The frontend calls these endpoints to manage users, roles, and permissions.
- Access may be restricted based on user roles (admin, teacher).

---

## Example Usage

- Admins manage user accounts, roles, and permissions using these endpoints.
- Teachers and admins search for students and manage user details.
- Activity logs are used for auditing and monitoring user actions.

---

## Best Practices

- Ensure only authorized users can modify user data or permissions.
- Validate all input data to maintain data integrity and security.
- Regularly review user roles, permissions, and activity logs for compliance.

---

## Troubleshooting

- If user data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect user data.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
