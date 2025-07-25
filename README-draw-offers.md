# Chess Draw Offers Feature

This implementation adds the ability for players to offer and accept/decline draw offers in player vs player chess games.

## Features

- **Offer Draw**: Players can offer a draw to their opponent during an active game
- **Accept/Decline**: Opponents can accept or decline draw offers
- **Automatic Draw**: If both players have pending draw offers, the second offer automatically accepts the first
- **Expiration**: Draw offers expire after 5 minutes if not responded to
- **Real-time Notifications**: 
  - Visual indicators on the "Offer Draw" button when offers are received
  - Toast notifications for immediate draw offer alerts
  - Browser notifications when the tab is not active
  - Auto-polling every 5 seconds for new offers
- **Quick Actions**: Accept/decline directly from toast notifications
- **Game Statistics**: Draw results are properly recorded in player statistics

## Database Changes

A new table `chess_draw_offers` has been added to track draw offers:

```sql
CREATE TABLE chess_draw_offers (
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
```

## API Endpoints

### Offer Draw
- **POST** `/api/chess/offer-draw.php`
- **Body**: `{ "game_id": 123 }`
- **Response**: Success message or auto-accept if opponent already offered

### Respond to Draw
- **POST** `/api/chess/respond-draw.php` 
- **Body**: `{ "game_id": 123, "response": "accept|decline" }`
- **Response**: Game result if accepted, confirmation if declined

### Get Draw Offers
- **GET** `/api/chess/get-draw-offers.php?game_id=123`
- **Response**: List of pending draw offers for the game

## Frontend Components

### DrawOfferDialog Component
- Modal dialog for draw offer management
- Shows pending offers from opponent
- Shows user's pending offers
- Buttons to offer, accept, or decline draws
- Real-time updates via polling

### DrawOfferToast Component  
- Non-intrusive toast notification for incoming draw offers
- Quick accept/decline buttons for immediate response
- Auto-hide after 30 seconds
- Links to open full dialog for more details

### BrowserNotification Utility
- Shows native browser notifications when tab is not active
- Notifications for draw offers and game endings
- Requires user permission (requested automatically)
- Auto-expires after reasonable time periods

### ChessBoard Integration
- "Offer Draw" button with visual indicators:
  - Orange pulsing button when offers are received
  - Red badge showing number of pending offers
  - Standard blue button for offering draws
- Button is disabled during opponent's turn or when game is over
- Integrated with existing game flow and notifications
- Auto-polling for draw offers every 5 seconds

## Usage

1. **Installation**: Run the database migration script in `database_migrations/`
2. **Game Play**: In any active player vs player game, click "Offer Draw" 
3. **Response**: Opponent will see the offer and can accept/decline
4. **Result**: If accepted, game ends in a draw (1/2-1/2) and statistics are updated

## Cleanup

The system includes automatic cleanup of expired and old draw offers:
- Pending offers expire after 5 minutes
- Old offers (>7 days) are automatically deleted
- Run `cleanup-draw-offers.php` as a cron job for maintenance

## Game Rules Compliance

- Follows standard chess draw offer rules
- Only one pending offer per game per player
- Offers can be made at any time during active games
- Automatic acceptance when both players have offered draws
- Proper result recording (1/2-1/2) for rating calculations
