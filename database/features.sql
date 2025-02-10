CREATE TABLE features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    icon_class VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default features
INSERT INTO features (icon_class, title, description, display_order) VALUES
('FaChessBoard', 'Interactive Learning', 'Practice with our interactive chess board', 1),
('FaVideo', 'Live Classes', 'Join real-time sessions with chess masters', 2),
('FaChartLine', 'Progress Tracking', 'Monitor your improvement with detailed analytics', 3);
