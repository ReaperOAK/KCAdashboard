# KCAdashboard API – Quiz Endpoints Documentation

## Overview

The `quiz` endpoints folder provides the backend API for all quiz-related features in KCAdashboard. These PHP files enable the creation, management, participation, and analysis of quizzes for students and teachers. The endpoints support workflows for quiz authoring, publishing, taking, grading, and leaderboard tracking.

---

## File Structure

```
endpoints/quiz/
  create.php                # Create a new quiz
  delete.php                # Delete a quiz
  get-all.php               # Retrieve all quizzes
  get-by-difficulty.php     # Get quizzes by difficulty level
  get-by-id.php             # Get a quiz by its ID
  get-latest-result.php     # Get the latest quiz result for a user
  get-leaderboard.php       # Get the quiz leaderboard
  get-overall-leaderboard.php # Get the overall leaderboard for quizzes
  get-teacher-quizzes.php   # Get quizzes created by a teacher
  get-user-history.php      # Get a user's quiz history
  publish.php               # Publish a quiz
  save-draft.php            # Save a quiz as a draft
  submit-quiz.php           # Submit a quiz attempt
  update.php                # Update quiz details
  upload-question-image.php # Upload an image for a quiz question
```

---

## File Explanations

- **create.php**  
  Creates a new quiz, allowing teachers to define questions, answers, and settings.

- **delete.php**  
  Deletes a quiz from the system.

- **get-all.php**  
  Retrieves all quizzes available in the system.

- **get-by-difficulty.php**  
  Gets quizzes filtered by difficulty level (easy, medium, hard, etc.).

- **get-by-id.php**  
  Gets detailed information about a specific quiz by its ID.

- **get-latest-result.php**  
  Gets the most recent quiz result for a user.

- **get-leaderboard.php**  
  Gets the leaderboard for a specific quiz, showing top performers.

- **get-overall-leaderboard.php**  
  Gets the overall leaderboard across all quizzes.

- **get-teacher-quizzes.php**  
  Gets all quizzes created by a specific teacher.

- **get-user-history.php**  
  Gets a user's quiz participation and results history.

- **publish.php**  
  Publishes a quiz, making it available for students to take.

- **save-draft.php**  
  Saves a quiz as a draft for later editing or publishing.

- **submit-quiz.php**  
  Submits a user's answers for a quiz attempt.

- **update.php**  
  Updates quiz details, such as questions, answers, or settings.

- **upload-question-image.php**  
  Uploads an image to be used in a quiz question.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data or handling file uploads.
- The frontend calls these endpoints to create, manage, take, and analyze quizzes.
- Access may be restricted based on user roles (teacher, student, admin).

---

## Example Usage

- Teachers create and publish quizzes, and view leaderboards and results.
- Students take quizzes, view their history, and see their rankings.

---

## Best Practices

- Ensure only authorized users can create, update, or delete quizzes.
- Validate all quiz data and user submissions to prevent errors and cheating.
- Regularly review quiz content and results for quality and fairness.

---

## Troubleshooting

- If quiz data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect quiz integrity.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
