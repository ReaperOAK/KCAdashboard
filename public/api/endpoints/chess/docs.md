# KCAdashboard API – Chess Endpoints Documentation

## Overview

The `chess` endpoints folder provides the backend API for all chess-related features in KCAdashboard. These PHP files enable users to play, manage, analyze, and track chess games and challenges, as well as interact with chess engines and PGN files. The endpoints support both real-time gameplay and historical analysis for students, teachers, and admins.

---

## File Structure

```
endpoints/chess/
  cancel-challenge.php      # Cancel a chess challenge
  challenge.php             # Issue a new chess challenge
  challenges.php            # List all chess challenges
  cleanup-games.php         # Clean up chess games
  cleanup-inactive-games.php # Clean up inactive chess games
  create-practice.php       # Create a chess practice session
  engine-analysis.php       # Analyze games using a chess engine
  game.php                  # Handle chess game logic
  games.php                 # List all chess games
  get-categories.php        # Retrieve chess categories
  get-game.php              # Get details of a specific chess game
  get-games.php             # Get multiple chess games
  get-move-history.php      # Retrieve move history for a game
  get-stats.php             # Get chess statistics
  make-move.php             # Handle making a move in a game
  online-players.php        # List online chess players
  player-stats.php          # Get player statistics
  practice-positions.php    # Provide practice positions
  record-view.php           # Record a view of a game
  resign-game.php           # Handle resigning from a game
  respond-challenge.php     # Respond to a chess challenge
  save-pgn.php              # Save a game in PGN format
  save-result.php           # Save the result of a game
  upload-pgn.php            # Upload a PGN file
  edit-pgn.php              # Edit PGN metadata and visibility
  delete-pgn.php            # Delete a PGN file
  set-pgn-visibility.php    # Change PGN visibility
  validate-pgn.php          # Validate a PGN file
```

---

## File Explanations

- **cancel-challenge.php**  
  Cancels an existing chess challenge, removing it from the pending list.

- **challenge.php**  
  Issues a new chess challenge to another player.

- **challenges.php**  
  Lists all current chess challenges, both sent and received.

- **cleanup-games.php** / **cleanup-inactive-games.php**  
  Cleans up old or inactive chess games to keep the database tidy.

- **create-practice.php**  
  Creates a new chess practice session for training or drills.

- **engine-analysis.php**  
  Analyzes games using a chess engine, providing move suggestions and evaluations.

- **game.php** / **games.php**  
  Handles core chess game logic and lists all games in the system.

- **get-categories.php**  
  Retrieves available chess categories (e.g., openings, tactics).

- **get-game.php** / **get-games.php**  
  Gets details for one or more specific chess games.

- **get-move-history.php**  
  Retrieves the move history for a given game.

- **get-stats.php**  
  Provides statistics on games, players, and activity.

- **make-move.php**  
  Handles making a move in a game, updating the board and state.

- **online-players.php**  
  Lists currently online chess players.

- **player-stats.php**  
  Gets statistics for individual players.

- **practice-positions.php**  
  Provides practice positions for training.

- **record-view.php**  
  Records when a game is viewed, for analytics or tracking.

- **resign-game.php**  
  Handles resigning from a game.

- **respond-challenge.php**  
  Responds to a received chess challenge (accept/decline).

- **save-pgn.php**  
  Saves a game in PGN (Portable Game Notation) format.

- **save-result.php**  
  Saves the result of a completed game.

- **upload-pgn.php**  
  Uploads a PGN file for analysis or record-keeping. Now supports advanced visibility controls (public, private, batch, students) via metadata. **Limited to 50 games per upload for performance.**

- **edit-pgn.php**  
  Edit PGN metadata and visibility. Only the owner or admin can edit.

- **delete-pgn.php**  
  Delete a PGN file. Only the owner or admin can delete.

- **set-pgn-visibility.php**  
  Change PGN visibility after upload. Only the owner or admin can change visibility.

- **validate-pgn.php**  
  Validates the format and content of a PGN file. **Enforces 50-game limit per file.**

- **get-game.php**  
  Gets details for one or more specific chess games. **Automatically limits large PGN files to first 50 games when viewing.**

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data or file uploads.
- The frontend calls these endpoints for real-time gameplay, analysis, and record management.
- Access may be restricted based on user roles (student, teacher, admin).

---

## Example Usage

- Players challenge each other and play games using `challenge.php`, `make-move.php`, and related endpoints.
- Teachers or admins analyze games and track statistics using analytics endpoints.
- Practice sessions and PGN uploads support training and study.

---

## Best Practices

- Ensure only authorized users can make moves or modify games.
- Validate all input data to prevent cheating or errors.
- Regularly clean up old and inactive games to maintain performance.

---

## Troubleshooting

- If game data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect game integrity.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
