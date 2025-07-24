# Quizzes & Assessment

This section covers the assessment system including quizzes, questions (with chess integration), answers, attempts, and feedback.

## Quiz Management

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

## Chess Question Features

### Chess Question Capabilities
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

## Question & Answer Management

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

## Feedback System

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

## Foreign Key Relationships

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

### quizzes
- `created_by` references `users(id)` ON DELETE CASCADE
