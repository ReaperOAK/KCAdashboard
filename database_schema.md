### class_ratings
| Column     | Type        | Null | Key | Default           | Extra           |
|------------|-------------|------|-----|-------------------|-----------------|
| id         | int(11)     | NO   | PRI | NULL              | auto_increment  |
| class_id   | int(11)     | NO   | MUL | NULL              |                 |
| student_id | int(11)     | NO   | MUL | NULL              |                 |
| rating     | int(11)     | NO   |     | NULL              |                 |
| comment    | text        | YES  |     | NULL              |                 |
| created_at | datetime    | YES  |     | CURRENT_TIMESTAMP |                 |

**Indexes & Constraints:**
- `UNIQUE KEY unique_rating (class_id, student_id)` ensures a student can rate a class only once (can update).
- `class_id` references `batch_sessions(id)` or `classrooms(id)` depending on implementation.
- `student_id` references `users(id)`.

**Purpose:**
- Stores student ratings and optional comments for classes (online/offline), submitted after class ends.


# Kolkata Chess Academy Database Schema

## Leave Management
### leave_requests
| Column         | Type                                    | Null | Key | Default           | Extra           |
|---------------|-----------------------------------------|------|-----|-------------------|-----------------|
| id            | int(11)                                 | NO   | PRI | NULL              | auto_increment  |
| teacher_id    | int(11)                                 | NO   | MUL | NULL              |                 |
| start_datetime| datetime                                | NO   |     | NULL              |                 |
| end_datetime  | datetime                                | NO   |     | NULL              |                 |
| reason        | text                                    | YES  |     | NULL              |                 |
| status        | enum('pending','approved','rejected')   | NO   |     | 'pending'         |                 |
| admin_comment | text                                    | YES  |     | NULL              |                 |
| created_at    | timestamp                               | YES  |     | CURRENT_TIMESTAMP |                 |
| updated_at    | timestamp                               | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

**Foreign Keys:**
- `teacher_id` references `users(id)` ON DELETE CASCADE

**Purpose:**
- Stores leave requests submitted by teachers, with status and admin comments for approval/rejection.

**Indexes:**
- `teacher_id` for fast lookup by teacher


### report_cards
| Column       | Type          | Null | Key | Default           | Extra           |
|--------------|---------------|------|-----|-------------------|-----------------|
| id           | int(11)       | NO   | PRI | NULL              | auto_increment  |
| student_id   | int(11)       | NO   | MUL | NULL              |                 |
| file_name    | varchar(255)  | NO   |     | NULL              |                 |
| uploaded_by  | int(11)       | NO   | MUL | NULL              |                 |
| uploaded_at  | timestamp     | YES  |     | CURRENT_TIMESTAMP |                 |
| description  | varchar(255)  | YES  |     | NULL              |                 |

**Foreign Keys:**
- `student_id` references `users(id)` ON DELETE CASCADE
- `uploaded_by` references `users(id)` ON DELETE SET NULL

**Purpose:**
- Stores report card uploads for students. Allows multiple report cards per student, with upload history and metadata.

## Authentication & Users
### users
| Column          | Type          | Null | Key | Default | Extra                |
|----------------|---------------|------|-----|---------|----------------------|
| id             | int(11)       | NO   | PRI | NULL    | auto_increment      |
| email          | varchar(255)  | NO   | UNI | NULL    |                     |
| password       | varchar(255)  | NO   |     | NULL    |                     |
| role           | enum('student','teacher','admin') | NO | | NULL |          |
| full_name      | varchar(255)  | NO   |     | NULL    |                     |
| created_at     | timestamp     | YES  |     | NULL    |                     |
| updated_at     | timestamp     | YES  |     | NULL    | on update CURRENT_TIMESTAMP |
| is_active      | tinyint(1)    | YES  |     | NULL    |                     |
| google_id      | varchar(255)  | YES  | UNI | NULL    |                     |
| profile_picture| varchar(255)  | YES  |     | NULL    |                     |
| status         | enum('active','inactive','suspended') | YES | | 'active' |  |

### auth_tokens
| Column     | Type         | Null | Key | Default | Extra           |
|------------|-------------|------|-----|---------|-----------------|
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)     | NO   | MUL | NULL    |                |
| token      | varchar(255)| NO   |     | NULL    |                |
| expires_at | timestamp   | NO   |     | NULL    |                |
| created_at | timestamp   | YES  |     | NULL    |                |

### password_resets
| Column     | Type         | Null | Key | Default | Extra           |
|------------|-------------|------|-----|---------|-----------------|
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)     | NO   | MUL | NULL    |                |
| token      | varchar(255)| NO   | IDX | NULL    |                |
| expires_at | timestamp   | NO   | IDX | NULL    |                |
| created_at | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |
| used_at    | timestamp   | YES  |     | NULL    |                |

### email_verifications
| Column     | Type         | Null | Key | Default | Extra           |
|------------|-------------|------|-----|---------|-----------------|
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)     | NO   | MUL | NULL    |                |
| token      | varchar(255)| NO   | UNI | NULL    |                |
| expires_at | timestamp   | NO   |     | NULL    |                |
| used_at    | timestamp   | YES  |     | NULL    |                |
| created_at | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |

- `user_id` references `users(id)` ON DELETE CASCADE
- `token` is unique and used for email verification links

## Educational Content
### classrooms
| Column      | Type                            | Null | Key | Default | Extra           |
|-------------|--------------------------------|------|-----|---------|-----------------|
| id          | int(11)                        | NO   | PRI | NULL    | auto_increment |
| name        | varchar(255)                   | NO   |     | NULL    |                |
| description | text                           | YES  |     | NULL    |                |
| teacher_id  | int(11)                        | NO   | MUL | NULL    |                |
| schedule    | text                           | YES  |     | NULL    |                |
| status      | enum('active','archived','upcoming') | YES | | NULL  |                |
| created_at  | timestamp                      | YES  |     | NULL    |                |

### classroom_students
| Column      | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|--------|
| classroom_id| int(11)   | NO   | PRI | NULL    |        |
| student_id  | int(11)   | NO   | PRI | NULL    |        |
| joined_at   | timestamp | YES  |     | NULL    |        |

