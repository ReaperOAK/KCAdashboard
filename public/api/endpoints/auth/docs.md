# KCAdashboard API – Auth Endpoints Documentation

## Overview

The `auth` endpoints folder provides the backend API for all authentication and user account management features in KCAdashboard. These PHP files handle user login, registration, password resets, email verification, and security measures such as rate limiting. They are essential for secure access and user lifecycle management.

---

## File Structure

```
endpoints/auth/
  login.php             # User login
  rate_limit.php        # Rate limiting for authentication
  register.php          # User registration
  request-reset.php     # Initiate password reset
  reset-password.php    # Reset user password
  send_verification.php # Send email verification link
  update-profile.php    # Update user profile
  verify-email.php      # Verify user email address
  verify-token.php      # Verify authentication tokens
```

---

## File Explanations

- **login.php**  
  Handles user login by validating credentials and issuing authentication tokens or sessions. Now includes role-based session management with configurable limits per user role.

- **logout.php**  
  Handles user logout by invalidating the current authentication token on the server side.

- **get-active-sessions.php**  
  Returns a list of all active sessions for the current user, showing login times and device information.

- **manage-sessions.php**  
  Allows users to manage their active sessions, including logging out all other devices or all sessions.

- **rate_limit.php**  
  Implements rate limiting to prevent brute-force attacks and abuse of authentication endpoints.

- **register.php**  
  Handles new user registration with enhanced security. All new registrations are automatically assigned the "student" role. Only administrators can promote users to "teacher" or "admin" roles through the user management system. This prevents unauthorized access to privileged dashboards.

- **request-reset.php**  
  Initiates the password reset process by sending a reset link or code to the user's email.

- **reset-password.php**  
  Resets the user's password after verifying the reset token or code.

- **send_verification.php**  
  Sends an email verification link to the user after registration or on request.

- **update-profile.php**  
  Allows users to update their profile information, such as name, email, or password.

- **verify-email.php**  
  Verifies the user's email address using a token or code from the verification link.

- **verify-token.php**  
  Verifies authentication tokens for session management and secure access.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data.
- The frontend calls these endpoints for user login, registration, password management, and profile updates.
- Security measures (rate limiting, token verification) are enforced to protect user accounts.

---

## Example Usage

- Users log in via the frontend, which calls `login.php` and receives an authentication token.
- Registration, password reset, and email verification are handled through their respective endpoints.

---

## Best Practices

- Enforce strong password policies and input validation.
- Use HTTPS for all authentication endpoints.
- Implement rate limiting and token expiration for security.
- Never expose sensitive error messages to the client.

---

## Troubleshooting

- If users cannot log in or register, check for database connectivity and input validation errors.
- Ensure email sending is properly configured for verification and password reset.
- Monitor rate limiting to avoid locking out legitimate users.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
