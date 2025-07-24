# System Administration

This section covers system administration functionality including notifications, support tickets, FAQs, and activity monitoring.

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

## Foreign Key Relationships

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