### classroom_discussions
| Column       | Type      | Null | Key | Default           | Extra           |
|-------------|-----------|------|-----|-------------------|-----------------|
| id          | int(11)   | NO   | PRI | NULL              | auto_increment |
| classroom_id| int(11)   | NO   | MUL | NULL              |                |
| user_id     | int(11)   | NO   | MUL | NULL              |                |
| message     | text      | NO   |     | NULL              |                |
| parent_id   | int(11)   | YES  | MUL | NULL              |                |
| created_at  | timestamp | NO   |     | CURRENT_TIMESTAMP |                |
| updated_at  | timestamp | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### classroom_assignments
| Column          | Type                           | Null | Key | Default           | Extra           |
|----------------|--------------------------------|------|-----|-------------------|-----------------|
| id             | int(11)                        | NO   | PRI | NULL              | auto_increment |
| classroom_id   | int(11)                        | NO   | MUL | NULL              |                |
| title          | varchar(255)                   | NO   |     | NULL              |                |
| description    | text                           | YES  |     | NULL              |                |
| instructions   | text                           | YES  |     | NULL              |                |
| due_date       | datetime                       | NO   |     | NULL              |                |
| points         | int                            | YES  |     | 100               |                |
| assignment_type| enum('text','file','both')     | YES  |     | 'both'            |                |
| created_by     | int(11)                        | NO   | MUL | NULL              |                |
| created_at     | timestamp                      | YES  |     | CURRENT_TIMESTAMP |                |
| updated_at     | timestamp                      | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### assignment_submissions
| Column          | Type                                   | Null | Key | Default           | Extra           |
|----------------|----------------------------------------|------|-----|-------------------|-----------------|
| id             | int(11)                                | NO   | PRI | NULL              | auto_increment |
| assignment_id  | int(11)                                | NO   | MUL | NULL              |                |
| student_id     | int(11)                                | NO   | MUL | NULL              |                |
| submission_text| text                                   | YES  |     | NULL              |                |
| submission_file| varchar(512)                           | YES  |     | NULL              |                |
| submission_date| timestamp                              | YES  |     | CURRENT_TIMESTAMP |                |
| grade          | decimal(5,2)                           | YES  |     | NULL              |                |
| feedback       | text                                   | YES  |     | NULL              |                |
| graded_by      | int(11)                                | YES  | MUL | NULL              |                |
| graded_at      | timestamp                              | YES  |     | NULL              |                |
| status         | enum('submitted','graded','returned')  | YES  |     | 'submitted'       |                |

### batches
| Column       | Type                                   | Null | Key | Default | Extra           |
|--------------|----------------------------------------|------|-----|---------|-----------------|
| id           | int(11)                                | NO   | PRI | NULL    | auto_increment |
| name         | varchar(255)                           | NO   |     | NULL    |                |
| description  | text                                   | YES  |     | NULL    |                |
| level        | enum('beginner','intermediate','advanced')| NO |   | NULL    |                |
| schedule     | text                                   | NO   |     | NULL    |                |
| max_students | int(11)                               | NO   |     | NULL    |                |
| teacher_id   | int(11)                               | NO   | MUL | NULL    |                |
| status       | enum('active','inactive','completed')  | YES  |    | NULL    |                |
| created_at   | timestamp                             | YES  |     | NULL    |                |

### batch_sessions
| Column         | Type                    | Null | Key | Default   | Extra           |
|---------------|-------------------------|------|-----|-----------|-----------------|
| id            | int(11)                | NO   | PRI | NULL      | auto_increment |
| batch_id      | int(11)                | NO   | MUL | NULL      |                |
| title         | varchar(255)           | NO   |     | NULL      |                |
| date_time     | datetime               | NO   |     | NULL      |                |
| duration      | int(11)                | NO   |     | NULL      |                |
| type          | enum('online','offline')| YES  |     | 'offline' |                |
| meeting_link  | varchar(512)           | YES  |     | NULL      |                |
| reminder_sent | boolean                | YES  |     | 0         |                |
| attendance_taken| boolean              | YES  |     | 0         |                |
| online_meeting_id| varchar(255)        | YES  |     | NULL      |                |
| created_at    | timestamp              | YES  |     | NULL      |                |

### batch_students
| Column     | Type                                      | Null | Key | Default            | Extra |
|------------|-------------------------------------------|------|-----|-------------------|--------|
| batch_id   | int(11)                                   | NO   | PRI | NULL              |        |
| student_id | int(11)                                   | NO   | PRI | NULL              |        |
| joined_at  | timestamp                                 | YES  |     | CURRENT_TIMESTAMP |        |
| status     | enum('active','inactive','completed')     | YES  |     | 'active'          |        |

## Assessment & Feedback
### quizzes
| Column      | Type                                   | Null | Key | Default | Extra           |
|------------|----------------------------------------|------|-----|---------|-----------------|
| id         | int(11)                                | NO   | PRI | NULL    | auto_increment |
| title      | varchar(255)                           | NO   |     | NULL    |                |
| description| text                                   | YES  |     | NULL    |                |
| difficulty | enum('beginner','intermediate','advanced')| NO |   | NULL    |                |
| time_limit | int(11)                               | YES  |     | NULL    |                |
| status     | enum('draft','published')              | NO   |     | 'draft' |                |
| created_by | int(11)                               | NO   | MUL | NULL    |                |
| created_at | timestamp                             | YES  |     | NULL    |                |

### quiz_questions
| Column      | Type                              | Null | Key | Default | Extra           |
|------------|-----------------------------------|------|-----|---------|-----------------|
| id         | int(11)                           | NO   | PRI | NULL    | auto_increment |
| quiz_id    | int(11)                           | NO   | MUL | NULL    |                |
| question   | text                              | NO   |     | NULL    |                |
| image_url  | varchar(512)                      | YES  |     | NULL    |                |
| type       | enum('multiple_choice','puzzle','chess')  | NO   |  | NULL    |                |
| order_index| int(11)                           | YES  | IDX | 0       |                |
| points     | int(11)                           | YES  |     | 1       |                |
| chess_position | varchar(100)                      | YES  |     | NULL    | FEN notation   |
| chess_orientation | enum('white','black')           | YES  |     | white   | Board orientation |
| correct_moves  | text                              | YES  |     | NULL    | JSON array     |
| pgn_data   | text                              | YES  |     | NULL    | PGN for multi-move sequences |
| expected_player_color | enum('white','black')          | YES  |     | 'white' | Player color in PGN mode |

**Indexes:**
- `PRIMARY KEY (id)`
- `KEY quiz_id (quiz_id)` - Foreign key to quizzes table
- `KEY idx_quiz_order (quiz_id, order_index)` - For efficient ordering of questions within a quiz

**Drag & Drop Support:**
- **order_index**: Integer field that determines the display order of questions within a quiz. Questions are ordered by `order_index ASC, id ASC`.
- Teachers can drag and drop questions to reorder them, with changes persisted via the `/api/quiz/reorder-questions.php` endpoint.
- Default value is 0, but gets set to sequential values (1, 2, 3...) when questions are created or reordered.

### Chess Question Features
- **chess_position**: Stores the chess position in FEN (Forsyth-Edwards Notation) format. Default is 'start' for starting position.
- **chess_orientation**: Determines which side of the board is shown at the bottom ('white' or 'black').
- **correct_moves**: JSON array storing the correct moves for the position. Each move contains 'from', 'to', and optional 'description' fields.
- **pgn_data**: PGN string for multi-move sequences where the computer makes automatic moves based on the game line.
- **expected_player_color**: Determines which color the student should play in PGN mode ('white' or 'black').

