# KCAdashboard API – Models Documentation

## Overview

The `models` folder contains PHP classes that represent the core data entities in KCAdashboard. These model files encapsulate the structure, relationships, and business logic for analytics, users, attendance, chess games, quizzes, notifications, and more. Models are used throughout the API to interact with the database and enforce data integrity.

---

## File Structure

```
models/
  Analytics.php              # Analytics data and operations
  Attendance.php             # Attendance records and logic
  Batch.php                  # Batch-related data
  ChessChallenge.php         # Chess challenge data
  ChessGame.php              # Chess game data
  ChessPractice.php          # Chess practice sessions
  ChessStats.php             # Chess statistics
  Classroom.php              # Classroom data
  EmailVerification.php      # Email verification logic
  Grading.php                # Grading data and logic
  Notification.php           # Notifications
  NotificationPreference.php # User notification preferences
  Permission.php             # User permissions
  Quiz.php                   # Quiz data
  Resource.php               # Resources
  Support.php                # Support tickets and FAQs
  Tournament.php             # Tournament data
  User.php                   # User data and logic
```

---

## File Explanations

- **Analytics.php**  
  Handles analytics data, queries, and reporting logic.

- **Attendance.php**  
  Manages attendance records, validation, and related business rules.

- **Batch.php**  
  Represents batch entities, including relationships to students and classrooms.

- **ChessChallenge.php**  
  Models chess challenge data and challenge logic.

- **ChessGame.php**  
  Represents chess games, moves, and game state.

- **ChessPractice.php**  
  Handles chess practice sessions and related data.

- **ChessStats.php**  
  Stores and computes chess statistics for players and games.

- **Classroom.php**  
  Represents classroom entities, including students, teachers, and sessions.

- **EmailVerification.php**  
  Manages email verification tokens and logic.

- **Grading.php**  
  Handles grading data, calculations, and feedback.

  
- **Notification.php**  
  Models notifications sent to users. All notification logic is now handled via NotificationService for security and consistency. Deletion enforces user ownership.

  
- **NotificationPreference.php**  
  Stores user notification preferences (email, SMS, in-app, etc.). All logic is now centralized and channel-safe, with robust validation.

- **Permission.php**  
  Manages user permissions and access control.

- **Quiz.php**  
  Represents quizzes, questions, answers, and results.

- **Resource.php**  
  Models educational resources and their metadata.

- **Support.php**  
  Handles support tickets and FAQ entries.

- **Tournament.php**  
  Represents tournament data, participants, and results.

- **User.php**  
  Models user data, authentication, and profile logic.

---

## How Models Work

- Each PHP file defines a class that maps to a database table or entity.
- Models are used by endpoints and services to query, update, and validate data.
- Business logic and data relationships are encapsulated within model classes.

---

## Example Usage

- Endpoints include model files to interact with the database (e.g., fetching users, saving attendance).
- Models enforce validation and business rules before data is saved or updated.

---

## Best Practices

- Keep model logic focused on data structure, relationships, and validation.
- Avoid placing unrelated business logic in models; use services for complex workflows.
- Regularly review and update models as the database schema evolves.

---

## Troubleshooting

- If data is missing or incorrect, check the model logic and database queries.
- Ensure models are properly included and instantiated in endpoint files.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
