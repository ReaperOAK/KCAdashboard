# PGN Content Management

This section covers PGN file management, sharing, viewing, annotations, and user preferences for chess content.

## PGN Files

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

## PGN Sharing & Access

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

**Indexes**:
- `idx_pgn_id` on pgn_id
- `idx_user_id` on user_id
- `idx_viewed_at` on viewed_at
- `unique_user_pgn` UNIQUE on (pgn_id, user_id)

## PGN Categories & Organization

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

**Indexes**:
- `unique_category_name` UNIQUE on name
- `idx_is_active` on is_active
- `idx_sort_order` on sort_order

## PGN Annotations & Analysis

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

**Indexes**:
- `idx_pgn_move` on (pgn_id, move_number) - For efficient move-based queries
- `idx_position` on position_fen
- `idx_author` on author_id
- `idx_type` on annotation_type

## User Preferences

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

## Analytics & Statistics

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

## Foreign Key Relationships

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