### Chess Question Modes
1. **Single Position Mode (FEN)**: Set a position where student needs to find the best move
2. **Multi-Move Mode (PGN)**: Present a game line where student plays their color and computer responds automatically
3. **Tactical Puzzle**: Combination of position setup with specific move sequences
4. **Opening Theory**: Show an opening position with expected continuation

### Usage Examples
1. **Tactical puzzle**: Set a position where student needs to find the best move
2. **Endgame study**: Present an endgame position with multiple correct continuations  
3. **Opening theory**: Show an opening position and ask for the correct next move
4. **Multi-move sequence**: Provide a PGN where student plays White moves and computer makes Black moves automatically

### quiz_answers
| Column      | Type      | Null | Key | Default | Extra           |
|------------|-----------|------|-----|---------|-----------------|
| id         | int(11)   | NO   | PRI | NULL    | auto_increment |
| question_id| int(11)   | NO   | MUL | NULL    |                |
| answer_text| text      | NO   |     | NULL    |                |
| is_correct | tinyint(1)| NO   |     | NULL    |                |

### quiz_attempts
| Column      | Type      | Null | Key | Default | Extra           |
|------------|-----------|------|-----|---------|-----------------|
| id         | int(11)   | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)   | NO   | MUL | NULL    |                |
| quiz_id    | int(11)   | NO   | MUL | NULL    |                |
| score      | int(11)   | NO   |     | NULL    |                |
| time_taken | int(11)   | YES  |     | NULL    |                |
| completed_at| timestamp | YES  |     | NULL    |                |

### student_feedback
| Column             | Type      | Null | Key | Default | Extra           |
|-------------------|-----------|------|-----|---------|-----------------|
| id                | int(11)   | NO   | PRI | NULL    | auto_increment |
| student_id        | int(11)   | NO   | MUL | NULL    |                |
| teacher_id        | int(11)   | NO   | MUL | NULL    |                |
| rating           | int(11)   | NO   |     | NULL    |                |
| comment          | text      | YES  |     | NULL    |                |
| areas_of_improvement| text    | YES  |     | NULL    |                |
| strengths        | text      | YES  |     | NULL    |                |
| created_at       | timestamp | YES  |     | NULL    |                |

## Chess Content
### pgn_files
| Column      | Type                                        | Null | Key | Default | Extra           |
|------------|---------------------------------------------|------|-----|---------|-----------------|
| id         | int(11)                                     | NO   | PRI | NULL    | auto_increment |
| title      | varchar(255)                                | NO   | IDX | NULL    |                |
| description| text                                        | YES  |     | NULL    |                |
| category   | enum('opening','middlegame','endgame','tactics','strategy')| NO | IDX | NULL    |                |
| pgn_content| text                                        | NO   |     | NULL    |                |
| file_path  | varchar(512)                                | YES  |     | NULL    |                |
| is_public  | tinyint(1)                                 | YES  | IDX | FALSE   |                |
| teacher_id | int(11)                                    | NO   | MUL | NULL    |                |
| created_at | timestamp                                  | YES  | IDX | NULL    |                |
| view_count | int(11)                                    | YES  |     | 0       | Auto-updated by trigger |
| metadata   | text                                       | YES  |     | NULL    | JSON metadata  |

**Indexes**:
- `idx_category` on category
- `idx_is_public` on is_public  
- `idx_teacher_id` on teacher_id
- `idx_created_at` on created_at
- `idx_pgn_files_title` on title
- `ft_pgn_search` FULLTEXT on (title, description)

### pgn_shares
| Column     | Type                    | Null | Key | Default | Extra |
|-----------|-------------------------|------|-----|---------|-------|
| pgn_id    | int(11)                | NO   | PRI | NULL    |       |
| user_id   | int(11)                | NO   | PRI | NULL    |       |
| permission| enum('view','edit')    | YES  | IDX | 'view'  |       |
| shared_at | timestamp              | YES  | IDX | CURRENT_TIMESTAMP |  |

**Indexes**:
- `idx_pgn_user` on (pgn_id, user_id)
- `idx_permission` on permission
- `idx_shared_at` on shared_at

### pgn_views
| Column     | Type        | Null | Key | Default | Extra           |
|-----------|-------------|------|-----|---------|-----------------|
| id        | int(11)     | NO   | PRI | NULL    | auto_increment |
| pgn_id    | int(11)     | NO   | MUL | NULL    |                |
| user_id   | int(11)     | YES  | MUL | NULL    |                |
| viewed_at | timestamp   | YES  | IDX | CURRENT_TIMESTAMP |      |
| ip_address| varchar(45) | YES  |     | NULL    |                |
| user_agent| text        | YES  |     | NULL    |                |

**Purpose**: Track analytics and view statistics for PGN files
**Constraints**: UNIQUE KEY on (pgn_id, user_id) to prevent duplicate views per user per game

### pgn_categories
| Column      | Type         | Null | Key | Default   | Extra           |
|-------------|--------------|------|-----|-----------|-----------------|
| id          | int(11)      | NO   | PRI | NULL      | auto_increment |
| name        | varchar(100) | NO   | UNI | NULL      |                |
| description | text         | YES  |     | NULL      |                |
| color       | varchar(7)   | YES  |     | '#3B82F6' |                |
| icon        | varchar(50)  | YES  |     | NULL      |                |
| sort_order  | int(11)      | YES  | IDX | 0         |                |
| is_active   | tinyint(1)   | YES  | IDX | 1         |                |
| created_at  | timestamp    | YES  |     | CURRENT_TIMESTAMP |        |

**Purpose**: Enhanced categorization system for PGN files with visual indicators
**Default Categories**: opening, middlegame, endgame, tactics, strategy

### pgn_annotations
| Column          | Type                                         | Null | Key | Default | Extra           |
|-----------------|----------------------------------------------|------|-----|---------|-----------------|
| id              | int(11)                                      | NO   | PRI | NULL    | auto_increment |
| pgn_id          | int(11)                                      | NO   | MUL | NULL    |                |
| move_number     | int(11)                                      | NO   | IDX | NULL    |                |
| position_fen    | varchar(100)                                 | NO   | IDX | NULL    |                |
| annotation_type | enum('comment','variation','nag','arrow','highlight') | NO | IDX | NULL    |                |
| content         | text                                         | NO   |     | NULL    |                |
| author_id       | int(11)                                      | YES  | MUL | NULL    |                |
| is_public       | tinyint(1)                                   | YES  |     | 0       |                |
| created_at      | timestamp                                    | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at      | timestamp                                    | YES  |     | CURRENT_TIMESTAMP |      |

**Purpose**: Store user annotations, comments, and analysis on specific moves
**Indexes**: Composite index on (pgn_id, move_number) for efficient move-based queries

