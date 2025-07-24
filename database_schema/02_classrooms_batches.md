# Classrooms & Batches

This section covers the educational structure including classrooms, batches, sessions, assignments, and student enrollment management.

## Classroom Management

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

## Assignment Management

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

## Batch Management

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

## Foreign Key Relationships

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

## Indexes

### attendance
- idx_student_date (student_id, created_at)
- idx_batch_date (batch_id, created_at)
- idx_session_status (session_id, status)
