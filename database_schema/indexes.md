# Database Indexes

This document provides a comprehensive reference for all database indexes across the schema for performance optimization.

## Performance Indexes

### users (Enhanced Profile System)
- `idx_users_fide_id` on fide_id - For FIDE player lookups and uniqueness
- `idx_users_fide_rating` on fide_rating - For rating-based queries and leaderboards
- `idx_users_national_rating` on national_rating - For national rating comparisons
- `idx_users_date_of_birth` on date_of_birth - For age-based filtering and statistics
- `UNIQUE KEY email (email)` - Enforce unique email addresses
- `UNIQUE KEY google_id (google_id)` - For OAuth integration (when not null)

### user_documents
- `idx_user_documents_user_id` on user_id - For efficient user document retrieval
- `idx_user_documents_type` on document_type - For document type filtering
- `idx_user_documents_verification` on (is_verified, document_type) - For admin verification workflows

### fide_ratings_history
- `idx_fide_ratings_user_id` on user_id - For user rating history queries
- `idx_fide_ratings_fide_id` on fide_id - For FIDE player rating tracking
- `idx_fide_ratings_date` on recorded_date - For chronological rating analysis
- `idx_fide_ratings_composite` on (user_id, rating_type, recorded_date) - For efficient rating progression queries

### attendance
- `idx_student_date` (student_id, created_at) - For student attendance history queries
- `idx_batch_date` (batch_id, created_at) - For batch attendance reports
- `idx_session_status` (session_id, status) - For session attendance summaries

### pgn_files
- `idx_category` on category - For category-based filtering
- `idx_is_public` on is_public - For public/private content separation
- `idx_teacher_id` on teacher_id - For teacher's content queries
- `idx_created_at` on created_at - For chronological ordering
- `idx_pgn_files_title` on title - For title-based searches
- `ft_pgn_search` FULLTEXT on (title, description) - For full-text search functionality

### pgn_shares
- `idx_pgn_user` on (pgn_id, user_id) - For user access checking
- `idx_permission` on permission - For permission-based queries
- `idx_shared_at` on shared_at - For chronological sharing history

### pgn_views
- `idx_pgn_id` on pgn_id - For PGN view statistics
- `idx_user_id` on user_id - For user view history
- `idx_viewed_at` on viewed_at - For chronological view tracking
- `unique_user_pgn` UNIQUE on (pgn_id, user_id) - Prevent duplicate views per user per PGN

### pgn_categories
- `unique_category_name` UNIQUE on name - Enforce unique category names
- `idx_is_active` on is_active - For active category filtering
- `idx_sort_order` on sort_order - For ordered category display

### pgn_annotations
- `idx_pgn_move` on (pgn_id, move_number) - For efficient move-based annotation queries
- `idx_position` on position_fen - For position-based annotation searches
- `idx_author` on author_id - For author's annotation history
- `idx_type` on annotation_type - For annotation type filtering

## Quiz & Assessment Indexes

### quiz_questions
- `PRIMARY KEY (id)` - Primary key constraint
- `KEY quiz_id (quiz_id)` - Foreign key to quizzes table for efficient quiz question retrieval
- `KEY idx_quiz_order (quiz_id, order_index)` - For efficient ordering of questions within a quiz (drag & drop support)

## Primary Key Constraints

All tables with auto-increment IDs have primary key constraints:
- `users(id)`
- `classrooms(id)`
- `batches(id)`
- `batch_sessions(id)`
- `quizzes(id)`
- `quiz_questions(id)`
- `quiz_answers(id)`
- `quiz_attempts(id)`
- `pgn_files(id)`
- `pgn_views(id)`
- `pgn_categories(id)`
- `pgn_annotations(id)`
- `resources(id)`
- `notifications(id)`
- `attendance(id)`
- `attendance_settings(id)`
- `online_meeting_sync_logs(id)`
- `support_tickets(id)`
- `ticket_responses(id)`
- `faqs(id)`
- `permissions(id)`
- `activity_logs(id)`
- `chess_studies(id)`
- `chess_games(id)`
- `chess_game_moves(id)`
- `chess_challenges(id)`
- `chess_practice_positions(id)`
- `classroom_assignments(id)`
- `assignment_submissions(id)`
- `classroom_discussions(id)`
- `student_feedback(id)`

## Composite Primary Keys

Junction tables use composite primary keys:
- `classroom_students(classroom_id, student_id)`
- `batch_students(batch_id, student_id)`
- `pgn_shares(pgn_id, user_id)`
- `chess_study_shares(study_id, user_id)`
- `user_permissions(user_id, permission_id)`
- `role_permissions(role, permission_id)`
- `classroom_resources(classroom_id, resource_id)`
- `batch_resources(batch_id, resource_id)`
- `student_resource_shares(student_id, resource_id)`
- `resource_access(resource_id, user_id)`
- `resource_bookmarks(user_id, resource_id)`

## Unique Constraints

### permissions
- `UNIQUE KEY name (name)` - Ensure unique permission names

### pgn_categories
- `UNIQUE KEY unique_category_name (name)` - Ensure unique category names

### pgn_views
- `UNIQUE KEY unique_user_pgn (pgn_id, user_id)` - Prevent duplicate view records per user per PGN

## Full-Text Search Indexes

### pgn_files
- `FULLTEXT KEY ft_pgn_search (title, description)` - Enable full-text search on PGN titles and descriptions

## Performance Optimization Notes

1. **Composite Indexes**: Multi-column indexes are ordered by selectivity (most selective first)
2. **Foreign Key Indexes**: All foreign key columns have indexes for efficient JOIN operations
3. **Timestamp Indexes**: Created_at and updated_at columns are indexed for chronological queries
4. **Status Indexes**: Enum status fields are indexed for filtering active/inactive records
5. **Full-Text Search**: FULLTEXT indexes enable efficient text search functionality

## Query Optimization Guidelines

1. Use covering indexes when possible (include all columns needed in the query)
2. Monitor slow query log to identify missing indexes
3. Consider partitioning for very large tables (attendance, activity_logs)
4. Use EXPLAIN to analyze query execution plans
5. Regularly analyze table statistics for optimal query planning