### user_pgn_preferences
| Column               | Type         | Null | Key | Default | Extra           |
|---------------------|-------------|------|-----|---------|-----------------|
| user_id             | int(11)     | NO   | PRI | NULL    |                |
| board_theme         | varchar(50) | YES  |     | 'blue'  |                |
| piece_set           | varchar(50) | YES  |     | 'cburnett' |             |
| board_orientation   | varchar(10) | YES  |     | 'white' |                |
| auto_play_speed     | int(11)     | YES  |     | 1000    |                |
| show_coordinates    | tinyint(1)  | YES  |     | 1       |                |
| show_move_list      | tinyint(1)  | YES  |     | 1       |                |
| show_engine_analysis| tinyint(1)  | YES  |     | 0       |                |
| preferred_notation  | varchar(20) | YES  |     | 'san'   |                |
| sound_enabled       | tinyint(1)  | YES  |     | 1       |                |
| created_at          | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at          | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |

**Purpose**: Store individual user preferences for PGN viewer interface

### pgn_statistics (VIEW)
**Purpose**: Aggregated statistics view for PGN files including:
- Unique viewers count
- Total views
- Last viewed timestamp  
- Share count
- Content size
- Game count from metadata
- Valid games count

**Columns**: id, title, category, teacher_id, is_public, created_at, unique_viewers, total_views, last_viewed, shared_with_count, content_size, game_count, valid_games

## Resources & Materials

### Resource Access Control System
The resource system implements a comprehensive access control mechanism:

- **Public Resources**: Resources marked with `is_public = TRUE` are accessible to all users
- **Classroom Sharing**: Resources can be shared with specific classrooms via `classroom_resources`
- **Batch Sharing**: Resources can be shared with specific batches via `batch_resources`  
- **Individual Sharing**: Resources can be shared directly with students via `student_resource_shares`

**Access Logic for Students**: A student can access a resource if ANY of the following is true:
1. The resource is public (`is_public = TRUE`)
2. The resource is directly shared with them
3. The resource is shared with a classroom they belong to
4. The resource is shared with a batch they belong to

**Access Logic for Teachers/Admins**: Can see all resources and share them with their own classrooms/batches.

### resources
| Column        | Type                           | Null | Key | Default | Extra           |
|---------------|--------------------------------|------|-----|---------|-----------------|
| id            | int(11)                        | NO   | PRI | NULL    | auto_increment |
| title         | varchar(255)                   | NO   |     | NULL    |                |
| description   | text                           | YES  |     | NULL    |                |
| type          | enum('pgn','pdf','video','link')| NO  |    | NULL    |                |
| url           | varchar(512)                   | NO   |     | NULL    |                |
| category      | varchar(100)                   | NO   |     | NULL    |                |
| created_by    | int(11)                        | NO   | MUL | NULL    |                |
| created_at    | timestamp                      | YES  |     | NULL    |                |
| file_size     | int                            | YES  |     | NULL    |                |
| downloads     | int                            | YES  |     | 0       |                |
| thumbnail_url | varchar(512)                   | YES  |     | NULL    |                |
| is_featured   | boolean                        | YES  |     | FALSE   |                |
| tags          | text                           | YES  |     | NULL    |                |
| difficulty    | enum('beginner','intermediate','advanced') | YES | | 'beginner' |     |
| is_public     | boolean                        | YES  |     | FALSE   |                |

### classroom_resources
| Column       | Type      | Null | Key | Default | Extra |
|-------------|-----------|------|-----|---------|--------|
| classroom_id | int(11)   | NO   | PRI | NULL    |        |
| resource_id  | int(11)   | NO   | PRI | NULL    |        |
| shared_by    | int(11)   | NO   | MUL | NULL    |        |
| shared_at    | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### batch_resources
| Column      | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|--------|
| batch_id   | int(11)   | NO   | PRI | NULL    |        |
| resource_id| int(11)   | NO   | PRI | NULL    |        |
| shared_by  | int(11)   | NO   | MUL | NULL    |        |
| shared_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### student_resource_shares
| Column      | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|--------|
| student_id | int(11)   | NO   | PRI | NULL    |        |
| resource_id| int(11)   | NO   | PRI | NULL    |        |
| shared_by  | int(11)   | NO   | MUL | NULL    |        |
| shared_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### resource_access
| Column       | Type      | Null | Key | Default | Extra |
|-------------|-----------|------|-----|---------|--------|
| resource_id | int(11)   | NO   | PRI | NULL    |        |
| user_id     | int(11)   | NO   | PRI | NULL    |        |
| last_accessed| timestamp | YES  |     | NULL    |        |

### resource_bookmarks
| Column       | Type      | Null | Key | Default | Extra |
|-------------|-----------|------|-----|---------|--------|
| user_id     | int(11)   | NO   | PRI | NULL    |        |
| resource_id | int(11)   | NO   | PRI | NULL    |        |
| created_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

## Notifications
### notifications
| Column     | Type         | Null | Key | Default | Extra           |
|------------|-------------|------|-----|---------|-----------------|
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)     | NO   | MUL | NULL    |                |
| title      | varchar(255)| NO   |     | NULL    |                |
| message    | text        | NO   |     | NULL    |                |
| type       | varchar(50) | NO   |     | NULL    |                |
| is_read    | tinyint(1)  | YES  |     | NULL    |                |
| created_at | timestamp   | YES  |     | NULL    |                |

## Attendance System
### attendance
| Column          | Type                                        | Null | Key | Default | Extra           |
|-----------------|---------------------------------------------|------|-----|---------|-----------------|
| id              | int(11)                                     | NO   | PRI | NULL    | auto_increment |
| student_id      | int(11)                                     | NO   | MUL | NULL    |                |
| batch_id        | int(11)                                     | NO   | MUL | NULL    |                |
| session_id      | int(11)                                     | NO   | MUL | NULL    |                |
| status          | enum('present','absent','excused','late')   | NO   |     | NULL    |                |
| marked_by       | int(11)                                     | NO   | MUL | NULL    |                |
| check_in_time   | datetime                                    | YES  |     | NULL    |                |
| check_out_time  | datetime                                    | YES  |     | NULL    |                |
| online_duration | int                                         | YES  |     | NULL    |                |
| platform        | varchar(50)                                 | YES  |     | NULL    |                |
| sync_source     | varchar(50)                                 | YES  |     | NULL    |                |
| notes           | text                                        | YES  |     | NULL    |                |
| created_at      | timestamp                                   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at      | timestamp                                   | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### attendance_settings
| Column                        | Type      | Null | Key | Default | Extra           |
|------------------------------|-----------|------|-----|---------|-----------------|
| id                           | int(11)   | NO   | PRI | NULL    | auto_increment |
| min_attendance_percent       | int(11)   | YES  |     | 75      |                |
| late_threshold_minutes       | int(11)   | YES  |     | 15      |                |
| auto_mark_absent_after_minutes| int(11)   | YES  |     | 30      |                |
| reminder_before_minutes      | int(11)   | YES  |     | 60      |                |
| zoom_api_key                | varchar(255)| YES  |     | NULL    |                |
| zoom_api_secret             | varchar(255)| YES  |     | NULL    |                |
| google_meet_credentials     | text       | YES  |     | NULL    |                |
| created_at                  | timestamp  | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at                  | timestamp  | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### online_meeting_sync_logs
| Column       | Type                            | Null | Key | Default | Extra           |
|-------------|----------------------------------|------|-----|---------|-----------------|
| id          | int(11)                         | NO   | PRI | NULL    | auto_increment |
| session_id  | int(11)                         | NO   | MUL | NULL    |                |
| platform    | varchar(50)                     | NO   |     | NULL    |                |
| meeting_id  | varchar(255)                    | NO   |     | NULL    |                |
| sync_status | enum('success','failed')        | NO   |     | NULL    |                |
| error_message| text                           | YES  |     | NULL    |                |
| synced_at   | timestamp                       | YES  |     | CURRENT_TIMESTAMP |      |

