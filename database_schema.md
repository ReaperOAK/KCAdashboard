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
| Column       | Type                    | Null | Key | Default | Extra           |
|-------------|-------------------------|------|-----|---------|-----------------|
| id          | int(11)                | NO   | PRI | NULL    | auto_increment |
| batch_id    | int(11)                | NO   | MUL | NULL    |                |
| title       | varchar(255)           | NO   |     | NULL    |                |
| date_time   | datetime               | NO   |     | NULL    |                |
| duration    | int(11)                | NO   |     | NULL    |                |
| type        | enum('online','offline')| YES  |     | 'offline'|              |
| meeting_link| varchar(512)           | YES  |     | NULL    |                |
| created_at  | timestamp              | YES  |     | NULL    |                |

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
| created_by | int(11)                               | NO   | MUL | NULL    |                |
| created_at | timestamp                             | YES  |     | NULL    |                |

### quiz_questions
| Column      | Type                              | Null | Key | Default | Extra           |
|------------|-----------------------------------|------|-----|---------|-----------------|
| id         | int(11)                           | NO   | PRI | NULL    | auto_increment |
| quiz_id    | int(11)                           | NO   | MUL | NULL    |                |
| question   | text                              | NO   |     | NULL    |                |
| image_url  | varchar(512)                      | YES  |     | NULL    |                |
| type       | enum('multiple_choice','puzzle')  | NO   |     | NULL    |                |
| points     | int(11)                           | YES  |     | 1       |                |

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
| category   | enum('opening','middlegame','endgame','tactics')| NO | | NULL    |                |
| pgn_content| text                                        | NO   |     | NULL    |                |
| file_path  | varchar(512)                                | YES  |     | NULL    |                |
| is_public  | tinyint(1)                                 | YES  |     | NULL    |                |
| teacher_id | int(11)                                    | NO   | MUL | NULL    |                |
| created_at | timestamp                                  | YES  |     | NULL    |                |

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
| Column     | Type                           | Null | Key | Default | Extra           |
|------------|--------------------------------|------|-----|---------|-----------------|
| id         | int(11)                        | NO   | PRI | NULL    | auto_increment |
| title      | varchar(255)                   | NO   |     | NULL    |                |
| description| text                           | YES  |     | NULL    |                |
| type       | enum('pgn','pdf','video','link')| NO  |    | NULL    |                |
| url        | varchar(512)                   | NO   |     | NULL    |                |
| category   | varchar(100)                   | NO   |     | NULL    |                |
| created_by | int(11)                        | NO   | MUL | NULL    |                |
| created_at | timestamp                      | YES  |     | NULL    |                |

### resource_access
| Column       | Type      | Null | Key | Default | Extra |
|-------------|-----------|------|-----|---------|--------|
| resource_id | int(11)   | NO   | PRI | NULL    |        |
| user_id     | int(11)   | NO   | PRI | NULL    |        |
| last_accessed| timestamp | YES  |     | NULL    |        |

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
| Column     | Type                                        | Null | Key | Default | Extra           |
|------------|---------------------------------------------|------|-----|---------|-----------------|
| id         | int(11)                                     | NO   | PRI | NULL    | auto_increment |
| student_id | int(11)                                     | NO   | MUL | NULL    |                |
| batch_id   | int(11)                                     | NO   | MUL | NULL    |                |
| session_id | int(11)                                     | NO   | MUL | NULL    |                |
| status     | enum('present','absent','excused','late')   | NO   |     | NULL    |                |
| marked_by  | int(11)                                     | NO   | MUL | NULL    |                |
| notes      | text                                        | YES  |     | NULL    |                |
| created_at | timestamp                                   | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at | timestamp                                   | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### attendance_settings
| Column                      | Type      | Null | Key | Default | Extra           |
|----------------------------|-----------|------|-----|---------|-----------------|
| id                         | int(11)   | NO   | PRI | NULL    | auto_increment |
| min_attendance_percent     | int(11)   | YES  |     | 75      |                |
| late_threshold_minutes     | int(11)   | YES  |     | 15      |                |
| auto_mark_absent_after_minutes | int(11) | YES |     | 30      |                |
| reminder_before_minutes    | int(11)   | YES  |     | 60      |                |
| created_at                 | timestamp | YES  |     | CURRENT_TIMESTAMP |      |
| updated_at                 | timestamp | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

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
