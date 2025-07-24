# Users & Authentication

This section covers user management, authentication, and profile functionality.

## Core User Management

### users
| Column                    | Type                                  | Null | Key | Default | Extra           |
|--------------------------|---------------------------------------|------|-----|---------|-----------------|
| id                       | int(11)                               | NO   | PRI | NULL    | auto_increment |
| email                    | varchar(255)                          | NO   | UNI | NULL    |                |
| password                 | varchar(255)                          | NO   |     | NULL    |                |
| role                     | enum('student','teacher','admin')     | NO   |     | NULL    |                |
| full_name                | varchar(255)                          | NO   |     | NULL    |                |
| created_at               | timestamp                             | YES  |     | NULL    |                |
| updated_at               | timestamp                             | YES  |     | NULL    | on update CURRENT_TIMESTAMP |
| is_active                | tinyint(1)                            | YES  |     | NULL    |                |
| google_id                | varchar(255)                          | YES  | UNI | NULL    |                |
| profile_picture_url      | varchar(500)                          | YES  |     | NULL    |                |
| status                   | enum('active','inactive','suspended') | YES  |     | 'active'|                |
| fide_id                  | varchar(20)                           | YES  | IDX | NULL    |                |
| fide_rating              | int(11)                               | YES  | IDX | NULL    |                |
| national_rating          | int(11)                               | YES  | IDX | NULL    |                |
| date_of_birth            | date                                  | YES  | IDX | NULL    |                |
| dob_certificate_url      | varchar(500)                          | YES  |     | NULL    |                |
| phone_number             | varchar(20)                           | YES  |     | NULL    |                |
| bio                      | text                                  | YES  |     | NULL    |                |
| achievements             | text                                  | YES  |     | NULL    |                |
| specializations          | text                                  | YES  |     | NULL    |                |
| experience_years         | int(11)                               | YES  |     | NULL    |                |
| coaching_since           | date                                  | YES  |     | NULL    |                |
| address                  | text                                  | YES  |     | NULL    |                |
| emergency_contact_name   | varchar(255)                          | YES  |     | NULL    |                |
| emergency_contact_phone  | varchar(20)                           | YES  |     | NULL    |                |

**Purpose:**
- Core user management with role-based access (student, teacher, admin)
- Enhanced profile system with chess-specific information
- FIDE integration for professional chess players
- Document management for verification (profile pictures, certificates)
- Emergency contact information for students

**Key Features:**
- **FIDE Integration**: Links to official FIDE profiles via `fide_id`
- **Rating Management**: Both FIDE and national ratings
- **Document Requirements**: Mandatory profile pictures and DOB certificates for students
- **Role-Specific Fields**: Teaching experience for coaches, emergency contacts for students
- **Profile Completeness**: Bio, achievements, and specializations

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE KEY email (email)`
- `UNIQUE KEY google_id (google_id)`
- `INDEX idx_users_fide_id (fide_id)`
- `INDEX idx_users_fide_rating (fide_rating)`
- `INDEX idx_users_national_rating (national_rating)`
- `INDEX idx_users_date_of_birth (date_of_birth)`

### user_documents
| Column        | Type                                                      | Null | Key | Default           | Extra           |
|--------------|-----------------------------------------------------------|------|-----|-------------------|-----------------|
| id           | int(11)                                                   | NO   | PRI | NULL              | auto_increment |
| user_id      | int(11)                                                   | NO   | IDX | NULL              |                |
| document_type| enum('profile_picture','dob_certificate','id_proof','other') | NO   | IDX | NULL              |                |
| file_name    | varchar(255)                                              | NO   |     | NULL              |                |
| file_path    | varchar(500)                                              | NO   |     | NULL              |                |
| file_size    | int(11)                                                   | YES  |     | NULL              |                |
| mime_type    | varchar(100)                                              | YES  |     | NULL              |                |
| uploaded_at  | timestamp                                                 | YES  |     | CURRENT_TIMESTAMP |                |
| is_verified  | boolean                                                   | YES  |     | FALSE             |                |
| verified_by  | int(11)                                                   | YES  |     | NULL              |                |
| verified_at  | timestamp                                                 | YES  |     | NULL              |                |

**Purpose:**
- Secure document storage with metadata tracking
- Admin verification workflow for uploaded documents
- Support for multiple document types per user
- File integrity and access control

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE
- `verified_by` references `users(id)` ON DELETE SET NULL

### fide_ratings_history
| Column       | Type                              | Null | Key | Default           | Extra           |
|-------------|-----------------------------------|------|-----|-------------------|-----------------|
| id          | int(11)                           | NO   | PRI | NULL              | auto_increment |
| user_id     | int(11)                           | NO   | IDX | NULL              |                |
| fide_id     | varchar(20)                       | NO   | IDX | NULL              |                |
| rating      | int(11)                           | NO   |     | NULL              |                |
| rating_type | enum('standard','rapid','blitz')  | YES  |     | 'standard'        |                |
| recorded_date| date                             | NO   | IDX | NULL              |                |
| created_at  | timestamp                         | YES  |     | CURRENT_TIMESTAMP |                |

**Purpose:**
- Track FIDE rating changes over time
- Support for different rating categories
- Historical analysis of player progress
- Integration with FIDE official data

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

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
| token      | varchar(255)| NO   | IDX | NULL    |                |
| expires_at | timestamp   | NO   | IDX | NULL    |                |
| created_at | timestamp   | YES  |     | CURRENT_TIMESTAMP |      |
| verified_at| timestamp   | YES  |     | NULL    |                |

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

## Foreign Key Relationships

### users
- `google_id` for OAuth integration (unique)
- `email` must be unique across the system
- `fide_id` must be unique if provided (chess player identification)

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
