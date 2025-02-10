CREATE TABLE user_preferences (
    user_id INT PRIMARY KEY,
    board_theme VARCHAR(20) NOT NULL DEFAULT 'blue',
    show_coordinates BOOLEAN NOT NULL DEFAULT true,
    piece_style VARCHAR(20) NOT NULL DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