## Support System
### support_tickets
| Column     | Type                                        | Null | Key | Default | Extra           |
|------------|---------------------------------------------|------|-----|---------|-----------------|
| id         | int(11)                                     | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)                                     | NO   | MUL | NULL    |                |
| title      | varchar(255)                                | NO   |     | NULL    |                |
| description| text                                        | NO   |     | NULL    |                |
| status     | enum('open','in_progress','resolved','closed')| NO |     | 'open'  |                |
| priority   | enum('low','medium','high','urgent')        | NO   |     | 'medium'|                |
| category   | varchar(100)                                | NO   |     | NULL    |                |
| assigned_to| int(11)                                     | YES  | MUL | NULL    |                |
| created_at | timestamp                                   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at | timestamp                                   | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### ticket_responses
| Column     | Type         | Null | Key | Default | Extra           |
|------------|-------------|------|-----|---------|-----------------|
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| ticket_id  | int(11)     | NO   | MUL | NULL    |                |
| user_id    | int(11)     | NO   | MUL | NULL    |                |
| message    | text        | NO   |     | NULL    |                |
| created_at | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |

### faqs
| Column       | Type         | Null | Key | Default | Extra           |
|-------------|-------------|------|-----|---------|-----------------|
| id          | int(11)     | NO   | PRI | NULL    | auto_increment |
| question    | text        | NO   |     | NULL    |                |
| answer      | text        | NO   |     | NULL    |                |
| category    | varchar(100)| NO   |     | NULL    |                |
| is_published| tinyint(1)  | YES  |     | TRUE    |                |
| created_by  | int(11)     | NO   | MUL | NULL    |                |
| created_at  | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at  | timestamp   | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

## Permissions & Activity Tracking

### permissions
| Column      | Type          | Null | Key | Default | Extra           |
|------------|---------------|------|-----|---------|-----------------|
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| name       | varchar(100)  | NO   | UNI | NULL    |                |
| description| text          | YES  |     | NULL    |                |
| created_at | timestamp     | YES  |     | CURRENT_TIMESTAMP |      |

### user_permissions
| Column      | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|--------|
| user_id    | int(11)   | NO   | PRI | NULL    |        |
| permission_id| int(11)  | NO   | PRI | NULL    |        |
| granted_by | int(11)   | NO   | MUL | NULL    |        |
| granted_at | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### role_permissions
| Column       | Type         | Null | Key | Default | Extra |
|-------------|--------------|------|-----|---------|--------|
| role        | varchar(50)  | NO   | PRI | NULL    |        |
| permission_id| int(11)     | NO   | PRI | NULL    |        |

### activity_logs
| Column      | Type          | Null | Key | Default | Extra           |
|------------|---------------|------|-----|---------|-----------------|
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)       | NO   | MUL | NULL    |                |
| action     | varchar(100)  | NO   |     | NULL    |                |
| description| text          | YES  |     | NULL    |                |
| ip_address | varchar(45)   | YES  |     | NULL    |                |
| user_agent | text          | YES  |     | NULL    |                |
| created_at | timestamp     | YES  |     | CURRENT_TIMESTAMP |      |

## Chess Platform

### chess_studies
| Column       | Type                                                     | Null | Key | Default | Extra           |
|--------------|----------------------------------------------------------|------|-----|---------|-----------------|
| id           | int(11)                                                  | NO   | PRI | NULL    | auto_increment  |
| title        | varchar(255)                                             | NO   |     | NULL    |                 |
| description  | text                                                     | YES  |     | NULL    |                 |
| position     | varchar(255)                                             | NO   |     | 'start' |                 |
| category     | enum('opening', 'middlegame', 'endgame', 'tactics', 'strategy') | NO | | NULL | |
| owner_id     | int(11)                                                  | NO   | MUL | NULL    |                 |
| is_public    | boolean                                                  | YES  |     | FALSE   |                 |
| preview_url  | varchar(255)                                             | YES  |     | NULL    |                 |
| created_at   | timestamp                                                | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at   | timestamp                                                | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### chess_study_shares
| Column     | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|-------|
| study_id   | int(11)   | NO   | PRI | NULL    |       |
| user_id    | int(11)   | NO   | PRI | NULL    |       |
| shared_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### chess_games
| Column          | Type                                   | Null | Key | Default  | Extra           |
|-----------------|----------------------------------------|------|-----|----------|-----------------|
| id              | int(11)                                | NO   | PRI | NULL     | auto_increment  |
| white_player_id | int(11)                                | NO   | MUL | NULL     |                 |
| black_player_id | int(11)                                | NO   | MUL | NULL     |                 |
| position        | varchar(255)                           | NO   |     | 'start'  |                 |
| status          | enum('active', 'completed', 'abandoned')| NO  |     | 'active' |                 |
| result          | varchar(10)                            | YES  |     | NULL     |                 |
| reason          | varchar(50)                            | YES  |     | NULL     |                 |
| time_control    | varchar(50)                            | YES  |     | NULL     |                 |
| type            | enum('correspondence', 'rapid', 'blitz', 'bullet') | NO | | NULL |              |
| last_move_at    | timestamp                              | YES  |     | CURRENT_TIMESTAMP |        |
| created_at      | timestamp                              | YES  |     | CURRENT_TIMESTAMP |        |
| preview_url     | varchar(255)                           | YES  |     | NULL     |                 |

