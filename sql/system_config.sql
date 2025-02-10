CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    max_students_per_batch INT NOT NULL DEFAULT 20,
    auto_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by INT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_config (id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
