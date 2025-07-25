-- Migration: Add chess_draw_offers table for draw offer functionality
-- Date: 2025-01-25
-- Description: Creates the chess_draw_offers table to track draw offers in chess games

-- Create the chess_draw_offers table
CREATE TABLE IF NOT EXISTS chess_draw_offers (
  id int(11) AUTO_INCREMENT PRIMARY KEY,
  game_id int(11) NOT NULL,
  offered_by_id int(11) NOT NULL,
  status enum('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp NULL,
  responded_at timestamp NULL,
  FOREIGN KEY (game_id) REFERENCES chess_games(id) ON DELETE CASCADE,
  FOREIGN KEY (offered_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chess_draw_offers_game_id ON chess_draw_offers(game_id);
CREATE INDEX IF NOT EXISTS idx_chess_draw_offers_offered_by_id ON chess_draw_offers(offered_by_id);
CREATE INDEX IF NOT EXISTS idx_chess_draw_offers_status ON chess_draw_offers(status);
CREATE INDEX IF NOT EXISTS idx_chess_draw_offers_expires_at ON chess_draw_offers(expires_at);

-- Verify the table was created
SELECT 'chess_draw_offers table created successfully' as result;
DESCRIBE chess_draw_offers;