### chess_game_moves
| Column         | Type       | Null | Key | Default | Extra          |
|----------------|------------|------|-----|---------|----------------|
| id             | int(11)    | NO   | PRI | NULL    | auto_increment |
| game_id        | int(11)    | NO   | MUL | NULL    |                |
| move_number    | int(11)    | NO   |     | NULL    |                |
| move_san       | varchar(10)| NO   |     | NULL    |                |
| position_after | varchar(255)| NO  |     | NULL    |                |
| made_by_id     | int(11)    | NO   | MUL | NULL    |                |
| created_at     | timestamp  | YES  |     | CURRENT_TIMESTAMP |      |

### chess_challenges
| Column        | Type                                     | Null | Key | Default  | Extra          |
|---------------|------------------------------------------|------|-----|----------|----------------|
| id            | int(11)                                  | NO   | PRI | NULL     | auto_increment |
| challenger_id | int(11)                                  | NO   | MUL | NULL     |                |
| recipient_id  | int(11)                                  | NO   | MUL | NULL     |                |
| time_control  | varchar(50)                              | YES  |     | NULL     |                |
| color         | varchar(20)                              | NO   |     | NULL     |                |
| position      | varchar(255)                             | YES  |     | 'start'  |                |
| status        | enum('pending', 'accepted', 'declined', 'expired') | YES | | 'pending' |       |
| created_at    | timestamp                                | YES  |     | CURRENT_TIMESTAMP |      |
| expires_at    | timestamp                                | YES  |     | NULL     |                |

### chess_practice_positions
| Column       | Type                                     | Null | Key | Default | Extra          |
|--------------|------------------------------------------|------|-----|---------|----------------|
| id           | int(11)                                  | NO   | PRI | NULL    | auto_increment |
| title        | varchar(255)                             | NO   |     | NULL    |                |
| description  | text                                     | YES  |     | NULL    |                |
| position     | varchar(255)                             | NO   |     | NULL    |                |
| type         | enum('opening', 'tactics', 'endgame')    | NO   |     | NULL    |                |
| difficulty   | enum('beginner', 'intermediate', 'advanced') | NO | | NULL   |                |
| engine_level | int(11)                                  | NO   |     | 5       |                |
| created_by   | int(11)                                  | NO   | MUL | NULL    |                |
| created_at   | timestamp                                | YES  |     | CURRENT_TIMESTAMP |      |
| preview_url  | varchar(255)                             | YES  |     | NULL    |                |

### chess_player_stats
| Column       | Type      | Null | Key | Default | Extra                       |
|--------------|-----------|------|-----|---------|---------------------------- |
| user_id      | int(11)   | NO   | PRI | NULL    |                            |
| games_played | int(11)   | YES  |     | 0       |                            |
| games_won    | int(11)   | YES  |     | 0       |                            |
| games_lost   | int(11)   | YES  |     | 0       |                            |
| games_drawn  | int(11)   | YES  |     | 0       |                            |
| rating       | int(11)   | YES  |     | 1200    |                            |
| last_updated | timestamp | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

## Foreign Key Relationships

### user_permissions
- `user_id` references `users(id)` ON DELETE CASCADE
- `permission_id` references `permissions(id)` ON DELETE CASCADE
- `granted_by` references `users(id)`

### role_permissions
- `permission_id` references `permissions(id)` ON DELETE CASCADE

### activity_logs
- `user_id` references `users(id)` ON DELETE CASCADE

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

### attendance
- `student_id` references `users(id)`
- `batch_id` references `batches(id)`
- `session_id` references `batch_sessions(id)`
- `marked_by` references `users(id)`

### online_meeting_sync_logs
- `session_id` references `batch_sessions(id)`

## Resources Foreign Key Relationships

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

## Foreign Key Relationships for Chess Tables

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

## Foreign Key Relationships for PGN Tables

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

## Indexes
### attendance
- idx_student_date (student_id, created_at)
- idx_batch_date (batch_id, created_at)
- idx_session_status (session_id, status)

### pgn_files
- idx_category on category
- idx_is_public on is_public  
- idx_teacher_id on teacher_id
- idx_created_at on created_at
- idx_pgn_files_title on title
- ft_pgn_search FULLTEXT on (title, description)

### pgn_shares
- idx_pgn_user on (pgn_id, user_id)
- idx_permission on permission
- idx_shared_at on shared_at

### pgn_views
- idx_pgn_id on pgn_id
- idx_user_id on user_id
- idx_viewed_at on viewed_at
- unique_user_pgn UNIQUE on (pgn_id, user_id)

### pgn_categories
- unique_category_name UNIQUE on name
- idx_is_active on is_active
- idx_sort_order on sort_order

### pgn_annotations
- idx_pgn_move on (pgn_id, move_number)
- idx_position on position_fen
- idx_author on author_id
- idx_type on annotation_type

## Resources & Materials

### Resource Access Control System
The resource system implements a comprehensive access control mechanism:

- **Public Resources**: Resources marked with `is_public = TRUE` are accessible to all users
- **Classroom Sharing**: Resources can be shared with specific classrooms via `classroom_resources`
- **Batch Sharing**: Resources can be shared with specific batches via `batch_resources`  
- **Individual Sharing**: Resources can be shared directly with students via `student_resource_shares`

**Access Logic for Students**: A student can access a resource if ANY of the following is true:
1. The resource is public (`is_public = TRUE`)
2. The resource is directly shared with them
3. The resource is shared with a classroom they belong to
4. The resource is shared with a batch they belong to

**Access Logic for Teachers/Admins**: Can see all resources and share them with their own classrooms/batches.

### resources
| Column        | Type                           | Null | Key | Default | Extra           |
|---------------|--------------------------------|------|-----|---------|-----------------|
| id            | int(11)                        | NO   | PRI | NULL    | auto_increment |
| title         | varchar(255)                   | NO   |     | NULL    |                |
| description   | text                           | YES  |     | NULL    |                |
| type          | enum('pgn','pdf','video','link')| NO  |    | NULL    |                |
| url           | varchar(512)                   | NO   |     | NULL    |                |
| category      | varchar(100)                   | NO   |     | NULL    |                |
| created_by    | int(11)                        | NO   | MUL | NULL    |                |
| created_at    | timestamp                      | YES  |     | NULL    |                |
| file_size     | int                            | YES  |     | NULL    |                |
| downloads     | int                            | YES  |     | 0       |                |
| thumbnail_url | varchar(512)                   | YES  |     | NULL    |                |
| is_featured   | boolean                        | YES  |     | FALSE   |                |
| tags          | text                           | YES  |     | NULL    |                |
| difficulty    | enum('beginner','intermediate','advanced') | YES | | 'beginner' |     |
| is_public     | boolean                        | YES  |     | FALSE   |                |

