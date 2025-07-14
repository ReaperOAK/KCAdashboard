
# KCAdashboard Frontend – User Management Modals Documentation

## Overview

The `Modals` subfolder under `components/user-management` contains modal dialog components used for user management tasks. These modals provide focused, interactive interfaces for editing user details and viewing user activity, enhancing the user management experience for administrators and staff.

---

## File Structure

```
components/user-management/Modals/
  EditUserModal.js   # Modal for editing user details and viewing activity logs
```

---

## File Explanations

- **EditUserModal.js**  
  A modal dialog component that allows administrators to edit user details (name, email, role, status) and view user activity logs. It features tabbed navigation between details and activity, form validation, and responsive design. The modal can be closed by clicking the backdrop or the close button, and integrates with the user activity page for audit trails.

---

## Features

- **Tabbed Navigation:** Switch between editing user details and viewing activity logs.
- **Form Controls:** Edit full name, email, role, and status with validation and error handling.
- **Activity Logs:** View recent actions and history for the selected user (via integration with the admin's user activity page).
- **Accessible Modal:** Can be closed via backdrop click or close button; keyboard accessible.
- **Responsive Design:** Styled with Tailwind CSS for usability on all screen sizes.

---

## How the Modal Works

- Receives the user object, state setters, and handlers as props from the parent component.
- Renders a modal overlay with a form for editing user details and a tab for activity logs.
- Handles form submission, validation, and error display.
- Calls the provided `onClose` handler to close the modal.

---

## Example Usage

```
import EditUserModal from './components/user-management/Modals/EditUserModal';

{showEditModal && (
  <EditUserModal
    user={selectedUser}
    onSubmit={handleEditSubmit}
    onClose={closeModal}
    error={editError}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
  />
)}
```

---

## Best Practices

- Use local state for editing in modals (e.g., EditUserModal) and only update parent state on submit. This prevents infinite update loops and improves performance.

- Keep modal state (open/close, active tab, user data) in the parent component for clarity.
- Validate all user input before submitting changes.
- Use clear error messages and feedback for a better user experience.
- Ensure the modal is accessible and can be closed via keyboard and mouse.

---

## Troubleshooting

- **Infinite update loop in edit modal:** Ensure EditUserModal uses local state for editing and only calls parent on submit. Use the functional form of setUser in UserDetailsForm.

- **Modal not closing:** Ensure the `onClose` handler is passed and correctly implemented.
- **Form not saving:** Check that the `onSubmit` handler is connected and updates the backend as needed.
- **Tabs not switching:** Confirm that `activeTab` and `setActiveTab` are managed in the parent and passed as props.
- **Styling issues:** Make sure Tailwind CSS is properly configured in the project.

---

For more details on user management components, see the main `docs.md` in the `user-management` folder.
