# KCAdashboard API Config Folder Documentation

## Overview

This folder contains essential configuration files for the KCAdashboard API. These files are responsible for setting up core services such as database connectivity, email delivery, and CORS (Cross-Origin Resource Sharing) policies. Proper configuration here ensures secure, reliable, and maintainable operation of the backend.

---

## File Structure

```
config/
  cors.php       # CORS policy configuration
  Database.php   # Database connection and settings
  mail.php       # Email server and mailer configuration
```

---

## Features & Responsibilities

- **cors.php**: Defines which domains are allowed to access the API, what HTTP methods are permitted, and manages CORS headers for security and interoperability.
- **Database.php**: Sets up the database connection parameters (host, username, password, database name, charset, etc.), and provides the logic to establish and manage connections to the database server.
- **mail.php**: Configures the mail server (SMTP settings, authentication, sender details) and is used by the API to send emails for notifications, verifications, and password resets.

---

## How to Use

1. **Edit `Database.php`** to match your database server credentials and settings.
2. **Edit `mail.php`** to configure your SMTP server and sender details for outgoing emails.
3. **Edit `cors.php`** to allow or restrict domains and HTTP methods as needed for your frontend or third-party integrations.

---

## Best Practices

- Keep sensitive credentials (like database passwords and SMTP credentials) secure and do not commit them to public repositories.
- Regularly review and update CORS settings to avoid exposing your API to unwanted domains.
- Test email and database connectivity after making changes to these files.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
