
# KCAdashboard Frontend – Authentication Pages Documentation

## Overview

The `auth` folder under `pages` contains all authentication-related page components for the KCAdashboard application. These pages handle user login, registration, password reset, and email verification flows. They are designed to provide a secure and user-friendly authentication experience for all users.

---

## File Structure

```
pages/auth/
  Login.js         # Login page for users
  Register.js      # Registration page for new users
  ResetPassword.js # Password reset page
  VerifyEmail.js   # Email verification page
```

---


## Registration & Role Security Policy (July 2025)

## Session Management (July 2025)

- Users can manage their active sessions from the new Settings page in the dashboard UI.
- Session management features include viewing all active sessions, logging out from other devices, and monitoring session activity.
- See [`../../docs/session-management.md`](../../docs/session-management.md) for technical and user documentation.
All new user registrations are created as students only. Teacher/admin roles can only be assigned by an admin via the user management interface. This is enforced in both frontend and backend for security.

## File Explanations

- **Login.js**  
  Provides a form for users to enter their email and password to log in. Handles authentication logic, error display, and redirects on success.

- **Register.js**  
  Registration form for new users. All new accounts are created as students. Teacher/admin roles can only be assigned by an admin. Prompts users to verify their email after successful registration.

- **ResetPassword.js**  
  Allows users to request a password reset and set a new password using a token sent via email. Handles validation and error feedback.

- **VerifyEmail.js**  
  Handles email verification links. Informs users of verification status and guides them to log in after successful verification.

---

## Features

- **Show/Hide Password:** All authentication forms now include a show/hide password toggle for better usability and accessibility.
- **Reusable Password Components:** `PasswordInput` and `FormikPasswordField` are used for consistent, accessible password fields across the app.
- **Secure Authentication:** All forms validate input and handle errors securely.
- **User Feedback:** Clear messages for success, errors, and next steps (e.g., check your email).
- **Token-Based Flows:** Password reset and email verification use secure tokens sent via email.
- **Integration with Auth Context:** Pages interact with the authentication context/hook for state and API calls.

---

## How These Pages Work

- Each page is mapped to a route (e.g., `/login`, `/register`, `/reset-password`, `/verify-email`).
- Pages use forms (Formik/Yup or React state) for input handling and validation.
- On success, users are redirected to the appropriate next step (dashboard, login, etc.).

---

## Example Usage

**Login Route:**
```
import Login from './pages/auth/Login';
<Route path="/login" element={<Login />} />
```

**Register Route:**
```
import Register from './pages/auth/Register';
<Route path="/register" element={<Register />} />
```

---

## Best Practices

- Validate all user input and display clear error messages.
- Never store sensitive data in the frontend; use secure tokens for authentication flows.
- Guide users through each step with clear instructions and feedback.
- Use environment variables for API endpoints and secrets.

---

## Troubleshooting

- **Login not working:** Check API connectivity and ensure credentials are correct.
- **Registration errors:** Validate all required fields and check for duplicate emails.
- **Password reset issues:** Ensure the reset token is valid and not expired.
- **Email verification problems:** Confirm the verification link is correct and not expired.

---

For more details on authentication flows and integration, see the main `docs.md` in the `src` folder.
