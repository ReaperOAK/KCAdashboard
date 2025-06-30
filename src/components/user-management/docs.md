
# KCAdashboard Frontend – User Management Components Documentation

## Overview

The `user-management` folder under `components` contains all React components related to managing users within the KCAdashboard application. These components provide a complete interface for listing, filtering, editing, and managing user accounts, roles, and statuses. The folder is designed for use by administrators and staff who need to oversee user data and permissions.

---

## File Structure

```
components/user-management/
  Filters.js         # Filtering/search bar for user management
  UserTable.js       # Table displaying all users
  UserTableRow.js    # Row component for each user in the table
  Modals/
    EditUserModal.js # Modal dialog for editing user details and viewing activity
```

---

## File Explanations

- **Filters.js**  
  Provides a search input and dropdown filter to quickly find users by name/email and filter by role (student, teacher, admin, or all). It is a controlled component, receiving state and setters as props from the parent.

- **UserTable.js**  
  Renders a responsive table of users, including checkboxes for bulk selection, columns for user details, and an actions column. It maps over the user list and renders a `UserTableRow` for each user. Handles selection logic and passes down event handlers for editing, permissions, deletion, and status/role changes.

- **UserTableRow.js**  
  Represents a single row in the user table. Displays user info, allows inline editing of role and status, and provides action buttons (edit, permissions, delete). Includes a mobile-friendly dropdown menu for actions using Headless UI's `Menu` and Heroicons.

- **Modals/EditUserModal.js**  
  A modal dialog for editing user details (name, email, role, status) and viewing user activity logs. Supports tabbed navigation between details and activity. Handles form submission, validation, and closing logic. Integrates with the admin's user activity page for audit trails.

---

## Features

- **User Search & Filtering:** Quickly find users by name/email and filter by role.
- **Bulk Selection:** Select multiple users for batch actions (future extensibility).
- **Inline Editing:** Change user roles and statuses directly from the table.
- **Action Menus:** Edit, manage permissions, or delete users with accessible action buttons and mobile-friendly menus.
- **Edit Modal:** Edit user details and view activity logs in a modal dialog with tabbed navigation.
- **Responsive Design:** All components are styled with Tailwind CSS for a modern, responsive UI.

---

## How These Components Work Together

1. The parent user management page maintains the user list and state for search/filter criteria.
2. `Filters.js` is used at the top to control search and filter state.
3. `UserTable.js` receives the filtered user list and renders a table, passing each user to `UserTableRow.js`.
4. `UserTableRow.js` provides inline controls and action buttons for each user.
5. When editing, the `EditUserModal.js` is shown, allowing detailed edits and activity review.

---

## Example Usage

```
import Filters from './components/user-management/Filters';
import UserTable from './components/user-management/UserTable';
import EditUserModal from './components/user-management/Modals/EditUserModal';

// In parent component:
<Filters searchTerm={searchTerm} setSearchTerm={setSearchTerm} filter={filter} setFilter={setFilter} />
<UserTable users={filteredUsers} ...handlers />
{showEditModal && <EditUserModal user={selectedUser} ...handlers />}
```

---

## Best Practices

- Keep state management (user list, search/filter, modal visibility) in the parent container/page.
- Pass only necessary props to each component for clarity and reusability.
- Use semantic HTML and accessible controls for all actions and forms.
- Validate user input in modals and handle errors gracefully.

---

## Troubleshooting

- **Table not updating:** Ensure user state is updated in the parent and passed down as props.
- **Modal not closing:** Check that the `onClose` handler is correctly wired and backdrop clicks are handled.
- **Role/status changes not saving:** Confirm that event handlers are implemented and update the backend as needed.
- **Styling issues:** Make sure Tailwind CSS and Headless UI are properly installed and configured.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