### classroom_resources
| Column       | Type      | Null | Key | Default | Extra |
|-------------|-----------|------|-----|---------|--------|
| classroom_id | int(11)   | NO   | PRI | NULL    |        |
| resource_id  | int(11)   | NO   | PRI | NULL    |        |
| shared_by    | int(11)   | NO   | MUL | NULL    |        |
| shared_at    | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### batch_resources
| Column      | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|--------|
| batch_id   | int(11)   | NO   | PRI | NULL    |        |
| resource_id| int(11)   | NO   | PRI | NULL    |        |
| shared_by  | int(11)   | NO   | MUL | NULL    |        |
| shared_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### student_resource_shares
| Column      | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|--------|
| student_id | int(11)   | NO   | PRI | NULL    |        |
| resource_id| int(11)   | NO   | PRI | NULL    |        |
| shared_by  | int(11)   | NO   | MUL | NULL    |        |
| shared_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### resource_access
| Column       | Type      | Null | Key | Default | Extra |
|-------------|-----------|------|-----|---------|--------|
| resource_id | int(11)   | NO   | PRI | NULL    |        |
| user_id     | int(11)   | NO   | PRI | NULL    |        |
| last_accessed| timestamp | YES  |     | NULL    |        |

### resource_bookmarks
| Column       | Type      | Null | Key | Default | Extra |
|-------------|-----------|------|-----|---------|--------|
| user_id     | int(11)   | NO   | PRI | NULL    |        |
| resource_id | int(11)   | NO   | PRI | NULL    |        |
| created_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

## Notifications
### notifications
| Column     | Type         | Null | Key | Default | Extra           |
|------------|-------------|------|-----|---------|-----------------|
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)     | NO   | MUL | NULL    |                |
| title      | varchar(255)| NO   |     | NULL    |                |
| message    | text        | NO   |     | NULL    |                |
| type       | varchar(50) | NO   |     | NULL    |                |
| is_read    | tinyint(1)  | YES  |     | NULL    |                |
| created_at | timestamp   | YES  |     | NULL    |                |

## Attendance System
### attendance
| Column          | Type                                        | Null | Key | Default | Extra           |
|-----------------|---------------------------------------------|------|-----|---------|-----------------|
| id              | int(11)                                     | NO   | PRI | NULL    | auto_increment |
| student_id      | int(11)                                     | NO   | MUL | NULL    |                |
| batch_id        | int(11)                                     | NO   | MUL | NULL    |                |
| session_id      | int(11)                                     | NO   | MUL | NULL    |                |
| status          | enum('present','absent','excused','late')   | NO   |     | NULL    |                |
| marked_by       | int(11)                                     | NO   | MUL | NULL    |                |
| check_in_time   | datetime                                    | YES  |     | NULL    |                |
| check_out_time  | datetime                                    | YES  |     | NULL    |                |
| online_duration | int                                         | YES  |     | NULL    |                |
| platform        | varchar(50)                                 | YES  |     | NULL    |                |
| sync_source     | varchar(50)                                 | YES  |     | NULL    |                |
| notes           | text                                        | YES  |     | NULL    |                |
| created_at      | timestamp                                   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at      | timestamp                                   | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### attendance_settings
| Column                        | Type      | Null | Key | Default | Extra           |
|------------------------------|-----------|------|-----|---------|-----------------|
| id                           | int(11)   | NO   | PRI | NULL    | auto_increment |
| min_attendance_percent       | int(11)   | YES  |     | 75      |                |
| late_threshold_minutes       | int(11)   | YES  |     | 15      |                |
| auto_mark_absent_after_minutes| int(11)   | YES  |     | 30      |                |
| reminder_before_minutes      | int(11)   | YES  |     | 60      |                |
| zoom_api_key                | varchar(255)| YES  |     | NULL    |                |
| zoom_api_secret             | varchar(255)| YES  |     | NULL    |                |
| google_meet_credentials     | text       | YES  |     | NULL    |                |
| created_at                  | timestamp  | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at                  | timestamp  | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### online_meeting_sync_logs
| Column       | Type                            | Null | Key | Default | Extra           |
|-------------|----------------------------------|------|-----|---------|-----------------|
| id          | int(11)                         | NO   | PRI | NULL    | auto_increment |
| session_id  | int(11)                         | NO   | MUL | NULL    |                |
| platform    | varchar(50)                     | NO   |     | NULL    |                |
| meeting_id  | varchar(255)                    | NO   |     | NULL    |                |
| sync_status | enum('success','failed')        | NO   |     | NULL    |                |
| error_message| text                           | YES  |     | NULL    |                |
| synced_at   | timestamp                       | YES  |     | CURRENT_TIMESTAMP |      |

## Support System
### support_tickets
| Column     | Type                                        | Null | Key | Default | Extra           |
|------------|---------------------------------------------|------|-----|---------|-----------------|
| id         | int(11)                                     | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)                                     | NO   | MUL | NULL    |                |
| title      | varchar(255)                                | NO   |     | NULL    |                |
| description| text                                        | NO   |     | NULL    |                |
| status     | enum('open','in_progress','resolved','closed')| NO |     | 'open'  |                |
| priority   | enum('low','medium','high','urgent')        | NO   |     | 'medium'|                |
| category   | varchar(100)                                | NO   |     | NULL    |                |
| assigned_to| int(11)                                     | YES  | MUL | NULL    |                |
| created_at | timestamp                                   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at | timestamp                                   | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### ticket_responses
| Column     | Type         | Null | Key | Default | Extra           |
|------------|-------------|------|-----|---------|-----------------|
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| ticket_id  | int(11)     | NO   | MUL | NULL    |                |
| user_id    | int(11)     | NO   | MUL | NULL    |                |
| message    | text        | NO   |     | NULL    |                |
| created_at | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |

### faqs
| Column       | Type         | Null | Key | Default | Extra           |
|-------------|-------------|------|-----|---------|-----------------|
| id          | int(11)     | NO   | PRI | NULL    | auto_increment |
| question    | text        | NO   |     | NULL    |                |
| answer      | text        | NO   |     | NULL    |                |
| category    | varchar(100)| NO   |     | NULL    |                |
| is_published| tinyint(1)  | YES  |     | TRUE    |                |
| created_by  | int(11)     | NO   | MUL | NULL    |                |
| created_at  | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at  | timestamp   | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

## Permissions & Activity Tracking

### permissions
| Column      | Type          | Null | Key | Default | Extra           |
|------------|---------------|------|-----|---------|-----------------|
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| name       | varchar(100)  | NO   | UNI | NULL    |                |
| description| text          | YES  |     | NULL    |                |
| created_at | timestamp     | YES  |     | CURRENT_TIMESTAMP |      |

### user_permissions
| Column      | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|--------|
| user_id    | int(11)   | NO   | PRI | NULL    |        |
| permission_id| int(11)  | NO   | PRI | NULL    |        |
| granted_by | int(11)   | NO   | MUL | NULL    |        |
| granted_at | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### role_permissions
| Column       | Type         | Null | Key | Default | Extra |
|-------------|--------------|------|-----|---------|--------|
| role        | varchar(50)  | NO   | PRI | NULL    |        |
| permission_id| int(11)     | NO   | PRI | NULL    |        |

