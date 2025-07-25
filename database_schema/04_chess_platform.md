# Chess Platform

This section covers the interactive chess features including games, studies, challenges, practice positions, and player statistics.

## Chess Studies

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

## Chess Games

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

## Chess Challenges & Practice

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

### chess_draw_offers
| Column               | Type                                     | Null | Key | Default  | Extra          |
|----------------------|------------------------------------------|------|-----|----------|----------------|
| id                   | int(11)                                  | NO   | PRI | NULL     | auto_increment |
| game_id              | int(11)                                  | NO   | MUL | NULL     |                |
| offered_by_id        | int(11)                                  | NO   | MUL | NULL     |                |
| status               | enum('pending', 'accepted', 'declined', 'expired') | NO | | 'pending' |       |
| move_number_when_offered | int(11)                              | NO   |     | NULL     |                |
| created_at           | timestamp                                | YES  |     | CURRENT_TIMESTAMP |      |
| expires_at           | timestamp                                | YES  |     | NULL     |                |
| responded_at         | timestamp                                | YES  |     | NULL     |                |

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

## Chess Player Statistics

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

### chess_draw_offers
- `game_id` references `chess_games(id)` ON DELETE CASCADE
- `offered_by_id` references `users(id)` ON DELETE CASCADE

### chess_practice_positions
- `created_by` references `users(id)` ON DELETE CASCADE

### chess_player_stats
- `user_id` references `users(id)` ON DELETE CASCADE
