# KCA Dashboard Database Schema

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
| points     | int(11)                           | YES  |     | 1       |                |
| chess_position | varchar(100)                      | YES  |     | NULL    | FEN notation   |
| chess_orientation | enum('white','black')           | YES  |     | white   | Board orientation |
| correct_moves  | text                              | YES  |     | NULL    | JSON array     |
| pgn_data   | text                              | YES  |     | NULL    | PGN for multi-move sequences |
| expected_player_color | enum('white','black')          | YES  |     | 'white' | Player color in PGN mode |

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
| title      | varchar(255)                                | NO   |     | NULL    |                |
| description| text                                        | YES  |     | NULL    |                |
| category   | enum('opening','middlegame','endgame','tactics','strategy')| NO | | NULL    |                |
| pgn_content| text                                        | NO   |     | NULL    |                |
| file_path  | varchar(512)                                | YES  |     | NULL    |                |
| is_public  | tinyint(1)                                 | YES  |     | FALSE   |                |
| teacher_id | int(11)                                    | NO   | MUL | NULL    |                |
| created_at | timestamp                                  | YES  |     | NULL    |                |

### pgn_shares
| Column     | Type                    | Null | Key | Default | Extra |
|-----------|-------------------------|------|-----|---------|-------|
| pgn_id    | int(11)                | NO   | PRI | NULL    |       |
| user_id   | int(11)                | NO   | PRI | NULL    |       |
| permission| enum('view','edit')    | YES  |     | 'view'  |       |
| shared_at | timestamp              | YES  |     | CURRENT_TIMESTAMP |  |

### tournaments
| Column          | Type                                      | Null | Key | Default | Extra           |
|-----------------|-------------------------------------------|------|-----|---------|-----------------|
| id              | int(11)                                   | NO   | PRI | NULL    | auto_increment |
| title           | varchar(255)                              | NO   |     | NULL    |                |
| description     | text                                      | YES  |     | NULL    |                |
| date_time       | datetime                                  | NO   |     | NULL    |                |
| location        | varchar(255)                              | YES  |     | NULL    |                |
| type            | enum('online','offline')                  | NO   |     | NULL    |                |
| entry_fee       | decimal(10,2)                            | YES  |     | NULL    |                |
| prize_pool      | decimal(10,2)                            | YES  |     | NULL    |                |
| max_participants| int(11)                                   | YES  |     | NULL    |                |
| status          | enum('upcoming','ongoing','completed','cancelled')| YES| | NULL  |                |
| lichess_id      | varchar(255)                              | YES  |     | NULL    |                |
| created_by      | int(11)                                   | NO   | MUL | NULL    |                |
| created_at      | timestamp                                 | YES  |     | NULL    |                |

### tournament_registrations
| Column           | Type                                    | Null | Key | Default  | Extra |
|-----------------|----------------------------------------|------|-----|----------|--------|
| tournament_id   | int(11)                                | NO   | PRI | NULL     |        |
| user_id        | int(11)                                | NO   | PRI | NULL     |        |
| registration_date| timestamp                             | YES  |     | NULL     |        |
| payment_status  | enum('pending','completed','refunded') | YES  |     | 'pending'|        |

## Resources & Materials
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

## Indexes
### attendance
- idx_student_date (student_id, created_at)
- idx_batch_date (batch_id, created_at)
- idx_session_status (session_id, status)
