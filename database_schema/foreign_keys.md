# Foreign Key Relationships

This document provides a comprehensive reference for all foreign key relationships across the database schema.

## User & Authentication Related

### users (Enhanced Profile System)
**Note**: No outgoing foreign keys, but serves as parent for many relationships
- `email` - UNIQUE constraint ensures one account per email
- `google_id` - UNIQUE constraint for OAuth integration (when not null)
- `fide_id` - UNIQUE constraint for chess player identification (when not null)

### user_documents
- `user_id` references `users(id)` ON DELETE CASCADE
- `verified_by` references `users(id)` ON DELETE SET NULL

### fide_ratings_history
- `user_id` references `users(id)` ON DELETE CASCADE

### auth_tokens
- `user_id` references `users(id)` ON DELETE CASCADE

### password_resets
- `user_id` references `users(id)` ON DELETE CASCADE

### email_verifications
- `user_id` references `users(id)` ON DELETE CASCADE

### user_permissions
- `user_id` references `users(id)` ON DELETE CASCADE
- `permission_id` references `permissions(id)` ON DELETE CASCADE
- `granted_by` references `users(id)`

### role_permissions
- `permission_id` references `permissions(id)` ON DELETE CASCADE

### activity_logs
- `user_id` references `users(id)` ON DELETE CASCADE

## Classroom & Batch Related

### classrooms
- `teacher_id` references `users(id)` ON DELETE CASCADE

### classroom_students
- `classroom_id` references `classrooms(id)` ON DELETE CASCADE
- `student_id` references `users(id)` ON DELETE CASCADE

### classroom_discussions
- `classroom_id` references `classrooms(id)` ON DELETE CASCADE
- `user_id` references `users(id)` ON DELETE CASCADE
- `parent_id` references `classroom_discussions(id)` ON DELETE CASCADE

### classroom_assignments
- `classroom_id` references `classrooms(id)` ON DELETE CASCADE
- `created_by` references `users(id)` ON DELETE CASCADE

### assignment_submissions
- `assignment_id` references `classroom_assignments(id)` ON DELETE CASCADE
- `student_id` references `users(id)` ON DELETE CASCADE
- `graded_by` references `users(id)` ON DELETE SET NULL

### batches
- `teacher_id` references `users(id)` ON DELETE CASCADE

### batch_sessions
- `batch_id` references `batches(id)` ON DELETE CASCADE

### batch_students
- `batch_id` references `batches(id)` ON DELETE CASCADE
- `student_id` references `users(id)` ON DELETE CASCADE

### attendance
- `student_id` references `users(id)`
- `batch_id` references `batches(id)`
- `session_id` references `batch_sessions(id)`
- `marked_by` references `users(id)`

### online_meeting_sync_logs
- `session_id` references `batch_sessions(id)`

## Quiz & Assessment Related

### quizzes
- `created_by` references `users(id)` ON DELETE CASCADE

### quiz_questions
- `quiz_id` references `quizzes(id)` ON DELETE CASCADE

### quiz_answers
- `question_id` references `quiz_questions(id)` ON DELETE CASCADE

### quiz_attempts
- `user_id` references `users(id)` ON DELETE CASCADE
- `quiz_id` references `quizzes(id)` ON DELETE CASCADE

### student_feedback
- `student_id` references `users(id)` ON DELETE CASCADE
- `teacher_id` references `users(id)` ON DELETE CASCADE

## Chess Platform Related

### chess_studies
- `owner_id` references `users(id)` ON DELETE CASCADE

### chess_study_shares
- `study_id` references `chess_studies(id)` ON DELETE CASCADE
- `user_id` references `users(id)` ON DELETE CASCADE

### chess_games
- `white_player_id` references `users(id)`
- `black_player_id` references `users(id)`

### chess_game_moves
- `game_id` references `chess_games(id)` ON DELETE CASCADE
- `made_by_id` references `users(id)`

### chess_challenges
- `challenger_id` references `users(id)` ON DELETE CASCADE
- `recipient_id` references `users(id)` ON DELETE CASCADE

### chess_practice_positions
- `created_by` references `users(id)` ON DELETE CASCADE

### chess_player_stats
- `user_id` references `users(id)` ON DELETE CASCADE

## PGN Content Related

### pgn_files
- `teacher_id` references `users(id)` ON DELETE CASCADE

### pgn_shares
- `pgn_id` references `pgn_files(id)` ON DELETE CASCADE
- `user_id` references `users(id)` ON DELETE CASCADE

### pgn_views
- `pgn_id` references `pgn_files(id)` ON DELETE CASCADE
- `user_id` references `users(id)` ON DELETE SET NULL

### pgn_annotations
- `pgn_id` references `pgn_files(id)` ON DELETE CASCADE
- `author_id` references `users(id)` ON DELETE SET NULL

### user_pgn_preferences
- `user_id` references `users(id)` ON DELETE CASCADE

## Resources & Materials Related

### resources
- `created_by` references `users(id)` ON DELETE CASCADE

### classroom_resources
- `classroom_id` references `classrooms(id)` ON DELETE CASCADE
- `resource_id` references `resources(id)` ON DELETE CASCADE
- `shared_by` references `users(id)`

### batch_resources
- `batch_id` references `batches(id)` ON DELETE CASCADE
- `resource_id` references `resources(id)` ON DELETE CASCADE
- `shared_by` references `users(id)`

### student_resource_shares
- `student_id` references `users(id)` ON DELETE CASCADE
- `resource_id` references `resources(id)` ON DELETE CASCADE
- `shared_by` references `users(id)`

### resource_access
- `resource_id` references `resources(id)` ON DELETE CASCADE
- `user_id` references `users(id)` ON DELETE CASCADE

### resource_bookmarks
- `user_id` references `users(id)` ON DELETE CASCADE
- `resource_id` references `resources(id)` ON DELETE CASCADE

## System Administration Related

### notifications
- `user_id` references `users(id)` ON DELETE CASCADE

### support_tickets
- `user_id` references `users(id)` ON DELETE CASCADE
- `assigned_to` references `users(id)` ON DELETE SET NULL

### ticket_responses
- `ticket_id` references `support_tickets(id)` ON DELETE CASCADE
- `user_id` references `users(id)` ON DELETE CASCADE

### faqs
- `created_by` references `users(id)` ON DELETE CASCADE

## Cascade Behavior Summary

### ON DELETE CASCADE
These relationships will automatically delete dependent records when the parent is deleted:
- All user-owned content (studies, resources, pgn files, etc.)
- All classroom/batch memberships and associated content
- All permissions and activity logs
- All sharing relationships

### ON DELETE SET NULL
These relationships will set the foreign key to NULL when the parent is deleted:
- Grading relationships (preserves submission record even if grader is deleted)
- Optional attribution (preserves content even if author is deleted)
- Anonymous view tracking

### ON DELETE RESTRICT (Implicit)
Some relationships may require special handling before deletion:
- Active game players
- Critical system references that need data migration
