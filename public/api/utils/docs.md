# KCAdashboard API – Utils Documentation

## Overview

The `utils` folder contains utility PHP scripts that provide reusable helper functions and logic for the KCAdashboard API. These files support core features such as authorization, chess operations, file uploads, email handling, and integration with external engines. Utilities are used throughout the backend to keep code DRY (Don't Repeat Yourself) and maintainable.

---

## File Structure

```
utils/
  authorize.php      # Authorization logic for API requests
  ChessHelper.php    # Helper functions for chess operations
  cleanup-old-games.php # Cleans up old chess games from the database
  EmailService.php   # Utility for sending emails (may extend main EmailService)
  Mailer.php         # Low-level email sending logic
  PGNParser.php      # Parses PGN (Portable Game Notation) chess files
  Stockfish.php      # Integrates with the Stockfish chess engine
  UploadHelper.php   # Helper functions for file uploads
```

---

## File Explanations

- **authorize.php**  
  Handles authorization logic, checking user permissions and access rights for API requests.

- **ChessHelper.php**  
  Provides helper functions for chess operations, such as move validation and board setup.

- **cleanup-old-games.php**  
  Cleans up old or inactive chess games from the database to maintain performance and storage efficiency.

- **EmailService.php**  
  Utility for sending emails, may be used as a helper or extension to the main `EmailService` in the `services` folder.

- **Mailer.php**  
  Handles low-level email sending logic, such as SMTP configuration and message delivery.

- **PGNParser.php**  
  Parses PGN (Portable Game Notation) chess files for import, analysis, or validation.

- **Stockfish.php**  
  Integrates with the Stockfish chess engine for move analysis and evaluation.

- **UploadHelper.php**  
  Provides helper functions for handling file uploads securely and efficiently.

---

## How Utilities Work

- Utility scripts are included or required by endpoint and service files as needed.
- They encapsulate reusable logic, reducing code duplication and improving maintainability.
- Utilities may interact with models, services, or external APIs.

---

## Example Usage

- Endpoints include `authorize.php` to enforce access control.
- Chess endpoints use `ChessHelper.php`, `PGNParser.php`, and `Stockfish.php` for game logic and analysis.
- File upload endpoints use `UploadHelper.php` for secure file handling.

---

## Best Practices

- Keep utility functions focused and reusable.
- Avoid duplicating logic across endpoints; use utilities instead.
- Regularly review and update utility scripts as requirements evolve.

---

## Troubleshooting

- If utility functions fail, check for missing includes or incorrect usage in endpoint files.
- Ensure utilities are up to date and compatible with the rest of the codebase.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
