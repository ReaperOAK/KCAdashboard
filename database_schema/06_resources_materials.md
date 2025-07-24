# Resources & Materials

This section covers the resource management system with comprehensive access control for educational materials.

## Resource Access Control System

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

## Core Resource Management

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

## Resource Sharing

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

## Resource Tracking

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

## Foreign Key Relationships

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