### activity_logs
| Column      | Type          | Null | Key | Default | Extra           |
|------------|---------------|------|-----|---------|-----------------|
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)       | NO   | MUL | NULL    |                |
| action     | varchar(100)  | NO   |     | NULL    |                |
| description| text          | YES  |     | NULL    |                |
| ip_address | varchar(45)   | YES  |     | NULL    |                |
| user_agent | text          | YES  |     | NULL    |                |
| created_at | timestamp     | YES  |     | CURRENT_TIMESTAMP |      |

## Chess Platform

### chess_studies
| Column       | Type                                                     | Null | Key | Default | Extra           |
|--------------|----------------------------------------------------------|------|-----|---------|-----------------|
| id           | int(11)                                                  | NO   | PRI | NULL    | auto_increment  |
| title        | varchar(255)                                             | NO   |     | NULL    |                 |
| description  | text                                                     | YES  |     | NULL    |                 |
| position     | varchar(255)                                             | NO   |     | 'start' |                 |
| category     | enum('opening', 'middlegame', 'endgame', 'tactics', 'strategy') | NO | | NULL | |
| owner_id     | int(11)                                                  | NO   | MUL | NULL    |                 |
| is_public    | boolean                                                  | YES  |     | FALSE   |                 |
| preview_url  | varchar(255)                                             | YES  |     | NULL    |                 |
| created_at   | timestamp                                                | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at   | timestamp                                                | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### chess_study_shares
| Column     | Type      | Null | Key | Default | Extra |
|------------|-----------|------|-----|---------|-------|
| study_id   | int(11)   | NO   | PRI | NULL    |       |
| user_id    | int(11)   | NO   | PRI | NULL    |       |
| shared_at  | timestamp | YES  |     | CURRENT_TIMESTAMP |  |

### chess_games
| Column          | Type                                   | Null | Key | Default  | Extra           |
|-----------------|----------------------------------------|------|-----|----------|-----------------|
| id              | int(11)                                | NO   | PRI | NULL     | auto_increment  |
| white_player_id | int(11)                                | NO   | MUL | NULL     |                 |
| black_player_id | int(11)                                | NO   | MUL | NULL     |                 |
| position        | varchar(255)                           | NO   |     | 'start'  |                 |
| status          | enum('active', 'completed', 'abandoned')| NO  |     | 'active' |                 |
| result          | varchar(10)                            | YES  |     | NULL     |                 |
| reason          | varchar(50)                            | YES  |     | NULL     |                 |
| time_control    | varchar(50)                            | YES  |     | NULL     |                 |
| type            | enum('correspondence', 'rapid', 'blitz', 'bullet') | NO | | NULL |              |
| last_move_at    | timestamp                              | YES  |     | CURRENT_TIMESTAMP |        |
| created_at      | timestamp                              | YES  |     | CURRENT_TIMESTAMP |        |
| preview_url     | varchar(255)                           | YES  |     | NULL     |                 |

### chess_game_moves
| Column         | Type       | Null | Key | Default | Extra          |
|----------------|------------|------|-----|---------|----------------|
| id             | int(11)    | NO   | PRI | NULL    | auto_increment |
| game_id        | int(11)    | NO   | MUL | NULL    |                |
| move_number    | int(11)    | NO   |     | NULL    |                |
| move_san       | varchar(10)| NO   |     | NULL    |                |
| position_after | varchar(255)| NO  |     | NULL    |                |
| made_by_id     | int(11)    | NO   | MUL | NULL    |                |
| created_at     | timestamp  | YES  |     | CURRENT_TIMESTAMP |      |

### chess_challenges
| Column        | Type                                     | Null | Key | Default  | Extra          |
|---------------|------------------------------------------|------|-----|----------|----------------|
| id            | int(11)                                  | NO   | PRI | NULL     | auto_increment |
| challenger_id | int(11)                                  | NO   | MUL | NULL     |                |
| recipient_id  | int(11)                                  | NO   | MUL | NULL     |                |
| time_control  | varchar(50)                              | YES  |     | NULL     |                |
| color         | varchar(20)                              | NO   |     | NULL     |                |
| position      | varchar(255)                             | YES  |     | 'start'  |                |
| status        | enum('pending', 'accepted', 'declined', 'expired') | YES | | 'pending' |       |
| created_at    | timestamp                                | YES  |     | CURRENT_TIMESTAMP |      |
| expires_at    | timestamp                                | YES  |     | NULL     |                |

### chess_practice_positions
| Column       | Type                                     | Null | Key | Default | Extra          |
|--------------|------------------------------------------|------|-----|---------|----------------|
| id           | int(11)                                  | NO   | PRI | NULL    | auto_increment |
| title        | varchar(255)                             | NO   |     | NULL    |                |
| description  | text                                     | YES  |     | NULL    |                |
| position     | varchar(255)                             | NO   |     | NULL    |                |
| type         | enum('opening', 'tactics', 'endgame')    | NO   |     | NULL    |                |
| difficulty   | enum('beginner', 'intermediate', 'advanced') | NO | | NULL   |                |
| engine_level | int(11)                                  | NO   |     | 5       |                |
| created_by   | int(11)                                  | NO   | MUL | NULL    |                |
| created_at   | timestamp                                | YES  |     | CURRENT_TIMESTAMP |      |
| preview_url  | varchar(255)                             | YES  |     | NULL    |                |

### chess_player_stats
| Column       | Type      | Null | Key | Default | Extra                       |
|--------------|-----------|------|-----|---------|---------------------------- |
| user_id      | int(11)   | NO   | PRI | NULL    |                            |
| games_played | int(11)   | YES  |     | 0       |                            |
| games_won    | int(11)   | YES  |     | 0       |                            |
| games_lost   | int(11)   | YES  |     | 0       |                            |
| games_drawn  | int(11)   | YES  |     | 0       |                            |
| rating       | int(11)   | YES  |     | 1200    |                            |
| last_updated | timestamp | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

## Foreign Key Relationships

### user_permissions
- `user_id` references `users(id)` ON DELETE CASCADE
- `permission_id` references `permissions(id)` ON DELETE CASCADE
- `granted_by` references `users(id)`

### role_permissions
- `permission_id` references `permissions(id)` ON DELETE CASCADE

### activity_logs
- `user_id` references `users(id)` ON DELETE CASCADE

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

### attendance
- `student_id` references `users(id)`
- `batch_id` references `batches(id)`
- `session_id` references `batch_sessions(id)`
- `marked_by` references `users(id)`

### online_meeting_sync_logs
- `session_id` references `batch_sessions(id)`

## Resources Foreign Key Relationships

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

## Foreign Key Relationships for Chess Tables

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

## Foreign Key Relationships for PGN Tables

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