CREATE TABLE pgn_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date DATETIME NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE pgn_shares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pgn_id INT NOT NULL,
    user_id INT NOT NULL,
    shared_date DATETIME NOT NULL,
    FOREIGN KEY (pgn_id) REFERENCES pgn_files(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
