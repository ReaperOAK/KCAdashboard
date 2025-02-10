-- Add FAQ table
CREATE TABLE IF NOT EXISTS faqs (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add support settings table
CREATE TABLE IF NOT EXISTS support_settings (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    auto_reply TINYINT(1) DEFAULT 0,
    smart_routing TINYINT(1) DEFAULT 0,
    response_delay INT DEFAULT 30,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default support settings
INSERT INTO support_settings (id, auto_reply, smart_routing, response_delay) 
VALUES (1, 0, 0, 30)
ON DUPLICATE KEY UPDATE id=id;

-- Add indexes for better performance
ALTER TABLE faqs ADD INDEX idx_category (category);
ALTER TABLE faqs ADD INDEX idx_created_at (created_at);
